import { Hero } from "@/components/hero";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { locales } from "@/i18n/config";

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

export default async function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-4">
      <Hero />
    </div>
  );
}
