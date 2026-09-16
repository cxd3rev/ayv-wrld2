"use client";

import { cn } from "@/lib/utils";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((next: Omit<Toast, "id">) => {
    const id = Date.now();
    setToasts((current) => [...current, { ...next, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-md border px-4 py-3 shadow-xl",
              item.tone === "error"
                ? "border-danger/30 bg-card text-danger"
                : item.tone === "success"
                  ? "border-success/30 bg-card text-success"
                  : "border-border bg-card text-foreground",
            )}
          >
            <p className="text-sm font-medium">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
