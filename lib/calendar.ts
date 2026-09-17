import type { ProductId } from "@/config/products";
import type { Booking, Invoice, Lead, Quote } from "@/types/database";

export type CalendarEventType =
  | "lead_follow_up"
  | "appointment"
  | "booking_reminder"
  | "quote_follow_up"
  | "invoice_due"
  | "invoice_reminder";

export type CalendarEvent = {
  id: string;
  product: ProductId;
  type: CalendarEventType;
  recordId: string;
  focusParam: string;
  title: string;
  detail: string | null;
  date: string;
  time: string | null;
  allDay: boolean;
};

export type CalendarProductDefinition = {
  slug: ProductId;
  name: string;
  tone: "stone" | "violet" | "green" | "red";
};

export type CalendarSourceMap = {
  leads: Lead[];
  bookings: Booking[];
  quotes: Quote[];
  invoices: Invoice[];
};

export type CalendarEventAdapter = {
  source: keyof CalendarSourceMap;
  product: CalendarProductDefinition;
  events: (sources: CalendarSourceMap) => CalendarEvent[];
};

function defineCalendarAdapter<K extends keyof CalendarSourceMap>(definition: {
  source: K;
  product: CalendarProductDefinition;
  map: (record: CalendarSourceMap[K][number]) => CalendarEvent[];
}): CalendarEventAdapter {
  return {
    source: definition.source,
    product: definition.product,
    events: (sources) => sources[definition.source].flatMap(definition.map),
  };
}

const avyroAdapter = defineCalendarAdapter({
  source: "leads",
  product: { slug: "avyro", name: "Avyro", tone: "stone" },
  map: (lead) =>
    lead.follow_up_on
      ? [
          {
            id: `avyro:${lead.id}:follow-up`,
            product: "avyro",
            type: "lead_follow_up",
            recordId: lead.id,
            focusParam: "lead",
            title: lead.name,
            detail: null,
            date: lead.follow_up_on,
            time: null,
            allDay: true,
          },
        ]
      : [],
});

const veltoAdapter = defineCalendarAdapter({
  source: "bookings",
  product: { slug: "velto", name: "Velto", tone: "violet" },
  map: (booking) => {
    const events: CalendarEvent[] = [
      {
        id: `velto:${booking.id}:appointment`,
        product: "velto",
        type: "appointment",
        recordId: booking.id,
        focusParam: "booking",
        title: booking.customer_name,
        detail: booking.service,
        date: booking.starts_on,
        time: booking.start_time.slice(0, 5),
        allDay: false,
      },
    ];

    if (booking.reminder_on) {
      events.push({
        id: `velto:${booking.id}:reminder`,
        product: "velto",
        type: "booking_reminder",
        recordId: booking.id,
        focusParam: "booking",
        title: booking.customer_name,
        detail: booking.service,
        date: booking.reminder_on,
        time: null,
        allDay: true,
      });
    }

    return events;
  },
});

const rovynAdapter = defineCalendarAdapter({
  source: "quotes",
  product: { slug: "rovyn", name: "Rovyn", tone: "green" },
  map: (quote) =>
    quote.follow_up_on
      ? [
          {
            id: `rovyn:${quote.id}:follow-up`,
            product: "rovyn",
            type: "quote_follow_up",
            recordId: quote.id,
            focusParam: "quote",
            title: quote.customer_name,
            detail: quote.title,
            date: quote.follow_up_on,
            time: null,
            allDay: true,
          },
        ]
      : [],
});

const orvynAdapter = defineCalendarAdapter({
  source: "invoices",
  product: { slug: "orvyn", name: "Orvyn", tone: "red" },
  map: (invoice) => {
    if (invoice.status === "paid" || invoice.status === "void") return [];
    const events: CalendarEvent[] = [{
      id: `orvyn:${invoice.id}:due`,
      product: "orvyn",
      type: "invoice_due",
      recordId: invoice.id,
      focusParam: "invoice",
      title: invoice.customer_name,
      detail: invoice.invoice_number,
      date: invoice.due_on,
      time: null,
      allDay: true,
    }];
    if (invoice.next_reminder_on) {
      events.push({
        id: `orvyn:${invoice.id}:reminder`,
        product: "orvyn",
        type: "invoice_reminder",
        recordId: invoice.id,
        focusParam: "invoice",
        title: invoice.customer_name,
        detail: invoice.invoice_number,
        date: invoice.next_reminder_on,
        time: null,
        allDay: true,
      });
    }
    return events;
  },
});

/**
 * Register one adapter per product. The interactive calendar only consumes
 * normalized CalendarEvent values and does not know product record shapes.
 */
export const calendarEventAdapters = [
  avyroAdapter,
  veltoAdapter,
  rovynAdapter,
  orvynAdapter,
] as const;

export const calendarProducts = calendarEventAdapters.map((adapter) => adapter.product);

export function buildCalendarEvents(sources: CalendarSourceMap): CalendarEvent[] {
  return calendarEventAdapters.flatMap((adapter) => adapter.events(sources)).sort(compareCalendarEvents);
}

export function compareCalendarEvents(a: CalendarEvent, b: CalendarEvent) {
  return (
    a.date.localeCompare(b.date) ||
    Number(a.allDay) - Number(b.allDay) ||
    (a.time ?? "").localeCompare(b.time ?? "") ||
    a.title.localeCompare(b.title)
  );
}

export type CalendarDate = { year: number; month: number; day: number };

export function parseDateOnly(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatDateOnly({ year, month, day }: CalendarDate) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addCalendarDays(value: string, amount: number) {
  const parsed = parseDateOnly(value);
  if (!parsed) throw new Error(`Invalid date-only value: ${value}`);
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + amount));
  return formatDateOnly({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

export function monthGrid(year: number, month: number) {
  const first = formatDateOnly({ year, month, day: 1 });
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayOffset = (firstWeekday + 6) % 7;
  const gridStart = addCalendarDays(first, -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addCalendarDays(gridStart, index));
}

export function shiftMonth(year: number, month: number, amount: number) {
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function localDateOnly(date = new Date()) {
  return formatDateOnly({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

export function dateOnlyToLocalNoon(value: string) {
  const parsed = parseDateOnly(value);
  if (!parsed) throw new Error(`Invalid date-only value: ${value}`);
  return new Date(parsed.year, parsed.month - 1, parsed.day, 12);
}
