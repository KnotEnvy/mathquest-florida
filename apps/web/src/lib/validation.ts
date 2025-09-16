// apps/web/src/lib/validation.ts
import { z } from 'zod';

export const AttemptPostSchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  // Accept various value types but store as string
  answer: z.union([z.string(), z.number(), z.boolean()]).transform((v) => String(v)),
  correct: z.boolean(),
  // timeSpent in ms, cap to 10 minutes to avoid bad data
  timeSpent: z
    .number({ invalid_type_error: 'timeSpent must be a number' })
    .int('timeSpent must be an integer')
    .nonnegative('timeSpent must be >= 0')
    .max(10 * 60 * 1000, 'timeSpent too large'),
});

export const QuestionsQuerySchema = z.object({
  count: z.coerce.number().int().min(1).max(25).default(10),
  domain: z.string().min(1).optional(),
  ability: z.coerce.number().min(-3).max(3).optional(),
});

export const StatsQuerySchema = z.object({
  recent: z.coerce.number().int().min(1).max(50).default(10),
});

const CoachMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'message content is required'),
});

export const CoachRequestSchema = z.object({
  messages: z.array(CoachMessageSchema).min(1, 'Provide at least one message'),
  mode: z.enum(['hint', 'explain', 'comfort', 'challenge']).default('hint'),
  topic: z.string().max(80).optional(),
  question: z
    .object({
      id: z.string().optional(),
      prompt: z.string().min(1, 'Question prompt is required'),
      choices: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
      domain: z.string().optional(),
      difficulty: z.number().optional(),
    })
    .optional(),
  attemptSummary: z
    .object({
      attempts: z.number().int().min(0).optional(),
      lastAnswer: z.string().optional(),
      correct: z.boolean().optional(),
      streak: z.number().int().min(0).optional(),
    })
    .optional(),
});
