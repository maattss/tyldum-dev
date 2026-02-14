"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@vercel/analytics";
import type { NextWebVitalsMetric } from "next/app";

function formatMetricValue(metric: NextWebVitalsMetric): number {
  if (metric.name === "CLS") {
    return Number(metric.value.toFixed(4));
  }

  return Number(metric.value.toFixed(2));
}

export function WebVitalsReporter() {
  const pathname = usePathname();
  const sentKeysRef = useRef<Set<string>>(new Set());

  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const route = pathname || "/";
    const dedupeKey = `${metric.id}:${metric.name}:${route}`;

    if (sentKeysRef.current.has(dedupeKey)) {
      return;
    }

    sentKeysRef.current.add(dedupeKey);

    track("web_vitals", {
      route,
      name: metric.name,
      value: formatMetricValue(metric),
      rating: metric.rating ?? "unknown",
      navigationType: metric.navigationType ?? "unknown",
    });
  });

  return null;
}
