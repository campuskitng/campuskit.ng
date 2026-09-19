import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserTransactions } from "@/lib/account-queries";
import { TransactionsFeed } from "./TransactionsFeed";

export const revalidate = 0;

export default async function TransactionsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/transactions");

  const { items, nextCursor } = await getUserTransactions();

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Transaction history</h1>
        <p className="mt-2 text-body text-muted">Every payment tied to your account, most recent first.</p>
      </header>

      <div className="mt-6">
        <TransactionsFeed initialItems={items} initialCursor={nextCursor} />
      </div>
    </div>
  );
}
