"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type Tab = { id: string; label: string; content: React.ReactNode };

export function Tabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border border-foreground/10 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}
