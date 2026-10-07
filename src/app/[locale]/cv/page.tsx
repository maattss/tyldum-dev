import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { CollapsibleExperience } from "@/components/collapsible-experience";
import { ExperienceEntry } from "@/components/experience-entry";
import { PrintButton } from "@/components/print-button";
import { SectionHeading } from "@/components/section-heading";
import { SkillList } from "@/components/skill-list";
import { COLUMN } from "@/lib/layout";
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

  return (
    <div className={`${COLUMN} py-12 sm:py-16`}>
      <CvProfileJsonLd locale={locale} />
      <div className="space-y-12">
        <header className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[40px]">
              <span className="mr-3 font-mono font-normal text-primary print:hidden" aria-hidden="true">
                #
              </span>
              {t("name")}
            </h1>
            <p className="mt-3 text-lg">{t("subtitle")}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 font-mono text-[13px] text-muted-foreground">
              <span>{t("contact.location")}</span>
              <span aria-hidden="true">·</span>
              <a href={LINKEDIN_URL} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
                {/* A printed CV cannot be clicked, so spell the URL out on paper. */}
                <span className="print:hidden">linkedin</span>
                <span className="hidden print:inline">{LINKEDIN_HANDLE}</span>
              </a>
              <span aria-hidden="true">·</span>
              <a href={GITHUB_URL} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">
                <span className="print:hidden">github</span>
                <span className="hidden print:inline">{GITHUB_HANDLE}</span>
              </a>
            </p>
            <div className="mt-4 hidden print:hidden sm:block">
              <PrintButton label={t("downloadCV")} />
            </div>
          </div>

          <Image
            src="/images/profile.jpg"
            alt={t("name")}
            width={88}
            height={88}
            sizes="88px"
            loading="lazy"
            fetchPriority="low"
            className="h-[88px] w-[88px] shrink-0 rounded-[14px] border border-border object-cover print:hidden"
          />
        </header>

        <p className="leading-relaxed text-muted-foreground">{t("summary")}</p>

        <section aria-labelledby="cv-experience">
          <SectionHeading id="cv-experience">{t("experience.title")}</SectionHeading>
          <div className="mt-5 space-y-7">
            {recentJobs.map((job) => (
              <ExperienceEntry key={`${job.company}-${job.period}`} job={job} />
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

        <section aria-labelledby="cv-education">
          <SectionHeading id="cv-education">{t("education.title")}</SectionHeading>
          <div className="mt-5 space-y-6">
            {education.map((edu) => (
              <article key={`${edu.school}-${edu.period}`} className="print:break-inside-avoid">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="inline font-semibold">{edu.degree}</h3>
                    <span>, {edu.school}</span>
                  </div>
                  <p className="shrink-0 font-mono text-[13px] text-muted-foreground">{edu.period}</p>
                </div>
                {edu.description && (
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{edu.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="cv-skills" className="print:break-inside-avoid">
          <SectionHeading id="cv-skills">{t("skills.title")}</SectionHeading>
          <SkillList categories={skillCategories} />
        </section>
      </div>
    </div>
  );
}
