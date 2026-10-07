/** A markdown-style "## heading", the one section label the site uses. */
export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-mono text-[15px] font-medium lowercase">
      <span className="font-normal text-muted-foreground print:hidden" aria-hidden="true">
        ##{" "}
      </span>
      {children}
    </h2>
  );
}
