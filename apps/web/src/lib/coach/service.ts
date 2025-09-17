// apps/web/src/lib/coach/service.ts
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type CoachMode = 'hint' | 'explain' | 'comfort' | 'challenge';

export interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
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

const MODE_BEHAVIORS: Record<CoachMode, { guidance: string; temperature: number }> = {
  hint: {
    guidance:
      'Offer a concise hint that nudges the student toward the next logical step without giving away the full solution. Encourage them to show their work.',
    temperature: 0.3,
  },
  explain: {
    guidance:
      'Deliver a complete step-by-step explanation with clear reasoning and math notation. Tie the concept back to SAT Math framing where possible.',
    temperature: 0.2,
  },
  comfort: {
    guidance:
      'Lead with empathy and encouragement. Normalize struggle, reflect their effort, and offer a reassuring next action. Keep math guidance lightweight.',
    temperature: 0.6,
  },
  challenge: {
    guidance:
      'Push the student to think deeper. Ask follow-up questions, highlight patterns, and suggest strategies that raise the difficulty slightly.',
    temperature: 0.5,
  },
};

const SYSTEM_PREAMBLE =
  'You are MathQuest Coach, an encouraging AI tutor helping Florida SAT students conquer math anxiety.';

let cachedClient: OpenAI | null = null;

export function getCoachClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function buildContextDetails({
  question,
  attemptSummary,
  topic,
}: Pick<CoachRequestPayload, 'question' | 'attemptSummary' | 'topic'>) {
  const details: string[] = [];

  if (topic) {
    details.push(`Student focus topic: ${topic}.`);
  }

  if (question) {
    const parts: string[] = ['Current question prompt:', question.prompt];
    if (question.choices?.length) {
      parts.push(`Choices: ${question.choices.join(', ')}`);
    }
    if (question.domain) {
      parts.push(`Domain: ${question.domain}.`);
    }
    if (typeof question.difficulty === 'number') {
      parts.push(`Difficulty parameter: ${question.difficulty.toFixed(2)}.`);
    }
    details.push(parts.join(' '));
  }

  if (attemptSummary) {
    const summary: string[] = [];
    if (typeof attemptSummary.attempts === 'number') {
      summary.push(`Attempts this session: ${attemptSummary.attempts}.`);
    }
    if (attemptSummary.lastAnswer) {
      summary.push(`Most recent answer: ${attemptSummary.lastAnswer}.`);
    }
    if (typeof attemptSummary.correct === 'boolean') {
      summary.push(`Last answer correct: ${attemptSummary.correct ? 'yes' : 'no'}.`);
    }
    if (typeof attemptSummary.streak === 'number') {
      summary.push(`Current streak: ${attemptSummary.streak}.`);
    }
    if (summary.length) {
      details.push(summary.join(' '));
    }
  }

  if (!details.length) {
    return '';
  }

  return `Context: ${details.join(' ')}`;
}

function buildSystemPrompt(mode: CoachMode, contextDetails: string) {
  const persona = MODE_BEHAVIORS[mode];
  return [SYSTEM_PREAMBLE, persona.guidance, 'Keep responses under 180 words, use friendly language, and include LaTeX for math when useful.', contextDetails]
    .filter(Boolean)
    .join(' ');
}

function toOpenAIMessages({ mode, messages, question, attemptSummary, topic }: CoachRequestPayload) {
  const contextDetails = buildContextDetails({ question, attemptSummary, topic });
  const systemPrompt = buildSystemPrompt(mode, contextDetails);

  const preparedMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((message) => ({ role: message.role, content: message.content })),
  ];

  return preparedMessages;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const MAX_RETRIES = Number.parseInt(process.env.COACH_MAX_RETRIES ?? '2', 10);

async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function generateCoachCompletion(payload: CoachRequestPayload): Promise<CoachCompletionResult> {
  const client = getCoachClient();
  const messages = toOpenAIMessages(payload);
  const { temperature } = MODE_BEHAVIORS[payload.mode];
  const start = Date.now();
  const maxAttempts = Math.max(1, MAX_RETRIES + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const completion = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature,
        max_tokens: 512,
        messages,
      });

      const choice = completion.choices?.[0];
      const responseText = choice?.message?.content?.trim();

      if (!responseText) {
        throw new Error('Coach returned an empty response');
      }

      return {
        message: responseText,
        finishReason: choice?.finish_reason ?? null,
        usage: completion.usage ?? null,
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

  throw new Error('Unable to contact coach');
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
