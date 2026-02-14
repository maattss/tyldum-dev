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
      className="gap-2 border-border bg-card hover:bg-secondary"
    >
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
