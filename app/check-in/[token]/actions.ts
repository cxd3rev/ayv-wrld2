"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { recordCheckInReply } from "@/services/journey";

export async function replyToCheckIn(token: string, reply: "positive" | "neutral" | "negative") {
  return recordCheckInReply(createAdminClient(), token, reply);
}
