"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
}

interface CollapsibleExperienceProps {
  items: ExperienceItem[];
  showMoreLabel: string;
  showLessLabel: string;
}

function ExperienceEntry({ job }: { job: ExperienceItem }) {
  return (
    <div className="group relative pl-6 border-l border-border/50 hover:border-primary/50 transition-colors duration-200">
      <div className="absolute left-0 top-1.5 w-2 h-2 -translate-x-[4.5px] rounded-full bg-border group-hover:bg-primary transition-colors duration-200" />
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
        <div>
          <h3 className="font-semibold text-foreground">{job.role}</h3>
          <p className="text-primary/80 text-sm">{job.company}</p>
        </div>
        <p className="text-xs text-muted-foreground font-medium tabular-nums">
          {job.period}
        </p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {job.description}
      </p>
      {job.highlights.length > 0 && (
        <ul className="mt-2 space-y-1 list-disc list-inside">
          {job.highlights.map((highlight, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CollapsibleExperience({
  items,
  showMoreLabel,
  showLessLabel,
}: CollapsibleExperienceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-8">
      {/* Earlier experience items with animation */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-8 pb-8 pl-6">
            {items.map((job, index) => (
              <ExperienceEntry key={index} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
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
