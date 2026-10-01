import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { alternates: { canonical: "/signup" } };

export default function SignupPage() {
  return (
    <AuthShell>
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
