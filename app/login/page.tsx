import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Log in to your AYV WRLD workspace.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
