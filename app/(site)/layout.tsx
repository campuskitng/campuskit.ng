import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeSync } from "@/components/ThemeSync";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings-actions";
import { getUnreadNotificationCount } from "@/lib/notifications";
import type { ThemePreference } from "@/lib/types";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; display_name: string; role: string; theme_preference: ThemePreference } | null = null;
  let unreadNotifications = 0;
  if (user) {
    const [{ data }, count] = await Promise.all([
      supabase.from("profiles").select("username, display_name, role, theme_preference").eq("id", user.id).maybeSingle(),
      getUnreadNotificationCount(),
    ]);
    profile = data;
    unreadNotifications = count;
  }

  const settings = await getSiteSettings();
  const isAdmin = profile?.role === "admin";

  // Full block for everyone except admins (so an admin can still sign in
  // and flip the flag back off without being locked out of the site).
  if (settings.maintenance_mode && !isAdmin) {
    return (
      <>
        {profile ? <ThemeSync preference={profile.theme_preference} /> : null}
        <Navbar profile={profile} unreadNotifications={unreadNotifications} />
        <main id="main" className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-center">
          <div>
            <p className="text-title font-semibold text-ink">CampusKit is undergoing scheduled maintenance</p>
            <p className="mt-2 text-body text-muted">We&apos;ll be back shortly. Please check back soon.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {profile ? <ThemeSync preference={profile.theme_preference} /> : null}
      {settings.maintenance_mode && isAdmin ? (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-meta font-medium text-amber-900">
          Maintenance mode is ON — the public site is showing a maintenance page to everyone except admins.
        </div>
      ) : null}
      <Navbar profile={profile} unreadNotifications={unreadNotifications} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
