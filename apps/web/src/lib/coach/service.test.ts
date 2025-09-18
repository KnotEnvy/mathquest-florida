import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const createMock = vi.fn();
const responsesMock = vi.fn();
const moderationsMock = vi.fn();

const openAIMock = vi.fn(() => ({
  chat: {
    completions: {
      create: createMock,
    },
  },
  responses: {
    create: responsesMock,
  },
  moderations: {
    create: moderationsMock,
  },
}));

vi.mock("openai", () => ({
  default: openAIMock,
}));

describe("coach service", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  let generateCoachCompletion: typeof import("./service").generateCoachCompletion;
  let getCoachClient: typeof import("./service").getCoachClient;

  async function loadService() {
    const service = await import("./service");
    generateCoachCompletion = service.generateCoachCompletion;
    getCoachClient = service.getCoachClient;
  }

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4o-mini";
    await loadService();
    responsesMock.mockReset();
    createMock.mockReset();
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
  });

  it("creates a singleton OpenAI client", () => {
    getCoachClient();
    getCoachClient();

    expect(openAIMock).toHaveBeenCalledTimes(1);
  });

  it("generates coach responses with retries using chat completions", async () => {
    createMock.mockRejectedValueOnce(new Error("rate limit"));
    createMock.mockResolvedValue({
      choices: [
        {
          message: { content: "Try isolating x." },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCoachCompletion({
      mode: "hint",
      messages: [{ role: "user", content: "Help me solve 2x + 3 = 11" }],
    });

    expect(result.message).toBe("Try isolating x.");
    expect(result.attempts).toBe(2);
    expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 });
    expect(createMock).toHaveBeenCalledTimes(2);
    expect(responsesMock).not.toHaveBeenCalled();
  });

  it("throws when OpenAI returns no content", async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: "" } }] });

    await expect(
      generateCoachCompletion({
        mode: "hint",
        messages: [{ role: "user", content: "Empty response please" }],
      }),
    ).rejects.toThrow("Coach returned an empty response");
  });

  it("uses the responses API for gpt-5 models", async () => {
    process.env.OPENAI_MODEL = "gpt-5.0-mini";
    vi.resetModules();
    await loadService();

    responsesMock.mockResolvedValue({
      output_text: "Try isolating x.",
      usage: { input_tokens: 12, output_tokens: 25, total_tokens: 37 },
      output: [{ finish_reason: "stop" }],
    });

    const result = await generateCoachCompletion({
      mode: "hint",
      messages: [{ role: "user", content: "Help me solve 2x + 3 = 11" }],
    });

    expect(responsesMock).toHaveBeenCalledTimes(1);
    expect(createMock).not.toHaveBeenCalled();
    expect(responsesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining("MathQuest Coach"),
        input: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: expect.stringContaining("Help me solve 2x + 3 = 11") }),
        ]),
      }),
    );
    const requestPayload = responsesMock.mock.calls[0]?.[0] as {
      input?: Array<{ role: string; content: string }>;
    };
    expect(requestPayload).toBeDefined();
    expect(requestPayload?.input?.length).toBeGreaterThan(0);
    expect(requestPayload).not.toHaveProperty("temperature");
    expect(result.message).toBe("Try isolating x.");
    expect(result.usage).toEqual({ promptTokens: 12, completionTokens: 25, totalTokens: 37 });
  });
});
