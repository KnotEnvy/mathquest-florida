// apps/web/src/lib/coach/cache.ts
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import { buildCoachCacheFingerprint, type CoachCompletionResult, type CoachRequestPayload } from './service';

interface CacheEntry extends CoachCompletionResult {
  mode: CoachRequestPayload['mode'];
  cachedAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
let redisClient: Redis | null = null;
const CACHE_TTL_SECONDS = Number.parseInt(process.env.COACH_CACHE_TTL ?? '300', 10);

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

export function buildCoachCacheKey(payload: CoachRequestPayload) {
  const fingerprint = buildCoachCacheFingerprint(payload);
  const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');
  return `coach:response:${hash}`;
}

export async function getCachedCoachResponse(
  key: string,
): Promise<CacheEntry | null> {
  const redis = getRedisClient();
  if (redis) {
    const cached = await redis.get<CacheEntry>(key);
    if (cached) {
      return cached;
    }
  }

  const local = memoryCache.get(key);
  if (!local) {
    return null;
  }

  if (Date.now() - local.cachedAt > CACHE_TTL_SECONDS * 1000) {
    memoryCache.delete(key);
    return null;
  }

  return local;
}

export async function setCoachCacheResponse(key: string, entry: CacheEntry) {
  const redis = getRedisClient();
  const payload = { ...entry, cachedAt: Date.now() } satisfies CacheEntry;

  if (redis) {
    await redis.set(key, payload, { ex: CACHE_TTL_SECONDS });
  }

  memoryCache.set(key, payload);
}

export function createCacheEntry(
  mode: CoachRequestPayload['mode'],
  result: CoachCompletionResult,
): CacheEntry {
  return {
    ...result,
    mode,
    cachedAt: Date.now(),
  };
}
