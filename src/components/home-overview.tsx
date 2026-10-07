import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { parseCvExperienceItems, parseCvSkillCategories } from "@/lib/content-schemas";
import { SectionHeading } from "./section-heading";
import { SkillList } from "./skill-list";

/** A short look at the CV, drawn from the same messages so the two never drift. */
export async function HomeOverview({ locale }: { locale: string }) {
  const t = await getTranslations("home");
  const cv = await getTranslations("cv");
  const jobs = parseCvExperienceItems(cv.raw("experience.items"), locale).slice(0, 4);
  const skillCategories = parseCvSkillCategories(cv.raw("skills.categories"), locale);

  return (
    <>
      <section aria-labelledby="home-experience" className="pb-12">
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
          <Link
            href="/cv"
            className="text-primary underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t("fullCv")}
          </Link>
        </p>
      </section>

      <section aria-labelledby="home-skills" className="pb-24">
        <SectionHeading id="home-skills">{cv("skills.title")}</SectionHeading>
        <SkillList categories={skillCategories} />
      </section>
    </>
  );
}
