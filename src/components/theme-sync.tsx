"use client";

import { useLayoutEffect } from "react";

/**
 * Switching language is a client-side navigation that remounts the [locale]
 * root layout, and React resets <html>'s attributes to its own props on the
 * way: the "dark" class and inline colours the theme script set are dropped.
 * The inline script only runs on a full page load, so re-apply the theme here,
 * before the browser paints.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    window.__theme?.reapply();
  }, []);

  return null;
}
