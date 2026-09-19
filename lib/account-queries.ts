import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export type TransactionItem = {
  id: string;
  reference: string;
  purpose: string;
  productId: string;
  productName: string | null;
  amountKobo: number;
  currency: string;
  status: string;
  channel: string | null;
  createdAt: string;
};

/**
 * Keyset pagination by created_at (backed by `payments_user_created_idx`).
 * Never loads a user's whole payment history at once — only PAGE_SIZE rows
 * per call, however many transactions they've made over time. Pass the
 * `createdAt` of the last row you received as `cursor` for the next page.
 */
export async function getUserTransactions(cursor?: string): Promise<{ items: TransactionItem[]; nextCursor: string | null }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], nextCursor: null };

  let query = supabase
    .from("payments")
    .select("id, reference, purpose, product_id, amount_kobo, currency, status, channel, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];

  // The `payments.product_id` pointer is deliberately polymorphic (not an
  // FK — see "Key architectural decisions" in docs/IMPLEMENTATION_STATUS.md)
  // so document names are resolved with one small follow-up query, batched
  // for the whole page rather than per row.
  const documentIds = rows.filter((r) => r.purpose === "document_template").map((r) => r.product_id);
  const nameById = new Map<string, string>();
  if (documentIds.length > 0) {
    const { data: templates } = await supabase.from("document_templates").select("id, name").in("id", documentIds);
    for (const t of templates ?? []) nameById.set(t.id, t.name);
  }

  const items: TransactionItem[] = rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    purpose: row.purpose,
    productId: row.product_id,
    productName: nameById.get(row.product_id) ?? null,
    amountKobo: row.amount_kobo,
    currency: row.currency,
    status: row.status,
    channel: row.channel,
    createdAt: row.created_at,
  }));

  const nextCursor = items.length === PAGE_SIZE ? items[items.length - 1].createdAt : null;
  return { items, nextCursor };
}
