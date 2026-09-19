import { MarketplaceClient } from "./MarketplaceClient";
import { getMarketplaceItems } from "@/lib/supabase/queries";

export const revalidate = 0;

export default async function MarketplacePage() {
  const items = await getMarketplaceItems();
  return <MarketplaceClient items={items} />;
}
