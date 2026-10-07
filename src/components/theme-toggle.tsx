"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const CONFETTI_CLICKS = 3;

export function ThemeToggle() {
  const t = useTranslations("theme");
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    const isDark = document.documentElement.classList.contains("dark");
    window.__theme?.set(isDark ? "light" : "dark");

    // Easter egg: flip the theme three times within two seconds.
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    if (clickCountRef.current === CONFETTI_CLICKS) {
      clickCountRef.current = 0;
      // Loaded on demand so it stays out of the initial bundle.
      void import("@/lib/confetti").then(({ triggerConfetti }) => triggerConfetti());
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("toggle")}
      title={t("toggle")}
      className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* The icon shows the current theme; CSS picks it, so it never flashes. */}
      <Sun className="h-[18px] w-[18px] dark:hidden" strokeWidth={1.75} aria-hidden="true" />
      <Moon className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
