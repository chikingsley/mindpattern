import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

if (!process.env.REDIS_TOKEN) {
  throw new Error('REDIS_TOKEN is not defined');
}

// Create Redis client
export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Create rate limiter
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 s'), // 20 requests per 10 seconds
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Cache keys
export const CACHE_KEYS = {
  EMBEDDINGS: 'embeddings:', // For caching embeddings
  MESSAGES: 'messages:', // For caching messages
  SESSIONS: 'sessions:', // For caching sessions
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  EMBEDDINGS: 60 * 60 * 24, // 24 hours
  MESSAGES: 60 * 60 * 24 * 7, // 7 days
  SESSIONS: 60 * 60 * 24 * 7, // 7 days
} as const;

// Helper function to generate cache key
export const getCacheKey = (type: keyof typeof CACHE_KEYS, id: string) => {
  return `${CACHE_KEYS[type]}${id}`;
};

// Helper function to set cache with TTL
export const setCache = async <T>(
  type: keyof typeof CACHE_KEYS,
  id: string,
  data: T
) => {
  const key = getCacheKey(type, id);
  await redis.set(key, data, {
    ex: CACHE_TTL[type],
  });
};

// Helper function to get cache
export const getCache = async <T>(
  type: keyof typeof CACHE_KEYS,
  id: string
): Promise<T | null> => {
  const key = getCacheKey(type, id);
  return redis.get<T>(key);
};

// Helper function to delete cache
export const deleteCache = async (type: keyof typeof CACHE_KEYS, id: string) => {
  const key = getCacheKey(type, id);
  await redis.del(key);
};

// Helper function to delete all cache of a type
export const deleteAllCache = async (type: keyof typeof CACHE_KEYS) => {
  const keys = await redis.keys(`${CACHE_KEYS[type]}*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
