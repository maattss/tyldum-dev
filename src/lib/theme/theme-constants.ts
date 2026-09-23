export const LIGHT_THEME_COLOR = "#f8f7f2";
export const DARK_THEME_COLOR = "#151412";

export const LIGHT_STATUS_BAR_STYLE = "default";
export const DARK_STATUS_BAR_STYLE = "black-translucent";

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
