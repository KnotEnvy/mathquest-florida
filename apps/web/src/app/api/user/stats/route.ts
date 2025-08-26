import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
      },
    });

    // Get user profile (XP, level, etc.)
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    // Get attempt statistics
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

    // Get recent attempts with question details
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
      take: 10,
    });

    // Calculate current level based on XP (100 XP per level)
    const currentLevel = Math.floor((profile?.xp || 0) / 100) + 1;

    const stats = {
      totalAttempts,
      correctAttempts,
      xp: profile?.xp || 0,
      currentLevel,
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