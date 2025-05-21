// src/lib/redis.ts
import { createClient } from "redis";

declare global {
  // eslint-disable-next-line no-var
  var redis: ReturnType<typeof createClient> | undefined;
}

let redis: ReturnType<typeof createClient>;
const env = {
  REDIS_URL: process.env.REDIS_URL,
};

if (env.REDIS_URL) {
  redis =
    global.redis ||
    createClient({
      url: env.REDIS_URL,
      socket: {
        // Additional socket options
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error("Too many retries on REDIS. Connection Terminated");
            return new Error("Too many retries");
          }
          return Math.min(retries * 100, 5000); // Reconnect with backoff up to 5s
        },
      },
    });

  redis.on("error", (err) => console.error("Redis Client Error", err));

  if (process.env.NODE_ENV !== "production") {
    global.redis = redis;
  }
} else {
  // Fallback in-memory cache for development when Redis isn't configured
  console.warn(
    "REDIS_URL not set - using in-memory cache (not suitable for production)"
  );

  const fallbackCache = new Map<string, { value: any; expires: number }>();

  redis = {
    async get(key: string) {
      const entry = fallbackCache.get(key);
      if (!entry) return null;
      if (entry.expires < Date.now()) {
        fallbackCache.delete(key);
        return null;
      }
      return entry.value;
    },
    async setex(key: string, seconds: number, value: any) {
      fallbackCache.set(key, {
        value,
        expires: Date.now() + seconds * 1000,
      });
    },
    async del(key: string | string[]) {
      const keys = Array.isArray(key) ? key : [key];
      keys.forEach((k) => fallbackCache.delete(k));
    },
    async keys(pattern: string) {
      const allKeys = Array.from(fallbackCache.keys());
      // Simple pattern matching (only supports * at end)
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
    isOpen: true,
    on: () => redis,
    // TypeScript placeholder for other methods
  } as unknown as ReturnType<typeof createClient>;
}

// Helper functions
export async function cachedOperation<T>(
  key: string,
  ttl: number,
  operation: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await operation();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}

export async function flushPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

// Cache a result with a TTL
// This function is used to cache results for a specific key with a time-to-live (TTL) value.
export async function cacheResult<T>(
  key: string,
  ttl: number,
  value: T
): Promise<void> {
  try {
    if (!redis) {
      throw new Error("Redis client not initialized");
    }

    // Only cache if we have a valid Redis connection or fallback
    if (
      redis.isOpen ||
      (process.env.NODE_ENV !== "production" && !redis.isOpen)
    ) {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
    }
  } catch (error) {
    console.error(`Failed to cache result for key ${key}:`, error);
    // Fail silently - caching should never break application flow
  }
}

// Always connect in production
if (process.env.NODE_ENV === "production") {
  redis.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
  });
}

export { redis };
