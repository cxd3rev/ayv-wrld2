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

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
