// apps/web/src/lib/coach/rate-limit.ts
import { Redis } from '@upstash/redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

const WINDOW_SECONDS = Number.parseInt(process.env.COACH_RATE_WINDOW ?? `${60 * 60}`, 10);
const REQUEST_LIMIT = Number.parseInt(process.env.COACH_RATE_LIMIT ?? '40', 10);

let redisClient: Redis | null = null;
const localCounters = new Map<string, { count: number; resetAt: number }>();

function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

export async function enforceCoachRateLimit(identifier: string): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis) {
    const key = `coach:rl:${identifier}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const remaining = REQUEST_LIMIT - current;
    if (current > REQUEST_LIMIT) {
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        limit: REQUEST_LIMIT,
        retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      limit: REQUEST_LIMIT,
      retryAfterSeconds: 0,
    };
  }

  const now = Date.now();
  const existing = localCounters.get(identifier);
  if (!existing || existing.resetAt <= now) {
    localCounters.set(identifier, { count: 1, resetAt: now + WINDOW_SECONDS * 1000 });
    return {
      allowed: true,
      remaining: Math.max(0, REQUEST_LIMIT - 1),
      limit: REQUEST_LIMIT,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  if (existing.count > REQUEST_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: REQUEST_LIMIT,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  localCounters.set(identifier, existing);
  return {
    allowed: true,
    remaining: Math.max(0, REQUEST_LIMIT - existing.count),
    limit: REQUEST_LIMIT,
    retryAfterSeconds: 0,
  };
}
