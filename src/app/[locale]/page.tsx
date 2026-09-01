import { Hero } from "@/components/hero";
import { PageBackdrop } from "@/components/page-backdrop";
import { getTranslations, setRequestLocale } from "next-intl/server";
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* Outside the container on purpose: it is positioned against <main>, so it
        * runs the full width of the page rather than stopping at max-w-6xl. */}
      <PageBackdrop />
      <div className="container mx-auto max-w-6xl px-4">
        <Hero />
      </div>
    </>
  );
}
