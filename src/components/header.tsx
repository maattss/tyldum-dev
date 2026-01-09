"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(path);
  };

  const isHome = isActive(`/${locale}`) && !pathname.includes("/cv");
  const isCv = isActive(`/${locale}/cv`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className="group relative text-sm font-medium transition-colors duration-200"
          >
            <span className={isHome ? "gradient-text font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
              tyldum.dev
            </span>
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${isHome ? "w-full" : "w-0 group-hover:w-full"}`} />
          </Link>
          <Link
            href={`/${locale}/cv`}
            className="group relative text-sm font-medium transition-colors duration-200"
          >
            <span className={isCv ? "gradient-text font-semibold" : "text-muted-foreground group-hover:text-foreground"}>
              {t("cv")}
            </span>
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${isCv ? "w-full" : "w-0 group-hover:w-full"}`} />
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
