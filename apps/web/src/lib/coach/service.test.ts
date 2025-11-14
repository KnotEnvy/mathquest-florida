import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const responsesCreateMock = vi.fn();
const responsesRetrieveMock = vi.fn();
const moderationsMock = vi.fn();

const openAIMock = vi.fn(() => ({
  responses: {
    create: responsesCreateMock,
    retrieve: responsesRetrieveMock,
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
    process.env.OPENAI_MODEL = "gpt-5-nano-2025-08-07";
    await loadService();
    responsesCreateMock.mockReset();
    responsesRetrieveMock.mockReset();
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

  it("generates coach responses with retries using the Responses API", async () => {
    responsesCreateMock.mockRejectedValueOnce(new Error("rate limit"));
    responsesCreateMock.mockResolvedValue({
      id: "resp_test",
      status: "completed",
      output_text: "Try isolating x.",
      usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
    });

    const result = await generateCoachCompletion({
      mode: "hint",
      messages: [{ role: "user", content: "Help me solve 2x + 3 = 11" }],
    });

    expect(result.message).toBe("Try isolating x.");
    expect(result.attempts).toBe(2);
    expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 20, totalTokens: 30 });
    expect(responsesCreateMock).toHaveBeenCalledTimes(2);

    const payload = responsesCreateMock.mock.calls[0]?.[0];
    expect(payload.instructions).toContain("Offer a concise hint");
    expect(payload.input[0]).toEqual({ role: "user", content: "Help me solve 2x + 3 = 11" });
    expect(payload.text).toEqual({ format: { type: "text" } });
  });

  it("throws when OpenAI returns no content", async () => {
    responsesCreateMock.mockResolvedValue({ id: "resp_empty", status: "completed", output_text: "" });

    await expect(
      generateCoachCompletion({
        mode: "explain",
        messages: [{ role: "user", content: "Empty response please" }],
      }),
    ).rejects.toThrow("Coach returned an empty response");
  });

  it("falls back to output message content when output_text is empty", async () => {
    responsesCreateMock.mockResolvedValue({
      output_text: "",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Consider isolating variables step by step." }],
        },
      ],
      usage: { input_tokens: 8, output_tokens: 18, total_tokens: 26 },
    });

    const result = await generateCoachCompletion({
      mode: "comfort",
      messages: [{ role: "user", content: "I'm stuck." }],
    });

    expect(result.message).toContain("isolating variables");
  });

  it("embeds question context and custom system prompts in instructions", async () => {
    responsesCreateMock.mockResolvedValue({
      id: "resp_context",
      status: "completed",
      output_text: "Consider isolating x first.",
      usage: { input_tokens: 15, output_tokens: 18, total_tokens: 33 },
    });

    await generateCoachCompletion({
      mode: "challenge",
      messages: [
        { role: "system", content: "Always ask for scratch work uploads." },
        { role: "user", content: "Any harder version of this problem?" },
      ],
      question: {
        prompt: "Solve 3x + 5 = 20",
        difficulty: 0.8,
        domain: "Algebra",
      },
      attemptSummary: {
        attempts: 2,
        correct: false,
      },
    });

    const payload = responsesCreateMock.mock.calls[0]?.[0] as { instructions: string };
    expect(payload.instructions).toContain("MathQuest Coach");
    expect(payload.instructions).toContain("Domain: Algebra");
    expect(payload.instructions).toContain("Always ask for scratch work uploads.");
  });

  it("polls until the response completes when initial status is in_progress", async () => {
    responsesCreateMock.mockResolvedValue({
      id: "resp_poll",
      status: "in_progress",
      output: [],
      output_text: "",
      usage: null,
    });

    responsesRetrieveMock.mockResolvedValue({
      id: "resp_poll",
      status: "completed",
      output_text: "Finished response.",
      usage: { input_tokens: 9, output_tokens: 12, total_tokens: 21 },
    });

    const result = await generateCoachCompletion({
      mode: "hint",
      messages: [{ role: "user", content: "Need help" }],
    });

    expect(result.message).toBe("Finished response.");
    expect(responsesRetrieveMock).toHaveBeenCalledWith("resp_poll");
  });
});
