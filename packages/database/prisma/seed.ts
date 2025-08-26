// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();

  // Create achievements
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
    prisma.achievement.create({
      data: {
        code: 'speed_demon',
        name: 'Speed Demon',
        description: 'Answer 5 questions correctly in under 2 minutes each',
        category: 'speed',
        tier: 1,
        xpReward: 75,
        requirements: { fastAnswers: 5 },
      },
    }),
  ]);

  // Create comprehensive question bank
  const questions = [
    // ALGEBRA - Easy
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
      difficulty: -1.0,
      tags: ['linear-equations', 'solving-for-x', 'basic-algebra'],
    },
    {
      content: {
        type: 'multiple-choice',
        question: 'If 3(x - 2) = 12, what is the value of x?',
        choices: ['2', '4', '6', '8'],
        correctAnswer: '6',
        explanation: 'Distribute: 3x - 6 = 12. Add 6: 3x = 18. Divide by 3: x = 6.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Equations',
      difficulty: -0.8,
      tags: ['linear-equations', 'distributive-property'],
    },

    // ALGEBRA - Medium
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
        choices: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: 'Slope = (y₂ - y₁) / (x₂ - x₁) = (7 - 3) / (4 - 2) = 4 / 2 = 2',
      },
      domain: 'Algebra',
      subdomain: 'Linear Functions',
      difficulty: 0,
      tags: ['slope', 'coordinate-geometry', 'linear-functions'],
    },
    {
      content: {
        type: 'multiple-choice',
        question: 'If the line y = mx + 5 passes through the point (2, 9), what is the value of m?',
        choices: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: 'Substitute the point: 9 = m(2) + 5. Solve: 9 = 2m + 5, so 4 = 2m, thus m = 2.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Functions',
      difficulty: 0.2,
      tags: ['slope', 'point-slope', 'linear-equations'],
    },

    // ADVANCED MATH - Functions
    {
      content: {
        type: 'grid-in',
        question: 'If f(x) = x² + 2x - 3, what is f(2)?',
        correctAnswer: '5',
        explanation: 'f(2) = (2)² + 2(2) - 3 = 4 + 4 - 3 = 5',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.3,
      tags: ['functions', 'evaluation', 'quadratics'],
    },
    {
      content: {
        type: 'multiple-choice',
        question: 'If f(x) = 2x + 1 and g(x) = x², what is f(g(2))?',
        choices: ['5', '7', '9', '11'],
        correctAnswer: '9',
        explanation: 'First find g(2) = 2² = 4. Then f(4) = 2(4) + 1 = 8 + 1 = 9.',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.5,
      tags: ['composite-functions', 'function-composition'],
    },

    // ADVANCED MATH - Quadratics
    {
      content: {
        type: 'multiple-choice',
        question: 'What are the x-intercepts of y = x² - 5x + 6?',
        choices: ['x = 1 and x = 6', 'x = 2 and x = 3', 'x = -2 and x = -3', 'x = 0 and x = 5'],
        correctAnswer: 'x = 2 and x = 3',
        explanation: 'Factor: x² - 5x + 6 = (x - 2)(x - 3). Set equal to 0: x = 2 or x = 3.',
      },
      domain: 'Advanced Math',
      subdomain: 'Quadratic Functions',
      difficulty: 0.4,
      tags: ['quadratics', 'factoring', 'x-intercepts'],
    },

    // PROBLEM SOLVING & DATA ANALYSIS
    {
      content: {
        type: 'multiple-choice',
        question: 'A store offers a 20% discount on all items. If an item originally costs $80, what is the sale price?',
        choices: ['$16', '$60', '$64', '$70'],
        correctAnswer: '$64',
        explanation: '20% of $80 = 0.20 × 80 = $16 discount. Sale price = $80 - $16 = $64.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: -0.5,
      tags: ['percentages', 'discounts', 'word-problems'],
    },
    {
      content: {
        type: 'grid-in',
        question: 'If the mean of 5 numbers is 12, and four of the numbers are 10, 11, 13, and 14, what is the fifth number?',
        correctAnswer: '12',
        explanation: 'Sum of all 5 numbers = 5 × 12 = 60. Sum of 4 numbers = 10 + 11 + 13 + 14 = 48. Fifth number = 60 - 48 = 12.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.1,
      tags: ['mean', 'statistics', 'algebra'],
    },

    // GEOMETRY & TRIGONOMETRY
    {
      content: {
        type: 'multiple-choice',
        question: 'In a right triangle with legs of length 3 and 4, what is the length of the hypotenuse?',
        choices: ['5', '6', '7', '8'],
        correctAnswer: '5',
        explanation: 'Using the Pythagorean theorem: c² = a² + b² = 3² + 4² = 9 + 16 = 25. So c = 5.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Right Triangles',
      difficulty: -0.7,
      tags: ['pythagorean-theorem', 'right-triangles'],
    },
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the area of a circle with radius 6?',
        choices: ['12π', '24π', '36π', '72π'],
        correctAnswer: '36π',
        explanation: 'Area = πr² = π(6)² = 36π',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Circles',
      difficulty: -0.3,
      tags: ['circles', 'area', 'geometry'],
    },

    // FLORIDA PERT SPECIFIC
    {
      content: {
        type: 'multiple-choice',
        question: 'Simplify: (2x²y³)²',
        choices: ['4x⁴y⁶', '2x⁴y⁶', '4x²y⁶', '2x⁴y⁵'],
        correctAnswer: '4x⁴y⁶',
        explanation: '(2x²y³)² = 2² × (x²)² × (y³)² = 4x⁴y⁶',
      },
      domain: 'Algebra',
      subdomain: 'Exponents',
      difficulty: 0.2,
      tags: ['exponents', 'simplification', 'PERT'],
    },
    {
      content: {
        type: 'grid-in',
        question: 'If log₂(x) = 3, what is the value of x?',
        correctAnswer: '8',
        explanation: 'log₂(x) = 3 means 2³ = x, so x = 8.',
      },
      domain: 'Advanced Math',
      subdomain: 'Logarithms',
      difficulty: 0.6,
      tags: ['logarithms', 'exponentials', 'PERT'],
    },

    // Additional ALGEBRA questions
    {
      content: {
        type: 'multiple-choice',
        question: 'Which of the following is equivalent to 2(x + 3) - 4?',
        choices: ['2x + 2', '2x + 6', '2x - 4', '2x + 10'],
        correctAnswer: '2x + 2',
        explanation: 'Distribute: 2(x + 3) = 2x + 6. Then subtract 4: 2x + 6 - 4 = 2x + 2.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Equations',
      difficulty: -0.5,
      tags: ['distributive-property', 'simplifying'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'If 4x - 7 = 3x + 8, what is the value of x?',
        correctAnswer: '15',
        explanation: 'Subtract 3x from both sides: x - 7 = 8. Add 7 to both sides: x = 15.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Equations',
      difficulty: -0.3,
      tags: ['linear-equations', 'solving-for-x'],
    },

    // Additional GEOMETRY questions
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the area of a triangle with base 8 and height 6?',
        choices: ['24', '28', '32', '48'],
        correctAnswer: '24',
        explanation: 'Area of triangle = (1/2) × base × height = (1/2) × 8 × 6 = 24.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Area and Perimeter',
      difficulty: -0.8,
      tags: ['area', 'triangles', 'basic-geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'In a right triangle, if one angle is 30°, what is the measure of the third angle?',
        choices: ['30°', '60°', '90°', '120°'],
        correctAnswer: '60°',
        explanation: 'In any triangle, angles sum to 180°. With 90° and 30°, the third angle is 180° - 90° - 30° = 60°.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Triangles',
      difficulty: -0.2,
      tags: ['triangles', 'angle-sum', 'right-triangles'],
    },

    // Additional DATA ANALYSIS questions
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the median of the data set: 2, 5, 8, 8, 12, 15?',
        choices: ['7', '8', '8.5', '10'],
        correctAnswer: '8',
        explanation: 'For 6 numbers, median is average of 3rd and 4th values: (8 + 8)/2 = 8.',
      },
      domain: 'Problem-Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: -0.1,
      tags: ['median', 'statistics', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'If 25% of a number is 18, what is the number?',
        correctAnswer: '72',
        explanation: 'Let x be the number. 0.25x = 18. Divide both sides by 0.25: x = 18/0.25 = 72.',
      },
      domain: 'Problem-Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.1,
      tags: ['percentages', 'proportions', 'problem-solving'],
    },
  ];

  // Insert questions
  const createdQuestions = await Promise.all(
    questions.map((q) => prisma.question.create({ data: q }))
  );

  console.log(`✅ Created ${achievements.length} achievements`);
  console.log(`✅ Created ${createdQuestions.length} questions`);
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