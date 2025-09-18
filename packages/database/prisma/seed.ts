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