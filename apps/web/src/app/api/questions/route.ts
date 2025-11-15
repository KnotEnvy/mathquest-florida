// apps/web/src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionsQuerySchema } from '@/lib/validation';

export const runtime = 'nodejs';

type QuestionRecord = {
  id: string;
  difficulty: number;
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectClosestByAbility<T extends QuestionRecord>(
  questions: T[],
  ability: number,
  count: number,
): T[] {
  if (!questions.length) {
    return [];
  }

  const scored = questions.map((question) => ({
    question,
    distance: Math.abs(question.difficulty - ability),
  }));

  scored.sort((a, b) => a.distance - b.distance);

  return scored.slice(0, count).map((item) => item.question);
}

export async function GET(request: Request) {
  try {
    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const parsed = QuestionsQuerySchema.safeParse({
      count: searchParams.get('count') ?? '10',
      domain: searchParams.get('domain') ?? undefined,
      ability: searchParams.get('ability') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { count, domain, ability } = parsed.data;
    const baseWhere = {
      status: 'ACTIVE' as const,
      ...(domain && { domain }),
    };

    if (typeof ability === 'number') {
      // Fetch a pool of candidates around the requested ability
      const window = 0.75;
      const abilityCandidates = await prisma.question.findMany({
        where: {
          ...baseWhere,
          difficulty: {
            gte: ability - window,
            lte: ability + window,
          },
        },
        orderBy: {
          difficulty: 'asc',
        },
        take: Math.min(count * 3, 60),
      });

      let selected = selectClosestByAbility(abilityCandidates, ability, count);

      if (selected.length < count) {
        const fallback = await prisma.question.findMany({
          where: baseWhere,
          orderBy: {
            updatedAt: 'desc',
          },
          take: count - selected.length,
        });

        const seen = new Set(selected.map((question) => question.id));
        for (const question of fallback) {
          if (!seen.has(question.id)) {
            selected.push(question);
          }
          if (selected.length === count) {
            break;
          }
        }
      }

      if (selected.length) {
        return NextResponse.json({ questions: shuffle(selected).slice(0, count) });
      }
      // Fall back to random selection if ability targeting finds nothing
    }

    // Default: random selection across the domain
    const totalCount = await prisma.question.count({
      where: baseWhere,
    });

    const maxSkip = Math.max(0, totalCount - count);
    const skip = maxSkip > 0 ? Math.floor(Math.random() * (maxSkip + 1)) : 0;

    const questions = await prisma.question.findMany({
      where: baseWhere,
      take: count,
      skip,
      orderBy: {
        id: 'asc', // Consistent ordering for pagination
      },
    });

    return NextResponse.json({ questions: shuffle(questions) });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 },
    );
  }
}

