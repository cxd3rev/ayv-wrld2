import { replyToCheckIn } from "@/app/check-in/[token]/actions";
import { redirect } from "next/navigation";

export default async function CheckInReplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string; missing?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  async function choose(formData: FormData) {
    "use server";
    const reply = String(formData.get("reply"));
    if (reply !== "positive" && reply !== "neutral" && reply !== "negative") return;
    const result = await replyToCheckIn(token, reply);
    redirect(result.ok ? `/check-in/${token}?done=1` : `/check-in/${token}?missing=1`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">Avyro</p>
      <h1 className="display mt-4 text-4xl">How did it go?</h1>
      {query.missing ? (
        <p className="mt-6 text-lg text-muted">This check-in link is no longer valid.</p>
      ) : query.done ? (
        <p className="mt-6 text-lg text-muted">Thank you. Your reply has been saved.</p>
      ) : (
        <form action={choose} className="mt-8 grid gap-3">
          <button name="reply" value="positive" className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">It went well</button>
          <button name="reply" value="neutral" className="rounded-full border border-foreground/20 px-5 py-3 text-sm">It was fine</button>
          <button name="reply" value="negative" className="rounded-full border border-foreground/20 px-5 py-3 text-sm">It did not go well</button>
        </form>
      )}
    </main>
  );
}
