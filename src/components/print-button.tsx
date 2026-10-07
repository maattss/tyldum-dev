"use client";

import { Printer } from "lucide-react";
import { useEffect } from "react";

interface PrintButtonProps {
  label: string;
  /** Used as the document title while printing, so "Save as PDF" suggests it as the file name. */
  pdfTitle: string;
}

export function PrintButton({ label, pdfTitle }: PrintButtonProps) {
  // Covers Ctrl/Cmd+P too, not just this button.
  useEffect(() => {
    let previousTitle = document.title;
    const before = () => {
      // Guard against a repeated beforeprint overwriting the saved tab title.
      if (document.title !== pdfTitle) previousTitle = document.title;
      document.title = pdfTitle;
    };
    const after = () => {
      document.title = previousTitle;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [pdfTitle]);

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
