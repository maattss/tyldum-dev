"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { applyThemeMeta } from "@/lib/theme/theme-meta";

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") {
      return;
    }

    applyThemeMeta(document, resolvedTheme);
  }, [resolvedTheme]);

  return null;
}
