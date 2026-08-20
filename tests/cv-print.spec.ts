import { expect, test } from "@playwright/test";

import noMessages from "../src/i18n/messages/no.json";

/**
 * "Download PDF" is just `window.print()`, so the print stylesheet *is* the
 * CV's PDF layout. Guard it: site chrome must be gone, every role must be on
 * the page even though the earlier-experience section is collapsed on screen,
 * and text must stay dark on white regardless of the active theme.
 *
 * Note: the collapsed section is `aria-hidden`, so these assertions use CSS
 * locators rather than `getByRole`, which consults the accessibility tree.
 */
const experienceItems = noMessages.cv.experience.items;

for (const theme of ["dark", "light"] as const) {
  test(`printed CV is complete and readable (${theme} theme)`, async ({
    page,
  }) => {
    await page.addInitScript((themeMode) => {
      localStorage.setItem("theme", themeMode);
    }, theme);

    await page.goto("/no/cv");
    await page.emulateMedia({ media: "print" });

    // Site chrome does not belong on a CV.
    await expect(page.locator("header.sticky")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(
      page.getByRole("button", { name: noMessages.cv.experience.showMore }),
    ).toBeHidden();

    // Every role must print, including the ones collapsed on screen.
    for (const job of experienceItems) {
      await expect(
        page
          .locator("article h3")
          .filter({ hasText: new RegExp(`^${escapeRegExp(job.role)}$`) })
          .first(),
      ).toBeVisible();
    }

    // The collapsed section must be fully opaque, not mid-fade: print
    // rendering snapshots the page immediately, so transitions must be off.
    const panel = page.locator('[role="region"]');
    await expect(panel).toHaveCSS("opacity", "1");

    // Profile URLs replace the clickable labels on paper.
    await expect(page.getByText("linkedin.com/in/mtyldum")).toBeVisible();
    await expect(page.getByText("github.com/maattss")).toBeVisible();

    // Browsers drop backgrounds when printing, so the text must be dark.
    const color = await page
      .getByRole("heading", { level: 1 })
      .evaluate((el) => getComputedStyle(el).color);
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    expect(luminance).toBeLessThan(0.5);
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
