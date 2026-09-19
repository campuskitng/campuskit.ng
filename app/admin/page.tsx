import { FileText, ShieldAlert, ShoppingBag, Users } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const supabase = createSupabaseServerClient();
  const [{ count: userCount }, { data: payments }, { count: marketplaceCount }, { count: pendingReports }, { data: auditLog }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("amount_kobo").eq("purpose", "document_template").eq("status", "success"),
      supabase.from("marketplace_items").select("id", { count: "exact", head: true }),
      supabase.from("anonymous_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("admin_audit_log").select("id, action, entity_type, entity_id, created_at").order("created_at", { ascending: false }).limit(10),
    ]);

  const revenue = (payments ?? []).reduce((sum, p) => sum + p.amount_kobo, 0) / 100;

  return (
    <div className="max-w-5xl">
      <h1 className="text-section font-semibold text-ink">Overview</h1>
      <p className="mt-1 text-label text-muted">What&apos;s happening across CampusKit right now.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Students" value={(userCount ?? 0).toString()} note="Registered accounts" icon={Users} />
        <StatCard label="Document revenue" value={`₦${revenue.toLocaleString("en-NG")}`} note={`${payments?.length ?? 0} paid orders`} icon={FileText} />
        <StatCard label="Marketplace listings" value={(marketplaceCount ?? 0).toString()} note="Live now" icon={ShoppingBag} />
        <StatCard label="Anonymous reports" value={(pendingReports ?? 0).toString()} note="Awaiting review" icon={ShieldAlert} />
      </div>

      <section aria-labelledby="activity-heading" className="mt-8">
        <h2 id="activity-heading" className="text-title font-semibold text-ink">Recent admin activity</h2>
        <ul className="mt-3 divide-y divide-hairline rounded-card border border-hairline bg-surface">
          {(auditLog ?? []).map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3.5">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
              <div className="min-w-0 flex-1">
                <p className="text-label text-ink">{item.action.replace(/_/g, " ")} — {item.entity_type}</p>
                <p className="mt-0.5 text-meta text-muted">{item.entity_id}</p>
              </div>
              <span className="shrink-0 text-meta text-muted">{new Date(item.created_at).toLocaleString()}</span>
            </li>
          ))}
          {(!auditLog || auditLog.length === 0) ? (
            <li className="px-4 py-6 text-center text-meta text-muted">No admin activity yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
