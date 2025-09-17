import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const generateCoachCompletion = vi.fn();
const buildCoachCacheKey = vi.fn(() => 'coach:cache:test');
const getCachedCoachResponse = vi.fn();
const setCoachCacheResponse = vi.fn();
const createCacheEntry = vi.fn((mode, result) => ({ ...result, mode, cachedAt: Date.now() }));
const enforceCoachRateLimit = vi.fn();
const ensureCoachContentIsSafe = vi.fn();

vi.mock('@/lib/coach/service', () => ({
  generateCoachCompletion,
}));

vi.mock('@/lib/coach/cache', () => ({
  buildCoachCacheKey,
  getCachedCoachResponse,
  setCoachCacheResponse,
  createCacheEntry,
}));

vi.mock('@/lib/coach/rate-limit', () => ({
  enforceCoachRateLimit,
}));

vi.mock('@/lib/coach/moderation', () => ({
  ensureCoachContentIsSafe,
}));

describe('/api/coach', () => {
  let POST: typeof import('./route').POST;
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
    enforceCoachRateLimit.mockResolvedValue({ allowed: true, remaining: 19, limit: 20, retryAfterSeconds: 0 });
    ensureCoachContentIsSafe.mockResolvedValue({ allowed: true });
    POST = (await import('./route')).POST;
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('returns 400 for invalid json body', async () => {
    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        body: 'invalid-json',
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid payload structure', async () => {
    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns 503 when API key is missing', async () => {
    process.env.OPENAI_API_KEY = '';
    POST = (await import('./route')).POST;

    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'hint',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(503);
  });

  it('serves cached responses when available', async () => {
    getCachedCoachResponse.mockResolvedValue({
      message: 'cached',
      mode: 'hint',
      finishReason: 'stop',
      usage: { totalTokens: 10 },
      attempts: 1,
      latencyMs: 120,
      cachedAt: Date.now(),
    });

    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'hint',
        messages: [{ role: 'user', content: 'Need help' }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('cached');
    expect(data.cached).toBe(true);
    expect(generateCoachCompletion).not.toHaveBeenCalled();
  });

  it('calls coach service and stores cache when not cached', async () => {
    getCachedCoachResponse.mockResolvedValue(null);
    generateCoachCompletion.mockResolvedValue({
      message: 'Try isolating x.',
      finishReason: 'stop',
      usage: { totalTokens: 42 },
      attempts: 1,
      latencyMs: 250,
    });

    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'hint',
        messages: [{ role: 'user', content: 'How do I solve this?' }],
        question: {
          prompt: 'Solve 2x + 3 = 11',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(generateCoachCompletion).toHaveBeenCalledTimes(1);
    expect(setCoachCacheResponse).toHaveBeenCalledWith(
      'coach:cache:test',
      expect.objectContaining({ message: 'Try isolating x.' }),
    );
    expect(data.cached).toBe(false);
    expect(data.mode).toBe('hint');
  });

  it('returns 429 when rate limit is exceeded', async () => {
    enforceCoachRateLimit.mockResolvedValue({ allowed: false, remaining: 0, limit: 20, retryAfterSeconds: 120 });

    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hint',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      }),
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Too many coach requests. Try again soon.' });
  });

  it('blocks flagged content from moderation', async () => {
    getCachedCoachResponse.mockResolvedValue(null);
    ensureCoachContentIsSafe.mockResolvedValue({ allowed: false, flaggedCategories: ['violence'] });

    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hint',
          messages: [{ role: 'user', content: 'harmful request' }],
        }),
      }),
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.flaggedCategories).toContain('violence');
    expect(generateCoachCompletion).not.toHaveBeenCalled();
  });

  it('returns 500 when the coach service throws', async () => {
    getCachedCoachResponse.mockResolvedValue(null);
    generateCoachCompletion.mockRejectedValue(new Error('openai down'));

    const response = await POST(
      new Request('http://localhost/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hint',
          messages: [{ role: 'user', content: 'Need help' }],
        }),
      }),
    );

    expect(response.status).toBe(500);
  });
});
