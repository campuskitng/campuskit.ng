"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SavedItemType = "tool" | "opportunity" | "marketplace_item" | "document_template" | "past_question";

export async function saveItemAction(itemType: SavedItemType, itemId: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save items." };
  const { error } = await supabase.from("saved_items").insert({ user_id: user.id, item_type: itemType, item_id: itemId });
  if (error && !error.message.includes("duplicate")) return { error: error.message };
  revalidatePath("/account/saved");
  return { ok: true };
}

export async function unsaveItemAction(savedItemId: string) {
  const supabase = createSupabaseServerClient();
  await supabase.from("saved_items").delete().eq("id", savedItemId);
  revalidatePath("/account/saved");
}

/** Toggles save state by (itemType, itemId) — used by the SaveButton on public pages. */
export async function toggleSavedAction(itemType: SavedItemType, itemId: string): Promise<{ saved: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false, error: "Sign in to save items." };

  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_items").delete().eq("id", existing.id);
    revalidatePath("/account/saved");
    return { saved: false };
  }

  const { error } = await supabase.from("saved_items").insert({ user_id: user.id, item_type: itemType, item_id: itemId });
  if (error) return { saved: false, error: error.message };
  revalidatePath("/account/saved");
  return { saved: true };
}

export async function isItemSaved(itemType: SavedItemType, itemId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .maybeSingle();
  return !!data;
}
