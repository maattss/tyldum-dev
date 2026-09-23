"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ExperienceEntry } from "@/components/experience-entry";
import type { CVExperienceItem } from "@/lib/content-schemas";

interface CollapsibleExperienceProps {
  items: CVExperienceItem[];
  showMoreLabel: string;
  showLessLabel: string;
}

export function CollapsibleExperience({
  items,
  showMoreLabel,
  showLessLabel,
}: CollapsibleExperienceProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  return (
    <div>
      {/* Earlier experience items with animation */}
      <div
        id={panelId}
        inert={!isExpanded}
        // `print:` variants keep every entry on the printed CV even while the
        // section is collapsed on screen. The transition must be disabled too:
        // print rendering snapshots the page immediately, so an animating
        // opacity would be captured mid-fade.
        className={`grid transition-all duration-300 ease-in-out print:grid-rows-[1fr] print:opacity-100 print:transition-none ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden print:overflow-visible">
          <div>
            {items.map((job) => (
              <ExperienceEntry key={`${job.company}-${job.period}`} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 border-t border-border py-4 font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground print:hidden"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
        <span>{isExpanded ? showLessLabel : showMoreLabel}</span>
      </button>
    </div>
  );
}
