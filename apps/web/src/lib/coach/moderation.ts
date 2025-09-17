// apps/web/src/lib/coach/moderation.ts
import { getCoachClient } from './service';

export interface ModerationResult {
  allowed: boolean;
  flaggedCategories?: string[];
}

const MODERATION_MODEL = process.env.COACH_MODERATION_MODEL ?? 'omni-moderation-latest';

export async function ensureCoachContentIsSafe(input: string): Promise<ModerationResult> {
  if (!input.trim()) {
    return { allowed: true };
  }

  try {
    const client = getCoachClient();
    const moderation = await client.moderations.create({
      model: MODERATION_MODEL,
      input,
    });

    const result = moderation.results?.[0];
    if (result?.flagged) {
      const categories = Object.entries(result.categories ?? {})
        .filter(([, value]) => Boolean(value))
        .map(([category]) => category);

      return {
        allowed: false,
        flaggedCategories: categories,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.warn('Coach moderation failed, allowing request by default.', error);
    return { allowed: true };
  }
}
