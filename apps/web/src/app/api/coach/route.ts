// apps/web/src/app/api/coach/route.ts
import { NextResponse } from 'next/server';
import { CoachRequestSchema } from '@/lib/validation';
import { generateCoachCompletion, type CoachRequestPayload } from '@/lib/coach/service';
import { buildCoachCacheKey, createCacheEntry, getCachedCoachResponse, setCoachCacheResponse } from '@/lib/coach/cache';
import { enforceCoachRateLimit } from '@/lib/coach/rate-limit';
import { ensureCoachContentIsSafe } from '@/lib/coach/moderation';

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'anonymous';
  }

  const realIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('fastly-client-ip');

  if (realIp) {
    return realIp;
  }

  return 'anonymous';
}

function getModerationInput(payload: CoachRequestPayload) {
  const lastUserMessage = [...payload.messages].reverse().find((message) => message.role === 'user');
  const parts = [lastUserMessage?.content ?? '', payload.question?.prompt ?? '', payload.topic ?? '']
    .map((entry) => entry?.trim())
    .filter((entry) => entry && entry.length > 0);

  return parts.join('\n');
}

function buildRateHeaders(limit: number, remaining: number) {
  return {
    'Cache-Control': 'no-store',
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
  } as Record<string, string>;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Coach service is not configured. Set OPENAI_API_KEY.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CoachRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request payload', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data as CoachRequestPayload;
  const identifier = getClientIdentifier(request);
  const rate = await enforceCoachRateLimit(identifier);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many coach requests. Try again soon.' },
      {
        status: 429,
        headers: {
          ...buildRateHeaders(rate.limit, 0),
          'Retry-After': String(Math.max(1, rate.retryAfterSeconds || 60)),
        },
      },
    );
  }

  const moderationInput = getModerationInput(payload);
  const moderation = await ensureCoachContentIsSafe(moderationInput);
  if (!moderation.allowed) {
    return NextResponse.json(
      {
        error: 'Coach cannot respond to that request.',
        flaggedCategories: moderation.flaggedCategories,
      },
      {
        status: 400,
        headers: buildRateHeaders(rate.limit, rate.remaining),
      },
    );
  }

  const cacheKey = buildCoachCacheKey(payload);
  const cached = await getCachedCoachResponse(cacheKey);
  if (cached) {
    return NextResponse.json(
      {
        message: cached.message,
        mode: cached.mode,
        finishReason: cached.finishReason,
        usage: cached.usage,
        cached: true,
        attempts: cached.attempts,
        latencyMs: 0,
      },
      {
        headers: buildRateHeaders(rate.limit, rate.remaining),
      },
    );
  }

  try {
    const result = await generateCoachCompletion(payload);
    const entry = createCacheEntry(payload.mode, result);
    await setCoachCacheResponse(cacheKey, entry);

    return NextResponse.json(
      {
        ...result,
        mode: payload.mode,
        cached: false,
      },
      {
        headers: buildRateHeaders(rate.limit, rate.remaining),
      },
    );
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json(
      { error: 'Failed to contact coach' },
      {
        status: 500,
        headers: buildRateHeaders(rate.limit, rate.remaining),
      },
    );
  }
}


