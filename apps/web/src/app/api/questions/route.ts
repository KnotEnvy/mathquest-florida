// apps/web/src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    const domain = searchParams.get('domain') || undefined;

    // Fetch random questions
    const questions = await prisma.question.findMany({
      where: {
        status: 'ACTIVE',
        ...(domain && { domain }),
      },
      take: count,
      orderBy: {
        createdAt: 'desc', // For now, we'll improve this with randomization later
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
