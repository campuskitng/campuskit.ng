import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/notifications";
import { NotificationsFeed } from "./NotificationsFeed";

export const revalidate = 0;

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/notifications");

  const { items, nextCursor } = await getNotifications();

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-2 text-body text-muted">Real activity on your account — nothing here is manufactured.</p>
      </header>

      <div className="mt-6">
        <NotificationsFeed initialItems={items} initialCursor={nextCursor} />
      </div>
    </div>
  );
}
