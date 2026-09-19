"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SiteSettings = {
  anonymous_messaging_enabled: boolean;
  maintenance_mode: boolean;
};

const DEFAULTS: SiteSettings = {
  anonymous_messaging_enabled: true,
  maintenance_mode: false,
};

/** Reads the small set of site-wide flags. Public (no auth needed) — used by public pages too (e.g. the maintenance banner). */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const settings = { ...DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in settings) {
      (settings as Record<string, boolean>)[row.key] = row.value === true || row.value === "true";
    }
  }
  return settings;
}

export async function setSiteSettingAction(key: keyof SiteSettings, value: boolean) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in required." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return { error: "Admin access required." };

  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  await supabase.from("admin_audit_log").insert({ admin_id: user.id, action: "update_setting", entity_type: "site_settings", entity_id: key });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}
