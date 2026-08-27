"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { AuroraHandle } from "@/lib/gpu/aurora";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * WebGPU aurora behind the hero.
 *
 * Renders nothing at all unless the browser has WebGPU and the visitor has not
 * asked for reduced motion. In every other case the `.bg-gradient-blur` layer in
 * the root layout is the backdrop, exactly as it was before this existed — which
 * is also why the UI regression snapshots (taken under `reducedMotion: "reduce"`)
 * stay valid.
 */
export function HeroBackdrop() {
  const { resolvedTheme } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<AuroraHandle | null>(null);
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
        const { startAurora } = await import("@/lib/gpu/aurora");
        if (cancelled) return;

        // The bootstrap script in <head> has already put the theme class on
        // <html>, so this is correct on the very first frame — `resolvedTheme`
        // is still undefined this early.
        const handle = await startAurora(canvas, {
          dark: document.documentElement.classList.contains("dark"),
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
    <div className="hero-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
