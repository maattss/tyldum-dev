export const LIGHT_THEME_COLOR = "#f7f9fd";
export const DARK_THEME_COLOR = "#08090a";

export const LIGHT_STATUS_BAR_STYLE = "default";
export const DARK_STATUS_BAR_STYLE = "black-translucent";

/** localStorage key holding the visitor's theme preference. */
export const THEME_STORAGE_KEY = "theme";
/** Attribute on <html> mirroring the preference, so CSS can pick the toggle icon. */
export const THEME_PREFERENCE_ATTRIBUTE = "data-theme-pref";
/** Event dispatched on `document` after every theme change. */
export const THEME_CHANGE_EVENT = "themechange";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
/** Used when nothing is stored: the site is designed dark-first. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "dark";

export type ResolvedTheme = "light" | "dark";
export type StatusBarStyle =
  | typeof LIGHT_STATUS_BAR_STYLE
  | typeof DARK_STATUS_BAR_STYLE;

export interface ThemeMetaValues {
  themeColor: string;
  statusBarStyle: StatusBarStyle;
}

export function getThemeMetaValues(isDark: boolean): ThemeMetaValues {
  return {
    themeColor: isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
    statusBarStyle: isDark ? DARK_STATUS_BAR_STYLE : LIGHT_STATUS_BAR_STYLE,
  };
}

declare global {
  interface Window {
    /** Installed by the inline theme script in the root layout. */
    __theme?: { set: (preference: ThemePreference) => void };
  }
}
