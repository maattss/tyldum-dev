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
});
