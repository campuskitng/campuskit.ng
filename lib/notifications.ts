import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/lib/types";

/**
 * Notifications are inserted only by DB triggers (anonymous message,
 * payment success — see supabase/schema.sql section 12) or the
 * opportunity-deadline cron using the admin client. Nothing here ever
 * inserts a notification directly, so there's no path for a client to
 * fabricate one.
 */

const PAGE_SIZE = 20;

type NotificationRow = {
  id: string;
  type: NotificationItem["type"];
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/**
 * Keyset pagination by created_at: pass the `createdAt` of the last item
 * you received as `cursor` to get the next page. Never fetches the whole
 * table — bounded to PAGE_SIZE per call, by design (see brief section 7/9).
 */
export async function getNotifications(cursor?: string): Promise<{ items: NotificationItem[]; nextCursor: string | null }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], nextCursor: null };

  let query = supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;
  const items = (data ?? []).map(mapNotification);
  const nextCursor = items.length === PAGE_SIZE ? items[items.length - 1].createdAt : null;
  return { items, nextCursor };
}

/** Cheap count query (uses the partial `read_at is null` index) — never
 * fetches rows, just a count, so it's safe to call on every page load. */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  return count ?? 0;
}
