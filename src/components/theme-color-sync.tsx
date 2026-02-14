"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const LIGHT_THEME_COLOR = "#f7f9fd";
const DARK_THEME_COLOR = "#08090a";

function setOrCreateMetaTag(name: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]:not([media])`,
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }

    const isDark = resolvedTheme === "dark";
    const themeColor = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;

    setOrCreateMetaTag("theme-color", themeColor);
    setOrCreateMetaTag(
      "apple-mobile-web-app-status-bar-style",
      isDark ? "black-translucent" : "default",
    );
    document.documentElement.style.backgroundColor = themeColor;
  }, [resolvedTheme]);

  return null;
}
