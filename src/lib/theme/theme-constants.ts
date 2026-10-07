export const LIGHT_THEME_COLOR = "#ffffff";
export const DARK_THEME_COLOR = "#0a0b0d";

export const LIGHT_STATUS_BAR_STYLE = "default";
export const DARK_STATUS_BAR_STYLE = "black-translucent";

/**
 * localStorage key holding an explicit choice ("light" | "dark"). Without one
 * the site follows the OS. Older visitors may still have "system" stored from
 * the three-way toggle; that reads as "no choice".
 */
export const THEME_STORAGE_KEY = "theme";

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
    __theme?: { set: (theme: ResolvedTheme) => void };
  }
}
