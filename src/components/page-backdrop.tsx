"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Clearing, GridHandle } from "@/lib/gpu/grid";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Breathing room between the hero content and the nearest dot, CSS px. */
const CLEAR_PADDING_X = 44;
const CLEAR_PADDING_Y = 30;

/**
 * The union of the hero's content boxes, in CSS px relative to the canvas.
 *
 * Measured rather than assumed. The grid has to leave a hole for the copy, and
 * the alternative — an ellipse in the shader sized against layout constants —
 * has to be re-derived by hand for every breakpoint and silently stops matching
 * the moment the hero changes. The elements know where they are; ask them.
 */
function measureClearing(canvas: HTMLCanvasElement): Clearing | null {
  // Scoped to main rather than to a section: the canvas is a sibling of the page
  // content now, not a child of the hero.
  const scope = canvas.closest("main") ?? document;
  const parts = scope.querySelectorAll<HTMLElement>("[data-hero-content]");
  if (parts.length === 0) return null;

  const canvasBox = canvas.getBoundingClientRect();
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const part of parts) {
    const box = part.getBoundingClientRect();
    left = Math.min(left, box.left);
    top = Math.min(top, box.top);
    right = Math.max(right, box.right);
    bottom = Math.max(bottom, box.bottom);
  }

  if (!Number.isFinite(left) || right <= left || bottom <= top) return null;

  return {
    centerX: (left + right) / 2 - canvasBox.left,
    centerY: (top + bottom) / 2 - canvasBox.top,
    halfWidth: (right - left) / 2 + CLEAR_PADDING_X,
    halfHeight: (bottom - top) / 2 + CLEAR_PADDING_Y,
  };
}

/**
 * Interactive dot grid behind the page content.
 *
 * Fills <main> — the box between the header and the footer — so its edges are
 * those two rules at any viewport height, rather than a rectangle sized to the
 * hero. The clearing it leaves for the copy is still measured off the hero's own
 * elements.
 *
 * Renders nothing at all unless the browser has WebGPU and the visitor has not
 * asked for reduced motion. In every other case the `.bg-gradient-blur` layer in
 * the root layout is the backdrop, exactly as it was before this existed — which
 * is also why the UI regression snapshots (taken under `reducedMotion: "reduce"`)
 * stay valid. The grid deforms under the cursor, so reduced motion is a
 * correctness gate here and not only a snapshot convenience.
 */
export function PageBackdrop() {
  const { resolvedTheme } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GridHandle | null>(null);
  const pausedRef = useRef(false);

  // Deliberately after mount: the server and the first client render must agree,
  // and neither can know about `navigator.gpu` or the motion preference.
  useEffect(() => {
    if (!("gpu" in navigator)) return;

    const motion = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setEnabled(!motion.matches);

    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  const syncClearing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !handleRef.current) return;
    const clearing = measureClearing(canvas);
    if (clearing) handleRef.current.setClearing(clearing);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    // Not every browser with WebGPU has requestIdleCallback (Safari shipped the
    // first without the second), so both paths are real.
    const hasIdleCallback = typeof window.requestIdleCallback === "function";

    const begin = async () => {
      try {
        const { startGrid } = await import("@/lib/gpu/grid");
        if (cancelled) return;

        const clearing = measureClearing(canvas);
        // No measurable content means the hero has not laid out yet, and a grid
        // drawn now would run straight through the copy. Skipping is the safe
        // failure: the CSS backdrop is already behind us.
        if (!clearing) return;

        // The bootstrap script in <head> has already put the theme class on
        // <html>, so this is correct on the very first frame — `resolvedTheme`
        // is still undefined this early.
        const handle = await startGrid(canvas, {
          dark: document.documentElement.classList.contains("dark"),
          clearing,
        });

        if (cancelled) {
          handle.dispose();
          return;
        }

        handleRef.current = handle;
        handle.setPaused(pausedRef.current);
      } catch {
        // An adapter can be refused for reasons we cannot fix here (no hardware,
        // a blocklisted driver, a lost device). The CSS backdrop is already
        // behind us, so the hero simply keeps the appearance it had.
        if (!cancelled) setEnabled(false);
      }
    };

    // Yield the main thread until after the hero has painted: the profile image
    // is the LCP element and this must not compete with it.
    const idleHandle = hasIdleCallback
      ? window.requestIdleCallback(() => void begin(), { timeout: 1500 })
      : window.setTimeout(() => void begin(), 300);

    return () => {
      cancelled = true;
      if (hasIdleCallback) window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [enabled]);

  // The hole has to follow the copy: a viewport resize, a font swap and a locale
  // change all move it, and none of them are a React render here.
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const scope = canvas?.closest("main");
    if (!scope) return;

    const observer = new ResizeObserver(syncClearing);
    observer.observe(scope);
    for (const part of scope.querySelectorAll("[data-hero-content]")) {
      observer.observe(part);
    }

    return () => observer.disconnect();
  }, [enabled, syncClearing]);

  // Nothing to render means nothing to animate: stop the loop outright when the
  // hero scrolls away or the tab goes to the background.
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let onScreen = true;
    let tabVisible = document.visibilityState === "visible";

    const apply = () => {
      pausedRef.current = !(onScreen && tabVisible);
      handleRef.current?.setPaused(pausedRef.current);
    };

    const observer = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      apply();
    });
    observer.observe(canvas);

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    handleRef.current?.setDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  if (!enabled) return null;

  return (
    <div className="page-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
