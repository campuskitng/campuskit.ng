import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Pencil,
  Receipt,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/notifications";

export const revalidate = 0;

function ShortcutCard({
  href,
  icon: Icon,
  label,
  meta,
  badge,
}: {
  href: string;
  icon: typeof Bell;
  label: string;
  meta?: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-brand/40 hover:bg-canvas"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium text-ink">
          {label}
          {badge && badge > 0 ? (
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-meta font-semibold text-white">🔴 {badge}</span>
          ) : null}
        </p>
        {meta ? <p className="text-meta text-muted">{meta}</p> : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}

export default async function AccountDashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account");

  const [{ data: profile }, unreadNotifications, { count: unreadAnonymous }, { count: savedCount }] = await Promise.all([
    supabase.from("profiles").select("username, display_name, institution, avatar_url, role").eq("id", user.id).single(),
    getUnreadNotificationCount(),
    supabase
      .from("anonymous_messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .eq("recipient_id", user.id)
      .neq("status", "removed")
      .neq("status", "expired"),
    supabase.from("saved_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const initial = (profile?.display_name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-title font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-title font-semibold text-ink">{profile?.display_name ?? "Your account"}</h1>
          <p className="text-label text-muted">
            @{profile?.username}
            {profile?.institution ? ` · ${profile.institution}` : ""}
          </p>
        </div>
      </div>

      <Link
        href="/account/edit"
        className="mt-4 inline-flex items-center gap-1.5 rounded-control border border-hairline bg-surface px-3.5 py-2 text-label font-medium text-ink shadow-control transition-colors hover:border-brand/40"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit profile
      </Link>

      {profile?.role === "admin" ? (
        <Link
          href="/admin"
          className="mt-4 flex items-center gap-3 rounded-card border border-brand/30 bg-brand-soft/40 p-4 text-brand-700 transition-colors hover:bg-brand-soft/60"
        >
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
          <span className="font-medium">Go to admin dashboard</span>
          <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}

      <div className="mt-6 grid gap-2.5">
        <ShortcutCard href="/account/anonymous" icon={MessageCircle} label="Anonymous" meta="Your inbox and shareable link" badge={unreadAnonymous ?? 0} />
        <ShortcutCard href="/account/notifications" icon={Bell} label="Notifications" meta="Activity on your account" badge={unreadNotifications} />
        <ShortcutCard href="/account/saved" icon={Bookmark} label="Saved" meta={`${savedCount ?? 0} saved item${savedCount === 1 ? "" : "s"}`} />
        <ShortcutCard href="/account/documents" icon={FileText} label="Documents" meta="Your generated & purchased documents" />
        <ShortcutCard href="/account/transactions" icon={Receipt} label="Transaction history" meta="Every payment on your account" />
      </div>
    </div>
  );
}
