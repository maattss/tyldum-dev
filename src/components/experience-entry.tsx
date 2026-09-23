import type { CVExperienceItem } from "@/lib/content-schemas";

/** One ruled row of the CV: the period in the margin, the entry beside it.
 *  Shared by experience and education so the two lists line up. */
export function CvRow({
  period,
  title,
  subtitle,
  children,
}: {
  period: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="grid gap-x-8 gap-y-1 border-t border-border py-5 sm:grid-cols-[9rem_1fr] print:break-inside-avoid">
      <p className="font-sans text-sm tabular-nums text-muted-foreground sm:pt-1">
        {period}
      </p>
      <div>
        <h3 className="text-lg font-medium leading-snug text-foreground">{title}</h3>
        <p className="font-sans text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </article>
  );
}

export function ExperienceEntry({ job }: { job: CVExperienceItem }) {
  return (
    <CvRow period={job.period} title={job.role} subtitle={job.company}>
      {job.description && (
        <p className="mt-2 leading-relaxed text-muted-foreground">{job.description}</p>
      )}

      {job.highlights.length > 0 && (
        <ul className="mt-2 space-y-1">
          {job.highlights.map((highlight) => (
            <li
              key={highlight}
              className="relative pl-4 text-muted-foreground before:absolute before:left-0 before:content-['–']"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </CvRow>
  );
}
