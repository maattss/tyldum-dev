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
  const homeT = await getTranslations("home");
  const featuredLinks = [
    {
      title: "The Agent Psychosis",
      href: "https://lucumr.pocoo.org/2026/1/18/agent-psychosis/",
      publishedAt: "2026-01-18",
    },
    {
      title: "Dark Flow",
      href: "https://www.fast.ai/posts/2026-01-28-dark-flow/",
      publishedAt: "2026-01-28",
    },
    {
      title: "Tech Trends 2026",
      href: "https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends.html",
      publishedAt: "2026-01-01",
    },
    {
      title: "mattshumer_ on X",
      href: "https://x.com/mattshumer_/status/2021256989876109403?s=20",
      publishedAt: "2025-01-01",
    },
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <Hero />
      <section className="mx-auto mb-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{homeT("recommendedReading")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{homeT("featuredLinksDescription")}</p>
        <ul className="mt-6 space-y-3">
          {featuredLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <span className="font-medium text-foreground group-hover:underline">{link.title}</span>
                <span className="text-sm text-muted-foreground">{link.publishedAt}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
