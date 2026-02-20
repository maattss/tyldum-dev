import { expect, test } from "@playwright/test";

test("reading page shows featured links ordered by date", async ({ page }) => {
  await page.goto("/en/reading");

  await expect(page.getByRole("heading", { name: "Recommended Reading" })).toBeVisible();

  const links = page.locator('li a[href^="https://"]');
  await expect(links).toHaveCount(4);

  await expect(links.nth(0)).toContainText("Dark Flow");
  await expect(links.nth(1)).toContainText("The Agent Psychosis");
  await expect(links.nth(2)).toContainText("Tech Trends 2026");
  await expect(links.nth(3)).toContainText("mattshumer_ on X");
});

test("reading page is localized in Norwegian", async ({ page }) => {
  await page.goto("/no/reading");

  await expect(page.getByRole("heading", { name: "Anbefalt lesning" })).toBeVisible();
});
