// @ts-ignore
import { log } from "dbc-node-logger";

function fail(message: string): never {
  log.error(message);
  process.exit(1);
}

function validateRedisConfiguration(): void {
  const redisMockEnabled =
    process.env.REDIS_USE_MOCK === "true" ||
    process.env.NODE_ENV === "test" ||
    process.env.JEST_WORKER_ID !== undefined;

  const redisHostConfigured = Boolean(process.env.REDIS_CLUSTER_HOST?.trim());

  if (!redisMockEnabled && !redisHostConfigured) {
    fail(
      "Redis is required: set REDIS_CLUSTER_HOST (and optionally REDIS_CLUSTER_PORT) or REDIS_USE_MOCK=true"
    );
  }
}

export function validateEnvironmentVariables(): void {
  validateRedisConfiguration();
}
