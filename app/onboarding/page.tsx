import { Atmosphere } from "@/components/atmosphere";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Logo } from "@/components/logo";
import { getWorkspace } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const workspace = await getWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.organization) redirect("/dashboard");

  return (
    <Atmosphere>
      <Link href="/" className="absolute top-6 left-6 text-sm text-white/55 hover:text-foreground">
        ← Home
      </Link>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-20">
        <Logo className="justify-center" />
        <h1 className="display mt-8 text-center text-4xl">Set up your workspace</h1>
        <p className="mt-3 mb-8 text-center text-sm text-muted">
          This creates your organization. You will be the owner. Future AYV WRLD products
          will use this same business profile.
        </p>
        <OnboardingForm />
      </div>
    </Atmosphere>
  );
}
