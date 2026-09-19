import { FeaturedHero } from "@/components/FeaturedHero";
import { PopularTools } from "@/components/PopularTools";
import { AnonymousShowcase } from "@/components/AnonymousShowcase";
import { DocumentShowcase } from "@/components/DocumentShowcase";
import { OpportunityList } from "@/components/OpportunityList";
import { MarketplacePreview } from "@/components/MarketplacePreview";
import { RecentlyAdded } from "@/components/RecentlyAdded";
import { PageEnding } from "@/components/PageEnding";
import { anonymousSamples, featuredSlides } from "@/data/featured";
import { homeDocumentIds } from "@/data/documents";
import { getDocumentTemplates, getMarketplaceItems, getOpportunities, getPastQuestions, getTools } from "@/lib/supabase/queries";

// Refetch on every request rather than caching a stale copy at build time —
// this is a small, low-traffic content set, so the extra round trip is cheap.
export const revalidate = 0;

export default async function HomePage() {
  const [tools, templates, opportunities, marketplaceItems, pastQuestions] = await Promise.all([
    getTools(),
    getDocumentTemplates(),
    getOpportunities(),
    getMarketplaceItems(),
    getPastQuestions({ limit: 20 }),
  ]);

  const popularTools = tools.filter((tool) => tool.popular);
  const homeDocuments = homeDocumentIds
    .map((id) => templates.find((template) => template.id === id))
    .filter((template): template is NonNullable<typeof template> => Boolean(template));
  const homeOpportunities = opportunities.slice(0, 4);
  const homeMarketplaceItems = marketplaceItems.slice(0, 3);

  const recentItems = [
    ...marketplaceItems.map((m) => ({ id: m.id, title: m.title, href: m.href, createdAt: m.postedAt, kind: "marketplace" as const })),
    ...opportunities.filter((o) => o.createdAt).map((o) => ({ id: o.id, title: o.title, href: o.href, createdAt: o.createdAt!, kind: "opportunity" as const })),
    ...pastQuestions.map((p) => ({ id: p.id, title: p.title, href: `/past-questions/${p.id}`, createdAt: p.createdAt, kind: "past_question" as const })),
  ];

  return (
    <>
      {/* Featured slides are curated marketing content, not a data list — kept local. */}
      <FeaturedHero slides={featuredSlides} />
      <RecentlyAdded items={recentItems} />
      <PopularTools tools={popularTools} />
      {/* Sample messages for the marketing teaser — the real inbox (built and
          live at /account/anonymous) intentionally isn't shown here, since a
          public homepage can't display anyone's actual private messages. */}
      <AnonymousShowcase messages={anonymousSamples} />
      <DocumentShowcase templates={homeDocuments} />
      <OpportunityList items={homeOpportunities} />
      <MarketplacePreview items={homeMarketplaceItems} />
      <PageEnding />
    </>
  );
}
