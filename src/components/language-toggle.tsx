"use client";

import { useLocale, useTranslations } from "next-intl";

import { localeNames, locales } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";

/**
 * "no / en": both locales side by side with the current one emphasised, so it
 * reads as a switch rather than as another page next to "/cv".
 */
export function LanguageToggle() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div role="group" aria-label={t("label")} className="flex items-center">
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center">
          {index > 0 && (
            <span className="text-border" aria-hidden="true">
              /
            </span>
          )}
          {loc === locale ? (
            <span aria-current="true" className="px-1.5 py-3 font-semibold text-foreground">
              {loc}
            </span>
          ) : (
            <Link
              href={pathname}
              locale={loc}
              hrefLang={loc}
              lang={loc}
              aria-label={localeNames[loc]}
              className="rounded-md px-1.5 py-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              {loc}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
