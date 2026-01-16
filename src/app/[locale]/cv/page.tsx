import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CollapsibleExperience } from "@/components/collapsible-experience";
import { PrintButton } from "@/components/print-button";

export function generateStaticParams() {
  return [{ locale: "no" }, { locale: "en" }];
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* CV Content */}
      <div className="cv-content space-y-12">
        {/* Header */}
        <header className="text-center pb-8 border-b border-border/50">
          <h1 className="text-4xl font-bold gradient-text mb-1">
            {t("name")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("contact.location")}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm text-muted-foreground">
            <a
              href="https://linkedin.com/in/mtyldum"
              className="hover:text-primary transition-colors duration-200 hover:-translate-y-0.5 transform inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <span className="text-border">•</span>
            <a
              href="https://github.com/maattss"
              className="hover:text-primary transition-colors duration-200 hover:-translate-y-0.5 transform inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <div className="mt-6 print:hidden">
            <PrintButton label={t("downloadCV")} />
          </div>
        </header>

        {/* Summary */}
        <section>
          <p className="text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
            {t("summary")}
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            {t("experience.title")}
          </h2>
          {(() => {
            const allJobs = t.raw("experience.items") as Array<{
              role: string;
              company: string;
              period: string;
              description: string;
              highlights: string[];
            }>;
            // Split at index 3 - first 3 are recent (2019+), rest are earlier
            const recentJobs = allJobs.slice(0, 3);
            const earlierJobs = allJobs.slice(3);

            return (
              <div className="space-y-8">
                {/* Recent experience */}
                {recentJobs.map((job, index) => (
                  <div
                    key={index}
                    className="group relative pl-6 border-l border-border/50 hover:border-primary/50 transition-colors duration-200"
                  >
                    <div className="absolute left-0 top-1.5 w-2 h-2 -translate-x-[4.5px] rounded-full bg-border group-hover:bg-primary transition-colors duration-200" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{job.role}</h3>
                        <p className="text-primary/80 text-sm">{job.company}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium tabular-nums">
                        {job.period}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
                    {job.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {job.highlights.map((highlight, i) => (
                          <li key={i} className="text-sm text-muted-foreground pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-muted-foreground/50">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Earlier experience - collapsible */}
                {earlierJobs.length > 0 && (
                  <CollapsibleExperience
                    items={earlierJobs}
                    showMoreLabel={t("experience.showMore")}
                    showLessLabel={t("experience.showLess")}
                  />
                )}
              </div>
            );
          })()}
        </section>

        {/* Education */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            {t("education.title")}
          </h2>
          <div className="space-y-6">
            {(
              t.raw("education.items") as Array<{
                degree: string;
                school: string;
                period: string;
                description?: string;
              }>
            ).map((edu, index) => (
              <div
                key={index}
                className="group relative pl-6 border-l border-border/50 hover:border-primary/50 transition-colors duration-200"
              >
                <div className="absolute left-0 top-1.5 w-2 h-2 -translate-x-[4.5px] rounded-full bg-border group-hover:bg-primary transition-colors duration-200" />
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                    <p className="text-primary/80 text-sm">{edu.school}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium tabular-nums">
                    {edu.period}
                  </p>
                </div>
                {edu.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            {t("skills.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(
              t.raw("skills.categories") as Array<{
                name: string;
                items: string[];
              }>
            ).map((category, index) => (
              <div key={index} className="group">
                <h3 className="text-xs font-medium text-foreground/70 uppercase tracking-wide mb-3 group-hover:text-primary transition-colors duration-200">
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {category.items.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-secondary/50 hover:bg-primary/10 hover:text-primary text-secondary-foreground rounded-md text-xs transition-all duration-200 hover:scale-105 cursor-default print:border print:border-foreground/20 print:bg-transparent"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
