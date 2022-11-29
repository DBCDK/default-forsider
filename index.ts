import fastify from "fastify";
import { generate, generateArray } from "./svg/svgGenerator";
import path from "path";
import { promises as Fs } from "fs";
import { mapMaterialType, materialTypes, sizes } from "./utils";
import { exec } from "child_process";
// @ts-ignore
import { log } from "dbc-node-logger";
import { getMetrics, initHistogram, registerDuration } from "./monitor";

const _ = require("lodash");
const server = fastify();
const upSince = new Date();
export const workingDirectory = process.env.IMAGE_DIR || "HUND";

/**
 * Check if working directories for storing images are in place
 */
async function checkDirectories() {
  const good = await fileExists(`/${workingDirectory}`);
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
      `find ./images -type f -name "*.jpg" -not -path "./images/${workingDirectory}/*" -delete || true`
    );
    // now delete the (empty) directories
    await executeBash(
      `find ./images/* -type d -not -path "./images/${workingDirectory}*" -delete || true`
      //"ls -la images/",
    );
  } catch (e) {
    log.error(JSON.stringify(e));
  }
}

checkDirectories();
cleanup();

// public folder for (static) images
server.register(require("@fastify/static"), {
  root: path.join(__dirname, "images"),
});

const PERFORMANCE_WAIT_FOR_IMAGE = "wait_for_image";
initHistogram(PERFORMANCE_WAIT_FOR_IMAGE);

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Fs.access("./images" + path);
    return true;
  } catch (error) {
    return false;
  }
}

async function waitForFile(path: string) {
  const retryBackOff = [100, 500, 1000, 5000, 10000];
  for (let i = 0; i < retryBackOff.length; i++) {
    if (await fileExists(path)) {
      // All good, file exists
      return;
    }

    // Not ready yet, wait some time
    // console.log("not found wait for file ", retryBackOff[i])
    await delay(retryBackOff[i]);
  }

  // Uhoh, this is not good, image was not generated, we should monitor this
  // TODO monitor this
}

server.addHook("onRequest", async (request, reply) => {
  // We should have a better way of identifying file access
  if (request.url.includes("/large") || request.url.includes("/thumbnail")) {
    const now = performance.now();
    await waitForFile(request.url);
    registerDuration(PERFORMANCE_WAIT_FOR_IMAGE, performance.now() - now);
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
  let found = Object.keys(materialTypes).indexOf(mappedMaterialType);
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
  materialType: materialTypes;
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
    const response = generate(request.query);
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
}>("/defaultcover/", (request, reply) => {
  const fisk = generateArray(request.body);
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
// Count of images that have taken over 5 s to wait for
let prevOver5SecondsWait = 0;
server.get("/howru", async (request, reply) => {
  const metrics = await getMetrics();

  // All requests minus requests that take 5s or below
  const over5Seconds =
    metrics.image_generation["<= +Inf"] - metrics.image_generation["<= 5"];

  const over5SecondsWait =
    metrics[PERFORMANCE_WAIT_FOR_IMAGE]["<= +Inf"] -
    metrics[PERFORMANCE_WAIT_FOR_IMAGE]["<= 5"];

  const alerts = [
    {
      description:
        "There are images that take over 5s to be generated, since last time howru was called",
      alert: over5Seconds > prevOver5Seconds,
      over5Seconds,
      prevOver5Seconds,
    },
    // {
    //   description:
    //     "Number of times it takes over 5s to fetch image since last time howru was called",
    //   alert: over5SecondsWait > prevOver5SecondsWait,
    //   over5SecondsWait,
    //   prevOver5SecondsWait,
    // },
  ];

  prevOver5Seconds = over5Seconds;
  prevOver5SecondsWait = over5SecondsWait;
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
  return await deleteAllImages();
});

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
