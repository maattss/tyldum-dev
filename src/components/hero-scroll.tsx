"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => 1 - (1 - t) ** 3;

/** Progress through `[start, end]` of the scroll, eased. */
const phase = (p: number, start: number, end: number) =>
  ease(clamp((p - start) / (end - start)));

/**
 * Drives the horizon hero from the scroll position. The section is taller than
 * the viewport and its stage is sticky, so scrolling through it advances one
 * progress value; CSS reads the derived variables and does all the drawing.
 *
 * Nothing animates on its own: with no scroll there is no work. Under reduced
 * motion the CSS shows the finished state and this never attaches.
 */
export function HeroScroll({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    const stage = section?.firstElementChild as HTMLElement | null;
    if (!section || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let stickyTop = 0;

    const apply = () => {
      frame = 0;
      const travel = section.offsetHeight - stage.offsetHeight;
      const scrolled = stickyTop - section.getBoundingClientRect().top;
      const p = travel > 0 ? clamp(scrolled / travel) : 1;

      section.style.setProperty("--curtain", phase(p, 0, 0.55).toFixed(4));
      section.style.setProperty("--sink", phase(p, 0.12, 0.42).toFixed(4));
      section.style.setProperty("--rise", phase(p, 0.4, 0.78).toFixed(4));
      section.style.setProperty("--hint", (1 - phase(p, 0, 0.12)).toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const measure = () => {
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      schedule();
    };

    const clear = () => {
      for (const name of ["--curtain", "--sink", "--rise", "--hint"]) {
        section.style.removeProperty(name);
      }
    };

    const attach = () => {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", measure);
      measure();
    };

    const detach = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      clear();
    };

    const onPreferenceChange = () => {
      detach();
      if (!reduceMotion.matches) attach();
    };

    if (!reduceMotion.matches) attach();
    reduceMotion.addEventListener("change", onPreferenceChange);

    return () => {
      reduceMotion.removeEventListener("change", onPreferenceChange);
      detach();
    };
  }, []);

  return (
    <section ref={ref} className={className} data-hero>
      {children}
    </section>
  );
}
