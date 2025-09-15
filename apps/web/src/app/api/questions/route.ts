// apps/web/src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionsQuerySchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const parsed = QuestionsQuerySchema.safeParse({
      count: searchParams.get('count'),
      domain: searchParams.get('domain') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { count, domain } = parsed.data;

    // First get the total count
    const totalCount = await prisma.question.count({
      where: {
        status: 'ACTIVE',
        ...(domain && { domain }),
      },
    });

    // Generate random skip value
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(0, totalCount - count)));

    // Fetch questions with random offset
    const questions = await prisma.question.findMany({
      where: {
        status: 'ACTIVE',
        ...(domain && { domain }),
      },
      take: count,
      skip,
      orderBy: {
        id: 'asc', // Consistent ordering for pagination
      },
    });

    // Shuffle the results for additional randomness
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    return NextResponse.json({ questions: shuffledQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
