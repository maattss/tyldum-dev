import { expect, test } from "@playwright/test";

const routes = [
  { name: "home-no", path: "/no" },
  { name: "home-en", path: "/en" },
  { name: "cv-no", path: "/no/cv" },
  { name: "cv-en", path: "/en/cv" },
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
        animations: "disabled",
        caret: "hide",
        scale: "css",
        // An absolute budget rather than a ratio: a ratio large enough to
        // absorb font antialiasing (0.015 == ~18k pixels at this viewport) also
        // absorbs entire lines of changed text. A few hundred pixels covers
        // rendering noise without hiding real content changes.
        maxDiffPixels: 300,
      });
    });
  }
}
