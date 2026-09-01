import { expect, test } from "@playwright/test";

// The interaction, exercised against a real adapter.
//
// Its own file because `launchOptions` forces a new worker and Playwright only
// accepts it at the top level. The flags ask Chromium for a software WebGPU
// adapter: a headless runner has no real GPU, and without them `requestAdapter()`
// returns null, which is why the rest of the suite can only ever check that the
// grid stays *absent*.
//
// Whether a given runner can actually provide the software adapter is not
// something to assume, so this skips rather than fails when it cannot. The
// Dawn-based `pnpm check:backdrop` remains the gate that always runs.
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
    const shot = async () => (await canvas.screenshot()).toString("base64");

    // Let the opening fade finish, or the comparison catches that instead.
    await page.waitForTimeout(1200);
    const resting = await shot();

    // Two moves: the first arms the pointer, the second gives it somewhere to
    // ease toward. Both land clear of the copy, where there are dots to deform.
    await page.mouse.move(240, 600);
    await page.mouse.move(300, 620);
    await page.waitForTimeout(700);

    // The whole feature is that it only does anything because someone is there.
    expect(await shot()).not.toBe(resting);
  });
});
