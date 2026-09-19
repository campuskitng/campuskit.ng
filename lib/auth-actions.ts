"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

export type ActionState = { error?: string; success?: string } | null;

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") ?? ""));

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3-20 characters: lowercase letters, numbers, underscore only." };
  }
  if (!displayName) return { error: "Add your display name." };

  const supabase = createSupabaseServerClient();

  // Fast-fail on a taken username before hitting auth (the DB trigger would
  // otherwise silently append a number, which surprises the user).
  const { data: existing } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
  if (existing) return { error: "That username is taken. Try another." };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, display_name: displayName } },
  });
  if (error) return { error: error.message };

  // Carry the original destination through the "check your email" step so
  // it isn't lost between signup and the eventual login.
  redirect(`/login?confirm=1&redirectTo=${encodeURIComponent(redirectTo)}`);
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") ?? ""));

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Incorrect email or password." };

  redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/account/new-password`,
  });
  if (error) return { error: error.message };
  return { success: "If that email has an account, a reset link is on its way." };
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/account");
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3-20 characters: lowercase letters, numbers, underscore only." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) return { error: "That username is taken." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, institution: institution || null, username })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function deleteAccountAction() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Deleting the auth user requires the service-role key, so this hands off
  // to a route handler that uses the admin client — never exposed to the
  // browser and gated on the caller's own verified session.
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/");
}
