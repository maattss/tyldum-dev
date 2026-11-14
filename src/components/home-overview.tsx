import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NOTES_LANGUAGE, notes } from "@/content/notes";
import { parseCvExperienceItems } from "@/lib/content-schemas";
import { SectionHeading } from "./section-heading";

const link = "text-primary underline decoration-1 underline-offset-4 hover:decoration-2";

/** Notes and projects, then a short look at the CV, drawn from the same
 *  messages as the CV page so the two never drift. */
export async function HomeOverview({ locale }: { locale: string }) {
  const t = await getTranslations("home");
  const cv = await getTranslations("cv");
  const projects = t.raw("projects.items") as {
    name: string;
    description: string;
    url: string;
    source: string;
  }[];
  const jobs = parseCvExperienceItems(cv.raw("experience.items"), locale).slice(0, 4);

  return (
    <>
      <section aria-labelledby="home-notes" className="pb-12">
        <SectionHeading id="home-notes">
          {t("notes.title")}
          {locale !== NOTES_LANGUAGE && (
            <span className="font-normal text-muted-foreground"> ({t("notes.languageHint")})</span>
          )}
        </SectionHeading>
        <div lang={NOTES_LANGUAGE} className="mt-4 space-y-7">
          {notes.map((note) => (
            <article key={note.slug} id={note.slug}>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-semibold">{note.title}</h3>
                <p className="shrink-0 font-mono text-[13px] text-muted-foreground">{note.date}</p>
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-projects" className="pb-12">
        <SectionHeading id="home-projects">{t("projects.title")}</SectionHeading>
        <div className="mt-4 space-y-6">
          {projects.map((project) => (
            <article key={project.name}>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-semibold">
                  {project.url ? (
                    <a href={project.url} className="underline decoration-1 underline-offset-4 hover:decoration-2">
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                {project.source ? (
                  <a href={project.source} className={`shrink-0 font-mono text-[13px] ${link}`}>
                    {t("projects.source")}
                  </a>
                ) : (
                  <p className="shrink-0 font-mono text-[13px] text-muted-foreground">
                    {t("projects.private")}
                  </p>
                )}
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-experience" className="pb-24">
        <SectionHeading id="home-experience">{cv("experience.title")}</SectionHeading>
        <ul className="mt-4 space-y-3.5">
          {jobs.map((job) => (
            <li key={`${job.company}-${job.period}`} className="flex gap-3.5 leading-relaxed">
              <span className="font-mono text-muted-foreground" aria-hidden="true">
                -
              </span>
              <span className="min-w-0 flex-1">
                <strong className="font-semibold">{job.role}</strong>, {job.company}{" "}
                <span className="whitespace-nowrap font-mono text-[13px] text-muted-foreground">
                  ({job.period})
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[15px]">
          <Link href="/cv" className={link}>
            {t("fullCv")}
          </Link>
        </p>
      </section>
    </>
  );
}
