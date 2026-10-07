/** A markdown-style "## heading", the one section label the site uses. */
export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      // On paper: a conventional small-caps label with a rule, kept with its content.
      className="font-mono text-[15px] font-medium lowercase print:break-after-avoid print:border-b print:border-border print:pb-1 print:text-[11px] print:tracking-[0.12em] print:uppercase"
    >
      <span className="font-normal text-muted-foreground print:hidden" aria-hidden="true">
        ##{" "}
      </span>
      {children}
    </h2>
  );
}
