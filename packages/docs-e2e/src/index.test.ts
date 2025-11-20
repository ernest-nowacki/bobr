import { test, expect } from '@playwright/test';

test('docs page has correct bottom icons text', async ({ page }) => {
  await page.goto('/');

  const expectedTexts = [
    'Iterate faster',
    'Save time',
    'Balanced runs'
  ];

  for (const text of expectedTexts) {
    await expect(page.getByText(text)).toBeVisible();
  }
});
