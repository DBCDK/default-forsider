import fastify from "fastify";
import { generate, generateArray } from "./svg/svgGenerator";
import path from "path";
import { promises as Fs } from "fs";
import { mapMaterialType, materialTypes, sizes } from "./utils";
import { exec } from "child_process";
import { log } from "dbc-node-logger";

const _ = require("lodash");
const server = fastify();

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
  if (
    request.url.startsWith("/large") ||
    request.url.startsWith("/thumbnail")
  ) {
    await waitForFile(request.url);
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
    console.log("hest");
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
