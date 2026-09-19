import { Check, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/admin/StatusPill";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reviewReportAction } from "@/lib/admin-actions";
import { ANONYMOUS_REPORT_REASONS } from "@/lib/types";
import { ReviewButtons } from "./ReviewButtons";

export const revalidate = 0;

function reasonLabel(reason: string): string {
  return ANONYMOUS_REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

export default async function AdminAnonymousPage() {
  const supabase = createSupabaseServerClient();
  const { data: reports } = await supabase
    .from("anonymous_reports")
    .select("id, reason, reason_detail, status, created_at, anonymous_messages(id, body, status)")
    .order("created_at", { ascending: false })
    .limit(50);

  const pending = (reports ?? []).filter((r) => r.status === "pending");
  const reviewed = (reports ?? []).filter((r) => r.status !== "pending");

  return (
    <div className="max-w-3xl">
      <h1 className="text-section font-semibold text-ink">Anonymous</h1>
      <p className="mt-1 text-label text-muted">
        {pending.length} report{pending.length === 1 ? "" : "s"} awaiting review. A single report never auto-removes a message.
      </p>

      <ul className="mt-5 space-y-3">
        {pending.map((report) => {
          const message = report.anonymous_messages as unknown as { id: string; body: string; status: string } | null;
          return (
            <li key={report.id} className="rounded-card border border-hairline bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-label font-medium text-ink">&ldquo;{message?.body}&rdquo;</p>
                  <p className="mt-1 text-meta text-muted">
                    Reported: {reasonLabel(report.reason)}
                    {report.reason_detail ? ` — "${report.reason_detail}"` : ""} · {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusPill status="flagged" />
              </div>
              {message ? <ReviewButtons reportId={report.id} messageId={message.id} onReview={reviewReportAction} /> : null}
            </li>
          );
        })}
        {pending.length === 0 ? (
          <li className="rounded-card border border-dashed border-hairline p-8 text-center text-label text-muted">No reports pending review.</li>
        ) : null}
      </ul>

      {reviewed.length > 0 ? (
        <>
          <h2 className="mt-8 text-title font-semibold text-ink">Reviewed</h2>
          <ul className="mt-3 space-y-2">
            {reviewed.map((report) => {
              const message = report.anonymous_messages as unknown as { status: string } | null;
              return (
                <li key={report.id} className="flex items-center justify-between rounded-control border border-hairline px-4 py-2.5 text-label">
                  <span className="truncate text-muted">{reasonLabel(report.reason)}</span>
                  <StatusPill status={message?.status === "removed" ? "removed" : "approved"} />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
