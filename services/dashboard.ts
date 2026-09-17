import { createClient } from "@/lib/supabase/server";
import type { Booking, Lead, Quote, RecordLink } from "@/types/database";

const leadColumns =
  "id, organization_id, name, email, phone, status, notes, follow_up_on, created_at, updated_at";
const bookingColumns =
  "id, organization_id, lead_id, customer_name, email, phone, service, starts_on, start_time, status, reminder_on, notes, created_at, updated_at";
const quoteColumns =
  "id, organization_id, customer_name, email, phone, title, amount, currency, status, follow_up_on, notes, created_at, updated_at";
const linkColumns =
  "id, organization_id, from_product, from_id, to_product, to_id, created_at";

export async function getDashboardRecords(organizationId: string) {
  const supabase = await createClient();
  const [leadsResult, bookingsResult, quotesResult, linksResult] = await Promise.all([
    supabase.from("leads").select(leadColumns).eq("organization_id", organizationId),
    supabase.from("bookings").select(bookingColumns).eq("organization_id", organizationId),
    supabase.from("quotes").select(quoteColumns).eq("organization_id", organizationId),
    supabase.from("record_links").select(linkColumns).eq("organization_id", organizationId),
  ]);

  return {
    leads: (leadsResult.data as Lead[] | null) ?? [],
    bookings: (bookingsResult.data as Booking[] | null) ?? [],
    quotes: (quotesResult.data as Quote[] | null) ?? [],
    links: (linksResult.data as RecordLink[] | null) ?? [],
  };
}
