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
    <div className={`${COLUMN} py-12 sm:py-16 print:max-w-none print:px-0 print:py-0`}>
      <CvProfileJsonLd locale={locale} />
      <div className="space-y-12 print:space-y-5">
        <header className="flex items-start justify-between gap-6 print:border-b print:border-border print:pb-4">
          <div className="min-w-0">
            <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[40px] print:text-[26px]">
              <span className="mr-3 font-mono font-normal text-primary print:hidden" aria-hidden="true">
                #
              </span>
              {t("name")}
            </h1>
            <p className="mt-3 text-lg print:mt-1 print:text-[15px]">{t("subtitle")}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 font-mono text-[13px] text-muted-foreground print:mt-1.5 print:text-[11px]">
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
              <PrintButton label={t("downloadCV")} pdfTitle={`${t("name")} – CV`} />
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
            className="h-[88px] w-[88px] shrink-0 rounded-[14px] border border-border object-cover print:h-16 print:w-16 print:rounded-[10px]"
          />
        </header>

        <p className="leading-relaxed text-muted-foreground print:text-[13px]">{t("summary")}</p>

        <section aria-labelledby="cv-experience">
          <SectionHeading id="cv-experience">{t("experience.title")}</SectionHeading>
          <div className="mt-5 space-y-7 print:mt-2.5 print:space-y-2.5">
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

        <section aria-labelledby="cv-education" className="print:break-inside-avoid">
          <SectionHeading id="cv-education">{t("education.title")}</SectionHeading>
          <div className="mt-5 space-y-6 print:mt-2.5 print:space-y-2.5">
            {education.map((edu) => (
              <article key={`${edu.school}-${edu.period}`} className="print:break-inside-avoid">
                <div className="flex flex-col gap-0.5 print:text-[14px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="inline font-semibold">{edu.degree}</h3>
                    <span>, {edu.school}</span>
                  </div>
                  <p className="shrink-0 font-mono text-[13px] text-muted-foreground print:text-[11px]">{edu.period}</p>
                </div>
                {edu.description && (
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground print:mt-0 print:text-[12.5px] print:leading-snug">{edu.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="cv-skills" className="print:break-inside-avoid">
          <SectionHeading id="cv-skills">{t("skills.title")}</SectionHeading>
          <SkillList categories={skillCategories} />
        </section>

        {/* Paper goes stale; point at the version that stays current. */}
        <p className="hidden border-t border-border pt-3 font-mono text-[11px] text-muted-foreground print:block">
          {t("onlineVersion", { url: `tyldum.dev/${locale}/cv` })}
        </p>
      </div>
    </div>
  );
}
