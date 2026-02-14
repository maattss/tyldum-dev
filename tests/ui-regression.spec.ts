import { expect, test } from "@playwright/test";

const routes = [
  { name: "home-no", path: "/no" },
  { name: "home-en", path: "/en" },
  { name: "cv-no", path: "/no/cv" },
] as const;

const themes = ["dark", "light"] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.name} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((themeMode) => {
        localStorage.setItem("theme", themeMode);
      }, theme);

      await page.goto(route.path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
        fullPage: true,
        animations: "disabled",
        caret: "hide",
        scale: "css",
        maxDiffPixelRatio: 0.01,
      });
    });
  }
}
