import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { formatNaira, buildWhatsAppLink } from "@/data/marketplace";
import { timeAgo } from "@/lib/format-time";
import { getMarketplaceItemById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isItemSaved } from "@/lib/saved-actions";
import { SaveButton } from "@/components/SaveButton";

export const revalidate = 0;

export default async function ListingPage({ params }: { params: { id: string } }) {
  const item = await getMarketplaceItemById(params.id);
  if (!item) {
    notFound();
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const saved = await isItemSaved("marketplace_item", params.id);
  const whatsappLink = buildWhatsAppLink(item.whatsappContact, item.title);

  return (
    <div className="shell max-w-3xl pb-16 pt-8 sm:pt-10">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-label font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Marketplace
      </Link>

      <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <div className="overflow-hidden rounded-card border border-hairline bg-surface">
          <Image
            src={item.image}
            alt={item.title}
            width={600}
            height={450}
            sizes="(max-width: 640px) 100vw, 600px"
            className="h-64 w-full object-cover sm:h-80"
            priority
          />
        </div>

        <div>
          <p className="text-display font-semibold tracking-tight text-ink">
            {formatNaira(item.price)}
          </p>
          <h1 className="mt-1 text-title font-medium text-ink">{item.title}</h1>
          <div className="mt-3">
            <SaveButton itemType="marketplace_item" itemId={params.id} initialSaved={saved} isAuthenticated={!!user} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-label text-muted">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {item.location}
            <span aria-hidden="true">·</span>
            {item.condition}
          </p>
          <p className="mt-1 text-meta text-muted">
            Posted {timeAgo(item.postedAt)} by {item.seller}
          </p>

          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-control bg-[#25D366] px-4 py-2.5 text-body font-medium text-white shadow-control transition-colors hover:bg-[#1EBE5A]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Message on WhatsApp
            </a>
          ) : (
            <p className="mt-5 rounded-control border border-hairline bg-canvas p-3 text-label text-muted">
              No contact configured for this listing yet.
            </p>
          )}
          <p className="mt-2 text-meta text-muted">
            You&apos;ll be taken to WhatsApp to chat with the seller directly. Meet in a public place on campus
            and check items before paying.
          </p>
        </div>
      </div>
    </div>
  );
}
