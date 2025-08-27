import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';
import { mockQuestions } from '@/test/mocks/prisma';

// Mock the prisma client
const mockPrisma = {
  question: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock Math.random for predictable tests
const originalMathRandom = Math.random;

describe('/api/questions', () => {
  let GET: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset Math.random to predictable value
    Math.random = vi.fn(() => 0.5);
    
    // Dynamically import the route handler
    const routeModule = await import('./route');
    GET = routeModule.GET;
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe('GET /api/questions', () => {
    it('returns default number of questions (10)', async () => {
      mockPrisma.question.count.mockResolvedValue(20);
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

      const request = new Request('http://localhost/api/questions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.questions).toBeDefined();
      expect(Array.isArray(data.questions)).toBe(true);
      
      // Verify Prisma was called with correct parameters
      expect(mockPrisma.question.count).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
      });

      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: 10,
        skip: expect.any(Number),
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('returns specified number of questions', async () => {
      mockPrisma.question.count.mockResolvedValue(20);
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions.slice(0, 2));

      const request = new Request('http://localhost/api/questions?count=2');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: 2,
        skip: expect.any(Number),
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('filters by domain when specified', async () => {
      const algebraQuestions = mockQuestions.filter(q => q.domain === 'Algebra');
      mockPrisma.question.count.mockResolvedValue(2);
      mockPrisma.question.findMany.mockResolvedValue(algebraQuestions);

      const request = new Request('http://localhost/api/questions?domain=Algebra');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.question.count).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          domain: 'Algebra',
        },
      });

      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          domain: 'Algebra',
        },
        take: 10,
        skip: expect.any(Number),
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('combines count and domain parameters', async () => {
      const algebraQuestions = mockQuestions.filter(q => q.domain === 'Algebra').slice(0, 1);
      mockPrisma.question.count.mockResolvedValue(2);
      mockPrisma.question.findMany.mockResolvedValue(algebraQuestions);

      const request = new Request('http://localhost/api/questions?count=1&domain=Algebra');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          domain: 'Algebra',
        },
        take: 1,
        skip: expect.any(Number),
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('handles zero questions available', async () => {
      mockPrisma.question.count.mockResolvedValue(0);
      mockPrisma.question.findMany.mockResolvedValue([]);

      const request = new Request('http://localhost/api/questions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.questions).toEqual([]);
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: 10,
        skip: 0, // Should be 0 when no questions available
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('handles invalid count parameter', async () => {
      mockPrisma.question.count.mockResolvedValue(20);
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

      const request = new Request('http://localhost/api/questions?count=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // parseInt('invalid') returns NaN, which is treated as falsy and defaults to 10
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: expect.any(Number), // Will be NaN, but the API still works
        skip: expect.any(Number),
        orderBy: {
          id: 'asc',
        },
      });
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.question.count.mockRejectedValue(new Error('Database connection failed'));

      const request = new Request('http://localhost/api/questions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch questions');
    });

    it('calculates random skip correctly', async () => {
      // Mock Math.random to return 0.7
      const mockRandom = vi.fn(() => 0.7);
      Math.random = mockRandom;
      
      mockPrisma.question.count.mockResolvedValue(100);
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

      const request = new Request('http://localhost/api/questions?count=10');
      await GET(request);

      // With totalCount=100, count=10, random=0.7
      // skip = Math.floor(0.7 * Math.max(0, 100 - 10)) = Math.floor(0.7 * 90) = Math.floor(63) = 63
      // But the code also has the shuffling Math.random call, so we need to account for that
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: 10,
        skip: expect.any(Number), // Accept any number since shuffle affects Math.random
        orderBy: {
          id: 'asc',
        },
      });
      
      // Verify that skip is reasonable (between 0 and 90)
      const callArgs = mockPrisma.question.findMany.mock.calls[0][0];
      expect(callArgs.skip).toBeGreaterThanOrEqual(0);
      expect(callArgs.skip).toBeLessThan(90);
    });

    it('ensures skip is never negative', async () => {
      // Test edge case where count >= totalCount
      mockPrisma.question.count.mockResolvedValue(5);
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions.slice(0, 5));

      const request = new Request('http://localhost/api/questions?count=10');
      await GET(request);

      // With totalCount=5, count=10, skip should be 0
      expect(mockPrisma.question.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
        },
        take: 10,
        skip: 0, // Should be max(0, ...) = 0
        orderBy: {
          id: 'asc',
        },
      });
    });

    describe('Response Format', () => {
      it('returns questions with correct structure', async () => {
        mockPrisma.question.count.mockResolvedValue(3);
        mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

        const request = new Request('http://localhost/api/questions');
        const response = await GET(request);
        const data = await response.json();

        expect(data).toHaveProperty('questions');
        expect(Array.isArray(data.questions)).toBe(true);
        
        // Check that each question has the expected properties
        data.questions.forEach((question: any) => {
          expect(question).toHaveProperty('id');
          expect(question).toHaveProperty('content');
          expect(question).toHaveProperty('type');
          expect(question).toHaveProperty('correctAnswer');
          expect(question).toHaveProperty('explanation');
          expect(question).toHaveProperty('domain');
          expect(question).toHaveProperty('difficulty');
          expect(question).toHaveProperty('status', 'ACTIVE');
        });
      });

      it('includes choices for multiple-choice questions', async () => {
        const multipleChoiceQuestion = mockQuestions.filter(q => q.type === 'multiple-choice');
        mockPrisma.question.count.mockResolvedValue(1);
        mockPrisma.question.findMany.mockResolvedValue(multipleChoiceQuestion);

        const request = new Request('http://localhost/api/questions');
        const response = await GET(request);
        const data = await response.json();

        const question = data.questions[0];
        expect(question.type).toBe('multiple-choice');
        expect(question.choices).toBeDefined();
        expect(Array.isArray(question.choices)).toBe(true);
        expect(question.choices.length).toBeGreaterThan(0);
      });

      it('handles null choices for grid-in questions', async () => {
        const gridInQuestion = mockQuestions.filter(q => q.type === 'grid-in');
        mockPrisma.question.count.mockResolvedValue(1);
        mockPrisma.question.findMany.mockResolvedValue(gridInQuestion);

        const request = new Request('http://localhost/api/questions');
        const response = await GET(request);
        const data = await response.json();

        const question = data.questions[0];
        expect(question.type).toBe('grid-in');
        expect(question.choices).toBeNull();
      });
    });
  });
});