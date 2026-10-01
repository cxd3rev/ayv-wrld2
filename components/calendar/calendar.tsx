"use client";

import {
  addCalendarDays,
  calendarProducts,
  dateOnlyToLocalNoon,
  localDateOnly,
  monthGrid,
  parseDateOnly,
  shiftMonth,
  type CalendarEvent,
  type CalendarEventType,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { openLinkedWorkspace } from "@/services/product-switch";
import { ArrowRight, Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

const eventTypes: CalendarEventType[] = [
  "lead_follow_up",
  "appointment",
  "booking_reminder",
  "quote_follow_up",
  "invoice_due",
  "invoice_reminder",
  "reactivation_touch",
  "review_request",
  "review_follow_up",
];

const toneClasses = {
  stone: {
    dot: "bg-white/70",
    chip: "border-white/15 bg-white/10 text-white/90",
  },
  violet: {
    dot: "bg-[#8ea4ff]",
    chip: "border-[#8ea4ff]/30 bg-[#1b2e7a]/40 text-[#d5ddff]",
  },
  green: {
    dot: "bg-[#3dd68c]",
    chip: "border-[#3dd68c]/30 bg-[#3dd68c]/15 text-[#b8f5d4]",
  },
  red: {
    dot: "bg-[#f07178]",
    chip: "border-[#f07178]/30 bg-[#f07178]/15 text-[#ffc9cc]",
  },
  yellow: {
    dot: "bg-[#f5c542]",
    chip: "border-[#f5c542]/35 bg-[#f5c542]/15 text-[#ffe7a3]",
  },
  pink: {
    dot: "bg-[#e879c8]",
    chip: "border-[#e879c8]/35 bg-[#e879c8]/15 text-[#ffd6f3]",
  },
} as const;

const productBySlug = Object.fromEntries(
  calendarProducts.map((product) => [product.slug, product]),
) as Record<string, (typeof calendarProducts)[number]>;

function useBrowserToday(serverToday: string) {
  return useSyncExternalStore(emptySubscribe, localDateOnly, () => serverToday);
}

function EventIcon({ type, className }: { type: CalendarEventType; className?: string }) {
  const Icon = type === "booking_reminder" ? Bell : type === "appointment" ? Clock3 : CalendarDays;
  return <Icon className={className} aria-hidden="true" />;
}

function EventButton({
  event,
  compact = false,
}: {
  event: CalendarEvent;
  compact?: boolean;
}) {
  const t = useTranslations("calendar");
  const product = productBySlug[event.product];
  const tone = toneClasses[product?.tone ?? "stone"];

  return (
    <button
      type="button"
      onClick={(click) => {
        click.stopPropagation();
        openLinkedWorkspace(event.product, { [event.focusParam]: event.recordId });
      }}
      className={cn(
        "group w-full border text-left transition-colors hover:border-foreground/30",
        tone.chip,
        compact ? "px-2 py-1" : "p-3",
      )}
      aria-label={t("openEvent", {
        type: t(`types.${event.type}`),
        title: event.title,
        product: product?.name ?? event.product,
      })}
    >
      <span className="flex min-w-0 items-center gap-2">
        <EventIcon type={event.type} className="h-3.5 w-3.5 shrink-0" />
        {!event.allDay ? (
          <span className="shrink-0 font-mono text-[10px] font-semibold">{event.time}</span>
        ) : null}
        <span className="truncate text-xs font-medium">{event.title}</span>
      </span>
      {!compact ? (
        <span className="mt-1 block truncate pl-5.5 text-[11px] opacity-70">
          {product?.name ?? event.product} · {t(`types.${event.type}`)}
          {event.detail ? ` · ${event.detail}` : ""}
        </span>
      ) : null}
    </button>
  );
}

export function Calendar({
  events,
  serverToday,
}: {
  events: CalendarEvent[];
  serverToday: string;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const today = useBrowserToday(serverToday);
  const parsedToday = parseDateOnly(today)!;
  const [chosenMonth, setChosenMonth] = useState<{ year: number; month: number } | null>(null);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const dayPanelRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState(() => new Set(calendarProducts.map(({ slug }) => slug)));
  const [types, setTypes] = useState(() => new Set(eventTypes));
  const activeMonth = chosenMonth ?? { year: parsedToday.year, month: parsedToday.month };
  const selectedDate = chosenDate ?? today;

  const filteredEvents = useMemo(
    () => events.filter((event) => products.has(event.product) && types.has(event.type)),
    [events, products, types],
  );
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    for (const event of filteredEvents) {
      const dayEvents = grouped.get(event.date) ?? [];
      dayEvents.push(event);
      grouped.set(event.date, dayEvents);
    }
    return grouped;
  }, [filteredEvents]);
  const days = monthGrid(activeMonth.year, activeMonth.month);
  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdays = days.slice(0, 7).map((day) => weekdayFormatter.format(dateOnlyToLocalNoon(day)));

  function toggleProduct(slug: (typeof calendarProducts)[number]["slug"]) {
    setProducts((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleType(type: CalendarEventType) {
    setTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function moveMonth(amount: number) {
    setChosenMonth(shiftMonth(activeMonth.year, activeMonth.month, amount));
  }

  function resetToday() {
    setChosenMonth({ year: parsedToday.year, month: parsedToday.month });
    selectDate(today);
  }

  function selectDate(date: string) {
    setChosenDate(date);
    requestAnimationFrame(() => {
      dayPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div>
      <div className="mt-8 flex flex-col gap-5 border-y border-foreground/10 py-5 xl:flex-row xl:items-center xl:justify-between">
        <fieldset>
          <legend className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            {t("filterProducts")}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {calendarProducts.map((product) => (
              <label
                key={product.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border px-3 py-2 text-xs font-medium",
                  products.has(product.slug)
                    ? toneClasses[product.tone].chip
                    : "border-foreground/10 text-muted",
                )}
              >
                <input
                  type="checkbox"
                  checked={products.has(product.slug)}
                  onChange={() => toggleProduct(product.slug)}
                  className="sr-only"
                />
                <span className={cn("h-2 w-2 rounded-full", toneClasses[product.tone].dot)} />
                {product.name}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            {t("filterTypes")}
          </legend>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {eventTypes.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={types.has(type)}
                  onChange={() => toggleType(type)}
                  className="accent-foreground"
                />
                <EventIcon type={type} className="h-3.5 w-3.5 text-muted" />
                {t(`types.${type}`)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="display text-2xl capitalize sm:text-3xl">
            {monthFormatter.format(
              new Date(activeMonth.year, activeMonth.month - 1, 1, 12),
            )}
          </h2>
          <p className="mt-2 text-sm text-muted">{t("clickHint")}</p>
        </div>
        <div className="workspace-card flex items-center">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="p-2.5 hover:bg-card-hover"
            aria-label={t("previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetToday}
            className="border-x border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-card-hover"
          >
            {t("today")}
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="p-2.5 hover:bg-card-hover"
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="workspace-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-foreground/10 bg-card-hover/60">
          {weekdays.map((weekday, index) => (
            <div
              key={`${weekday}-${index}`}
              className="px-1 py-2 text-center font-mono text-[9px] tracking-[0.08em] text-muted uppercase sm:text-[11px]"
            >
              {weekday}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date) => {
            const parsed = parseDateOnly(date)!;
            const dayEvents = eventsByDate.get(date) ?? [];
            const outsideMonth = parsed.month !== activeMonth.month;
            const selected = date === selectedDate;
            return (
              <div
                key={date}
                role="button"
                tabIndex={0}
                onClick={() => selectDate(date)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectDate(date);
                  }
                }}
                aria-pressed={selected}
                aria-label={t("selectDay", {
                  date: dayFormatter.format(dateOnlyToLocalNoon(date)),
                  count: dayEvents.length,
                })}
                className={cn(
                  "relative min-h-16 cursor-pointer border-r border-b border-foreground/10 p-1 text-left last:border-r-0 hover:bg-white/5 sm:min-h-28 sm:p-2",
                  outsideMonth && "bg-card-hover/35 text-muted",
                  selected && "bg-accent-soft outline-2 -outline-offset-2 outline-accent",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center text-xs",
                    date === today && "rounded-full bg-foreground text-background",
                  )}
                >
                  {parsed.day}
                </span>
                <span className="mt-1 flex min-h-5 w-full flex-wrap content-start gap-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => (
                    <span
                      key={event.id}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        toneClasses[productBySlug[event.product]?.tone ?? "stone"].dot,
                      )}
                    />
                  ))}
                  {dayEvents.length > 4 ? (
                    <span className="font-mono text-[8px]">+{dayEvents.length - 4}</span>
                  ) : null}
                </span>
                <span className="mt-1 hidden space-y-1 sm:block">
                  {dayEvents.slice(0, 2).map((event) => (
                    <span key={event.id} className="block">
                      <EventButton event={event} compact />
                    </span>
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="block px-1 text-[10px] text-muted">
                      {t("more", { count: dayEvents.length - 2 })}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <section
        ref={dayPanelRef}
        className="workspace-card p-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto"
      >
        <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
          {t("selectedDay")}
        </p>
        <h2 className="display mt-2 text-2xl capitalize">
          {dayFormatter.format(dateOnlyToLocalNoon(selectedDate))}
        </h2>
        <p className="mt-2 text-xs text-muted">{t("timezoneNote")}</p>
        <div className="mt-4 space-y-2">
          {selectedEvents.length ? (
            selectedEvents.map((event) => (
              <div key={event.id} className="space-y-1">
                <EventButton event={event} />
                <div className="flex items-center gap-2 px-1 text-xs text-muted">
                  {event.allDay ? (
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{event.allDay ? t("allDay") : event.time}</span>
                  <span>· {t(`types.${event.type}`)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-foreground/20 p-6 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-muted" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">{t("emptyDay")}</p>
              <p className="mt-1 text-xs text-muted">{t("emptyDayBody")}</p>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

export function CalendarPreview({
  events,
  serverToday,
}: {
  events: CalendarEvent[];
  serverToday: string;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const today = useBrowserToday(serverToday);
  const end = addCalendarDays(today, 30);
  const upcoming = events.filter((event) => event.date >= today && event.date <= end).slice(0, 5);
  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <section className="mt-10 border-t border-foreground/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted uppercase">
            {t("previewKicker")}
          </p>
          <h2 className="display mt-2 text-3xl">{t("previewTitle")}</h2>
        </div>
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent"
        >
          {t("openCalendar")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-5 grid gap-2 lg:grid-cols-5">
        {upcoming.length ? (
          upcoming.map((event) => (
            <div key={event.id} className="workspace-card p-3">
              <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
                {dateFormatter.format(dateOnlyToLocalNoon(event.date))}
                {event.time ? ` · ${event.time}` : ` · ${t("allDay")}`}
              </p>
              <div className="mt-2">
                <EventButton event={event} compact />
              </div>
              <p className="mt-2 truncate text-[11px] text-muted">
                {productBySlug[event.product]?.name} · {t(`types.${event.type}`)}
              </p>
            </div>
          ))
        ) : (
          <p className="col-span-full border border-dashed border-foreground/20 p-6 text-sm text-muted">
            {t("previewEmpty")}
          </p>
        )}
      </div>
    </section>
  );
}
