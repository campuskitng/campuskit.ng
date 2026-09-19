"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";

export function ReviewButtons({
  reportId,
  messageId,
  onReview,
}: {
  reportId: string;
  messageId: string;
  onReview: (reportId: string, messageId: string, decision: "approved" | "removed") => unknown;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => { void onReview(reportId, messageId, "approved"); })}
        className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-3 py-1.5 text-label font-medium text-ink transition-colors hover:border-success/40 hover:text-success"
      >
        <Check className="h-4 w-4" aria-hidden="true" /> Keep message
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => { void onReview(reportId, messageId, "removed"); })}
        className="inline-flex items-center gap-1.5 rounded-control border border-hairline px-3 py-1.5 text-label font-medium text-ink transition-colors hover:border-red-300 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
      </button>
    </div>
  );
}
