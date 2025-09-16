import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCreate = vi.fn();
const mockConstructor = vi.fn(() => ({
  chat: {
    completions: {
      create: mockCreate,
    },
  },
}));

vi.mock('openai', () => ({
  default: mockConstructor,
}));

describe('/api/coach', () => {
  let POST: typeof import('./route').POST;
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    vi.resetModules();
    mockCreate.mockReset();
    mockConstructor.mockClear();
    process.env.OPENAI_API_KEY = 'test-key';
    const route = await import('./route');
    POST = route.POST;
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('returns 400 for invalid json body', async () => {
    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      body: 'not-json',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for invalid payload structure', async () => {
    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request payload');
  });

  it('returns 503 when API key is missing', async () => {
    process.env.OPENAI_API_KEY = '';
    const route = await import('./route');
    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'hint',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await route.POST(request);
    expect(response.status).toBe(503);
  });

  it('forwards request to OpenAI and returns response text', async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: { content: 'Try isolating x.' },
          finish_reason: 'stop',
        },
      ],
      usage: { total_tokens: 42 },
    });

    const payload = {
      mode: 'hint' as const,
      messages: [
        { role: 'user' as const, content: 'I am stuck solving 2x + 3 = 11.' },
      ],
      question: {
        prompt: 'Solve 2x + 3 = 11',
        choices: ['3', '4', '5', '6'],
        domain: 'Algebra',
        difficulty: -0.3,
      },
      attemptSummary: {
        attempts: 1,
        lastAnswer: '5',
        correct: false,
      },
    };

    const request = new Request('http://localhost/api/coach', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockConstructor).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('gpt-4o-mini');
    expect(callArgs.messages[0].role).toBe('system');
    expect(callArgs.messages[1]).toEqual(payload.messages[0]);
    expect(data.message).toBe('Try isolating x.');
    expect(data.mode).toBe('hint');
    expect(data.finishReason).toBe('stop');
    expect(data.usage.total_tokens).toBe(42);
  });
});
