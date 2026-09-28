"use client";

import { HelpBlob } from "@/components/help/help-blob";
import { HelpProvider } from "@/components/help/help-state";

export function HelpRoot({ children }: { children: React.ReactNode }) {
  return (
    <HelpProvider>
      {children}
      <HelpBlob />
    </HelpProvider>
  );
}
