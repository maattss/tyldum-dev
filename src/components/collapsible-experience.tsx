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
    <article className="border-l-2 border-border pl-5">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{job.role}</h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">{job.period}</p>
      </div>
      {job.description && <p className="text-sm leading-relaxed text-muted-foreground">{job.description}</p>}
      {job.highlights.length > 0 && (
        <ul className="mt-2 space-y-1">
          {job.highlights.map((highlight, i) => (
            <li
              key={i}
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
        <div className="overflow-hidden pl-1">
          <div className="space-y-8 pb-8">
            {items.map((job, index) => (
              <ExperienceEntry key={index} job={job} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
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
