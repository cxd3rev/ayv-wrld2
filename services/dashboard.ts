import { createClient } from "@/lib/supabase/server";
import type { Booking, CheckIn, ChurnWatch, Invoice, Lead, LoyaltyRecord, Quote, Reactivation, RecordLink, Renewal, Review } from "@/types/database";

const leadColumns =
  "id, organization_id, name, email, phone, status, notes, follow_up_on, created_at, updated_at";
const bookingColumns =
  "id, organization_id, lead_id, customer_name, email, phone, service, starts_on, start_time, status, reminder_on, notes, created_at, updated_at";
const quoteColumns =
  "id, organization_id, customer_name, email, phone, title, amount, currency, status, follow_up_on, notes, created_at, updated_at";
const invoiceColumns =
  "id, organization_id, customer_name, email, phone, invoice_number, description, amount, currency, status, issued_on, due_on, next_reminder_on, notes, created_at, updated_at";
const reactivationColumns =
  "id, organization_id, customer_name, email, phone, kind, origin, client_id, status, message, incentive, last_seen_on, next_touch_on, notes, created_at, updated_at";
const reviewColumns =
  "id, organization_id, customer_name, email, phone, status, origin, client_id, channel, rating, feedback, review_url, requested_on, next_follow_up_on, notes, created_at, updated_at";
const checkInColumns =
  "id, organization_id, client_id, served_on, check_in_on, status, reply_token, created_at, updated_at, clients(name, email, phone, visit_count, loyalty_status, churn_status)";
const renewalColumns =
  "id, organization_id, client_id, plan_name, renews_on, reminder_on, status, created_at, updated_at, clients(name, email, phone)";
const watchColumns =
  "id, organization_id, client_id, frequency_days, last_activity_on, status, origin, created_at, updated_at, clients(name, email, phone)";
const loyaltyColumns =
  "id, organization_id, client_id, visit_count, status, origin, thank_you_on, created_at, updated_at, clients(name, email, phone)";
const linkColumns =
  "id, organization_id, from_product, from_id, to_product, to_id, created_at";

export async function getDashboardRecords(organizationId: string) {
  const supabase = await createClient();
  const [leadsResult, bookingsResult, quotesResult, invoicesResult, reactivationsResult, reviewsResult, linksResult, checkInsResult, renewalsResult, watchesResult, loyaltyResult] =
    await Promise.all([
      supabase.from("leads").select(leadColumns).eq("organization_id", organizationId),
      supabase.from("bookings").select(bookingColumns).eq("organization_id", organizationId),
      supabase.from("quotes").select(quoteColumns).eq("organization_id", organizationId),
      supabase.from("invoices").select(invoiceColumns).eq("organization_id", organizationId),
      supabase.from("reactivations").select(reactivationColumns).eq("organization_id", organizationId),
      supabase.from("reviews").select(reviewColumns).eq("organization_id", organizationId),
      supabase.from("record_links").select(linkColumns).eq("organization_id", organizationId),
      supabase.from("check_ins").select(checkInColumns).eq("organization_id", organizationId),
      supabase.from("renewals").select(renewalColumns).eq("organization_id", organizationId),
      supabase.from("churn_watches").select(watchColumns).eq("organization_id", organizationId),
      supabase.from("loyalty_records").select(loyaltyColumns).eq("organization_id", organizationId),
    ]);

  return {
    leads: (leadsResult.data as Lead[] | null) ?? [],
    bookings: (bookingsResult.data as Booking[] | null) ?? [],
    quotes: (quotesResult.data as Quote[] | null) ?? [],
    invoices: (invoicesResult.data as Invoice[] | null) ?? [],
    checkIns: (checkInsResult.data as CheckIn[] | null) ?? [],
    renewals: (renewalsResult.data as Renewal[] | null) ?? [],
    churnWatches: (watchesResult.data as ChurnWatch[] | null) ?? [],
    loyaltyRecords: (loyaltyResult.data as LoyaltyRecord[] | null) ?? [],
    reactivations: (reactivationsResult.data as Reactivation[] | null) ?? [],
    reviews: (reviewsResult.data as Review[] | null) ?? [],
    links: (linksResult.data as RecordLink[] | null) ?? [],
  };
}
