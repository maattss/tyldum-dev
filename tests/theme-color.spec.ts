import { expect, test } from "@playwright/test";

test.describe("status bar theme color", () => {
  test("uses dark theme color when user theme is dark and system is light", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "dark");
    });

    await page.goto("/en");

    await expect.poll(async () => {
      return page.evaluate(() => {
        const themeColor = document.head.querySelector<HTMLMetaElement>(
          'meta[name="theme-color"]:not([media])',
        )?.content;
        const statusBarStyle = document.head.querySelector<HTMLMetaElement>(
          'meta[name="apple-mobile-web-app-status-bar-style"]',
        )?.content;

        return `${themeColor ?? ""}|${statusBarStyle ?? ""}`;
      });
    }).toBe("#08090a|black-translucent");
  });

  test("uses light theme color when user theme is light and system is dark", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "light");
    });

    await page.goto("/en");

    await expect.poll(async () => {
      return page.evaluate(() => {
        const themeColor = document.head.querySelector<HTMLMetaElement>(
          'meta[name="theme-color"]:not([media])',
        )?.content;
        const statusBarStyle = document.head.querySelector<HTMLMetaElement>(
          'meta[name="apple-mobile-web-app-status-bar-style"]',
        )?.content;

        return `${themeColor ?? ""}|${statusBarStyle ?? ""}`;
      });
    }).toBe("#f7f9fd|default");
  });

  test("does not use a bright top gradient in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "dark");
    });

    await page.goto("/en");

    await expect.poll(async () => {
      return page.evaluate(() => {
        return getComputedStyle(document.body).backgroundImage;
      });
    }).not.toContain("255, 255, 255");
  });
});
