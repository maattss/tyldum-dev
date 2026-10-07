import { getTranslations, getLocale } from "next-intl/server";
import { HeaderNavLinks, HomeLink } from "./header-nav-links";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { COLUMN } from "@/lib/layout";

export async function Header() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <header id="site-header" className="pt-[env(safe-area-inset-top)] print:hidden">
      <div className={`${COLUMN} flex h-[72px] items-center justify-between gap-4`}>
        <HomeLink locale={locale} />
        <div className="flex items-center font-mono text-[13px]">
          <nav aria-label={t("label")}>
            <HeaderNavLinks locale={locale} cvLabel={t("cv")} />
          </nav>
          <span className="mx-2 h-4 w-px bg-border" aria-hidden="true" />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
