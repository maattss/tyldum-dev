import { getTranslations, getLocale } from "next-intl/server";
import { HeaderNavLinks } from "./header-nav-links";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

export async function Header() {
  const t = await getTranslations("nav");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background pt-[env(safe-area-inset-top)] font-sans print:hidden">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <HeaderNavLinks locale={locale} homeLabel="tyldum.dev" cvLabel={t("cv")} />
        </nav>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
