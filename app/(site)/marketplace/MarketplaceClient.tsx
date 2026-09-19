"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/MarketplacePreview";
import type { MarketplaceItem } from "@/lib/types";

type Sort = "recent" | "low" | "high";

const sorts: { id: Sort; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "low", label: "Lowest price" },
  { id: "high", label: "Highest price" },
];

export function MarketplaceClient({ items: initialItems }: { items: MarketplaceItem[] }) {
  const [sort, setSort] = useState<Sort>("recent");
  const [notice, setNotice] = useState(false);

  const items = useMemo(() => {
    const copy = [...initialItems];
    if (sort === "low") return copy.sort((a, b) => a.price - b.price);
    if (sort === "high") return copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [initialItems, sort]);

  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[42ch]">
          <h1 className="text-display font-semibold tracking-tight text-ink">Marketplace</h1>
          <p className="mt-2 text-body text-muted">Things students are buying and selling.</p>
        </div>
        <Button onClick={() => setNotice(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post an item
        </Button>
      </header>

      {notice ? (
        <p
          role="status"
          className="mt-5 rounded-card border border-hairline bg-surface px-4 py-3 text-label text-muted"
        >
          Posting opens once accounts and image uploads are connected. Your listing will need a
          photo, a price and a pickup area.
        </p>
      ) : null}

      <div className="mt-7 flex items-center gap-3">
        <label className="text-label text-muted" htmlFor="market-sort">
          Sort
        </label>
        <select
          id="market-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          className="field-input h-10 w-auto py-0 text-label"
        >
          {sorts.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <ListingCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
