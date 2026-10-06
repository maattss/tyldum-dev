import { expect, test } from "@playwright/test";

const themeState = () =>
  document.documentElement.getAttribute("data-theme-pref") +
  "|" +
  document.documentElement.classList.contains("dark") +
  "|" +
  localStorage.getItem("theme");

test("defaults to dark when nothing is stored, even with a light OS", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en");

  expect(await page.evaluate(themeState)).toBe("dark|true|null");
});

test("theme toggle cycles light, dark, system and persists the choice", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("theme", "light");
    }
  });
  await page.goto("/en");

  const toggle = page.getByRole("button", { name: /^Toggle theme/ });
  await expect(toggle).toHaveAccessibleName("Toggle theme: Light");

  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Toggle theme: Dark");
  expect(await page.evaluate(themeState)).toBe("dark|true|dark");

  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Toggle theme: System");
  // The OS is dark, so "system" resolves to dark.
  expect(await page.evaluate(themeState)).toBe("system|true|system");

  // "system" keeps following the OS after the page has loaded.
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => page.evaluate(themeState)).toBe("system|false|system");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content,
      ),
    )
    .toBe("#f7f9fd");

  await page.reload();
  await expect(toggle).toHaveAccessibleName("Toggle theme: System");
});

test("language toggle links to the same page in the other locale", async ({ page }) => {
  await page.goto("/en/cv");

  const link = page.getByRole("link", { name: "Les på norsk" });
  await expect(link).toHaveAttribute("hreflang", "no");
  await link.click();

  await expect(page).toHaveURL(/\/no\/cv$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "no");
  await expect(page.getByRole("link", { name: "Read in English" })).toBeVisible();
});
