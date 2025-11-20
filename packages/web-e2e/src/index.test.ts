import { test, expect } from "@playwright/test";

test("web page has correct bottom icons text", async ({ page }) => {
  await page.goto("/");

  const expectedTexts = ["Proper Cache", "Tree shaking", "No useless runs"];

  for (const text of expectedTexts) {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
});
