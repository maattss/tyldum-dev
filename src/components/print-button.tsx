"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  label: string;
}

export function PrintButton({ label }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-2 hover:-translate-y-0.5 transition-all duration-200"
    >
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
