import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { parseCvExperienceItems, parseCvSkillCategories } from "@/lib/content-schemas";

const panel = "rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8";
const heading = "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";

/** A short look at the CV, drawn from the same messages so the two never drift. */
export async function HomeOverview({ locale }: { locale: string }) {
  const t = await getTranslations("home");
  const cv = await getTranslations("cv");
  const jobs = parseCvExperienceItems(cv.raw("experience.items"), locale).slice(0, 3);
  const skillCategories = parseCvSkillCategories(cv.raw("skills.categories"), locale);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 pb-20 animate-fade-in md:grid-cols-5 sm:pb-28">
      <section aria-labelledby="home-experience" className={`${panel} flex flex-col md:col-span-3`}>
        <h2 id="home-experience" className={heading}>
          {t("experienceTitle")}
        </h2>

        <ol className="mt-6 flex-1 space-y-6">
          {jobs.map((job, index) => (
            <li key={`${job.company}-${job.period}`} className="relative pl-6">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[0.45rem] h-2 w-2 rounded-full ${
                  index === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-border"
                }`}
              />
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-semibold text-foreground">
                  {job.role}
                  <span className="block font-normal text-muted-foreground sm:inline">
                    <span className="hidden sm:inline" aria-hidden="true">
                      {" · "}
                    </span>
                    <span className="sr-only sm:hidden">, </span>
                    {job.company}
                  </span>
                </h3>
                <p className="shrink-0 font-mono text-xs text-muted-foreground">{job.period}</p>
              </div>
              {job.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
              )}
            </li>
          ))}
        </ol>

        <Link
          href="/cv"
          className="group mt-8 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline hover:underline-offset-4"
        >
          {t("fullCv")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="home-toolbox" className={`${panel} md:col-span-2`}>
        <h2 id="home-toolbox" className={heading}>
          {t("toolboxTitle")}
        </h2>

        <dl className="mt-6 space-y-5">
          {skillCategories.map((category) => (
            <div key={category.name}>
              <dt className="mb-2 text-sm font-medium text-foreground">{category.name}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {category.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
