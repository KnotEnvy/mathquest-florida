import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { StatsQuerySchema } from '@/lib/validation';

type AttemptWithQuestion = {
  id: string;
  correct: boolean;
  timeSpent: number;
  createdAt: Date;
  question: {
    domain: string;
    difficulty: number;
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = StatsQuerySchema.safeParse({ recent: searchParams.get('recent') ?? undefined });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { recent } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
      },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const [totalAttempts, correctAttempts] = await Promise.all([
      prisma.attempt.count({
        where: { userId: user.id },
      }),
      prisma.attempt.count({
        where: {
          userId: user.id,
          correct: true,
        },
      }),
    ]);

    const recentAttempts = await prisma.attempt.findMany({
      where: { userId: user.id },
      include: {
        question: {
          select: {
            domain: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: recent,
    });

    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : null;
    const averageDifficulty = recentAttempts.length
      ? recentAttempts.reduce((sum, attempt) => sum + (attempt.question?.difficulty ?? 0), 0) /
        recentAttempts.length
      : null;

    let abilityEstimate: number | null = null;
    if (averageDifficulty !== null || accuracy !== null) {
      const abilityFromDifficulty = averageDifficulty ?? 0;
      const abilityFromAccuracy = accuracy !== null ? (accuracy - 0.6) * 3 : 0;
      abilityEstimate = clamp(abilityFromDifficulty + abilityFromAccuracy, -2.5, 2.5);
    }

    const currentLevel = Math.floor((profile?.xp || 0) / 100) + 1;

    const stats = {
      totalAttempts,
      correctAttempts,
      xp: profile?.xp || 0,
      currentLevel,
      accuracy,
      abilityEstimate,
      recentAttempts: recentAttempts.map((attempt: AttemptWithQuestion) => ({
        id: attempt.id,
        question: {
          domain: attempt.question.domain,
          difficulty: attempt.question.difficulty,
        },
        correct: attempt.correct,
        timeSpent: attempt.timeSpent,
        createdAt: attempt.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
