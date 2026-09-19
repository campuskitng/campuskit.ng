"use client";

import { X } from "lucide-react";
import { unsaveItemAction } from "@/lib/saved-actions";

export function UnsaveButton({ itemId }: { itemId: string }) {
  return (
    <button
      type="button"
      onClick={() => unsaveItemAction(itemId)}
      aria-label="Remove from saved"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-muted hover:bg-canvas hover:text-[#B42318]"
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
