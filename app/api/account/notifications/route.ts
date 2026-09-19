import { NextResponse, type NextRequest } from "next/server";
import { getNotifications } from "@/lib/notifications";

// Backs the "Load more" button on /account/notifications — never returns
// more than one page (see PAGE_SIZE in lib/notifications.ts). Auth is
// enforced inside getNotifications() (returns empty for signed-out callers);
// RLS is the real gate underneath that.
export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const { items, nextCursor } = await getNotifications(cursor);
  return NextResponse.json({ items, nextCursor });
}
