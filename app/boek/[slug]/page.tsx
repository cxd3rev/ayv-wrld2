import { BookingForm } from "@/components/onderhoud/booking-form";
import { PublicShell } from "@/components/marketing/public-site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Afspraak", alternates: { canonical: `/boek/${slug}` } };
}

export default async function BookPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: organization } = await admin.from("organizations").select("id, name").eq("slug", slug).maybeSingle();
  if (!organization) notFound();
  const { data: slots } = await admin
    .from("onderhoud_slots")
    .select("id, starts_at, ends_at, onderhoud_bookings(id)")
    .eq("organization_id", organization.id)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  const open = (slots ?? []).filter((slot) => {
    const booking = Array.isArray(slot.onderhoud_bookings) ? slot.onderhoud_bookings[0] : slot.onderhoud_bookings;
    return !booking;
  });

  return (
    <PublicShell>
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Afspraak</p>
        <h1 className="display mt-4 text-4xl">{organization.name}</h1>
        <p className="mt-3 text-muted">Kies een open tijdslot voor het onderhoud.</p>
        <BookingForm
          slug={slug}
          slots={open.map((slot) => ({
            id: slot.id,
            label: new Date(slot.starts_at).toLocaleString("nl-BE", { dateStyle: "full", timeStyle: "short" }),
          }))}
        />
      </main>
    </PublicShell>
  );
}
