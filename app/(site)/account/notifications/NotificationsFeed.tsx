"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, MessageCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/notification-actions";
import { timeAgo } from "@/lib/format-time";
import type { NotificationItem } from "@/lib/types";

const ICONS: Record<NotificationItem["type"], typeof Bell> = {
  anonymous_message: MessageCircle,
  payment_success: PartyPopper,
  opportunity_deadline: Bell,
  system: Bell,
};

export function NotificationsFeed({
  initialItems,
  initialCursor,
}: {
  initialItems: NotificationItem[];
  initialCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [, startTransition] = useTransition();

  const unreadCount = items.filter((i) => !i.readAt).length;

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    const res = await fetch(`/api/account/notifications?cursor=${encodeURIComponent(cursor)}`);
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setLoadingMore(false);
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, readAt: new Date().toISOString() } : i)));
    startTransition(() => {
      markNotificationReadAction(id);
    });
  }

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  return (
    <div>
      {unreadCount > 0 ? (
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={markAllRead} className="flex items-center gap-1.5 text-label font-medium text-brand hover:text-brand-700">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all read
          </button>
        </div>
      ) : null}

      <div className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = ICONS[item.type];
            const isUnread = !item.readAt;
            const content = (
              <div className={`flex items-start gap-3 px-4 py-3.5 ${isUnread ? "bg-brand-soft/30" : ""}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-body ${isUnread ? "font-semibold text-ink" : "text-ink/80"}`}>{item.title}</p>
                  {item.body ? <p className="mt-0.5 line-clamp-2 text-label text-muted">{item.body}</p> : null}
                  <p className="mt-1 text-meta text-muted">{timeAgo(item.createdAt)}</p>
                </div>
                {isUnread ? <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" /> : null}
              </div>
            );
            return item.link ? (
              <Link key={item.id} href={item.link} onClick={() => isUnread && markRead(item.id)} className="block transition-colors hover:bg-canvas">
                {content}
              </Link>
            ) : (
              <div key={item.id} onClick={() => isUnread && markRead(item.id)} className="cursor-pointer transition-colors hover:bg-canvas">
                {content}
              </div>
            );
          })
        ) : (
          <p className="p-8 text-center text-label text-muted">
            Nothing yet. You&apos;ll see new anonymous messages, successful payments, and opportunity reminders here.
          </p>
        )}
      </div>

      {cursor ? (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
