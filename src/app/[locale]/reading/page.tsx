import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
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
  const t = await getTranslations({ locale, namespace: "reading" });

  return {
    title: t("title"),
  };
}

export default async function ReadingPage() {
  const t = await getTranslations("reading");
  const featuredLinks = [
    {
      title: "Dark Flow",
      href: "https://www.fast.ai/posts/2026-01-28-dark-flow/",
      source: "fast.ai",
      previewImage: "/images/link-previews/dark-flow.svg",
    },
    {
      title: "The Agent Psychosis",
      href: "https://lucumr.pocoo.org/2026/1/18/agent-psychosis/",
      source: "lucumr.pocoo.org",
      previewImage: "/images/link-previews/agent-psychosis.svg",
    },
    {
      title: "Tech Trends 2026",
      href: "https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends.html",
      source: "Deloitte",
      previewImage: "/images/link-previews/tech-trends.svg",
    },
    {
      title: "mattshumer_ on X",
      href: "https://x.com/mattshumer_/status/2021256989876109403?s=20",
      source: "X",
      previewImage: "/images/link-previews/mattshumer-x.svg",
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("description")}
        </p>

        <ul className="mt-8 space-y-4">
          {featuredLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-xl border border-border bg-background/60 p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Image
                    src={link.previewImage}
                    alt={`Preview thumbnail for ${link.title}`}
                    className="h-16 w-full rounded-md border border-border object-cover sm:w-32"
                    width={640}
                    height={360}
                  />
                  <div>
                    <p className="font-medium text-foreground group-hover:underline">{link.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{link.source}</p>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
