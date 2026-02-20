import { expect, test } from "@playwright/test";

test("home page shows featured links ordered by date", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { name: "Recommended Reading" })).toBeVisible();

  const links = page.locator('section:has-text("Recommended Reading") li a');
  await expect(links).toHaveCount(4);

  await expect(links.nth(0)).toContainText("Dark Flow");
  await expect(links.nth(1)).toContainText("The Agent Psychosis");
});
