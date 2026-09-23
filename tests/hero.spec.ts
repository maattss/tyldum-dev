import { expect, test, type Page } from "@playwright/test";

/**
 * The horizon hero is driven by scroll, which the screenshot suite never sees:
 * it runs under reduced motion, where the hero is shown finished. These tests
 * check the choreography itself by geometry, so they do not depend on pixels.
 */

async function geometry(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
    };
    return {
      horizon: box(".horizon-planet").top,
      greeting: box(".horizon-greeting"),
      name: box(".horizon-name"),
      left: box(".curtain-left"),
      right: box(".curtain-right"),
      viewport: window.innerWidth,
    };
  });
}

/** Scrolls to the end of the hero's travel and waits for the frame to apply. */
async function scrollThroughHero(page: Page) {
  await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("[data-hero]")!;
    window.scrollTo(0, section.offsetHeight);
  });
  await expect
    .poll(() => page.locator("[data-hero]").evaluate((el) => el.style.getPropertyValue("--rise")))
    .toBe("1.0000");
}

test.describe("horizon hero with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("starts with the greeting on the horizon and the name below it", async ({ page }) => {
    await page.goto("/en");
    const g = await geometry(page);

    // Resting on the horizon, not behind it.
    expect(g.greeting.bottom).toBeLessThanOrEqual(g.horizon + 1);
    // Entirely below the horizon line, i.e. hidden behind the planet.
    expect(g.name.top).toBeGreaterThanOrEqual(g.horizon);
    // Both curtains are in view.
    expect(g.left.right).toBeGreaterThan(0);
    expect(g.right.left).toBeLessThan(g.viewport);
  });

  test("scrolling parts the curtains and raises the name", async ({ page }) => {
    await page.goto("/en");
    await scrollThroughHero(page);
    const g = await geometry(page);

    expect(g.name.bottom).toBeLessThanOrEqual(g.horizon + 1);
    expect(g.greeting.top).toBeGreaterThanOrEqual(g.horizon);
    expect(g.left.right).toBeLessThanOrEqual(0);
    expect(g.right.left).toBeGreaterThanOrEqual(g.viewport);
  });
});

test.describe("horizon hero with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows the finished state without scrolling", async ({ page }) => {
    await page.goto("/en");
    const g = await geometry(page);

    expect(g.name.bottom).toBeLessThanOrEqual(g.horizon + 1);
    expect(g.left.right).toBeLessThanOrEqual(0);
    expect(g.right.left).toBeGreaterThanOrEqual(g.viewport);
    // Nothing is attached to scroll, so nothing is written inline.
    await expect(page.locator("[data-hero]")).not.toHaveAttribute("style", /--rise/);
  });
});
