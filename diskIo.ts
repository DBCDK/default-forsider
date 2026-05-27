import { promises as Fs } from "fs";
// @ts-ignore
import { log } from "dbc-node-logger";

function logDiskOp(
  op: string,
  filePath: string,
  totalMs: number,
  extra?: Record<string, unknown>
): void {
  log.info(`Disk ${op}`, { path: filePath, total_ms: totalMs, ...extra });
}

export async function readFile(filePath: string): Promise<Buffer> {
  const start = performance.now();
  try {
    const buffer = await Fs.readFile(filePath);
    logDiskOp("read", filePath, performance.now() - start, {
      size: buffer.length,
    });
    return buffer;
  } catch (err: any) {
    logDiskOp("read", filePath, performance.now() - start, {
      error: err?.code || err?.message,
    });
    throw err;
  }
}

export async function readFileUtf8(filePath: string): Promise<string> {
  const start = performance.now();
  try {
    const content = await Fs.readFile(filePath, { encoding: "utf8" });
    logDiskOp("read", filePath, performance.now() - start, {
      size: content.length,
    });
    return content;
  } catch (err: any) {
    logDiskOp("read", filePath, performance.now() - start, {
      error: err?.code || err?.message,
    });
    throw err;
  }
}

export async function writeFile(
  filePath: string,
  data: Buffer
): Promise<void> {
  const start = performance.now();
  try {
    await Fs.writeFile(filePath, data);
    logDiskOp("write", filePath, performance.now() - start, {
      size: data.length,
    });
  } catch (err: any) {
    logDiskOp("write", filePath, performance.now() - start, {
      error: err?.code || err?.message,
    });
    throw err;
  }
}

export async function access(filePath: string): Promise<void> {
  const start = performance.now();
  try {
    await Fs.access(filePath);
    logDiskOp("access", filePath, performance.now() - start);
  } catch (err: any) {
    logDiskOp("access", filePath, performance.now() - start, {
      error: err?.code || err?.message,
    });
    throw err;
  }
}

export async function mkdir(dirPath: string): Promise<void> {
  const start = performance.now();
  try {
    await Fs.mkdir(dirPath);
    logDiskOp("mkdir", dirPath, performance.now() - start);
  } catch (err: any) {
    logDiskOp("mkdir", dirPath, performance.now() - start, {
      error: err?.code || err?.message,
    });
    throw err;
  }
}
