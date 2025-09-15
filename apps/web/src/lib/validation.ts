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
});

export const StatsQuerySchema = z.object({
  recent: z.coerce.number().int().min(1).max(50).default(10),
});
