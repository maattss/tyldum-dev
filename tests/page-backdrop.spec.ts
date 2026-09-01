import { expect, test } from "@playwright/test";

// The grid is an enhancement, so the interesting cases are the ones where it
// must not appear at all — and the layout risk it introduces when it does.
test.describe("page backdrop", () => {
  test("is absent under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en", { waitUntil: "networkidle" });

    // This is also what keeps the UI regression snapshots valid: they are all
    // captured under reduced motion, so they must never contain a live canvas.
    await expect(page.locator(".page-backdrop")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("is absent when the browser has no WebGPU", async ({ page }) => {
    await page.addInitScript(() => {
      // `gpu` lives on Navigator.prototype, so deleting it off the instance
      // would leave `"gpu" in navigator` true.
      delete (Object.getPrototypeOf(navigator) as { gpu?: unknown }).gpu;
    });
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(page.locator(".page-backdrop")).toHaveCount(0);
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

  test("fills main, so it reaches the header and the footer at any height", async ({ page }) => {
    // The point of scoping the backdrop to <main> rather than to the hero: on a
    // tall viewport a hero-sized backdrop is a band across the top with dead
    // space under it. Checked at a deliberately tall window.
    await page.setViewportSize({ width: 1600, height: 1800 });
    await page.goto("/en", { waitUntil: "networkidle" });

    const geometry = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return null;
      // Injected rather than waited for: CI cannot acquire a WebGPU adapter, so
      // the real canvas is never mounted there. The CSS is what is under test.
      const probe = document.createElement("div");
      probe.className = "page-backdrop";
      main.appendChild(probe);
      const box = probe.getBoundingClientRect();
      const mainBox = main.getBoundingClientRect();
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      probe.remove();
      return {
        matchesMain:
          Math.abs(box.top - mainBox.top) < 1 &&
          Math.abs(box.height - mainBox.height) < 1 &&
          Math.abs(box.width - mainBox.width) < 1,
        height: box.height,
        overflow,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry!.matchesMain).toBe(true);
    // Sanity that "fills main" means something at this viewport, rather than
    // main having collapsed.
    expect(geometry!.height).toBeGreaterThan(1200);
    // The backdrop used to be 100vw, which overflowed by the scrollbar width.
    expect(geometry!.overflow).toBeLessThanOrEqual(0);
  });

});
