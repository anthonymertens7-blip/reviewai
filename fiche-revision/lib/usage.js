import { Redis } from "@upstash/redis";

export const FREE_LIMIT = 2;

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

function keyFor(userId) {
  return `fiche-revision:usage:${userId}`;
}

export async function getUsageCount(userId) {
  if (!redis) return 0;
  const count = await redis.get(keyFor(userId));
  return Number(count) || 0;
}

export async function incrementUsageCount(userId) {
  if (!redis) return 0;
  return redis.incr(keyFor(userId));
}
