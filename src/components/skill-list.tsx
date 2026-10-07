import type { CVSkillCategory } from "@/lib/content-schemas";

/** "category   item, item, item" rows, shared by the home page and the CV. */
export function SkillList({ categories }: { categories: CVSkillCategory[] }) {
  return (
    <dl className="mt-4 space-y-2.5 print:mt-2.5 print:space-y-0.5">
      {categories.map((category) => (
        <div key={category.name} className="flex flex-wrap gap-x-3.5 leading-relaxed print:items-baseline print:break-inside-avoid print:text-[13px]">
          <dt className="w-32 shrink-0 font-mono text-sm leading-7 text-muted-foreground lowercase print:text-[11px] print:leading-normal">
            {category.name}
          </dt>
          <dd className="min-w-[200px] flex-1">{category.items.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
