"use client";

import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/react";

export function SpeedInsightsClient() {
  const pathname = usePathname();

  return <SpeedInsights route={pathname} sampleRate={1} />;
}
