"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ThemePreference } from "@/lib/types";

const VALID: ThemePreference[] = ["system", "light", "dark"];

/**
 * Persists the account-level preference so it follows the user across
 * devices. next-themes (client) is still the thing that actually flips the
 * `dark` class and caches the choice in localStorage for instant, no-flash
 * paints on this device — this is the source of truth behind that cache.
 */
export async function updateThemePreferenceAction(theme: ThemePreference) {
  if (!VALID.includes(theme)) return { error: "Invalid theme." };
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error } = await supabase.from("profiles").update({ theme_preference: theme }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/account/appearance");
  return { ok: true };
}
