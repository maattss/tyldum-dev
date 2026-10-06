import { getTranslations, getLocale } from "next-intl/server";
import { HeaderNavLinks, HomeLink } from "./header-nav-links";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { SITE_NAME } from "@/lib/site";

export async function Header() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)] print:hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <HomeLink locale={locale} homeLabel={SITE_NAME} />
        <div className="flex items-center gap-1.5">
          <nav aria-label={t("label")}>
            <HeaderNavLinks locale={locale} cvLabel={t("cv")} />
          </nav>
          <span className="mx-1.5 h-5 w-px bg-border" aria-hidden="true" />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
