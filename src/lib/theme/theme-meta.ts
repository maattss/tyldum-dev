import {
  DARK_STATUS_BAR_STYLE,
  DARK_THEME_COLOR,
  DEFAULT_THEME_PREFERENCE,
  LIGHT_STATUS_BAR_STYLE,
  LIGHT_THEME_COLOR,
  THEME_CHANGE_EVENT,
  THEME_PREFERENCE_ATTRIBUTE,
  THEME_STORAGE_KEY,
} from "./theme-constants";

/**
 * Runs inline in <head> before first paint, serialized with toString(), so it
 * must be self-contained: everything it needs comes in through its arguments.
 *
 * It applies the stored preference, keeps following the OS while the
 * preference is "system", syncs other tabs, and installs `window.__theme`
 * for the toggle button.
 */
function themeScript(
  storageKey: string,
  attribute: string,
  changeEvent: string,
  fallback: string,
  light: [string, string],
  dark: [string, string],
) {
  const doc = document;
  const root = doc.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function read() {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" || value === "system"
        ? value
        : fallback;
    } catch {
      return fallback;
    }
  }

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

  function apply(preference: string, isChange: boolean) {
    const isDark =
      preference === "dark" || (preference === "system" && media.matches);
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
    root.setAttribute(attribute, preference);

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

    doc.dispatchEvent(new Event(changeEvent));
  }

  apply(read(), false);

  media.addEventListener("change", () => {
    if (read() === "system") apply("system", true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) apply(read(), true);
  });
  window.__theme = {
    set(preference) {
      try {
        localStorage.setItem(storageKey, preference);
      } catch {}
      apply(preference, true);
    },
  };
}

export function getThemeBootstrapScript(): string {
  const args = [
    THEME_STORAGE_KEY,
    THEME_PREFERENCE_ATTRIBUTE,
    THEME_CHANGE_EVENT,
    DEFAULT_THEME_PREFERENCE,
    [LIGHT_THEME_COLOR, LIGHT_STATUS_BAR_STYLE],
    [DARK_THEME_COLOR, DARK_STATUS_BAR_STYLE],
  ];

  return `(${themeScript.toString()})(${args.map((arg) => JSON.stringify(arg)).join(",")})`;
}
