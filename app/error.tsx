"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="display text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Please try again. If this keeps happening, check your environment variables and Supabase setup.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
