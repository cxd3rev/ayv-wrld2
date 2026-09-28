export type HelpStep = {
  text: string;
  actionLabel?: string;
  actionHref?: string;
};

export type HelpTopic = {
  id: string;
  title: string;
  steps: HelpStep[];
};

/**
 * Placeholder copy for features that already exist.
 * Replace the sentences when the real help writing is ready.
 */
export const helpTopics: Record<
  "pricing" | "growth-modules" | "product-switch" | "follow-ups" | "calendar",
  HelpTopic
> = {
  pricing: {
    id: "pricing",
    title: "Plans",
    steps: [
      {
        text: "Starter is one module at €39 a month. You choose Avyro, Velto, Rovyn, Orvyn, Nexro, or Ravelo.",
      },
      {
        text: "Growth is €79 a month and includes exactly three of those modules.",
      },
      {
        text: "The full stack is €149 a month and includes all six.",
      },
      {
        text: "The first plan starts with 7 days free. A card is required, and billing starts when the trial ends.",
        actionLabel: "Go to Billing",
        actionHref: "/dashboard/billing",
      },
    ],
  },
  "growth-modules": {
    id: "growth-modules",
    title: "Choosing Growth",
    steps: [
      {
        text: "Tick exactly three modules. Growth stays unavailable until three are selected.",
      },
      {
        text: "Switching from one paid module to Growth charges Growth, and the old plan stops renewing.",
      },
      {
        text: "The days you already paid on the previous plan are not refunded.",
      },
    ],
  },
  "product-switch": {
    id: "product-switch",
    title: "Switching modules",
    steps: [
      {
        text: "Open another module from this menu. Leads, bookings, quotes, and invoices stay in the same workspace.",
      },
      {
        text: "A module you have not paid for stays locked until a plan covers it.",
        actionLabel: "Go to Billing",
        actionHref: "/dashboard/billing",
      },
    ],
  },
  "follow-ups": {
    id: "follow-ups",
    title: "Follow-up emails",
    steps: [
      {
        text: "Add the client and pick the date. The follow-up email goes out that morning.",
      },
      {
        text: "These apps send email only. They do not send SMS or WhatsApp.",
      },
      {
        text: "One module allows 200 new records a month. Growth allows 1,000. The full stack has no cap. New records stop for the rest of the month when you hit the cap.",
      },
    ],
  },
  calendar: {
    id: "calendar",
    title: "Shared calendar",
    steps: [
      {
        text: "Each module has its own color. Use the filters to show or hide one.",
      },
      {
        text: "A date appears here when you set a follow-up, reminder, or booking in that module.",
      },
    ],
  },
};

export type HelpTopicId = keyof typeof helpTopics;

export function getHelpTopic(topicId: string) {
  return topicId in helpTopics ? helpTopics[topicId as HelpTopicId] : undefined;
}
