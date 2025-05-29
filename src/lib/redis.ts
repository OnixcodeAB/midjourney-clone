// src/lib/redis.ts
import { createClient } from "redis";
type RedisClient = ReturnType<typeof createClient> & {
  isOpen: boolean;
  isReady: boolean;
};

declare global {
  var redis: RedisClient | undefined;
}

let redis: RedisClient;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Fallback in-memory cache
const fallbackCache = new Map<string, { value: any; expires: number }>();

function createFallbackClient(): RedisClient {
  return {
    async get(key: string) {
      const entry = fallbackCache.get(key);
      if (!entry) return null;
      if (entry.expires < Date.now()) {
        fallbackCache.delete(key);
        return null;
      }
      return entry.value;
    },
    async setEx(key: string, seconds: number, value: string) {
      fallbackCache.set(key, {
        value,
        expires: Date.now() + seconds * 1000,
      });
    },
    async del(keys: string | string[]) {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach((k) => fallbackCache.delete(k));
    },
    async keys(pattern: string) {
      const allKeys = Array.from(fallbackCache.keys());
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        return allKeys.filter((k) => k.startsWith(prefix));
      }
      return allKeys.filter((k) => k === pattern);
    },
    async quit() {
      fallbackCache.clear();
    },
    connect: async () => {},
    disconnect: async () => {},
    isOpen: true,
    isReady: true,
    on: function () {
      return this as any;
    },
  } as unknown as RedisClient;
}

async function initializeRedis(): Promise<boolean> {
  if (!(process.env.REDIS_URL || "redis://localhost:6379")) {
    console.warn("REDIS_URL not set - using in-memory fallback");
    redis = createFallbackClient();
    return false;
  }

  try {
    if (global.redis && (global.redis.isOpen || global.redis.isReady)) {
      redis = global.redis;
      return true;
    }

    redis = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.log("Max reconnection attempts reached");
            return new Error("Max retries reached");
          }
          return Math.min(retries * 100, 5000);
        },
      },
    }) as RedisClient;

    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });

    await redis.connect();
    connectionAttempts = 0;

    if (process.env.NODE_ENV !== "production") {
      global.redis = redis;
    }

    return true;
  } catch (error) {
    connectionAttempts++;
    console.error(
      `Redis connection failed (attempt ${connectionAttempts}):`,
      error
    );

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      console.warn("Falling back to in-memory cache after connection failures");
      redis = createFallbackClient();
    }
    return false;
  }
}

// Initialize immediately
let isRedisConnected = false;
(async () => {
  isRedisConnected = await initializeRedis();
})();

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) return false;

  try {
    if (redis.isOpen && redis.isReady) return true;

    // Try to ping the server
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}

// Cache operations with automatic fallback
export async function cacheResult<T>(
  key: string,
  ttl: number,
  value: UsageResult | any
): Promise<void> {
  try {
    // Verify connection health
    if (!(await checkRedisHealth())) {
      if (!isRedisConnected) {
        isRedisConnected = await initializeRedis();
      }

      if (!isRedisConnected) {
        throw new Error("Redis unavailable");
      }
    }

    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to cache result for key ${key}:`, error);
    // Fallback to in-memory cache
    fallbackCache.set(key, {
      value: JSON.stringify(value),
      expires: Date.now() + ttl * 1000,
    });
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  /* console.log("getCached", key); */
  try {
    if (!(await checkRedisHealth())) {
      if (!isRedisConnected) {
        isRedisConnected = await initializeRedis();
      }

      if (!isRedisConnected) {
        const fallback = fallbackCache.get(key);
        /* console.log({ redisfallback: fallback }); */
        return fallback ? JSON.parse(fallback.value) : null;
      }
    }

    const result = await redis.get(key);
    /* console.log({ redis: result }); */
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error(`Failed to get cached value for key ${key}:`, error);
    const fallback = fallbackCache.get(key);
    return fallback ? JSON.parse(fallback.value) : null;
  }
}

export async function invalidateCache(key: string | string[]): Promise<void> {
  try {
    if (await checkRedisHealth()) {
      await redis.del(key);
    }

    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => fallbackCache.delete(k));
  } catch (error) {
    console.error("Cache invalidation failed:", error);
  }
}

export { redis };
