import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Please enter your business name."),
  industry: z.string().trim().min(1, "Please choose an industry."),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value) || /^[\w.-]+\.[a-z]{2,}/i.test(value),
      "Please enter a valid website.",
    ),
  businessEmail: z.string().trim().email("Please enter a valid business email."),
  phone: z.string().trim().optional(),
});

export const organizationSettingsSchema = z.object({
  name: z.string().trim().min(2, "Business name is required."),
  industry: z.string().trim().min(1, "Industry is required."),
  website: z.string().trim().optional(),
  email: z.string().trim().email("Please enter a valid business email."),
  phone: z.string().trim().optional(),
});

export const accountSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
});

export const inviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  role: z.enum(["admin", "member"]),
});

export const leadStatuses = ["new", "contacted", "won", "lost"] as const;

export const leadStatusSchema = z.enum(leadStatuses);

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Please enter the lead's name."),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Please enter a valid email.",
    ),
  phone: z.string().trim().optional().transform((value) => value || ""),
  notes: z.string().trim().optional().transform((value) => value || ""),
  followUpOn: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Please enter a valid follow-up date.",
    ),
});

export const updateLeadFollowUpSchema = z.object({
  followUpOn: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Please enter a valid follow-up date.",
    ),
});

export const bookingStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const bookingStatusSchema = z.enum(bookingStatuses);

const optionalEmailField = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Please enter a valid email.",
  );

const optionalDateField = (message: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), message);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const optionalUuidField = (message: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine((value) => value === "" || uuidPattern.test(value), message);

const requiredUuidField = (message: string) =>
  z.string().trim().refine((value) => uuidPattern.test(value), message);

export const recordProductSchema = z.enum(["avyro", "velto", "rovyn", "orvyn"]);

export const optionalRecordLinkSchema = z.object({
  linkProduct: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value === "" || recordProductSchema.safeParse(value).success,
      "That product is not valid.",
    ),
  linkId: optionalUuidField("That record is not valid."),
});

export const attachRecordLinkSchema = z.object({
  fromProduct: recordProductSchema,
  fromId: requiredUuidField("That record is not valid."),
  toProduct: recordProductSchema,
  toId: requiredUuidField("That record is not valid."),
});

export const deleteRecordLinkSchema = z.object({
  linkId: requiredUuidField("That connection is not valid."),
});

export const createBookingSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter the customer's name."),
  email: optionalEmailField,
  phone: z.string().trim().optional().transform((value) => value || ""),
  service: z.string().trim().min(2, "Please enter what they are booking."),
  startsOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a booking date."),
  startTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}(?::\d{2})?$/, "Please choose a booking time."),
  reminderOn: optionalDateField("Please enter a valid reminder date."),
  notes: z.string().trim().optional().transform((value) => value || ""),
  leadId: optionalUuidField("That lead is not valid."),
});

export const updateBookingLeadSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .refine(
      (value) =>
        uuidPattern.test(value),
      "That booking is not valid.",
    ),
  leadId: optionalUuidField("That lead is not valid."),
});

export const updateBookingReminderSchema = z.object({
  reminderOn: optionalDateField("Please enter a valid reminder date."),
});

export const quoteStatuses = ["sent", "followed_up", "won", "lost"] as const;

export const quoteStatusSchema = z.enum(quoteStatuses);
export const quoteCurrencies = ["EUR", "USD", "GBP"] as const;
export const quoteCurrencySchema = z.enum(quoteCurrencies);

const optionalAmountField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value || "").replace(",", "."))
  .refine(
    (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
    "Please enter a valid amount.",
  );

export const createQuoteSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter the customer's name."),
  email: optionalEmailField,
  phone: z.string().trim().optional().transform((value) => value || ""),
  title: z.string().trim().min(2, "Please enter what this quote is for."),
  amount: optionalAmountField,
  currency: quoteCurrencySchema,
  notes: z.string().trim().optional().transform((value) => value || ""),
  followUpOn: optionalDateField("Please enter a valid follow-up date."),
});

export const updateQuoteFollowUpSchema = z.object({
  followUpOn: optionalDateField("Please enter a valid follow-up date."),
});

export const invoiceStatuses = ["draft", "sent", "overdue", "paid", "void"] as const;
export const invoiceStatusSchema = z.enum(invoiceStatuses);

export const createInvoiceSchema = z
  .object({
    customerName: z.string().trim().min(2, "Please enter the customer's name."),
    email: optionalEmailField,
    phone: z.string().trim().optional().transform((value) => value || ""),
    invoiceNumber: z.string().trim().min(1, "Please enter an invoice number.").max(80),
    description: z.string().trim().min(2, "Please enter what this invoice is for."),
    amount: optionalAmountField.refine((value) => value !== "", "Please enter an amount."),
    currency: quoteCurrencySchema,
    issuedOn: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose an issue date."),
    dueOn: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a due date."),
    nextReminderOn: optionalDateField("Please enter a valid reminder date."),
    notes: z.string().trim().optional().transform((value) => value || ""),
  })
  .refine((data) => data.dueOn >= data.issuedOn, {
    message: "The due date cannot be before the issue date.",
    path: ["dueOn"],
  });

export const updateInvoiceReminderSchema = z.object({
  nextReminderOn: optionalDateField("Please enter a valid reminder date."),
});

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
