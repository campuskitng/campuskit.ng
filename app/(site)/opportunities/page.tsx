import { OpportunitiesClient } from "./OpportunitiesClient";
import { getOpportunities } from "@/lib/supabase/queries";

export const revalidate = 0;

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  return <OpportunitiesClient opportunities={opportunities} />;
}
