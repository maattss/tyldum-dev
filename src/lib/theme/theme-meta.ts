import {
  DARK_STATUS_BAR_STYLE,
  DARK_THEME_COLOR,
  LIGHT_STATUS_BAR_STYLE,
  LIGHT_THEME_COLOR,
  THEME_STORAGE_KEY,
} from "./theme-constants";

/**
 * Runs inline in <head> before first paint, serialized with toString(), so it
 * must be self-contained: everything it needs comes in through its arguments.
 *
 * Until the visitor picks light or dark, the site follows the OS (live). The
 * choice is remembered, synced across tabs, and set through `window.__theme`.
 */
function themeScript(
  storageKey: string,
  light: [string, string],
  dark: [string, string],
) {
  const doc = document;
  const root = doc.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function readStored(): string | null {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  }

  // Kept in memory too, so the toggle still works when storage is blocked.
  let choice = readStored();

  function meta(name: string) {
    let node = doc.head.querySelector<HTMLMetaElement>(
      `meta[name="${name}"]:not([media])`,
    );
    if (!node) {
      node = doc.createElement("meta");
      node.name = name;
      doc.head.appendChild(node);
    }
    return node;
  }

  function apply(isChange: boolean) {
    const isDark = choice ? choice === "dark" : media.matches;
    const [themeColor, statusBarStyle] = isDark ? dark : light;

    // Swap the palette in one frame instead of animating every colour.
    let freeze: HTMLStyleElement | undefined;
    if (isChange) {
      freeze = doc.createElement("style");
      freeze.textContent = "*,*::before,*::after{transition:none!important}";
      doc.head.appendChild(freeze);
    }

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    root.style.backgroundColor = themeColor;

    doc.head
      .querySelectorAll('meta[name="theme-color"][media]')
      .forEach((node) => node.remove());
    meta("theme-color").content = themeColor;
    meta("apple-mobile-web-app-status-bar-style").content = statusBarStyle;

    if (freeze) {
      const style = freeze;
      // Force a style recalc so the change lands before transitions return.
      void getComputedStyle(doc.body).opacity;
      setTimeout(() => style.remove(), 1);
    }
  }

  apply(false);

  media.addEventListener("change", () => {
    if (!choice) apply(true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      choice = readStored();
      apply(true);
    }
  });
  window.__theme = {
    set(theme) {
      choice = theme;
      try {
        localStorage.setItem(storageKey, theme);
      } catch {}
      apply(true);
    },
  };
}

export function getThemeBootstrapScript(): string {
  const args = [
    THEME_STORAGE_KEY,
    [LIGHT_THEME_COLOR, LIGHT_STATUS_BAR_STYLE],
    [DARK_THEME_COLOR, DARK_STATUS_BAR_STYLE],
  ];

  return `(${themeScript.toString()})(${args.map((arg) => JSON.stringify(arg)).join(",")})`;
}
