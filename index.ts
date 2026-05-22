import fastify from "fastify";
import { generate, generateArray, ensureGenerated } from "./svg/svgGenerator";
import path from "path";
import { promises as Fs } from "fs";
import { CoverColor, GeneralMaterialTypeCode, mapMaterialType } from "./utils";
import { exec } from "child_process";
// @ts-ignore
import { log } from "dbc-node-logger";
import { getMetrics } from "./monitor";
import { createVerifier } from "fast-jwt";

const _ = require("lodash");
const server = fastify({ maxParamLength: 2000 });
const upSince = new Date();
export const workingDirectory = process.env.IMAGE_DIR || "HEST";

const jwtDecoder = createVerifier({ key: process.env.DEFAULT_FORSIDER_KEY });

/**
 * Check if working directories for storing images are in place
 */
async function checkDirectories() {
  const good = await fileExists(`images/${workingDirectory}`);
  if (!good) {
    await Fs.mkdir(`images/${workingDirectory}`);
    await Fs.mkdir(`images/${workingDirectory}/large`);
    await Fs.mkdir(`images/${workingDirectory}/thumbnail`);
  }
}

/**
 * Wrapper for exec command - we need an async function to delete
 * images BEFORE we delete the directories holding them
 * @param command
 */
const executeBash = async (command: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const exec = require("child_process").exec;
    exec(
      command,
      function (
        error: Error,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) {
        if (error) {
          reject(error);
          return;
        }
        if (stderr) {
          reject(stderr);
          return;
        } else {
          resolve(stdout);
        }
      }
    );
  });
};

/**
 * Cleanup - if working directory has changed, we delete images in
 * old working directories - and then delete the old directories
 */
async function cleanup() {
  try {
    // first delete files
    await executeBash(
      `find ./images -type f -name "*.jpg" -not -path "./images/${workingDirectory}/*" -delete`
    );
    // now delete the (empty) directories
    await executeBash(
      `find ./images/* -type d -not -path "./images/${workingDirectory}*" -delete`
      //"ls -la images/",
    );
  } catch (e) {
    log.error(JSON.stringify(e));
  }
}

checkDirectories();

// public folder for (static) images
server.register(require("@fastify/static"), {
  root: path.join(__dirname, "images"),
});

function deleteAllImages() {
  return new Promise((resolve) => {
    exec("rm images/**/*", (err, _stdout, stdErr) => {
      if (err || stdErr) {
        log.error("Could not delete images");
        return resolve("NOT OK");
      }

      log.info("All images deleted");
      resolve("OK");
    });
  });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

function decodeJwt(uid: string): ICovers | null {
  try {
    return jwtDecoder(uid) as ICovers;
  } catch (e) {
    return null;
  }
}

// Signed JWT routes: verify, generate if missing (and wait), then serve image
server.get(`/large/:uid`, async function (request: any, reply: any) {
  try {
    const { uid } = request.params;
    const query = decodeJwt(uid);
    if (!query) {
      reply.code(404).send("Not found");
      return;
    }

    const { detail, error } = await ensureGenerated(query);
    if (error || !detail) {
      reply.code(404).send("Not found");
      return;
    }

    const res = await Fs.readFile(`images/${detail}`);
    reply.type("image/jpg");
    reply.code(200).send(res);
  } catch (e) {
    reply.code(404).send("Not found");
  }
});

server.get(`/thumbnail/:uid`, async function (request: any, reply: any) {
  try {
    const { uid } = request.params;
    const query = decodeJwt(uid);
    if (!query) {
      reply.code(404).send("Not found");
      return;
    }

    const { thumbNail, error } = await ensureGenerated(query);
    if (error || !thumbNail) {
      reply.code(404).send("Not found");
      return;
    }

    const res = await Fs.readFile(`images/${thumbNail}`);
    reply.type("image/jpg");
    reply.code(200).send(res);
  } catch (e) {
    reply.code(404).send("Not found");
  }
});

interface IRequestStatus {
  status: boolean;
  message: string;
}

// only validates materialtype for now -- TODO more validation
export function checkRequest(query: ICovers): IRequestStatus {
  const { title, materialType } = query;
  const requestStatus = { status: true, message: "all good" };

  // all params in query must be set
  if (!title || !materialType) {
    return {
      status: false,
      message: "ALL parameters ( title, materialType) must be set in query",
    };
  }

  const mappedMaterialType: string = mapMaterialType(materialType);

  // check materialtype
  let found = Object.values<string>(GeneralMaterialTypeCode).indexOf(
    mappedMaterialType
  );

  requestStatus.status = found !== -1;
  if (!requestStatus.status) {
    requestStatus.message = "not supported materialType:" + materialType;
    return requestStatus;
  }
  return requestStatus;
}

/**
 * Define interface for title, materialType parameters
 */
export interface ICovers {
  title: string;
  materialType: GeneralMaterialTypeCode;
  colors?: Array<CoverColor>;
}

interface IHeaders {
  "h-Custom": string;
}

// Typed endpoint - defaultcover
server.get<{
  Querystring: ICovers;
  Headers: IHeaders;
}>(
  "/defaultcover",
  {
    preValidation: (request, reply, done) => {
      const requestStatus = checkRequest(request.query);
      done(
        !requestStatus.status ? new Error(requestStatus.message) : undefined
      );
    },
  },
  async (request, reply) => {
    const customerHeader = request.headers["h-Custom"];
    const response = await generate(request.query);
    reply.code(200).send({ response: [response] });
  }
);

export interface ICoversArray {
  coverParams: Array<ICovers>;
}

// typed endpoint - POST
server.post<{
  Headers: IHeaders;
  Body: ICoversArray;
}>("/defaultcover/", async (request, reply) => {
  const fisk = await generateArray(request.body);
  reply.code(200).send({ response: fisk });
});

// ping/pong
server.get("/ping", async (request, reply) => {
  return "pong\n";
});

// for liveliness probe
server.get("/", async (request, reply) => {
  return "ok";
});

// Count of images that have taken over 5 s to generate
let prevOver5Seconds = 0;
server.get("/howru", async (request, reply) => {
  const metrics = await getMetrics();

  const over5Seconds =
    metrics.image_generation["<= +Inf"] - metrics.image_generation["<= 5"];

  const alerts = [
    {
      description:
        "There are images that take over 5s to be generated, since last time howru was called",
      alert: over5Seconds > prevOver5Seconds,
      over5Seconds,
      prevOver5Seconds,
    },
  ];

  prevOver5Seconds = over5Seconds;
  const ok = !alerts.find((a) => !!a.alert);

  const res = {
    ok,
    metrics,
    alerts,
    upSince,
  };

  if (!ok) {
    reply.statusCode = 500;
    log.error("Howru failed", { howruRes: JSON.stringify(res) });
  }
  return res;
});

// for yo
server.get("/hello", async (request, reply) => {
  return "Yo pjo";
});

server.delete("/wipeAll", async (request, reply) => {
  return await cleanup();
});

const port = Number(process.env.PORT) || 3000;

if (require.main === module) {
  server.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}
