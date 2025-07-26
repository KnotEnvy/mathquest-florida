// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'first_quest',
        name: 'Quest Beginner',
        description: 'Complete your first daily quest',
        category: 'milestone',
        tier: 1,
        xpReward: 50,
        requirements: { questsCompleted: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'streak',
        tier: 2,
        xpReward: 200,
        creditReward: 10,
        requirements: { streakDays: 7 },
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'perfect_quest',
        name: 'Perfectionist',
        description: 'Complete a quest with 100% accuracy',
        category: 'accuracy',
        tier: 1,
        xpReward: 100,
        requirements: { perfectQuests: 1 },
      },
    }),
  ]);

  // Create sample questions
  const sampleQuestions = [
    {
      content: {
        type: 'multiple-choice',
        question: 'If 2x + 3 = 11, what is the value of x?',
        choices: ['3', '4', '5', '6'],
        correctAnswer: '4',
        explanation: 'Subtract 3 from both sides: 2x = 8. Divide by 2: x = 4.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Equations',
      difficulty: -0.5,
      tags: ['linear-equations', 'solving-for-x'],
    },
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        choices: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: 'Slope = (y2 - y1) / (x2 - x1) = (7 - 3) / (4 - 2) = 4 / 2 = 2',
      },
      domain: 'Algebra',
      subdomain: 'Linear Functions',
      difficulty: 0,
      tags: ['slope', 'coordinate-geometry'],
    },
    {
      content: {
        type: 'grid-in',
        question: 'If f(x) = x² + 2x - 3, what is f(2)?',
        correctAnswer: '5',
        explanation: 'f(2) = (2)² + 2(2) - 3 = 4 + 4 - 3 = 5',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.5,
      tags: ['functions', 'evaluation'],
    },
  ];

  const questions = await Promise.all(
    sampleQuestions.map((q) => prisma.question.create({ data: q }))
  );

  console.log(`✅ Created ${achievements.length} achievements`);
  console.log(`✅ Created ${questions.length} sample questions`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
