import { expect, test } from "@playwright/test";

const themeState = () =>
  (document.documentElement.classList.contains("dark") ? "dark" : "light") +
  "|" +
  localStorage.getItem("theme");

for (const os of ["light", "dark"] as const) {
  test(`follows the OS (${os}) when nothing is stored`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: os });
    await page.goto("/en");

    expect(await page.evaluate(themeState)).toBe(`${os}|null`);
  });
}

test("keeps following the OS until the visitor picks a theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => page.evaluate(themeState)).toBe("dark|null");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content,
      ),
    )
    .toBe("#0a0b0d");
});

test("a legacy stored 'system' choice still follows the OS", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.setItem("theme", "system"));
  await page.goto("/en");

  expect(await page.evaluate(themeState)).toBe("dark|system");
});

test("theme toggle flips between light and dark and remembers it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en");

  const toggle = page.getByRole("button", { name: "Toggle theme" });

  await toggle.click();
  expect(await page.evaluate(themeState)).toBe("light|light");

  // An explicit choice wins over the OS from now on.
  await page.emulateMedia({ colorScheme: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await page.evaluate(themeState)).toBe("light|light");

  await toggle.click();
  expect(await page.evaluate(themeState)).toBe("dark|dark");

  await page.reload();
  expect(await page.evaluate(themeState)).toBe("dark|dark");
});

test("language switch shows both locales and links to the same page in the other", async ({ page }) => {
  await page.goto("/en/cv");

  const group = page.getByRole("group", { name: "Language" });
  await expect(group.locator('[aria-current="true"]')).toHaveText("en");

  const link = group.getByRole("link", { name: "Norsk" });
  await expect(link).toHaveAttribute("hreflang", "no");
  await link.click();

  await expect(page).toHaveURL(/\/no\/cv$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "no");
  const norwegian = page.getByRole("group", { name: "Språk" });
  await expect(norwegian.locator('[aria-current="true"]')).toHaveText("no");
  await expect(norwegian.getByRole("link", { name: "English" })).toBeVisible();
});

test("switching language keeps the chosen theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/no");

  await page.getByRole("button", { name: "Bytt tema" }).click();
  expect(await page.evaluate(themeState)).toBe("dark|dark");

  // A client-side navigation: the inline theme script does not run again.
  await page.evaluate(() => ((window as unknown as { __marker: boolean }).__marker = true));
  await page.getByRole("group", { name: "Språk" }).getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(true);

  await expect.poll(() => page.evaluate(themeState)).toBe("dark|dark");
  expect(
    await page.evaluate(
      () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])')?.content,
    ),
  ).toBe("#0a0b0d");
});
