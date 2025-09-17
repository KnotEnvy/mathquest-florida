import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
};

const mockPrisma = {
  user: {
    upsert: vi.fn(),
  },
  profile: {
    findUnique: vi.fn(),
  },
  attempt: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('/api/user/stats', () => {
  let GET: typeof import('./route').GET;

  beforeEach(async () => {
    vi.resetModules();
    mockSupabase.auth.getUser.mockReset();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'demo@mathquest.app' } }, error: null });

    mockPrisma.user.upsert.mockReset();
    mockPrisma.profile.findUnique.mockReset();
    mockPrisma.attempt.count.mockReset();
    mockPrisma.attempt.findMany.mockReset();

    mockPrisma.profile.findUnique.mockResolvedValue({ xp: 250 });

    GET = (await import('./route')).GET;
  });

  it('returns stats with ability estimate and accuracy', async () => {
    mockPrisma.attempt.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7);

    const now = new Date();
    mockPrisma.attempt.findMany.mockResolvedValue([
      {
        id: 'a1',
        correct: true,
        timeSpent: 1200,
        createdAt: now,
        question: { domain: 'Algebra', difficulty: 0.1 },
      },
      {
        id: 'a2',
        correct: false,
        timeSpent: 1500,
        createdAt: now,
        question: { domain: 'Geometry', difficulty: 0.3 },
      },
    ]);

    const response = await GET(new Request('http://localhost/api/user/stats?recent=5') as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalAttempts).toBe(10);
    expect(data.correctAttempts).toBe(7);
    expect(data.accuracy).toBeCloseTo(0.7);
    expect(data.abilityEstimate).toBeCloseTo(0.5, 3);
    expect(data.recentAttempts).toHaveLength(2);
  });

  it('returns 401 when user is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await GET(new Request('http://localhost/api/user/stats') as unknown as NextRequest);

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid query', async () => {
    const response = await GET(new Request('http://localhost/api/user/stats?recent=0') as unknown as NextRequest);
    expect(response.status).toBe(400);
  });

  it('handles no attempts gracefully', async () => {
    mockPrisma.attempt.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.attempt.findMany.mockResolvedValue([]);

    const response = await GET(new Request('http://localhost/api/user/stats?recent=5') as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accuracy).toBeNull();
    expect(data.abilityEstimate).toBeNull();
  });
});
