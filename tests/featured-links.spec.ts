import { expect, test } from "@playwright/test";

test("reading page shows saved links with previews", async ({ page }) => {
  await page.goto("/en/reading");

  await expect(page.getByRole("heading", { name: "Interesting links" })).toBeVisible();

  const links = page.locator('li a[href^="https://"]');
  await expect(links).toHaveCount(4);
  await expect(page.locator('li img[alt$="preview"]')).toHaveCount(4);

  await expect(links.nth(0)).toContainText("Dark Flow");
  await expect(links.nth(1)).toContainText("The Agent Psychosis");
  await expect(links.nth(2)).toContainText("Tech Trends 2026");
  await expect(links.nth(3)).toContainText("mattshumer_ on X");
});

test("reading page is localized in Norwegian", async ({ page }) => {
  await page.goto("/no/reading");

  await expect(page.getByRole("heading", { name: "Interessante lenker" })).toBeVisible();
});

test("reading nav link appears to the right of CV", async ({ page }) => {
  await page.goto("/en/reading");

  const navLinks = page.locator("header nav a");
  await expect(navLinks.nth(1)).toHaveText("CV");
  await expect(navLinks.nth(2)).toHaveText("Links");
});
