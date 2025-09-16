// apps/web/src/app/api/coach/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { CoachRequestSchema } from '@/lib/validation';

const MODE_BEHAVIORS: Record<'hint' | 'explain' | 'comfort' | 'challenge', { guidance: string; temperature: number }> = {
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

function buildSystemPrompt(mode: 'hint' | 'explain' | 'comfort' | 'challenge', context: string) {
  const persona = MODE_BEHAVIORS[mode];
  return [
    'You are MathQuest Coach, an encouraging AI tutor helping Florida SAT students conquer math anxiety.',
    persona.guidance,
    'Keep responses under 180 words, use friendly language, and include LaTeX for math when useful.',
    context,
  ]
    .filter(Boolean)
    .join(' ');
}

function buildContext({
  question,
  attemptSummary,
}: {
  question?: {
    id?: string;
    prompt: string;
    choices?: string[];
    correctAnswer?: string;
    domain?: string;
    difficulty?: number;
  };
  attemptSummary?: {
    attempts?: number;
    lastAnswer?: string;
    correct?: boolean;
    streak?: number;
  };
}) {
  const details: string[] = [];

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

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Coach service is not configured. Set OPENAI_API_KEY.' },
      { status: 503 }
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
    return NextResponse.json({ error: 'Invalid request payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const mode = data.mode;
  const context = buildContext({ question: data.question, attemptSummary: data.attemptSummary });
  const systemPrompt = buildSystemPrompt(mode, context);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: MODE_BEHAVIORS[mode].temperature,
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemPrompt },
        ...data.messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    });

    const choice = completion.choices?.[0];
    const responseText = choice?.message?.content?.trim();

    if (!responseText) {
      return NextResponse.json({ error: 'Coach did not return a response' }, { status: 502 });
    }

    return NextResponse.json({
      message: responseText,
      mode,
      finishReason: choice.finish_reason,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Coach API error:', error);
    return NextResponse.json({ error: 'Failed to contact coach' }, { status: 500 });
  }
}
