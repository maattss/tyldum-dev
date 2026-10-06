"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_CHANGE_EVENT,
  THEME_PREFERENCE_ATTRIBUTE,
  THEME_PREFERENCES,
  type ThemePreference,
} from "@/lib/theme/theme-constants";

function subscribe(onChange: () => void) {
  document.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => document.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

function getPreference(): ThemePreference {
  const value = document.documentElement.getAttribute(THEME_PREFERENCE_ATTRIBUTE);
  return THEME_PREFERENCES.find((preference) => preference === value) ?? DEFAULT_THEME_PREFERENCE;
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  // The server cannot know the stored preference; render the default until
  // hydration. The icons below are picked by CSS, so they never flash.
  const preference = useSyncExternalStore(subscribe, getPreference, () => DEFAULT_THEME_PREFERENCE);
  const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(preference) + 1) % THEME_PREFERENCES.length];

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    window.__theme?.set(next);

    // Easter egg: cycle through every theme within two seconds.
    clickCountRef.current += 1;
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    if (clickCountRef.current === THEME_PREFERENCES.length) {
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

  const label = `${t("toggle")}: ${t(preference)}`;

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} aria-label={label} title={label}>
      <Sun className="theme-icon theme-icon-light h-5 w-5" aria-hidden="true" />
      <Moon className="theme-icon theme-icon-dark h-5 w-5" aria-hidden="true" />
      <Monitor className="theme-icon theme-icon-system h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
