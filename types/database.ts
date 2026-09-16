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
  invited_by: string;
  created_at: string;
};

export type MemberWithProfile = OrganizationMember & {
  profiles: Pick<Profile, "full_name" | "email"> | null;
};
