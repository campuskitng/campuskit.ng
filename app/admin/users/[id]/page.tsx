import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RoleToggle } from "./RoleToggle";

export const revalidate = 0;

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase.from("profiles").select("*").eq("id", params.id).maybeSingle();
  if (!user) notFound();

  const [{ count: docCount }, { count: inboxCount }] = await Promise.all([
    supabase.from("document_purchases").select("id", { count: "exact", head: true }).eq("user_id", params.id),
    supabase.from("anonymous_messages").select("id", { count: "exact", head: true }).eq("recipient_id", params.id),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Users
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-section font-semibold text-ink">{user.display_name}</h1>
          <p className="text-label text-muted">@{user.username} · {user.institution ?? "No institution set"}</p>
        </div>
        <StatusPill status={user.role === "admin" ? "active" : "pending"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Documents" value={(docCount ?? 0).toString()} icon={FileText} />
        <StatCard label="Anonymous inbox" value={(inboxCount ?? 0).toString()} icon={MessageCircle} />
      </div>

      <dl className="mt-6 divide-y divide-hairline rounded-card border border-hairline bg-surface text-label">
        <div className="flex gap-4 px-4 py-3">
          <dt className="w-1/3 shrink-0 text-muted">Joined</dt>
          <dd className="text-ink">{new Date(user.created_at).toLocaleDateString()}</dd>
        </div>
        <div className="flex gap-4 px-4 py-3">
          <dt className="w-1/3 shrink-0 text-muted">Account ID</dt>
          <dd className="text-ink">{user.id}</dd>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <dt className="w-1/3 shrink-0 text-muted">Role</dt>
          <dd><RoleToggle userId={user.id} role={user.role} /></dd>
        </div>
      </dl>
    </div>
  );
}
