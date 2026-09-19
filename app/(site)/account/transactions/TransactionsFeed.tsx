"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatNaira } from "@/data/marketplace";
import type { TransactionItem } from "@/lib/account-queries";

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TransactionsFeed({
  initialItems,
  initialCursor,
}: {
  initialItems: TransactionItem[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    const res = await fetch(`/api/account/transactions?cursor=${encodeURIComponent(cursor)}`);
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setLoadingMore(false);
  }

  return (
    <div>
      <div className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-semibold text-ink">
                  {item.productName ?? item.purpose}
                </p>
                <p className="mt-0.5 text-meta text-muted">{item.reference}</p>
                <p className="mt-1 text-meta text-muted">{formatDate(item.createdAt)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-body font-semibold text-ink">{formatNaira(item.amountKobo / 100)}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-meta font-medium capitalize ${
                    STATUS_STYLES[item.status] ?? "bg-canvas text-muted"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-label text-muted">
            No transactions yet. Payments you make will show up here.
          </p>
        )}
      </div>

      {cursor ? (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
