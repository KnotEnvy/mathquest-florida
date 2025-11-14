// apps/web/src/lib/coach/service.ts
import OpenAI from "openai";
import type { Response as OpenAIResponse, ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";

export type CoachMode = "hint" | "explain" | "comfort" | "challenge";

export interface CoachMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CoachQuestionContext {
  id?: string;
  prompt: string;
  choices?: string[];
  correctAnswer?: string;
  domain?: string;
  difficulty?: number;
}

export interface CoachAttemptSummary {
  attempts?: number;
  lastAnswer?: string;
  correct?: boolean;
  streak?: number;
}

export interface CoachRequestPayload {
  mode: CoachMode;
  messages: CoachMessage[];
  topic?: string;
  question?: CoachQuestionContext;
  attemptSummary?: CoachAttemptSummary;
}

export interface CoachCompletionResult {
  message: string;
  finishReason?: string | null;
  usage?: {
    promptTokens?: number | null;
    completionTokens?: number | null;
    totalTokens?: number | null;
  } | null;
  attempts: number;
  latencyMs: number;
}

const MODE_BEHAVIORS: Record<
  CoachMode,
  { guidance: string; coachingBehaviors: string[] }
> = {
  hint: {
    guidance:
      "Offer a concise hint that nudges the student toward the next logical step without giving away the full solution.",
    coachingBehaviors: [
      "Ask the student to share their next step so you can confirm they are on track.",
      "Point to one specific strategy (isolating variables, drawing a diagram, etc.) rather than restating the prompt.",
    ],
  },
  explain: {
    guidance:
      "Deliver a complete step-by-step explanation with clear reasoning and math notation.",
    coachingBehaviors: [
      "Reference the SAT or PERT framing so learners see why the skill matters.",
      "Explicitly call out the concept being used before each step (e.g., Distributive Property, Factoring).",
    ],
  },
  comfort: {
    guidance:
      "Lead with empathy and encouragement. Normalize struggle, reflect their effort, and offer a reassuring next action.",
    coachingBehaviors: [
      "Mirror the learner's feelings before offering guidance.",
      "Offer one calming action item (deep breath, write out knowns) before any math advice.",
    ],
  },
  challenge: {
    guidance:
      "Push the student to think deeper. Ask follow-up questions, highlight patterns, and suggest strategies that raise the difficulty slightly.",
    coachingBehaviors: [
      "Turn your response into 1-2 probing questions before sharing any solution steps.",
      "Suggest a variation of the current problem that uses the same concept at a harder level.",
    ],
  },
};

const SYSTEM_PREAMBLE =
  "You are MathQuest Coach, an encouraging AI tutor helping Florida SAT students conquer math anxiety.";

let cachedClient: OpenAI | null = null;

export function getCoachClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function buildContextDetails({
  question,
  attemptSummary,
  topic,
}: Pick<CoachRequestPayload, "question" | "attemptSummary" | "topic">) {
  const details: string[] = [];

  if (topic) {
    details.push(`Student focus topic: ${topic}.`);
  }

  if (question) {
    const parts: string[] = ["Current question prompt:", question.prompt];
    if (question.choices?.length) {
      parts.push(`Choices: ${question.choices.join(", ")}`);
    }
    if (question.domain) {
      parts.push(`Domain: ${question.domain}.`);
    }
    if (typeof question.difficulty === "number") {
      parts.push(`Difficulty parameter: ${question.difficulty.toFixed(2)}.`);
    }
    details.push(parts.join(" "));
  }

  if (attemptSummary) {
    const summary: string[] = [];
    if (typeof attemptSummary.attempts === "number") {
      summary.push(`Attempts this session: ${attemptSummary.attempts}.`);
    }
    if (attemptSummary.lastAnswer) {
      summary.push(`Most recent answer: ${attemptSummary.lastAnswer}.`);
    }
    if (typeof attemptSummary.correct === "boolean") {
      summary.push(`Last answer correct: ${attemptSummary.correct ? "yes" : "no"}.`);
    }
    if (typeof attemptSummary.streak === "number") {
      summary.push(`Current streak: ${attemptSummary.streak}.`);
    }
    if (summary.length) {
      details.push(summary.join(" "));
    }
  }

  if (!details.length) {
    return "";
  }

  return `Context: ${details.join(" ")}`;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.0-mini";
const MAX_RETRIES = Number.parseInt(process.env.COACH_MAX_RETRIES ?? "2", 10);
const RESPONSE_COMPLETION_TIMEOUT_MS = Number.parseInt(
  process.env.COACH_RESPONSE_TIMEOUT_MS ?? "20000",
  10,
);
const RESPONSE_POLL_INTERVAL_MS = Number.parseInt(
  process.env.COACH_RESPONSE_POLL_INTERVAL_MS ?? "500",
  10,
);
const PENDING_RESPONSE_STATUSES = new Set(["in_progress", "queued"]);

async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatUsage(usage?: {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
}) {
  if (!usage) {
    return null;
  }

  const promptTokens = usage.prompt_tokens ?? usage.input_tokens ?? null;
  const completionTokens = usage.completion_tokens ?? usage.output_tokens ?? null;
  const totalTokens = usage.total_tokens ??
    (promptTokens !== null && completionTokens !== null
      ? promptTokens + completionTokens
      : null);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

function extractResponseText(response: OpenAIResponse) {
  const direct = response.output_text?.trim();
  if (direct && direct.length > 0) {
    return direct;
  }

  const collected: string[] = [];
  const pushText = (value?: string | null) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        collected.push(trimmed);
      }
    }
  };

  for (const item of response.output ?? []) {
    if (!item) {
      continue;
    }

    const itemType = (item as { type?: string }).type;
    if (itemType === "output_text") {
      pushText((item as { text?: string }).text);
      continue;
    }

    if (item.type === "message") {
      for (const content of item.content ?? []) {
        if (!content) {
          continue;
        }

        if (content.type === "output_text") {
          pushText(content.text);
        } else if (content.type === "refusal") {
          pushText(content.refusal);
        }
      }
    }
  }

  if (!collected.length) {
    return null;
  }

  const combined = collected.join("\n").trim();
  return combined.length > 0 ? combined : null;
}

type ResponsesInputMessage = {
  role: "user" | "assistant";
  content: string;
};

function isPendingStatus(status?: string | null) {
  if (!status) {
    return false;
  }
  return PENDING_RESPONSE_STATUSES.has(status);
}

async function fetchCompletedResponse(client: OpenAI, payload: ResponseCreateParamsNonStreaming) {
  let response = await client.responses.create(payload);

  if (!response.id || !isPendingStatus(response.status)) {
    return response;
  }

  const deadline = Date.now() + RESPONSE_COMPLETION_TIMEOUT_MS;

  while (isPendingStatus(response.status)) {
    if (Date.now() >= deadline) {
      throw new Error("Coach response timed out before completion");
    }

    await delay(RESPONSE_POLL_INTERVAL_MS);
    response = await client.responses.retrieve(response.id);
  }

  if (response.status && response.status !== "completed") {
    const errorMessage = response.error?.message ?? `Coach response failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response;
}

function buildExternalSystemInstructions(messages: CoachMessage[]) {
  return messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter((content) => content.length > 0);
}

function buildCoachInstructions(payload: CoachRequestPayload) {
  const contextDetails = buildContextDetails(payload);
  const persona = MODE_BEHAVIORS[payload.mode];
  const extraSystemPrompts = buildExternalSystemInstructions(payload.messages);

  return [
    SYSTEM_PREAMBLE,
    persona.guidance,
    ...persona.coachingBehaviors,
    "Keep responses under 180 words, use warm language, and include LaTeX syntax for math steps when helpful.",
    "End with a quick call-to-action so the learner knows what to try next.",
    contextDetails,
    ...extraSystemPrompts,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildResponsesInput(payload: CoachRequestPayload): ResponsesInputMessage[] {
  return payload.messages
    .filter((message): message is CoachMessage & { role: "user" | "assistant" } => {
      return message.role === "user" || message.role === "assistant";
    })
    .map((message) => ({ role: message.role, content: message.content.trim() }))
    .filter((message) => message.content.length > 0);
}

export async function generateCoachCompletion(payload: CoachRequestPayload): Promise<CoachCompletionResult> {
  const client = getCoachClient();
  const instructions = buildCoachInstructions(payload);
  const baseInput = buildResponsesInput(payload);
  const start = Date.now();
  const maxAttempts = Math.max(1, MAX_RETRIES + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      let conversationInput = baseInput;
      if (!conversationInput.length) {
        const fallbackContent = payload.messages[payload.messages.length - 1]?.content?.trim();
        conversationInput = [
          {
            role: "user" as const,
            content:
              fallbackContent && fallbackContent.length > 0
                ? fallbackContent
                : "I need help with SAT math practice.",
          },
        ];
      }

      const responsesPayload: ResponseCreateParamsNonStreaming = {
        model: DEFAULT_MODEL,
        input: conversationInput,
        instructions,
        max_output_tokens: 512,
        text: {
          format: {
            type: "text",
          },
        },
      };

      const response = await fetchCompletedResponse(client, responsesPayload);

      const responseText = extractResponseText(response);
      if (!responseText) {
        throw new Error("Coach returned an empty response");
      }

      return {
        message: responseText,
        finishReason: null,
        usage: formatUsage({
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens,
          total_tokens: response.usage?.total_tokens,
        }),
        attempts: attempt,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      const backoffMs = Math.min(500 * 2 ** (attempt - 1), 4000);
      await delay(backoffMs);
    }
  }

  throw new Error("Unable to contact coach");
}

export function buildCoachCacheFingerprint(payload: CoachRequestPayload) {
  return JSON.stringify({
    mode: payload.mode,
    messages: payload.messages,
    topic: payload.topic,
    question: payload.question,
    attemptSummary: payload.attemptSummary,
    model: DEFAULT_MODEL,
  });
}

export { MODE_BEHAVIORS };
