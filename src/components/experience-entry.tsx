import type { CVExperienceItem } from "@/lib/content-schemas";

export function ExperienceEntry({ job }: { job: CVExperienceItem }) {
  return (
    <article className="print:break-inside-avoid">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div>
          <h3 className="inline font-semibold">{job.role}</h3>
          <span>, {job.company}</span>
        </div>
        <p className="shrink-0 font-mono text-[13px] text-muted-foreground">{job.period}</p>
      </div>

      {job.description && (
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{job.description}</p>
      )}

      {job.highlights.length > 0 && (
        <ul className="mt-2 space-y-1">
          {job.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3 text-[15px] text-muted-foreground">
              <span className="font-mono" aria-hidden="true">
                -
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
