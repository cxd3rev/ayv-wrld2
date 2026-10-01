import { z } from "zod";

export const fuelTypeSchema = z.enum(["gas", "oil", "solid_fuel", "heat_pump"]);

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Gebruik een datum.");
const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(dateSchema.nullable());

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Vul de naam in.").max(200),
  email: z
    .string()
    .trim()
    .transform((value) => value || null)
    .pipe(z.string().email("Vul een geldig e-mailadres in.").nullable()),
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((value) => value || null),
});

export const addressSchema = z.object({
  customerId: z.string().uuid(),
  street: z.string().trim().min(1, "Vul de straat in.").max(200),
  postalCode: z.string().trim().min(1, "Vul de postcode in.").max(12),
  municipality: z.string().trim().min(1, "Vul de gemeente in.").max(120),
});

export const boilerSchema = z.object({
  addressId: z.string().uuid(),
  fuel: fuelTypeSchema,
  powerKw: z.coerce.number().positive("Vul het vermogen in kW in.").max(9999),
  brand: z.string().trim().max(120).transform((value) => value || null),
  model: z.string().trim().max(120).transform((value) => value || null),
  installedOn: dateSchema,
  lastMaintenanceOn: optionalDate,
  lastAuditOn: optionalDate,
  optionalIntervalMonths: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number().int().min(1).max(60).nullable()),
  notes: z.string().trim().max(2000).transform((value) => value || null),
});

export const reminderSettingsSchema = z.object({
  reminderLeadDays: z.coerce.number().int().min(1).max(90),
});

export const slotSchema = z
  .object({
    startsAt: z.string().trim().min(1, "Vul een beginuur in."),
    endsAt: z.string().trim().min(1, "Vul een einduur in."),
  })
  .refine((value) => new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(), {
    message: "Het einduur moet na het beginuur liggen.",
    path: ["endsAt"],
  });

export const bookingSchema = z.object({
  slotId: z.string().uuid(),
  customerName: z.string().trim().min(1, "Vul uw naam in.").max(200),
  email: z.string().trim().email("Vul een geldig e-mailadres in."),
  phone: z.string().trim().max(40).transform((value) => value || null),
});

export const visitSchema = z.object({
  boilerId: z.string().uuid(),
  visitedOn: dateSchema,
  notes: z.string().trim().max(2000).transform((value) => value || null),
  includesAudit: z.boolean(),
});

export function zodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Controleer de ingevulde gegevens.";
}
