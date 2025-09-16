import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockQuestions } from '@/test/mocks/prisma';

const mockPrisma = {
  question: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const originalMathRandom = Math.random;

describe('/api/questions', () => {
  let GET: typeof import('./route').GET;

  beforeEach(async () => {
    vi.clearAllMocks();
    Math.random = vi.fn(() => 0.42);
    const route = await import('./route');
    GET = route.GET;
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  it('returns the default set of questions when no filters are provided', async () => {
    mockPrisma.question.count.mockResolvedValue(20);
    mockPrisma.question.findMany.mockResolvedValue(mockQuestions.slice(0, 3));

    const response = await GET(new Request('http://localhost/api/questions'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.questions)).toBe(true);
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

  it('supports custom count and domain filters', async () => {
    const algebraQuestions = mockQuestions.filter((question) => question.domain === 'Algebra');
    mockPrisma.question.count.mockResolvedValue(algebraQuestions.length);
    mockPrisma.question.findMany.mockResolvedValue(algebraQuestions.slice(0, 2));

    const response = await GET(
      new Request('http://localhost/api/questions?count=2&domain=Algebra'),
    );

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
      take: 2,
      skip: expect.any(Number),
      orderBy: {
        id: 'asc',
      },
    });
  });

  it('prioritises questions near the requested ability', async () => {
    const abilityCandidates = Array.from({ length: 5 }).map((_, index) => ({
      ...mockQuestions[0],
      id: `ability-${index}`,
      difficulty: -0.5 + index * 0.3,
    }));

    mockPrisma.question.findMany
      .mockResolvedValueOnce(abilityCandidates)
      .mockResolvedValueOnce([]);

    const response = await GET(
      new Request('http://localhost/api/questions?count=3&ability=0.3'),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.question.count).not.toHaveBeenCalled();
    expect(mockPrisma.question.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        status: 'ACTIVE',
        difficulty: {
          gte: -0.45,
          lte: 1.05,
        },
      },
      orderBy: {
        difficulty: 'asc',
      },
      take: 9,
    });
    expect(data.questions).toHaveLength(3);
    const distances = data.questions.map((question: any) =>
      Math.abs(question.difficulty - 0.3),
    );
    expect(Math.max(...distances)).toBeLessThanOrEqual(0.45);
  });

  it('falls back to recent questions when ability window is empty', async () => {
    mockPrisma.question.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockQuestions.slice(0, 2));

    const response = await GET(
      new Request('http://localhost/api/questions?count=2&ability=-1.5'),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPrisma.question.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 2,
    });
    expect(data.questions).toHaveLength(2);
  });

  it('returns 400 for invalid query parameters', async () => {
    const response = await GET(
      new Request('http://localhost/api/questions?count=0&ability=5'),
    );
    expect(response.status).toBe(400);
  });

  it('handles database errors gracefully', async () => {
    mockPrisma.question.count.mockRejectedValue(new Error('database down'));

    const response = await GET(new Request('http://localhost/api/questions'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch questions');
  });
});
