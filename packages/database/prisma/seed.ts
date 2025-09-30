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
      domain: 'Problem Solving & Data Analysis',
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
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.1,
      tags: ['percentages', 'proportions', 'problem-solving'],
    },
    // ALGEBRA - Extended Practice
    {
      content: {
        type: 'multiple-choice',
        question: 'Solve the system of equations 2x + y = 7 and 3x - y = 11. What is the value of x?',
        choices: ['2', '3', '18/5', '4'],
        correctAnswer: '18/5',
        explanation: 'Add the equations to eliminate y: 5x = 18, so x = 18/5.',
      },
      domain: 'Algebra',
      subdomain: 'Systems of Equations',
      difficulty: 0.6,
      tags: ['systems-of-equations', 'elimination', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Simplify the expression (x^2 - 9)/(x - 3) for x not equal to 3.',
        choices: ['x - 3', 'x + 3', 'x^2 - 3', 'x^2 + 3'],
        correctAnswer: 'x + 3',
        explanation: 'Factor the numerator as (x - 3)(x + 3) and cancel (x - 3).',
      },
      domain: 'Algebra',
      subdomain: 'Polynomials',
      difficulty: 0.1,
      tags: ['polynomials', 'factoring', 'rational-expressions'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Solve for x: 4(2x - 1) = 3(x + 5).',
        correctAnswer: '19/5',
        explanation: 'Expand to get 8x - 4 = 3x + 15, so 5x = 19 and x = 19/5.',
      },
      domain: 'Algebra',
      subdomain: 'Linear Equations',
      difficulty: -0.2,
      tags: ['linear-equations', 'multi-step', 'algebra'],
    },

    // ADVANCED MATH - Extended Practice
    {
      content: {
        type: 'grid-in',
        question: 'What is the minimum value of f(x) = x^2 - 4x + 7?',
        correctAnswer: '3',
        explanation: 'Complete the square: f(x) = (x - 2)^2 + 3, so the minimum value is 3 at x = 2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Quadratic Functions',
      difficulty: 0.7,
      tags: ['quadratics', 'vertex-form', 'optimization'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'For the quadratic equation x^2 - 6x + k = 0 to have exactly one real solution, what must be the value of k?',
        correctAnswer: '9',
        explanation: 'Set the discriminant to zero: (-6)^2 - 4(1)(k) = 0 gives k = 9.',
      },
      domain: 'Advanced Math',
      subdomain: 'Quadratic Functions',
      difficulty: 1.0,
      tags: ['quadratics', 'discriminant', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Solve for x: 4^(x + 1) = 64.',
        choices: ['1', '2', '3', '4'],
        correctAnswer: '2',
        explanation: 'Rewrite 64 as 4^3. Then x + 1 = 3, so x = 2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Exponential Functions',
      difficulty: 0.8,
      tags: ['exponential-equations', 'powers', 'advanced-math'],
    },

    // PROBLEM SOLVING & DATA ANALYSIS - Extended Practice
    {
      content: {
        type: 'grid-in',
        question: 'A student scored 82, 88, and 91 on three tests. What score is needed on a fourth test to have an average of 90?',
        correctAnswer: '99',
        explanation: 'To average 90 over four tests requires 360 total points. The student has 261, so needs 99 more.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.4,
      tags: ['averages', 'statistics', 'word-problems'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A faucet can fill a tank in 12 minutes, and a drain can empty it in 18 minutes. If both are open from an empty tank, how long will it take to fill the tank?',
        choices: ['18 minutes', '24 minutes', '30 minutes', '36 minutes'],
        correctAnswer: '36 minutes',
        explanation: 'Net rate is 1/12 - 1/18 = 1/36 tank per minute, so it takes 36 minutes.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Rates',
      difficulty: 0.6,
      tags: ['rates', 'work-problems', 'word-problems'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A bag contains 4 red, 5 blue, and 3 green marbles. What is the probability of randomly selecting a marble that is not blue?',
        choices: ['1/3', '5/12', '7/12', '3/5'],
        correctAnswer: '7/12',
        explanation: 'There are 7 non-blue marbles out of 12 total, giving a probability of 7/12.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Probability',
      difficulty: 0.5,
      tags: ['probability', 'fractions', 'data-analysis'],
    },

    // GEOMETRY & TRIGONOMETRY - Extended Practice
    {
      content: {
        type: 'multiple-choice',
        question: 'What is the area of a triangle with base 8 and height 6?',
        choices: ['24', '28', '32', '48'],
        correctAnswer: '24',
        explanation: 'Area of triangle = (1/2) * base * height = (1/2) * 8 * 6 = 24.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Area and Perimeter',
      difficulty: -0.8,
      tags: ['area', 'triangles', 'basic-geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'In a right triangle, if one angle is 30 degrees, what is the measure of the third angle?',
        choices: ['30 degrees', '60 degrees', '90 degrees', '120 degrees'],
        correctAnswer: '60 degrees',
        explanation: 'In any triangle, angles sum to 180 degrees. With 90 degrees and 30 degrees, the third angle is 180 - 90 - 30 = 60 degrees.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Triangles',
      difficulty: -0.2,
      tags: ['triangles', 'angle-sum', 'right-triangles'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If sin(theta) = 3/5 for an acute angle theta, what is cos(theta)?',
        choices: ['4/5', '5/4', 'sqrt(13)/5', '3/4'],
        correctAnswer: '4/5',
        explanation: 'Use a right triangle: opposite = 3, hypotenuse = 5, so adjacent = 4 and cos(theta) = 4/5.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Trigonometric Ratios',
      difficulty: 0.8,
      tags: ['trigonometry', 'right-triangles', 'ratios'],
    },

    // ALGEBRA - Challenge Set
    {
      content: {
        type: 'multiple-choice',
        question: 'Solve (x - 2)/(x + 1) + (x + 1)/(x - 2) = 5. What is the sum of all real solutions?',
        choices: ['-1', '0', '1', '3'],
        correctAnswer: '1',
        explanation: 'Clear denominators to get 2x^2 - 2x + 5 = 5(x^2 - x - 2). This simplifies to x^2 - x - 5 = 0, which has solutions summing to 1 by Vieta. Neither solution makes the original denominator zero.',
      },
      domain: 'Algebra',
      subdomain: 'Rational Expressions',
      difficulty: 1.1,
      tags: ['rational-equations', 'vieta', 'algebra'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Let r and s be the roots of 3x^2 - 5x - 2 = 0. What is r^3 + s^3?',
        correctAnswer: '215/27',
        explanation: 'The roots satisfy r + s = 5/3 and rs = -2/3. Using r^3 + s^3 = (r + s)^3 - 3rs(r + s) gives (5/3)^3 - 3(-2/3)(5/3) = 215/27.',
      },
      domain: 'Algebra',
      subdomain: 'Polynomial Relationships',
      difficulty: 1.3,
      tags: ['polynomials', 'vieta', 'algebraic-manipulation'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If x satisfies x^2 - 4x + 1 = 0, what is the value of x^4 + 1/x^4?',
        choices: ['170', '178', '194', '210'],
        correctAnswer: '194',
        explanation: 'From x^2 - 4x + 1 = 0 we get x + 1/x = 4. Then x^2 + 1/x^2 = (x + 1/x)^2 - 2 = 14, so x^4 + 1/x^4 = (x^2 + 1/x^2)^2 - 2 = 194.',
      },
      domain: 'Algebra',
      subdomain: 'Algebraic Manipulation',
      difficulty: 1.2,
      tags: ['quadratics', 'power-sums', 'strategy'],
    },

    // ADVANCED MATH - Challenge Set
    {
      content: {
        type: 'grid-in',
        question: 'Solve for x: log_5(2x - 3) + log_5(x - 4) = 2.',
        correctAnswer: '13/2',
        explanation: 'Combine the logarithms to get log_5((2x - 3)(x - 4)) = 2, so (2x - 3)(x - 4) = 25. Expanding gives 2x^2 - 11x + 12 = 25, which simplifies to 2x^2 - 11x - 13 = 0. The only solution with x > 4 is x = 13/2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Logarithms',
      difficulty: 1.2,
      tags: ['logarithms', 'equations', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Let f(x) = (2x + 1)/(x + 3) for x != -3. What is the sum of all real solutions to f(f(x)) = x?',
        choices: ['-3', '-1', '0', '1'],
        correctAnswer: '-1',
        explanation: 'Composing f with itself yields f(f(x)) = (x + 1)/(x + 2). Setting this equal to x and solving gives x^2 + x - 1 = 0, whose solutions sum to -1. Both solutions keep denominators nonzero.',
      },
      domain: 'Advanced Math',
      subdomain: 'Rational Functions',
      difficulty: 1.3,
      tags: ['function-composition', 'rational-functions', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A sequence is defined by a_1 = 2 and a_{n+1} = sqrt(6 + a_n) for n >= 1. To what value does the sequence converge?',
        choices: ['2', '3', '4', '6'],
        correctAnswer: '3',
        explanation: 'If the sequence converges to L, then L = sqrt(6 + L). Solving L^2 = L + 6 yields L^2 - L - 6 = 0, so L = 3 or L = -2. The terms are positive, so the limit is 3.',
      },
      domain: 'Advanced Math',
      subdomain: 'Sequences',
      difficulty: 1.1,
      tags: ['sequences', 'fixed-point', 'advanced-math'],
    },

    // PROBLEM SOLVING & DATA ANALYSIS - Challenge Set
    {
      content: {
        type: 'grid-in',
        question: 'Machine A completes a job in 6 hours and machine B in 9 hours. They work together for 2 hours before machine B stops, and machine C finishes the job in 3 more hours. How many hours would it take machine C alone to finish the entire job?',
        correctAnswer: '27/4',
        explanation: 'In 2 hours A and B complete 2(1/6 + 1/9) = 5/9 of the job, leaving 4/9. Machine C completes 4/9 in 3 hours, so machine C has rate (4/9)/3 = 4/27 job per hour, meaning a full job would take 27/4 hours.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Rates',
      difficulty: 1.2,
      tags: ['rates', 'work-problems', 'multi-step'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A bag contains 5 red, 4 blue, and 3 green marbles. Three marbles are drawn at random without replacement. What is the probability that all three marbles are different colors?',
        choices: ['3/22', '3/11', '9/22', '9/11'],
        correctAnswer: '3/11',
        explanation: 'Choose one marble of each color in 5 * 4 * 3 ways and arrange them in 3! orders, giving 360 favorable outcomes. The total ordered outcomes are 12 * 11 * 10 = 1320, so the probability is 360/1320 = 3/11.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Probability',
      difficulty: 1.3,
      tags: ['probability', 'counting', 'combinatorics'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Two sections of the same course took an exam. Section A has 18 students with an average score of 82, and Section B has 12 students with an average score of 90. After the exam, 4 students from Section A retake the test and raise their scores by 3 points each, while no other scores change. What is the new combined average for all 30 students?',
        choices: ['84.8', '85.2', '85.6', '86.0'],
        correctAnswer: '85.6',
        explanation: 'Initial total points are 18 * 82 + 12 * 90 = 2556. The four retakes add 12 points, leading to 2568 total points. Dividing by 30 students gives a new average of 2568/30 = 85.6.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 1.1,
      tags: ['weighted-averages', 'data-analysis', 'multi-step'],
    },

    // GEOMETRY & TRIGONOMETRY - Challenge Set
    {
      content: {
        type: 'multiple-choice',
        question: 'Triangle ABC has side lengths 13, 14, and 15. What is the area of triangle ABC?',
        choices: ['60', '70', '84', '90'],
        correctAnswer: '84',
        explanation: 'Using Heron formula with semiperimeter 21 yields area sqrt(21 * 8 * 7 * 6) = sqrt(7056) = 84.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Triangles',
      difficulty: 1.1,
      tags: ['heron-formula', 'triangles', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'In right triangle ABC with right angle at C, AC = 8 and BC = 15. What is the length of the altitude from C to hypotenuse AB?',
        correctAnswer: '120/17',
        explanation: 'The hypotenuse has length sqrt(8^2 + 15^2) = 17, and the triangle area is (1/2)(8)(15) = 60. The altitude h satisfies (1/2)(17)(h) = 60, so h = 120/17.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Right Triangles',
      difficulty: 1.2,
      tags: ['right-triangles', 'altitudes', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If sin(theta) = 3/5 and theta is in the second quadrant, what is the exact value of tan(2theta)?',
        choices: ['-24/7', '-24/25', '24/7', '24/25'],
        correctAnswer: '-24/7',
        explanation: 'With sin(theta) = 3/5 in quadrant II, cos(theta) = -4/5. Thus tan(theta) = -3/4, and tan(2theta) = (2 tan(theta))/(1 - tan^2(theta)) = (2(-3/4))/(1 - 9/16) = -24/7.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Trigonometric Ratios',
      difficulty: 1.3,
      tags: ['trigonometry', 'double-angle', 'geometry'],
    },

﻿    // ALGEBRA - Mastery Boost
    {
      content: {
        type: 'multiple-choice',
        question: 'Solve the inequality 5x - 3 >= 2(2x + 1). Which interval describes the solution set?',
        choices: ['x >= 1', 'x >= 3', 'x >= 5', 'x >= 7'],
        correctAnswer: 'x >= 5',
        explanation: 'Distribute to get 5x - 3 >= 4x + 2. Subtract 4x and add 3 to obtain x >= 5.',
      },
      domain: 'Algebra',
      subdomain: 'Inequalities',
      difficulty: 0.8,
      tags: ['linear-inequalities', 'reasoning', 'algebra'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'For the quadratic 2x^2 - 3x - 5 = 0, what is the product of its solutions?',
        correctAnswer: '-5/2',
        explanation: 'Using Vieta, the product equals c/a = (-5)/2 = -5/2.',
      },
      domain: 'Algebra',
      subdomain: 'Quadratic Equations',
      difficulty: 0.9,
      tags: ['quadratics', 'vieta', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If f(x) = (2x - 3)/(x + 2) and g(x) = x^2 - 1, what is f(g(2))?',
        choices: ['1/3', '3/5', '4/5', '5/3'],
        correctAnswer: '3/5',
        explanation: 'g(2) = 4 - 1 = 3. Then f(3) = (6 - 3)/(3 + 2) = 3/5.',
      },
      domain: 'Algebra',
      subdomain: 'Functions',
      difficulty: 1.0,
      tags: ['function-composition', 'rational-functions', 'algebra'],
    },

    // ADVANCED MATH - Mastery Boost
    {
      content: {
        type: 'multiple-choice',
        question: 'Solve for x: log_2(x - 1) + log_2(x + 3) = 4.',
        choices: ['-1 + 2sqrt(5)', '1 + 2sqrt(5)', '3 + 2sqrt(5)', '5 + 2sqrt(5)'],
        correctAnswer: '-1 + 2sqrt(5)',
        explanation: 'Combine logs: (x - 1)(x + 3) = 16. This gives x^2 + 2x - 19 = 0. Only x = -1 + 2sqrt(5) satisfies x > 1.',
      },
      domain: 'Advanced Math',
      subdomain: 'Logarithms',
      difficulty: 1.2,
      tags: ['logarithms', 'equations', 'advanced-math'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'The arithmetic sequence has a_1 = 7 and a_5 = 31. What is the value of a_12?',
        correctAnswer: '73',
        explanation: 'Common difference is (31 - 7)/4 = 6. a_12 = 7 + 11*6 = 73.',
      },
      domain: 'Advanced Math',
      subdomain: 'Sequences',
      difficulty: 0.9,
      tags: ['sequences', 'arithmetic', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If h(x) = x^2 + 4x and k(x) = h(x + 1) - h(x), what is k(3)?',
        choices: ['9', '10', '11', '12'],
        correctAnswer: '11',
        explanation: 'Compute k(x) = (x + 1)^2 + 4(x + 1) - (x^2 + 4x) = 2x + 5, so k(3) = 11.',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.8,
      tags: ['difference-operator', 'functions', 'advanced-math'],
    },

    // PROBLEM SOLVING & DATA ANALYSIS - Mastery Boost
    {
      content: {
        type: 'multiple-choice',
        question: 'A survey shows that 60% of students like algebra and 45% like geometry. If 30% of students like both subjects, what percent like algebra but not geometry?',
        choices: ['15%', '25%', '30%', '45%'],
        correctAnswer: '30%',
        explanation: 'Use inclusion-exclusion: 60% - 30% = 30% like only algebra.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.6,
      tags: ['percentages', 'set-theory', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A 30-ounce solution is 20% acid. How many ounces of pure acid must be added to make the solution 32% acid?',
        correctAnswer: '5.25',
        explanation: 'Current acid = 0.20*30 = 6 ounces. Let x be acid added. (6 + x)/(30 + x) = 0.32 leads to x = 5.25.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 1.0,
      tags: ['mixture-problems', 'percentages', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'The mean of five numbers is 18. When one number is removed, the mean of the remaining four numbers is 16. What is the value of the number that was removed?',
        choices: ['18', '20', '24', '26'],
        correctAnswer: '26',
        explanation: 'Total of five numbers is 90. The remaining four sum to 64, so the removed number is 26.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.7,
      tags: ['statistics', 'averages', 'data-analysis'],
    },

    // GEOMETRY & TRIGONOMETRY - Mastery Boost
    {
      content: {
        type: 'multiple-choice',
        question: 'A circle has radius 9. What is the area of a sector formed by a central angle of 120 degrees?',
        choices: ['9pi', '18pi', '27pi', '54pi'],
        correctAnswer: '27pi',
        explanation: 'Sector area is (120/360)*pi*9^2 = (1/3)*81pi = 27pi.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Circles',
      difficulty: 0.9,
      tags: ['circles', 'sectors', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A rectangular prism has a square base with side length 5 and height 12. What is its surface area?',
        correctAnswer: '290',
        explanation: 'Two bases contribute 2*25 = 50. Four lateral faces contribute 4*(5*12) = 240. Total area is 290.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Three-Dimensional Figures',
      difficulty: 1.0,
      tags: ['surface-area', '3d-geometry', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'In the coordinate plane, triangle PQR has vertices P(1, 5), Q(5, 1), and R(1, 1). What is the length of segment PQ?',
        choices: ['4', '4sqrt(2)', '5', '6'],
        correctAnswer: '4sqrt(2)',
        explanation: 'Distance PQ = sqrt((5 - 1)^2 + (1 - 5)^2) = sqrt(16 + 16) = 4sqrt(2).',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Coordinate Geometry',
      difficulty: 0.8,
      tags: ['distance-formula', 'coordinate-geometry', 'geometry'],
    },

    // ALGEBRA - Expansion Final

    {
      content: {
        type: 'multiple-choice',
        question: 'Solve |3x - 7| = 2x + 5. What is the sum of all real solutions?',
        choices: ['12/5', '62/5', '13', '65/4'],
        correctAnswer: '62/5',
        explanation: 'Solving the absolute value equation gives x = 12 and x = 2/5. The sum is 62/5.',
      },
      domain: 'Algebra',
      subdomain: 'Absolute Value Equations',
      difficulty: 1.0,
      tags: ['absolute-value', 'equations', 'algebra'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Let x and y satisfy x + y = 5 and xy = 3. What is x^3 + y^3?',
        correctAnswer: '80',
        explanation: 'Use the identity x^3 + y^3 = (x + y)^3 - 3xy(x + y) = 125 - 45 = 80.',
      },
      domain: 'Algebra',
      subdomain: 'Polynomial Relationships',
      difficulty: 0.7,
      tags: ['vieta', 'symmetry', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Which expression is equivalent to (x^3 - 27)/(x - 3)?',
        choices: ['x^2 + 3x + 9', 'x^2 - 3x + 9', 'x^2 + 9', 'x^2 - 9'],
        correctAnswer: 'x^2 + 3x + 9',
        explanation: 'Apply synthetic division or the difference of cubes to obtain x^2 + 3x + 9.',
      },
      domain: 'Algebra',
      subdomain: 'Polynomials',
      difficulty: 0.4,
      tags: ['polynomials', 'factoring', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Solve x^2 - 5x + 4 <= 0. Which interval describes the solution set?',
        choices: ['x <= 1 or x >= 4', '1 <= x <= 4', 'x < 1 or x > 4', 'x >= 4'],
        correctAnswer: '1 <= x <= 4',
        explanation: 'Factor to (x - 1)(x - 4) <= 0, which holds for 1 <= x <= 4.',
      },
      domain: 'Algebra',
      subdomain: 'Quadratic Inequalities',
      difficulty: 0.6,
      tags: ['quadratics', 'inequalities', 'intervals'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Solve 2^(3x - 1) = 32. What is x?',
        correctAnswer: '2',
        explanation: 'Since 32 = 2^5, we have 3x - 1 = 5, so x = 2.',
      },
      domain: 'Algebra',
      subdomain: 'Exponential Equations',
      difficulty: 0.5,
      tags: ['exponential', 'equations', 'powers'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'The parabola y = a(x - 2)^2 - 3 passes through (0, 5). What is the value of a?',
        choices: ['-2', '-1', '2', '4'],
        correctAnswer: '2',
        explanation: 'Substitute (0, 5): 5 = a(4) - 3, so a = 2.',
      },
      domain: 'Algebra',
      subdomain: 'Quadratic Functions',
      difficulty: 0.7,
      tags: ['parabolas', 'vertex-form', 'algebra'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'For the arithmetic sequence a_n = 4 + 3(n - 1), what is the smallest n such that a_n >= 40?',
        correctAnswer: '13',
        explanation: 'Solve 4 + 3(n - 1) >= 40 to get n >= 13.',
      },
      domain: 'Algebra',
      subdomain: 'Sequences',
      difficulty: 0.6,
      tags: ['arithmetic-sequences', 'inequalities', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Simplify (3x^2 - 12x + 12)/(3x - 6) for x not equal to 2.',
        choices: ['x - 2', 'x + 2', '3x - 6', 'x^2 - 4'],
        correctAnswer: 'x - 2',
        explanation: 'Factor numerator and denominator: (3(x - 2)^2)/(3(x - 2)) = x - 2.',
      },
      domain: 'Algebra',
      subdomain: 'Rational Expressions',
      difficulty: 0.5,
      tags: ['simplifying', 'rational-expressions', 'algebra'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Let f(x) = (2x - 5)/(x + 1) for x not equal to -1. What is f^{-1}(3)?',
        correctAnswer: '-8',
        explanation: 'Set 3 = (2x - 5)/(x + 1). Solving gives x = -8.',
      },
      domain: 'Algebra',
      subdomain: 'Functions',
      difficulty: 0.8,
      tags: ['inverse-functions', 'rational-functions', 'algebra'],
    },

    // ADVANCED MATH - Expansion Final

    {
      content: {
        type: 'grid-in',
        question: 'Solve log_3(x + 1) - log_3(x - 2) = 2. What is x?',
        correctAnswer: '19/8',
        explanation: 'Combine logs to get (x + 1)/(x - 2) = 9, yielding x = 19/8.',
      },
      domain: 'Advanced Math',
      subdomain: 'Logarithms',
      difficulty: 1.2,
      tags: ['logarithms', 'equations', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Solve 3^(2x) = 5 * 3^x. What is x?',
        choices: ['log_3(5)', 'log_5(3)', '5', '1/5'],
        correctAnswer: 'log_3(5)',
        explanation: 'Divide both sides by 3^x to get 3^x = 5, so x = log_3(5).',
      },
      domain: 'Advanced Math',
      subdomain: 'Exponential Functions',
      difficulty: 1.0,
      tags: ['exponentials', 'logs', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'For f(x) = sqrt(4x - 7), what is the domain of f?',
        choices: ['x >= 7/4', 'x > -7/4', 'x <= 7/4', 'all real x'],
        correctAnswer: 'x >= 7/4',
        explanation: 'Require 4x - 7 >= 0, so x >= 7/4.',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.6,
      tags: ['radicals', 'domain', 'advanced-math'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A geometric sequence has a_1 = 6 and common ratio 2/3. What is a_5?',
        correctAnswer: '32/27',
        explanation: 'Compute a_5 = 6 * (2/3)^4 = 32/27.',
      },
      domain: 'Advanced Math',
      subdomain: 'Sequences',
      difficulty: 0.8,
      tags: ['geometric-sequences', 'exponents', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If f(x) = x^2 - 4x and g(x) = 3x + 1, what is (f \circ g)(2)?',
        choices: ['12', '18', '21', '25'],
        correctAnswer: '21',
        explanation: 'g(2) = 7 and f(7) = 49 - 28 = 21.',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.5,
      tags: ['composition', 'functions', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'What is the horizontal asymptote of f(x) = (2x^2 - 3x + 1)/(x^2 + x - 2)?',
        choices: ['y = 0', 'y = 1', 'y = 2', 'y = 3'],
        correctAnswer: 'y = 2',
        explanation: 'The ratio of leading coefficients is 2/1, giving horizontal asymptote y = 2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Rational Functions',
      difficulty: 0.9,
      tags: ['asymptotes', 'rational-functions', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Which function represents shifting y = x^2 three units right and two units up?',
        choices: ['(x + 3)^2 + 2', '(x - 3)^2 + 2', '(x - 3)^2 - 2', '(x + 3)^2 - 2'],
        correctAnswer: '(x - 3)^2 + 2',
        explanation: 'A right shift replaces x with x - 3 and a vertical shift adds 2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Functions',
      difficulty: 0.5,
      tags: ['transformations', 'parabolas', 'advanced-math'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'The sequence defined by a_1 = 4 and a_{n+1} = (a_n + 6)/2 approaches which value?',
        correctAnswer: '6',
        explanation: 'Fixed point L satisfies L = (L + 6)/2, so L = 6.',
      },
      domain: 'Advanced Math',
      subdomain: 'Sequences',
      difficulty: 1.1,
      tags: ['recursive', 'limits', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Let equation x^4 - 5x^2 + 4 = 0 have real solutions r. What is the product of all distinct real solutions?',
        choices: ['-4', '-2', '2', '4'],
        correctAnswer: '4',
        explanation: 'Factor to (x - 2)(x + 2)(x - 1)(x + 1). The product (-2)(-1)(1)(2) = 4.',
      },
      domain: 'Advanced Math',
      subdomain: 'Polynomial Relationships',
      difficulty: 1.0,
      tags: ['quartics', 'factoring', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Given f(x) = 2x + 1 for x <= -1 and f(x) = x^2 for x > -1, what is f(-3) + f(2)?',
        choices: ['-1', '1', '3', '5'],
        correctAnswer: '-1',
        explanation: 'Evaluate f(-3) = -5 and f(2) = 4, so the sum is -1.',
      },
      domain: 'Advanced Math',
      subdomain: 'Piecewise Functions',
      difficulty: 0.6,
      tags: ['piecewise', 'evaluation', 'advanced-math'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'If x + y = 5 and x^2 + y^2 = 29, what is xy?',
        correctAnswer: '-2',
        explanation: 'Use (x + y)^2 = x^2 + y^2 + 2xy to solve for xy = -2.',
      },
      domain: 'Advanced Math',
      subdomain: 'Systems of Equations',
      difficulty: 0.9,
      tags: ['systems', 'identities', 'advanced-math'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'For f(x) = sqrt(g(x)) with g(x) = x^2 - 9, what is the domain of f(g(x))?',
        choices: ['|x| >= 3', '|x| >= 2', 'x >= -3', 'all real x'],
        correctAnswer: '|x| >= 3',
        explanation: 'Require x^2 - 9 >= 0, so x <= -3 or x >= 3.',
      },
      domain: 'Advanced Math',
      subdomain: 'Composite Functions',
      difficulty: 1.0,
      tags: ['composition', 'domain', 'advanced-math'],
    },

    // PROBLEM SOLVING & DATA ANALYSIS - Expansion Final

    {
      content: {
        type: 'multiple-choice',
        question: "A class of 12 girls and 8 boys has an overall test average of 78. If the girls average 82, what is the boys' average score?",
        choices: ['68', '70', '72', '74'],
        correctAnswer: '72',
        explanation: "Total points are 20 * 78 = 1560. Girls contribute 12 * 82 = 984, leaving 576 for boys. The boys' average is 576/8 = 72.",
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.7,
      tags: ['weighted-average', 'statistics', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'In a survey, 45% prefer option A, 30% prefer option B, and the rest prefer option C. If 360 people prefer option C, how many people were surveyed?',
        correctAnswer: '1440',
        explanation: 'Option C represents 25%, so total participants are 360 / 0.25 = 1440.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.8,
      tags: ['percentages', 'surveys', 'data-analysis'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A bag has 5 red, 4 blue, and 3 green marbles. Two marbles are drawn without replacement. What is the probability both are red?',
        choices: ['1/6', '1/5', '5/33', '5/18'],
        correctAnswer: '5/33',
        explanation: 'Probability is (5/12) * (4/11) = 20/132 = 5/33.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Probability',
      difficulty: 0.9,
      tags: ['probability', 'combinatorics', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A car travels 120 miles at 40 miles per hour and returns 120 miles at 60 miles per hour. What is the average speed for the round trip?',
        correctAnswer: '48',
        explanation: 'Average speed is total distance 240 divided by total time (3 + 2 hours) = 48 mph.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Rates',
      difficulty: 0.9,
      tags: ['rates', 'average-speed', 'word-problems'],
    },


      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.6,
      tags: ['percent-change', 'discounts', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'The mean of the numbers 4, 8, 12, 15, and x is 10. What is x?',
        correctAnswer: '11',
        explanation: 'The sum must be 50. Since 4 + 8 + 12 + 15 = 39, we have x = 11.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.5,
      tags: ['mean', 'algebra', 'data-analysis'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: "A company's revenue grows from 2.4 million dollars to 3.3 million dollars. What is the percent increase?",
        choices: ['25%', '33%', '37.5%', '40%'],
        correctAnswer: '37.5%',
        explanation: 'Increase is 0.9 million; divide by 2.4 million to obtain 0.375 = 37.5%.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.7,
      tags: ['percent-change', 'finance', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A 5 kilogram solution is 30% sugar. How many kilograms of pure sugar must be added to make the solution 40% sugar?',
        correctAnswer: '5/6',
        explanation: 'Start with 1.5 kg sugar. Solve (1.5 + x)/(5 + x) = 0.40 to get x = 5/6.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 1.0,
      tags: ['mixtures', 'percentages', 'algebra'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'A jar contains 6 yellow and 4 white marbles. Two marbles are drawn without replacement. What is the probability they are different colors?',
        choices: ['12/45', '8/15', '2/5', '3/5'],
        correctAnswer: '8/15',
        explanation: 'Probability different colors = 2 * (6/10)*(4/9) = 48/90 = 8/15.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Probability',
      difficulty: 0.8,
      tags: ['probability', 'combinatorics', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Originally 40% of students passed an exam. After 30 more students pass, the pass rate becomes 50%. How many students were originally in the group?',
        correctAnswer: '300',
        explanation: 'Let total be T. Then 0.4T + 30 = 0.5T, so T = 300.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 1.1,
      tags: ['percentages', 'algebra', 'data-analysis'],
    },


      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.5,
      tags: ['quartiles', 'spread', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Notebooks cost 2.50 dollars each plus 7% sales tax. If the total cost is 53.50 dollars, how many notebooks were bought?',
        correctAnswer: '20',
        explanation: 'Solve 2.50n * 1.07 = 53.50 to get n = 20.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 0.8,
      tags: ['sales-tax', 'percentages', 'data-analysis'],
    },


      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Probability',
      difficulty: 0.9,
      tags: ['probability', 'complements', 'data-analysis'],
    },

    {
      content: {
        type: 'grid-in',
        question: "A company's profit decreases by 12% one year and increases by 20% the next year. What is the overall percent change?",
        correctAnswer: '5.6',
        explanation: 'Multiply factors 0.88 and 1.20 to get 1.056, a 5.6% increase.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Percentages',
      difficulty: 1.0,
      tags: ['percent-change', 'compounding', 'data-analysis'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Five numbers have a mean of 14. Removing one number leaves a mean of 12 for the remaining four numbers. What number was removed?',
        choices: ['18', '20', '22', '26'],
        correctAnswer: '22',
        explanation: 'Total is 5 * 14 = 70. Remaining sum is 4 * 12 = 48, so the removed number is 22.',
      },
      domain: 'Problem Solving & Data Analysis',
      subdomain: 'Statistics',
      difficulty: 0.6,
      tags: ['mean', 'statistics', 'data-analysis'],
    },

    // GEOMETRY & TRIGONOMETRY - Expansion Final

    {
      content: {
        type: 'multiple-choice',
        question: 'A trapezoid has bases 8 and 14 and height 6. What is its area?',
        choices: ['54', '60', '66', '72'],
        correctAnswer: '66',
        explanation: 'Area = ((8 + 14)/2) * 6 = 66.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Area and Perimeter',
      difficulty: 0.6,
      tags: ['trapezoids', 'area', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'What is the circumference of a circle with radius 5 expressed in terms of pi?',
        correctAnswer: '10pi',
        explanation: 'Circumference = 2 * pi * 5 = 10pi.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Circles',
      difficulty: 0.4,
      tags: ['circles', 'circumference', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A rectangular prism measures 3 by 4 by 12 units. What is the length of its space diagonal?',
        correctAnswer: '13',
        explanation: 'Diagonal = sqrt(3^2 + 4^2 + 12^2) = sqrt(169) = 13.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Three-Dimensional Figures',
      difficulty: 0.8,
      tags: ['3d-geometry', 'diagonals', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'In a right triangle with legs 7 and 24, what is sin of the angle opposite the side of length 7?',
        choices: ['7/24', '7/25', '24/25', '25/7'],
        correctAnswer: '7/25',
        explanation: 'The hypotenuse is 25, so sin(theta) = opposite/hypotenuse = 7/25.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Right Triangles',
      difficulty: 0.7,
      tags: ['trigonometry', 'right-triangles', 'ratios'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'An equilateral triangle has area 16sqrt(3). What is the side length?',
        choices: ['4', '6', '8', '12'],
        correctAnswer: '8',
        explanation: 'Area = (sqrt(3)/4)s^2. Setting equal to 16sqrt(3) gives s^2 = 64, so s = 8.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Triangles',
      difficulty: 0.9,
      tags: ['equilateral', 'area', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'Find the area of the triangle with vertices (2, 3), (8, 3), and (2, 9).',
        correctAnswer: '18',
        explanation: 'The triangle is right with legs 6. Area = (1/2)*6*6 = 18.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Coordinate Geometry',
      difficulty: 0.7,
      tags: ['coordinate-geometry', 'area', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'What is the arc length subtended by a 75 degree central angle in a circle of radius 12?',
        choices: ['5pi', '6pi', '8pi', '10pi'],
        correctAnswer: '5pi',
        explanation: 'Arc length = (75/360) * 2 * pi * 12 = 5pi.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Circles',
      difficulty: 0.8,
      tags: ['arc-length', 'circles', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'If tan(theta) = 3/4 with theta in quadrant I, what is sec(theta)?',
        choices: ['3/4', '4/3', '5/4', '4/5'],
        correctAnswer: '5/4',
        explanation: 'Construct a right triangle with opposite 3 and adjacent 4, giving hypotenuse 5 and sec(theta) = 5/4.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Trigonometric Ratios',
      difficulty: 0.7,
      tags: ['trigonometry', 'ratios', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'What is the distance between the points (-3, 4) and (5, -2)?',
        correctAnswer: '10',
        explanation: 'Distance = sqrt((8)^2 + (-6)^2) = 10.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Coordinate Geometry',
      difficulty: 0.5,
      tags: ['distance', 'coordinate-geometry', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'What is the volume of a sphere with radius 4 expressed in terms of pi?',
        choices: ['64pi/3', '128pi/3', '256pi/3', '512pi/3'],
        correctAnswer: '256pi/3',
        explanation: 'Volume = (4/3) * pi * 4^3 = 256pi/3.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Three-Dimensional Figures',
      difficulty: 0.8,
      tags: ['spheres', 'volume', 'geometry'],
    },

    {
      content: {
        type: 'grid-in',
        question: 'A cone has radius 6 and slant height 10. What is its total surface area in terms of pi?',
        correctAnswer: '96pi',
        explanation: 'Surface area = pi*r*l + pi*r^2 = 60pi + 36pi = 96pi.',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Three-Dimensional Figures',
      difficulty: 1.0,
      tags: ['cones', 'surface-area', 'geometry'],
    },

    {
      content: {
        type: 'multiple-choice',
        question: 'Points P(1, 5), Q(5, 1), and R(1, 1) form triangle PQR. What is the length of PQ?',
        choices: ['4', '4sqrt(2)', '6', '8'],
        correctAnswer: '4sqrt(2)',
        explanation: 'Use the distance formula: sqrt((5 - 1)^2 + (1 - 5)^2) = 4sqrt(2).',
      },
      domain: 'Geometry & Trigonometry',
      subdomain: 'Coordinate Geometry',
      difficulty: 0.8,
      tags: ['distance', 'coordinate-geometry', 'geometry'],
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