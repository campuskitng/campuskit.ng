"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// RLS ("Users update own notifications") is the real gate — the server
// client is scoped to the caller's session.

export async function markNotificationReadAction(notificationId: string) {
  const supabase = createSupabaseServerClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).is("read_at", null);
  revalidatePath("/account/notifications");
}

export async function markAllNotificationsReadAction() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/account/notifications");
}
