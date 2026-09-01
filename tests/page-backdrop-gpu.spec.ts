import { expect, test, type Page } from "@playwright/test";
import { PNG } from "pngjs";

// The interaction, exercised against a real adapter.
//
// Its own file because `launchOptions` forces a new worker and Playwright only
// accepts it at the top level. The flags ask Chromium for a software WebGPU
// adapter: a headless runner has no real GPU, and without them `requestAdapter()`
// returns null, which is why the rest of the suite can only ever check that the
// grid stays *absent*.
//
// Both preconditions below are skips rather than failures, because neither is a
// statement about the product:
//
//   * the runner may not offer a software adapter at all, and
//   * it may offer one that cannot actually render this shader, leaving a blank
//     canvas.
//
// A blank canvas is indistinguishable from "the pointer did nothing" if you only
// diff two screenshots, which is how the first version of this passed locally and
// failed in CI. The Dawn-based `pnpm check:backdrop` remains the gate that always
// runs and never skips.
test.use({
  launchOptions: {
    args: [
      "--enable-unsafe-webgpu",
      "--enable-unsafe-swiftshader",
      "--use-webgpu-adapter=swiftshader",
      "--use-angle=swiftshader",
    ],
  },
});

/** Distinct non-transparent colors, as a cheap "did anything get drawn" check. */
function distinctColors(shot: Buffer): number {
  const png = PNG.sync.read(shot);
  const seen = new Set<number>();
  for (let i = 0; i < png.data.length; i += 4) {
    seen.add((png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2]);
    if (seen.size > 4) break;
  }
  return seen.size;
}

/**
 * A point in open grid, to the left of the copy.
 *
 * Computed from the live layout rather than hardcoded. The clearing is measured
 * off the hero's own elements, so its edge moves with the font metrics of
 * whatever platform is running — a fixed coordinate that sits in open grid on
 * macOS can land inside the clearing on a Linux runner, where the shader draws
 * nothing and the pointer provably cannot change anything.
 */
async function openGridPoint(page: Page) {
  return page.evaluate(() => {
    const parts = document.querySelectorAll<HTMLElement>("[data-hero-content]");
    const main = document.querySelector("main");
    if (parts.length === 0 || !main) return null;

    let left = Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const part of parts) {
      const box = part.getBoundingClientRect();
      left = Math.min(left, box.left);
      top = Math.min(top, box.top);
      bottom = Math.max(bottom, box.bottom);
    }

    // Clear of the clearing's padding and its feather, with room to spare.
    const x = left - 170;
    const y = (top + bottom) / 2;
    const mainBox = main.getBoundingClientRect();
    if (x < mainBox.left + 40) return null;
    return { x, y };
  });
}

test.describe("page backdrop with a GPU", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/en", { waitUntil: "networkidle" });

    const hasAdapter = await page.evaluate(async () => {
      // Structurally typed rather than via lib.dom's GPU types, which this
      // project does not pull in.
      const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      if (!gpu) return false;
      try {
        return Boolean(await gpu.requestAdapter());
      } catch {
        return false;
      }
    });
    test.skip(!hasAdapter, "no WebGPU adapter on this runner");
  });

  test("mounts a canvas that fills main", async ({ page }) => {
    const canvas = page.locator(".page-backdrop canvas");
    await expect(canvas).toHaveCount(1);

    const fits = await page.evaluate(() => {
      const node = document.querySelector(".page-backdrop canvas");
      const main = document.querySelector("main");
      if (!node || !main) return false;
      const a = node.getBoundingClientRect();
      const b = main.getBoundingClientRect();
      return Math.abs(a.height - b.height) < 1 && Math.abs(a.width - b.width) < 1;
    });
    expect(fits).toBe(true);
  });

  test("the grid responds to the pointer", async ({ page }) => {
    const canvas = page.locator(".page-backdrop canvas");

    // Let the opening fade finish, or the comparison catches that instead.
    await page.waitForTimeout(1500);
    const resting = await canvas.screenshot();
    test.skip(
      distinctColors(resting) < 2,
      "the software adapter rendered a blank canvas, so there is nothing to deform",
    );

    const target = await openGridPoint(page);
    test.skip(target === null, "no open grid beside the copy at this viewport");

    // Two moves: the first arms the pointer, the second gives it somewhere to
    // ease toward.
    await page.mouse.move(target!.x - 40, target!.y);
    await page.mouse.move(target!.x, target!.y);
    await page.waitForTimeout(900);

    // The whole feature is that it only does anything because someone is there.
    expect((await canvas.screenshot()).equals(resting)).toBe(false);
  });
});
