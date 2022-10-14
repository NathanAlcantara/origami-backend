import Redis from "ioredis";

import { REDIS_URL } from "envs";
import { isValid } from "utils";

export enum CacheKey {
  LOGGED_USER = "logged-user",
}

let redisOptions = {};

if (!REDIS_URL.includes("localhost")) {
  redisOptions = {
    tls: {
      rejectUnauthorized: false,
    },
  };
}

export const createRedis = () => {
  return new Redis(REDIS_URL, redisOptions);
};

export const redis = createRedis();

export const setCache = (
  key: string,
  value: any,
  expireTime?: string | number
): void => {
  if (typeof value !== "string") {
    value = JSON.stringify(value);
  }

  if (isValid(expireTime)) {
    redis.set(key, value, "EX", expireTime);
  } else {
    redis.set(key, value);
  }
};

export const getCache = async <T>(key: string): Promise<T> => {
  try {
    const cache = await redis.get(key);
    try {
      return JSON.parse(cache);
    } catch {
      return cache as any;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    throw new Error(error);
  }
};