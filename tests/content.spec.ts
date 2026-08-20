import { expect, test, type Page } from "@playwright/test";

import enMessages from "../src/i18n/messages/en.json";
import noMessages from "../src/i18n/messages/no.json";

/**
 * Screenshot comparisons only cover the viewport and tolerate a small pixel
 * budget, so a text-only change (e.g. a new job title) can slip through them.
 * These assertions check the rendered content itself, across the whole page and
 * in both locales.
 */
const locales = [
  { locale: "no", messages: noMessages },
  { locale: "en", messages: enMessages },
] as const;

/** Text of every CV entry, so repeated values (a school that also appears as an
 *  employer) can be asserted per entry instead of page-wide. */
async function entryTexts(page: Page): Promise<string[]> {
  const texts = await page.locator("article").allTextContents();
  return texts.map((text) => text.replace(/\s+/g, " ").trim());
}

function expectEntryContaining(entries: string[], ...parts: string[]): void {
  const match = entries.find((entry) =>
    parts.every((part) => entry.includes(part)),
  );
  expect(match, `no CV entry contains all of: ${parts.join(" + ")}`).toBeDefined();
}

for (const { locale, messages } of locales) {
  test(`home renders hero content (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);

    await expect(
      page.getByRole("heading", { level: 1, name: messages.hero.name }),
    ).toBeVisible();
    await expect(page.getByText(messages.hero.tagline)).toBeVisible();
    await expect(page.getByText(messages.hero.description)).toBeVisible();

    await expect(
      page.getByRole("link", { name: messages.social.linkedin }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/mtyldum/");
    await expect(
      page.getByRole("link", { name: messages.social.github }),
    ).toHaveAttribute("href", "https://github.com/maattss");
  });

  test(`cv renders every experience and education entry (${locale})`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/cv`);

    await expect(
      page.getByRole("heading", { level: 1, name: messages.cv.name }),
    ).toBeVisible();
    await expect(page.getByText(messages.cv.subtitle)).toBeVisible();
    await expect(page.getByText(messages.cv.summary)).toBeVisible();

    // Earlier roles live behind a toggle; expand it before asserting on them.
    await page
      .getByRole("button", { name: messages.cv.experience.showMore })
      .click();

    const entries = await entryTexts(page);

    for (const job of messages.cv.experience.items) {
      expectEntryContaining(entries, job.role, job.company);
    }

    for (const edu of messages.cv.education.items) {
      expectEntryContaining(entries, edu.degree, edu.school);
    }

    for (const category of messages.cv.skills.categories) {
      for (const skill of category.items) {
        await expect(
          page.getByText(skill, { exact: true }).first(),
        ).toBeVisible();
      }
    }
  });

  test(`page titles are not double-prefixed (${locale})`, async ({ page }) => {
    for (const path of ["", "/cv"]) {
      await page.goto(`/${locale}${path}`);
      expect(await page.title()).not.toMatch(/tyldum\.dev.*tyldum\.dev/);
    }
  });
}

test("active nav link is marked for assistive technology", async ({ page }) => {
  await page.goto("/no/cv");

  await expect(page.getByRole("link", { name: "CV" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.getByRole("link", { name: "tyldum.dev" }),
  ).not.toHaveAttribute("aria-current", "page");
});

test("skip link becomes visible on focus and targets main", async ({ page }) => {
  await page.goto("/no");

  const skipLink = page.getByRole("link", { name: "Hopp til innhold" });
  await skipLink.focus();

  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveAttribute("href", "#main");
  await expect(page.locator("main#main")).toBeAttached();
});
