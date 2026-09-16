export type { ProductConfig, ProductId, ProductStatus } from "@/config/products";
export type {
  BillingCustomer,
  EmailEvent,
  MemberRole,
  MemberWithProfile,
  Notification,
  NotificationType,
  Organization,
  OrganizationInvite,
  OrganizationMember,
  OrganizationProduct,
  Price,
  Profile,
  Subscription,
  SubscriptionStatus,
} from "@/types/database";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};
