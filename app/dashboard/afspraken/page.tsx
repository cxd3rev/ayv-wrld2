import { DeleteSlotButton, SlotForm } from "@/components/onderhoud/slot-form";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/dashboard/afspraken" } };

export default async function AppointmentsPage() {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("onderhoud_slots")
    .select("id, starts_at, ends_at, onderhoud_bookings(customer_name, email, phone)")
    .eq("organization_id", organization.id)
    .order("starts_at", { ascending: true });
  const bookingUrl = `${getAppUrl()}/boek/${organization.slug}`;

  return (
    <div>
      <h1 className="display text-4xl">Afspraken</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Zet de uren open waarop een klant kan langskomen. Een geboekt uur verschijnt hier.</p>
      <div className="workspace-card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Boekingspagina voor klanten</p>
          <p className="mt-1 text-sm text-muted break-all">{bookingUrl}</p>
        </div>
        <a href={bookingUrl} className="button-secondary h-10 min-h-10 px-4">Openen</a>
      </div>
      <div className="mt-8 max-w-xl"><SlotForm /></div>
      <ul className="mt-8 space-y-3">
        {(slots ?? []).length === 0 ? <li className="text-sm text-muted">Nog geen uren opengezet.</li> : null}
        {(slots ?? []).map((slot) => {
          const booking = Array.isArray(slot.onderhoud_bookings) ? slot.onderhoud_bookings[0] : slot.onderhoud_bookings;
          const start = new Date(slot.starts_at);
          const end = new Date(slot.ends_at);
          return (
            <li key={slot.id} className="workspace-card flex items-center justify-between gap-4 p-4">
              <div>
                <p>{start.toLocaleString("nl-BE", { dateStyle: "medium", timeStyle: "short" })} – {end.toLocaleTimeString("nl-BE", { timeStyle: "short" })}</p>
                <p className="text-sm text-muted">{booking ? `${booking.customer_name} · ${booking.email}` : "Open"}</p>
              </div>
              {booking ? null : <DeleteSlotButton id={slot.id} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
