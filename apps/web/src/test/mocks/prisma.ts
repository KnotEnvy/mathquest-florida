import { vi } from 'vitest';

// Mock question data
export const mockQuestions = [
  {
    id: '1',
    content: 'What is $2 + 2$?',
    type: 'multiple-choice',
    choices: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: 'Adding $2 + 2$ equals $4$.',
    domain: 'Algebra',
    difficulty: 0.2,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    content: 'Calculate $\\sqrt{16}$',
    type: 'grid-in',
    choices: null,
    correctAnswer: '4',
    explanation: 'The square root of 16 is 4.',
    domain: 'Advanced Math',
    difficulty: 0.3,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    content: 'What is the value of $3 \\times 5$?',
    type: 'multiple-choice',
    choices: ['10', '15', '20', '25'],
    correctAnswer: '15',
    explanation: 'Multiplying $3 \\times 5$ equals $15$.',
    domain: 'Algebra',
    difficulty: 0.1,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const createMockPrisma = () => ({
  question: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  attempt: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  streak: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
});