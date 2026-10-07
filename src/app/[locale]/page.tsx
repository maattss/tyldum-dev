import { Hero } from "@/components/hero";
import { HomeOverview } from "@/components/home-overview";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { locales } from "@/i18n/config";
import { COLUMN } from "@/lib/layout";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className={COLUMN}>
      <Hero />
      <HomeOverview locale={locale} />
    </div>
  );
}
