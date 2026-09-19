import { NextResponse, type NextRequest } from "next/server";
import { getUserTransactions } from "@/lib/account-queries";

// Backs the "Load more" button on /account/transactions — never returns
// more than one page (see PAGE_SIZE in lib/account-queries.ts).
export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const { items, nextCursor } = await getUserTransactions(cursor);
  return NextResponse.json({ items, nextCursor });
}
