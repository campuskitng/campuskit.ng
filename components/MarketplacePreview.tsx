import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatNaira } from "@/data/marketplace";
import type { MarketplaceItem } from "@/lib/types";

export function ListingCard({ item }: { item: MarketplaceItem }) {
  return (
    <Link href={item.href} className="group block">
      <div className="overflow-hidden rounded-card border border-hairline bg-surface">
        <Image
          src={item.image}
          alt={item.title}
          width={600}
          height={450}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 360px"
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-44"
        />
      </div>
      <div className="mt-2.5">
        <p className="text-title font-medium text-ink group-hover:text-brand-700">
          {formatNaira(item.price)}
        </p>
        <p className="mt-0.5 line-clamp-1 text-label text-ink/90">{item.title}</p>
        <p className="mt-1 flex items-center gap-1.5 text-meta text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {item.location}
          <span aria-hidden="true">·</span>
          {item.condition}
        </p>
      </div>
    </Link>
  );
}

export function MarketplacePreview({ items }: { items: MarketplaceItem[] }) {
  return (
    <section aria-labelledby="marketplace-heading" className="shell pt-14 sm:pt-16">
      <SectionHeader
        title={<span id="marketplace-heading">Student marketplace</span>}
        description="Things students are buying and selling."
        action={{ label: "Browse marketplace", href: "/marketplace" }}
      />

      {/* Swipeable strip on phones, an even row from tablet up. */}
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {items.map((item) => (
          <li key={item.id} className="w-[68%] shrink-0 snap-start sm:w-auto">
            <ListingCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
