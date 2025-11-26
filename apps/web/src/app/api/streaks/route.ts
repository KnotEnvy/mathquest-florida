import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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

    // Get streak data
    const streakData = await prisma.streakData.findUnique({
      where: { userId: user.id },
    });

    if (!streakData) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityAt: null,
        streakFreezes: 0,
      });
    }

    return NextResponse.json({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastActivityAt: streakData.lastActivityAt.toISOString(),
      streakFreezes: streakData.streakFreezes,
    });
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get existing streak data
    const existingStreak = await prisma.streakData.findUnique({
      where: { userId: user.id },
    });

    if (!existingStreak) {
      // Create new streak data
      const newStreak = await prisma.streakData.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: now,
        },
      });

      return NextResponse.json({
        currentStreak: newStreak.currentStreak,
        longestStreak: newStreak.longestStreak,
        streakIncreased: true,
      });
    }

    const lastActivity = new Date(existingStreak.lastActivityAt);
    const lastActivityDate = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    const daysDifference = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    let newCurrentStreak = existingStreak.currentStreak;
    let streakIncreased = false;

    if (daysDifference === 0) {
      // Same day, no change to streak
      return NextResponse.json({
        currentStreak: existingStreak.currentStreak,
        longestStreak: existingStreak.longestStreak,
        streakIncreased: false,
      });
    } else if (daysDifference === 1) {
      // Next day, increment streak
      newCurrentStreak = existingStreak.currentStreak + 1;
      streakIncreased = true;
    } else {
      // More than 1 day, reset streak
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(existingStreak.longestStreak, newCurrentStreak);

    const updatedStreak = await prisma.streakData.update({
      where: { userId: user.id },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityAt: now,
      },
    });

    return NextResponse.json({
      currentStreak: updatedStreak.currentStreak,
      longestStreak: updatedStreak.longestStreak,
      streakIncreased,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}