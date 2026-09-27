"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  createReviewSchema,
  firstZodError,
  reviewStatusSchema,
  updateReviewFollowUpSchema,
} from "@/lib/validations";
import { linkCreatedRecord } from "@/services/record-links";
import type { Review } from "@/types/database";

const reviewColumns =
  "id, organization_id, customer_name, email, phone, status, channel, rating, feedback, review_url, requested_on, next_follow_up_on, notes, created_at, updated_at";

export async function listReviews(): Promise<Review[]> {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(reviewColumns)
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Review[] | null) ?? [];
}

export async function createReview(formData: FormData) {
  const { organization } = await requireWorkspace();
  const parsed = createReviewSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    channel: formData.get("channel"),
    rating: formData.get("rating"),
    feedback: formData.get("feedback"),
    reviewUrl: formData.get("reviewUrl"),
    requestedOn: formData.get("requestedOn"),
    nextFollowUpOn: formData.get("nextFollowUpOn"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      organization_id: organization.id,
      customer_name: parsed.data.customerName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      channel: parsed.data.channel,
      rating: parsed.data.rating ? Number(parsed.data.rating) : null,
      feedback: parsed.data.feedback || null,
      review_url: parsed.data.reviewUrl || null,
      requested_on: parsed.data.requestedOn,
      next_follow_up_on: parsed.data.nextFollowUpOn || null,
      notes: parsed.data.notes || null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: "Could not add this review request. Please try again." };
  }

  await linkCreatedRecord(formData, "ravelo", data.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/ravelo");
  return { ok: true as const, message: "Review request added." };
}

export async function updateReviewStatus(reviewId: string, status: string) {
  const parsed = reviewStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "That status is not valid." };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({
      status: parsed.data,
      next_follow_up_on:
        parsed.data === "public" || parsed.data === "responded" ? null : undefined,
    })
    .eq("id", reviewId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not update this review request." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/ravelo");
  return { ok: true as const, message: "Status updated." };
}

export async function updateReviewFollowUp(reviewId: string, nextFollowUpOn: string) {
  const parsed = updateReviewFollowUpSchema.safeParse({ nextFollowUpOn });
  if (!parsed.success) return { ok: false as const, error: firstZodError(parsed.error) };

  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ next_follow_up_on: parsed.data.nextFollowUpOn || null })
    .eq("id", reviewId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not save the follow-up date." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/ravelo");
  return { ok: true as const, message: "Follow-up saved." };
}

export async function deleteReview(reviewId: string) {
  const { organization } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("organization_id", organization.id);

  if (error) return { ok: false as const, error: "Could not remove this review request." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/ravelo");
  return { ok: true as const, message: "Review request removed." };
}
