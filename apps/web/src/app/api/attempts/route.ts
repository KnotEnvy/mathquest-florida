import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { AttemptPostSchema } from '@/lib/validation';

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

    const body = await request.json();
    const parsed = AttemptPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { questionId, answer, correct, timeSpent } = parsed.data;

    // Save attempt to database
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        questionId,
        answer,
        correct,
        timeSpent,
      },
    });

    // Update user XP (10 points for correct, 2 points for attempting)
    const xpGained = correct ? 10 : 2;
    
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        xp: { increment: xpGained },
      },
      create: {
        userId: user.id,
        displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Student',
        xp: xpGained,
      },
    });

    console.log('XP gained:', xpGained);
    console.log('Updated profile XP:', updatedProfile.xp);

    return NextResponse.json({ 
      success: true, 
      attempt: {
        id: attempt.id,
        correct: attempt.correct,
        xpGained,
      }
    });
  } catch (error) {
    console.error('Error saving attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
