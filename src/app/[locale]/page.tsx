import { Hero } from "@/components/hero";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export function generateStaticParams() {
  return [{ locale: "no" }, { locale: "en" }];
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
    <div className="container mx-auto px-4">
      <Hero />
    </div>
  );
}
