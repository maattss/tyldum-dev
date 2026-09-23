import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { CollapsibleExperience } from "@/components/collapsible-experience";
import { CvRow, ExperienceEntry } from "@/components/experience-entry";
import { PrintButton } from "@/components/print-button";
import { CvProfileJsonLd } from "@/components/json-ld";
import { locales } from "@/i18n/config";
import {
  GITHUB_HANDLE,
  GITHUB_URL,
  LINKEDIN_HANDLE,
  LINKEDIN_URL,
  absoluteUrl,
} from "@/lib/site";
import {
  parseCvEducationItems,
  parseCvExperienceItems,
  parseCvSkillCategories,
} from "@/lib/content-schemas";

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
      canonical: absoluteUrl(`/${locale}/cv`),
      languages: {
        no: absoluteUrl("/no/cv"),
        en: absoluteUrl("/en/cv"),
        "x-default": absoluteUrl("/no/cv"),
      },
    },
  };
}

export default async function CVPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("cv");
  const allJobs = parseCvExperienceItems(t.raw("experience.items"), locale);
  const recentJobs = allJobs.slice(0, 3);
  const earlierJobs = allJobs.slice(3);
  const education = parseCvEducationItems(t.raw("education.items"), locale);
  const skillCategories = parseCvSkillCategories(
    t.raw("skills.categories"),
    locale,
  );

  const sectionHeading =
    "mb-6 text-3xl font-medium tracking-tight text-foreground";
  const contactLink =
    "underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <CvProfileJsonLd locale={locale} />
      <div className="space-y-16">
        <header>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl">
                {t("name")}
              </h1>
              <p className="mt-3 text-xl text-muted-foreground">{t("subtitle")}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-muted-foreground">
                <span>{t("contact.location")}</span>
                <span aria-hidden="true">·</span>
                <a
                  href={LINKEDIN_URL}
                  className={contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* A printed CV cannot be clicked, so spell the URL out on paper. */}
                  <span className="print:hidden">LinkedIn</span>
                  <span className="hidden print:inline">{LINKEDIN_HANDLE}</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={GITHUB_URL}
                  className={contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="print:hidden">GitHub</span>
                  <span className="hidden print:inline">{GITHUB_HANDLE}</span>
                </a>
              </div>

              <div className="mt-6 hidden print:hidden sm:block">
                <PrintButton label={t("downloadCV")} />
              </div>
            </div>

            <div className="print:hidden shrink-0">
              <div className="relative h-24 w-24 overflow-hidden rounded-sm border border-border bg-card sm:h-28 sm:w-28">
                <Image
                  src="/images/profile.jpg"
                  alt={t("name")}
                  width={112}
                  height={112}
                  sizes="112px"
                  loading="lazy"
                  fetchPriority="low"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <section>
          <p className="max-w-2xl text-2xl leading-snug text-foreground">{t("summary")}</p>
        </section>

        <section>
          <h2 className={sectionHeading}>{t("experience.title")}</h2>

          <div>
            {recentJobs.map((job) => (
              <ExperienceEntry key={`${job.company}-${job.period}`} job={job} />
            ))}

            {earlierJobs.length > 0 ? (
              <CollapsibleExperience
                items={earlierJobs}
                showMoreLabel={t("experience.showMore")}
                showLessLabel={t("experience.showLess")}
              />
            ) : (
              <div className="border-t border-border" />
            )}
          </div>
        </section>

        <section>
          <h2 className={sectionHeading}>{t("education.title")}</h2>

          <div className="border-b border-border">
            {education.map((edu) => (
              <CvRow
                key={`${edu.school}-${edu.period}`}
                period={edu.period}
                title={edu.degree}
                subtitle={edu.school}
              >
                {edu.description && (
                  <p className="mt-2 leading-relaxed text-muted-foreground">{edu.description}</p>
                )}
              </CvRow>
            ))}
          </div>
        </section>

        <section>
          <h2 className={sectionHeading}>{t("skills.title")}</h2>

          <div className="border-b border-border font-sans">
            {skillCategories.map((category) => (
              <article
                key={category.name}
                className="grid gap-x-8 gap-y-2 border-t border-border py-4 text-sm sm:grid-cols-[9rem_1fr] print:break-inside-avoid"
              >
                <h3 className="font-medium text-foreground">{category.name}</h3>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-muted-foreground">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className="after:ml-2 after:text-border after:content-['/'] last:after:content-none"
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
