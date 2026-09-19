"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleSavedAction, type SavedItemType } from "@/lib/saved-actions";

export function SaveButton({
  itemType,
  itemId,
  initialSaved,
  isAuthenticated,
  className = "",
}: {
  itemType: SavedItemType;
  itemId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const result = await toggleSavedAction(itemType, itemId);
      if (result.error) setSaved(!next); // revert on failure
      else setSaved(result.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-label font-medium transition-colors ${
        saved
          ? "border-brand/40 bg-brand-soft text-brand-700"
          : "border-hairline bg-canvas text-ink hover:border-brand/40"
      } ${className}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
