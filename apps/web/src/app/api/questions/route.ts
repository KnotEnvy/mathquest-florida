// apps/web/src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    const domain = searchParams.get('domain') || undefined;

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
