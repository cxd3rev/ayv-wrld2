import type { Booking, Lead, Quote, RecordLink, RecordProduct } from "@/types/database";

export type ConversionMetric = {
  numerator: number;
  denominator: number;
  rate: number | null;
};

export type AttentionItem = {
  id: string;
  product: RecordProduct;
  recordId: string;
  name: string;
  date: string;
  timing: "overdue" | "today" | "upcoming";
  days: number;
};

export type ClientHealth = {
  lead: Lead;
  status: "on_track" | "needs_attention" | "at_risk";
  reason:
    | "won"
    | "lost"
    | "no_show"
    | "lost_quote"
    | "severely_overdue"
    | "overdue"
    | "cancelled"
    | "not_connected"
    | "progressing";
  bookingCount: number;
  quoteCount: number;
  bookings: Booking[];
  quotes: Quote[];
};

export type DashboardMetrics = {
  raw: {
    leads: number;
    bookings: number;
    quotes: number;
    wonQuotes: number;
  };
  funnel: {
    leads: number;
    linkedBookings: number;
    linkedQuotes: number;
    wonCustomers: number;
  };
  conversions: {
    leadToBooking: ConversionMetric;
    bookingToQuote: ConversionMetric;
    quoteWin: ConversionMetric;
  };
  pipeline: {
    byCurrency: Array<{ currency: string; amount: number }>;
    valuedQuotes: number;
    missingAmounts: number;
  };
  attention: AttentionItem[];
  clients: ClientHealth[];
};

const nodeKey = (product: RecordProduct, id: string) => `${product}:${id}`;

function rate(numerator: number, denominator: number): ConversionMetric {
  return {
    numerator,
    denominator,
    rate: denominator === 0 ? null : (numerator / denominator) * 100,
  };
}

function daysBetween(date: string, today: string) {
  const dayMs = 86_400_000;
  return Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / dayMs,
  );
}

function connectedIds(
  links: RecordLink[],
  leftProduct: RecordProduct,
  rightProduct: RecordProduct,
) {
  const pairs: Array<{ left: string; right: string }> = [];
  for (const link of links) {
    if (link.from_product === leftProduct && link.to_product === rightProduct) {
      pairs.push({ left: link.from_id, right: link.to_id });
    } else if (link.from_product === rightProduct && link.to_product === leftProduct) {
      pairs.push({ left: link.to_id, right: link.from_id });
    }
  }
  return pairs;
}

function linkedComponent(start: string, links: RecordLink[]) {
  const adjacency = new Map<string, Set<string>>();
  for (const link of links) {
    const from = nodeKey(link.from_product, link.from_id);
    const to = nodeKey(link.to_product, link.to_id);
    if (!adjacency.has(from)) adjacency.set(from, new Set());
    if (!adjacency.has(to)) adjacency.set(to, new Set());
    adjacency.get(from)!.add(to);
    adjacency.get(to)!.add(from);
  }

  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}

function classifyClient(
  lead: Lead,
  bookings: Booking[],
  quotes: Quote[],
  today: string,
): Pick<ClientHealth, "status" | "reason"> {
  const overdueDays = [
    lead.status === "new" || lead.status === "contacted" ? lead.follow_up_on : null,
    ...bookings
      .filter((booking) => booking.status === "scheduled" || booking.status === "confirmed")
      .map((booking) => booking.reminder_on),
    ...quotes
      .filter((quote) => quote.status === "sent" || quote.status === "followed_up")
      .map((quote) => quote.follow_up_on),
  ]
    .filter((date): date is string => Boolean(date))
    .map((date) => daysBetween(date, today))
    .filter((days) => days < 0)
    .map(Math.abs);

  if (lead.status === "lost") return { status: "at_risk", reason: "lost" };
  if (bookings.some((booking) => booking.status === "no_show")) {
    return { status: "at_risk", reason: "no_show" };
  }
  if (
    quotes.some((quote) => quote.status === "lost") &&
    !quotes.some((quote) => quote.status === "won")
  ) {
    return { status: "at_risk", reason: "lost_quote" };
  }
  if (overdueDays.some((days) => days >= 7)) {
    return { status: "at_risk", reason: "severely_overdue" };
  }
  if (overdueDays.length) return { status: "needs_attention", reason: "overdue" };
  if (bookings.some((booking) => booking.status === "cancelled")) {
    return { status: "needs_attention", reason: "cancelled" };
  }
  if (lead.status === "won" || quotes.some((quote) => quote.status === "won")) {
    return { status: "on_track", reason: "won" };
  }
  if (bookings.length === 0 && quotes.length === 0) {
    return { status: "needs_attention", reason: "not_connected" };
  }
  return { status: "on_track", reason: "progressing" };
}

export function calculateDashboardMetrics(
  leads: Lead[],
  bookings: Booking[],
  quotes: Quote[],
  links: RecordLink[],
  today: string,
): DashboardMetrics {
  const leadBookingPairs = connectedIds(links, "avyro", "velto");
  const bookingQuotePairs = connectedIds(links, "velto", "rovyn");
  const leadIds = new Set(leads.map((lead) => lead.id));
  const bookingIds = new Set(bookings.map((booking) => booking.id));
  const quoteIds = new Set(quotes.map((quote) => quote.id));

  const bookedLeadIds = new Set(
    leadBookingPairs
      .filter(({ left, right }) => leadIds.has(left) && bookingIds.has(right))
      .map(({ left }) => left),
  );
  const linkedBookingIds = new Set(
    leadBookingPairs
      .filter(({ left, right }) => leadIds.has(left) && bookingIds.has(right))
      .map(({ right }) => right),
  );
  const quotedBookingIds = new Set(
    bookingQuotePairs
      .filter(({ left, right }) => bookingIds.has(left) && quoteIds.has(right))
      .map(({ left }) => left),
  );
  const journeyQuoteIds = new Set(
    bookingQuotePairs
      .filter(({ left, right }) => linkedBookingIds.has(left) && quoteIds.has(right))
      .map(({ right }) => right),
  );

  const openQuotes = quotes.filter(
    (quote) => quote.status === "sent" || quote.status === "followed_up",
  );
  const pipeline = new Map<string, number>();
  let valuedQuotes = 0;
  let missingAmounts = 0;
  for (const quote of openQuotes) {
    const amount = quote.amount == null || quote.amount === "" ? null : Number(quote.amount);
    if (amount == null || !Number.isFinite(amount)) {
      missingAmounts += 1;
      continue;
    }
    valuedQuotes += 1;
    pipeline.set(quote.currency, (pipeline.get(quote.currency) ?? 0) + amount);
  }

  const attention: AttentionItem[] = [];
  for (const lead of leads) {
    if (
      lead.follow_up_on &&
      (lead.status === "new" || lead.status === "contacted") &&
      daysBetween(lead.follow_up_on, today) < 0
    ) {
      const days = daysBetween(lead.follow_up_on, today);
      attention.push({
        id: `avyro:${lead.id}`,
        product: "avyro",
        recordId: lead.id,
        name: lead.name,
        date: lead.follow_up_on,
        timing: "overdue",
        days,
      });
    }
  }
  for (const booking of bookings) {
    if (
      booking.reminder_on &&
      (booking.status === "scheduled" || booking.status === "confirmed")
    ) {
      const days = daysBetween(booking.reminder_on, today);
      if (days <= 7) {
        attention.push({
          id: `velto:${booking.id}`,
          product: "velto",
          recordId: booking.id,
          name: booking.customer_name,
          date: booking.reminder_on,
          timing: days < 0 ? "overdue" : days === 0 ? "today" : "upcoming",
          days,
        });
      }
    }
  }
  for (const quote of quotes) {
    if (
      quote.follow_up_on &&
      (quote.status === "sent" || quote.status === "followed_up") &&
      daysBetween(quote.follow_up_on, today) < 0
    ) {
      const days = daysBetween(quote.follow_up_on, today);
      attention.push({
        id: `rovyn:${quote.id}`,
        product: "rovyn",
        recordId: quote.id,
        name: quote.customer_name,
        date: quote.follow_up_on,
        timing: "overdue",
        days,
      });
    }
  }
  attention.sort((a, b) => a.days - b.days || a.name.localeCompare(b.name));

  const clientOrder = { at_risk: 0, needs_attention: 1, on_track: 2 };
  const clients = leads
    .map((lead): ClientHealth => {
      const component = linkedComponent(nodeKey("avyro", lead.id), links);
      const connectedBookings = bookings.filter((booking) =>
        component.has(nodeKey("velto", booking.id)),
      );
      const connectedQuotes = quotes.filter((quote) =>
        component.has(nodeKey("rovyn", quote.id)),
      );
      return {
        lead,
        ...classifyClient(lead, connectedBookings, connectedQuotes, today),
        bookingCount: connectedBookings.length,
        quoteCount: connectedQuotes.length,
        bookings: connectedBookings,
        quotes: connectedQuotes,
      };
    })
    .sort(
      (a, b) =>
        clientOrder[a.status] - clientOrder[b.status] ||
        a.lead.name.localeCompare(b.lead.name),
    );

  const decidedQuotes = quotes.filter(
    (quote) => quote.status === "won" || quote.status === "lost",
  );
  const wonQuotes = quotes.filter((quote) => quote.status === "won");

  return {
    raw: {
      leads: leads.length,
      bookings: bookings.length,
      quotes: quotes.length,
      wonQuotes: wonQuotes.length,
    },
    funnel: {
      leads: leads.length,
      linkedBookings: linkedBookingIds.size,
      linkedQuotes: journeyQuoteIds.size,
      wonCustomers: wonQuotes.filter((quote) => journeyQuoteIds.has(quote.id)).length,
    },
    conversions: {
      leadToBooking: rate(bookedLeadIds.size, leads.length),
      bookingToQuote: rate(quotedBookingIds.size, bookings.length),
      quoteWin: rate(wonQuotes.length, decidedQuotes.length),
    },
    pipeline: {
      byCurrency: [...pipeline.entries()]
        .map(([currency, amount]) => ({ currency, amount }))
        .sort((a, b) => a.currency.localeCompare(b.currency)),
      valuedQuotes,
      missingAmounts,
    },
    attention,
    clients,
  };
}
