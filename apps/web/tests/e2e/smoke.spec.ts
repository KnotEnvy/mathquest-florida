import { test, expect } from '@playwright/test';

test('home page renders and shows navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MathQuest Florida/i);
  await expect(page.getByRole('link', { name: /MathQuest Florida/i })).toBeVisible();
  // Either shows auth buttons or welcome text
  const maybeSignIn = page.getByRole('button', { name: /Sign In/i });
  const maybeWelcome = page.getByText(/Welcome, /);
  await expect(maybeSignIn.or(maybeWelcome)).toBeVisible();
});

test('practice page loads and shows loading then content or empty state', async ({ page }) => {
  await page.goto('/practice');
  // Loading state should appear quickly
  await expect(page.getByText(/Loading/i)).toBeVisible();
  // Then either question UI appears or empty DB message
  await expect(
    page.getByText(/Question \d+ of/i).or(
      page.getByText(/No questions available/i)
    )
  ).toBeVisible({ timeout: 20_000 });
});

