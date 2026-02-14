import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { HeaderNavLinks } from "./header-nav-links";

// Lazy load toggles - they're not critical for LCP
const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: true,
    loading: () => <div className="h-9 w-9" />,
  }
);

const LanguageToggle = dynamic(
  () => import("./language-toggle").then((mod) => mod.LanguageToggle),
  {
    ssr: true,
    loading: () => <div className="h-9 w-9" />,
  }
);

export async function Header() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <nav className="flex items-center gap-7">
          <HeaderNavLinks locale={locale} homeLabel="tyldum.dev" cvLabel={t("cv")} />
        </nav>
        <div className="flex items-center gap-1.5">
          <Suspense fallback={<div className="h-9 w-9" />}>
            <LanguageToggle />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-9" />}>
            <ThemeToggle />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
