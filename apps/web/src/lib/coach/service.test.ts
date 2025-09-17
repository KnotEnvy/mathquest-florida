import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const createMock = vi.fn();
const openAIMock = vi.fn(() => ({
  chat: {
    completions: {
      create: createMock,
    },
  },
  moderations: {
    create: vi.fn(),
  },
}));

vi.mock('openai', () => ({
  default: openAIMock,
}));

describe('coach service', () => {
  const originalEnv = process.env.OPENAI_API_KEY;
  let generateCoachCompletion: typeof import('./service').generateCoachCompletion;
  let getCoachClient: typeof import('./service').getCoachClient;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
    const service = await import('./service');
    generateCoachCompletion = service.generateCoachCompletion;
    getCoachClient = service.getCoachClient;
  });

  it('creates a singleton OpenAI client', () => {
    getCoachClient();
    getCoachClient();

    expect(openAIMock).toHaveBeenCalledTimes(1);
  });

  it('generates coach responses with retries', async () => {
    createMock.mockRejectedValueOnce(new Error('rate limit'));
    createMock.mockResolvedValue({
      choices: [
        {
          message: { content: 'Try isolating x.' },
          finish_reason: 'stop',
        },
      ],
      usage: { total_tokens: 42 },
    });

    const result = await generateCoachCompletion({
      mode: 'hint',
      messages: [{ role: 'user', content: 'Help me solve 2x + 3 = 11' }],
    });

    expect(result.message).toBe('Try isolating x.');
    expect(result.attempts).toBe(2);
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('throws when OpenAI returns no content', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: '' } }] });

    await expect(
      generateCoachCompletion({
        mode: 'hint',
        messages: [{ role: 'user', content: 'Empty response please' }],
      }),
    ).rejects.toThrow('Coach returned an empty response');
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });
});
