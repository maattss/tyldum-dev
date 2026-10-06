"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  // Two locales, so a plain link to the other one beats a menu.
  const other = locales.find((loc) => loc !== locale) as Locale;

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href={pathname} locale={other} hrefLang={other} lang={other} aria-label={t("switch")} title={t("switch")}>
        <Globe className="h-5 w-5" aria-hidden="true" />
      </Link>
    </Button>
  );
}
