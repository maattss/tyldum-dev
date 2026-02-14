import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { CollapsibleExperience } from "@/components/collapsible-experience";
import { PrintButton } from "@/components/print-button";
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
  const t = await getTranslations({ locale, namespace: "cv" });

  return {
    title: {
      absolute: t("title"),
    },
    description: t("summary"),
    alternates: {
      canonical: `https://tyldum.dev/${locale}/cv`,
      languages: {
        no: "https://tyldum.dev/no/cv",
        en: "https://tyldum.dev/en/cv",
      },
    },
  };
}

export default async function CVPage() {
  const t = await getTranslations("cv");
  const allJobs = t.raw("experience.items") as Array<{
    role: string;
    company: string;
    period: string;
    description: string;
    highlights: string[];
  }>;
  const recentJobs = allJobs.slice(0, 3);
  const earlierJobs = allJobs.slice(3);
  const education = t.raw("education.items") as Array<{
    degree: string;
    school: string;
    period: string;
    description?: string;
  }>;
  const skillCategories = t.raw("skills.categories") as Array<{
    name: string;
    items: string[];
  }>;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="space-y-12">
        <header className="border-b border-border pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">{t("name")}</h1>
              <p className="mt-1 text-lg text-muted-foreground">{t("subtitle")}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t("contact.location")}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <a
                  href="https://linkedin.com/in/mtyldum"
                  className="transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <span aria-hidden="true">/</span>
                <a
                  href="https://github.com/maattss"
                  className="transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>

              <div className="mt-4 print:hidden">
                <PrintButton label={t("downloadCV")} />
              </div>
            </div>

            <div className="print:hidden hidden sm:block">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-border/90 bg-card ring-1 ring-white/10 shadow-[0_24px_80px_-50px_rgba(47,185,255,0.65)]">
                <Image
                  src="/images/profile.jpg"
                  alt={t("name")}
                  width={112}
                  height={112}
                  sizes="112px"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <section>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">{t("summary")}</p>
        </section>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("experience.title")}
          </h2>

          <div className="space-y-7">
            {recentJobs.map((job, index) => (
              <article key={index} className="border-l-2 border-border pl-5">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{job.role}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{job.period}</p>
                </div>

                {job.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
                )}

                {job.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {job.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="relative pl-4 text-sm text-muted-foreground before:absolute before:left-0 before:content-['-']"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            {earlierJobs.length > 0 && (
              <CollapsibleExperience
                items={earlierJobs}
                showMoreLabel={t("experience.showMore")}
                showLessLabel={t("experience.showLess")}
              />
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("education.title")}
          </h2>

          <div className="space-y-6">
            {education.map((edu, index) => (
              <article key={index} className="border-l-2 border-border pl-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{edu.period}</p>
                </div>

                {edu.description && <p className="mt-1 text-sm text-muted-foreground">{edu.description}</p>}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("skills.title")}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {skillCategories.map((category, index) => (
              <article key={index}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground print:bg-transparent"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
