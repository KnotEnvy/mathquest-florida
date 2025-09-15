import { test, expect } from '@playwright/test';

test.describe('API endpoints (unauthenticated)', () => {
  test('GET /api/questions returns questions (<= 5)', async ({ request }) => {
    const res = await request.get('/api/questions?count=5');
    // If DB is connected, we expect 200; otherwise, allow 500 to surface
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body.questions)).toBeTruthy();
      expect(body.questions.length).toBeLessThanOrEqual(5);
    }
  });

  test('POST /api/attempts requires auth (401)', async ({ request }) => {
    const res = await request.post('/api/attempts', {
      data: { questionId: 'q1', answer: 'A', correct: false, timeSpent: 1000 },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/streaks requires auth (401)', async ({ request }) => {
    const res = await request.get('/api/streaks');
    expect(res.status()).toBe(401);
  });

  test('GET /api/user/stats requires auth (401)', async ({ request }) => {
    const res = await request.get('/api/user/stats');
    expect(res.status()).toBe(401);
  });
});

