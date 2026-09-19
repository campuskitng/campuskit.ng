"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteButton({
  id,
  onDelete,
  label = "item",
}: {
  id: string;
  onDelete: (id: string) => unknown;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => startTransition(() => { void onDelete(id); })}
          className="rounded-control border border-red-300 px-2 py-1 text-meta font-medium text-red-600 hover:bg-red-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : `Confirm delete`}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-meta text-muted hover:text-ink">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${label}`}
      className="shrink-0 rounded-control p-1.5 text-muted hover:bg-canvas hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
