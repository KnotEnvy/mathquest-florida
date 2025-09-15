import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.describe('Auth flow (optional)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'TEST_EMAIL/TEST_PASSWORD not set');

  test('can sign in with email/password and sign out', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_EMAIL!);
    await page.getByLabel('Password').fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Redirect to practice
    await page.waitForURL('**/practice');
    // Header shows welcome
    await expect(page.getByText(/Welcome, /)).toBeVisible();

    // Navigate to home and sign out
    await page.goto('/');
    await page.getByRole('button', { name: /Sign Out/i }).click();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });
});

