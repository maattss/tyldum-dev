import { expect, test } from "@playwright/test";

// The grid is an enhancement, so the interesting cases are the ones where it
// must not appear at all — and the layout risk it introduces when it does.
test.describe("hero backdrop", () => {
  test("is absent under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en", { waitUntil: "networkidle" });

    // This is also what keeps the UI regression snapshots valid: they are all
    // captured under reduced motion, so they must never contain a live canvas.
    await expect(page.locator(".hero-backdrop")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("is absent when the browser has no WebGPU", async ({ page }) => {
    await page.addInitScript(() => {
      // `gpu` lives on Navigator.prototype, so deleting it off the instance
      // would leave `"gpu" in navigator` true.
      delete (Object.getPrototypeOf(navigator) as { gpu?: unknown }).gpu;
    });
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(page.locator(".hero-backdrop")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // The grid leaves a hole for whatever carries data-hero-content, so an
  // unmarked block of text is one the dots would run straight through. Nothing
  // about adding one would look wrong in review, and CI cannot acquire a WebGPU
  // adapter to catch it visually, so it is asserted structurally instead.
  test("every piece of hero text is inside the grid's clearing", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const unmarked = await page.evaluate(() => {
      const section = document.querySelector("main section");
      if (!section) return ["no hero section found"];

      const strays: string[] = [];
      const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        const element = node.parentElement;
        if (element && !element.closest("[data-hero-content]")) {
          strays.push(`${element.tagName.toLowerCase()}: ${node.textContent.trim().slice(0, 40)}`);
        }
      }
      return strays;
    });

    expect(unmarked).toEqual([]);
  });

  test("does not cause horizontal overflow when present", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    // The backdrop is 100vw inside a max-w-6xl container, which overflows the
    // content box by the width of the scrollbar unless `overflow-x: clip` holds.
    // Injected rather than waited for, so the guard runs even on a headless
    // browser that cannot acquire a WebGPU adapter.
    const overflow = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.className = "hero-backdrop";
      document.querySelector("main section")?.appendChild(probe);
      const amount = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      probe.remove();
      return amount;
    });

    expect(overflow).toBeLessThanOrEqual(0);
  });
});
