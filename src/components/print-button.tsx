"use client";

import { Printer } from "lucide-react";

interface PrintButtonProps {
  label: string;
}

export function PrintButton({ label }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-md py-1 font-mono text-[13px] text-primary underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Printer className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </button>
  );
}
