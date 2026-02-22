import {
  DARK_STATUS_BAR_STYLE,
  DARK_THEME_COLOR,
  getThemeMetaValues,
  LIGHT_STATUS_BAR_STYLE,
  LIGHT_THEME_COLOR,
  type ResolvedTheme,
} from "./theme-constants";

type StoredThemePreference = "light" | "dark" | "system" | null;

function getOrCreateMetaTag(doc: Document, name: string): HTMLMetaElement {
  let meta = doc.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]:not([media])`,
  );

  if (!meta) {
    meta = doc.createElement("meta");
    meta.setAttribute("name", name);
    doc.head.appendChild(meta);
  }

  return meta;
}

export function applyThemeMeta(
  doc: Document,
  resolvedTheme: ResolvedTheme,
): void {
  const { themeColor, statusBarStyle } = getThemeMetaValues(
    resolvedTheme === "dark",
  );

  doc.documentElement.style.backgroundColor = themeColor;
  doc.head
    .querySelectorAll('meta[name="theme-color"][media]')
    .forEach((node) => node.remove());

  const themeMeta = getOrCreateMetaTag(doc, "theme-color");
  themeMeta.setAttribute("content", themeColor);

  const statusMeta = getOrCreateMetaTag(
    doc,
    "apple-mobile-web-app-status-bar-style",
  );
  statusMeta.setAttribute("content", statusBarStyle);
}

export function getThemeBootstrapScript(): string {
  return [
    "(function(){",
    "try{",
    "var doc=document;",
    "var root=doc.documentElement;",
    "var stored=localStorage.getItem('theme');",
    "var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;",
    "var isDark=stored==='dark'||((stored==='system'||stored===null)&&prefersDark);",
    `var themeColor=isDark?'${DARK_THEME_COLOR}':'${LIGHT_THEME_COLOR}';`,
    `var statusBarStyle=isDark?'${DARK_STATUS_BAR_STYLE}':'${LIGHT_STATUS_BAR_STYLE}';`,
    "if(isDark){root.classList.add('dark');}else{root.classList.remove('dark');}",
    "root.style.backgroundColor=themeColor;",
    "doc.head.querySelectorAll('meta[name=\"theme-color\"][media]').forEach(function(node){node.remove();});",
    "var themeMeta=doc.head.querySelector('meta[name=\"theme-color\"]:not([media])');",
    "if(!themeMeta){themeMeta=doc.createElement('meta');themeMeta.setAttribute('name','theme-color');doc.head.appendChild(themeMeta);}",
    "themeMeta.setAttribute('content',themeColor);",
    "var statusMeta=doc.head.querySelector('meta[name=\"apple-mobile-web-app-status-bar-style\"]:not([media])');",
    "if(!statusMeta){statusMeta=doc.createElement('meta');statusMeta.setAttribute('name','apple-mobile-web-app-status-bar-style');doc.head.appendChild(statusMeta);}",
    "statusMeta.setAttribute('content',statusBarStyle);",
    "}catch(e){}",
    "})();",
  ].join("");
}

export function toResolvedTheme(
  themePreference: StoredThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  const isDark =
    themePreference === "dark" ||
    ((themePreference === "system" || themePreference === null) && prefersDark);

  return isDark ? "dark" : "light";
}
