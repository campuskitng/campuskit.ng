"use client";

import { useTransition } from "react";
import { StatusPill } from "./StatusPill";

export function StatusToggle({
  id,
  status,
  onToggle,
}: {
  id: string;
  status: string;
  onToggle: (id: string, currentStatus: string) => unknown;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => { void onToggle(id, status); })}
      className="shrink-0"
      title="Click to toggle published/draft"
    >
      <StatusPill status={status === "published" ? "active" : "draft"} />
    </button>
  );
}
