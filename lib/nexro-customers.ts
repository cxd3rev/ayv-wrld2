import type { Booking, Invoice, Lead, Quote, Reactivation, RecordProduct } from "@/types/database";

export type NexroDetail =
  | "paid"
  | "completed"
  | "wonQuote"
  | "wonLead"
  | "openInvoice"
  | "openBooking"
  | "openQuote"
  | "openLead";

export type NexroSituation = "winback" | "referral" | "in_progress";

export type NexroPerson = {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  lastSeenOn: string;
  daysQuiet: number;
  situation: NexroSituation;
  detail: NexroDetail;
  sourceProduct: RecordProduct;
  sourceId: string;
};

const QUIET_DAYS = 14;

function dateOnly(value: string | null | undefined) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value ?? "");
  return match?.[1] ?? null;
}

function daysSince(date: string, today: string) {
  const dayMs = 86_400_000;
  return Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / dayMs,
  );
}

function personKey(name: string, email: string | null) {
  const mail = email?.trim().toLowerCase();
  if (mail) return `email:${mail}`;
  return `name:${name.trim().toLowerCase()}`;
}

type Touch = {
  name: string;
  email: string | null;
  phone: string | null;
  date: string;
  happy: boolean;
  open: boolean;
  lost: boolean;
  detail: NexroDetail;
  product: RecordProduct;
  id: string;
};

function touchesFromRecords(
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  invoices: Invoice[],
  today: string,
): Touch[] {
  const touches: Touch[] = [];

  for (const lead of leads) {
    const date = dateOnly(lead.follow_up_on) ?? dateOnly(lead.updated_at);
    if (!date) continue;
    touches.push({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      date,
      happy: lead.status === "won",
      open: lead.status === "new" || lead.status === "contacted",
      lost: lead.status === "lost",
      detail: lead.status === "won" ? "wonLead" : "openLead",
      product: "avyro",
      id: lead.id,
    });
  }

  for (const booking of bookings) {
    touches.push({
      name: booking.customer_name,
      email: booking.email,
      phone: booking.phone,
      date: booking.starts_on,
      happy: booking.status === "completed",
      open: booking.status === "scheduled" || booking.status === "confirmed",
      lost: booking.status === "cancelled" || booking.status === "no_show",
      detail: booking.status === "completed" ? "completed" : "openBooking",
      product: "velto",
      id: booking.id,
    });
  }

  for (const quote of quotes) {
    const date = dateOnly(quote.updated_at);
    if (!date) continue;
    touches.push({
      name: quote.customer_name,
      email: quote.email,
      phone: quote.phone,
      date,
      happy: quote.status === "won",
      open: quote.status === "sent" || quote.status === "followed_up",
      lost: quote.status === "lost",
      detail: quote.status === "won" ? "wonQuote" : "openQuote",
      product: "rovyn",
      id: quote.id,
    });
  }

  for (const invoice of invoices) {
    touches.push({
      name: invoice.customer_name,
      email: invoice.email,
      phone: invoice.phone,
      date: invoice.due_on,
      happy: invoice.status === "paid",
      open: invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "draft",
      lost: invoice.status === "void",
      detail: invoice.status === "paid" ? "paid" : "openInvoice",
      product: "orvyn",
      id: invoice.id,
    });
  }

  void today;
  return touches;
}

function samePerson(reactivation: Reactivation, key: string) {
  return personKey(reactivation.customer_name, reactivation.email) === key;
}

export function buildNexroPeople(
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  invoices: Invoice[],
  reactivations: Reactivation[],
  today: string,
) {
  const grouped = new Map<string, Touch[]>();
  for (const touch of touchesFromRecords(leads, bookings, quotes, invoices, today)) {
    const key = personKey(touch.name, touch.email);
    const list = grouped.get(key) ?? [];
    list.push(touch);
    grouped.set(key, list);
  }

  const ready: NexroPerson[] = [];
  const waiting: NexroPerson[] = [];

  for (const [key, list] of grouped) {
    const latest = [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest) continue;
    const happy = list.some((touch) => touch.happy);
    const open = list.some((touch) => touch.open);
    const lostOnly = list.every((touch) => touch.lost);
    if (lostOnly && !happy && !open) continue;

    const source = [...list].reverse().find((touch) => (happy ? touch.happy : touch.open)) ?? latest;
    const openWinback = reactivations.some(
      (item) =>
        samePerson(item, key) &&
        item.kind === "winback" &&
        (item.status === "scheduled" || item.status === "sent" || item.status === "replied"),
    );
    const askedReferral = reactivations.some(
      (item) => samePerson(item, key) && item.kind === "referral" && item.status !== "passed",
    );

    const person: NexroPerson = {
      key,
      name: source.name,
      email: source.email ?? latest.email,
      phone: source.phone ?? latest.phone,
      lastSeenOn: latest.date,
      daysQuiet: Math.max(0, daysSince(latest.date, today)),
      situation: "in_progress",
      detail: source.detail,
      sourceProduct: source.product,
      sourceId: source.id,
    };

    if (happy && !open && person.daysQuiet >= QUIET_DAYS && !openWinback) {
      person.situation = "winback";
      ready.push(person);
    } else if (happy && !open && !askedReferral) {
      person.situation = "referral";
      ready.push(person);
    } else if (open && !openWinback) {
      waiting.push(person);
    }
  }

  const byQuiet = (a: NexroPerson, b: NexroPerson) =>
    b.daysQuiet - a.daysQuiet || a.name.localeCompare(b.name);
  ready.sort(byQuiet);
  waiting.sort(byQuiet);
  return { ready, waiting };
}

export function nexroOutreachCopy(opts: {
  kind: "winback" | "referral";
  name: string;
  organizationName: string;
  offer: string;
  incentive: string;
}) {
  const org = opts.organizationName.trim() || "us";
  if (opts.kind === "winback") {
    return opts.offer.trim()
      ? `Hi ${opts.name}, it has been a while since you worked with ${org}. ${opts.offer.trim()}`
      : `Hi ${opts.name}, it has been a while since you worked with ${org}. We would like you back. Reply to this email and we will get you booked.`;
  }
  return opts.incentive.trim()
    ? `Hi ${opts.name}, thank you for choosing ${org}. If you know someone who needs the same help, send them our way. ${opts.incentive.trim()}`
    : `Hi ${opts.name}, thank you for choosing ${org}. If you know someone who needs the same help, reply with their name.`;
}
