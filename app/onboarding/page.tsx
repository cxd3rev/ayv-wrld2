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
      <Link href="/" className="absolute top-8 left-6 z-20 text-sm text-foreground/55 hover:text-foreground lg:left-12">
        ← Home
      </Link>
      <div className="arch-grid opacity-40" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-24">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="kicker mx-auto mt-12">Workspace</p>
        <h1 className="display mt-4 text-center text-4xl tracking-tight lg:text-5xl">Set up your workspace</h1>
        <p className="mt-4 mb-10 text-center text-sm leading-6 text-muted">
          This creates your organization. You will be the owner. Future AYV WRLD products
          will use this same business profile.
        </p>
        <OnboardingForm />
      </div>
    </Atmosphere>
  );
}
