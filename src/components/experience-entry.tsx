import type { CVExperienceItem } from "@/lib/content-schemas";

export function ExperienceEntry({ job }: { job: CVExperienceItem }) {
  return (
    <article className="border-l-2 border-border pl-5 print:break-inside-avoid">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{job.role}</h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <p className="shrink-0 min-w-[11ch] font-mono text-xs text-muted-foreground">{job.period}</p>
      </div>

      {job.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>
      )}

      {job.highlights.length > 0 && (
        <ul className="mt-2 space-y-1">
          {job.highlights.map((highlight) => (
            <li
              key={highlight}
              className="relative pl-4 text-sm text-muted-foreground before:absolute before:left-0 before:content-['-']"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
