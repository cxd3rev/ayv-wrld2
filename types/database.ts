/**
 * Hand-written database types for the AYV WRLD foundation tables.
 * When you connect a live Supabase project, you can later replace this
 * file with generated types from `supabase gen types typescript`.
 */

export type MemberRole = "owner" | "admin" | "member";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "incomplete";
export type NotificationType = "info" | "success" | "warning" | "billing";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  industry: string | null;
  email: string | null;
  phone: string | null;
  vat_number?: string | null;
  municipality?: string | null;
  service_municipalities?: string[] | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
};

export type OrganizationProduct = {
  id: string;
  organization_id: string;
  product_id: string;
  enabled: boolean;
  created_at: string;
};

export type BillingCustomer = {
  id: string;
  organization_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
};

export type Price = {
  id: string;
  product_id: string;
  stripe_price_id: string | null;
  currency: string;
  unit_amount: number | null;
  interval: "month" | "year" | null;
  active: boolean;
};

export type Subscription = {
  id: string;
  organization_id: string;
  billing_customer_id: string | null;
  product_id: string | null;
  price_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
  /** Catalog slug joined from products, not a DB column. */
  product_slug?: "avyro" | "velto" | "rovyn" | "orvyn" | "nexro" | "ravelo" | "growth" | "full_stack" | "onderhoud" | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailEvent = {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  to_email: string;
  template: string;
  status: "queued" | "sent" | "failed";
  provider_id: string | null;
  error: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
};

export type OrganizationInvite = {
  id: string;
  organization_id: string;
  email: string;
  role: MemberRole;
  token: string;
  invited_by: string;
  created_at: string;
};

export type LeadStatus = "new" | "contacted" | "won" | "lost";

export type Lead = {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  notes: string | null;
  follow_up_on: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Booking = {
  id: string;
  organization_id: string;
  lead_id: string | null;
  customer_name: string;
  email: string | null;
  phone: string | null;
  service: string;
  starts_on: string;
  start_time: string;
  status: BookingStatus;
  reminder_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteStatus = "sent" | "followed_up" | "won" | "lost";

export type Quote = {
  id: string;
  organization_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  title: string;
  amount: number | string | null;
  currency: string;
  status: QuoteStatus;
  follow_up_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "overdue" | "paid" | "void";

export type Invoice = {
  id: string;
  organization_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  invoice_number: string;
  description: string;
  amount: number | string;
  currency: string;
  status: InvoiceStatus;
  issued_on: string;
  due_on: string;
  next_reminder_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRelationship = "existing_customer" | "consent";

export type Contact = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string | null;
  relationship: ContactRelationship;
  consent_source: string | null;
  consent_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SharedClient = {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  last_activity_on: string | null;
  visit_count: number;
  loyalty_status: "none" | "loyal";
  churn_status: "none" | "at_risk";
  created_at: string;
  updated_at: string;
};

export type ModuleSettings = {
  organization_id: string;
  product: "avyro" | "velto" | "rovyn" | "orvyn";
  check_in_delay_days: number;
  renewal_lead_days: number;
  churn_margin_days: number;
  loyalty_threshold: number;
  send_thank_you: boolean;
};

export type CheckInStatus = "scheduled" | "sent" | "positive" | "neutral" | "negative";

export type CheckIn = {
  id: string;
  organization_id: string;
  client_id: string;
  served_on: string;
  check_in_on: string;
  status: CheckInStatus;
  reply_token: string;
  created_at: string;
  updated_at: string;
  clients: Pick<SharedClient, "name" | "email" | "phone" | "visit_count" | "loyalty_status" | "churn_status"> | null;
};

export type RenewalStatus = "scheduled" | "reminded" | "renewed" | "lapsed";

export type Renewal = {
  id: string;
  organization_id: string;
  client_id: string;
  plan_name: string;
  renews_on: string;
  reminder_on: string;
  status: RenewalStatus;
  created_at: string;
  updated_at: string;
  clients: Pick<SharedClient, "name" | "email" | "phone"> | null;
};

export type ChurnWatch = {
  id: string;
  organization_id: string;
  client_id: string;
  frequency_days: number;
  last_activity_on: string;
  status: "watching" | "at_risk";
  origin: "manual" | "velto";
  created_at: string;
  updated_at: string;
  clients: Pick<SharedClient, "name" | "email" | "phone"> | null;
};

export type LoyaltyRecord = {
  id: string;
  organization_id: string;
  client_id: string;
  visit_count: number;
  status: "tracking" | "loyal";
  origin: "manual" | "avyro";
  thank_you_on: string | null;
  created_at: string;
  updated_at: string;
  clients: Pick<SharedClient, "name" | "email" | "phone"> | null;
};

export type ReactivationKind = "winback" | "referral";
export type ReactivationOrigin = "manual" | "rovyn" | "orvyn";
export type ReactivationStatus = "scheduled" | "sent" | "replied" | "won" | "passed";

export type Reactivation = {
  id: string;
  organization_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  kind: ReactivationKind;
  origin: ReactivationOrigin;
  client_id: string | null;
  status: ReactivationStatus;
  message: string;
  incentive: string | null;
  last_seen_on: string | null;
  next_touch_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewOrigin = "manual" | "avyro";
export type ReviewStatus = "scheduled" | "requested" | "public" | "private" | "responded";
export type ReviewChannel = "google" | "trustpilot" | "facebook" | "other" | "private";

export type Review = {
  id: string;
  organization_id: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  status: ReviewStatus;
  origin: ReviewOrigin;
  client_id: string | null;
  channel: ReviewChannel;
  rating: number | null;
  feedback: string | null;
  review_url: string | null;
  requested_on: string;
  next_follow_up_on: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RecordProduct = "avyro" | "velto" | "rovyn" | "orvyn" | "nexro" | "ravelo";

export type RecordLink = {
  id: string;
  organization_id: string;
  from_product: RecordProduct;
  from_id: string;
  to_product: RecordProduct;
  to_id: string;
  created_at: string;
};

export type MemberWithProfile = OrganizationMember & {
  profiles: Pick<Profile, "full_name" | "email"> | null;
};
