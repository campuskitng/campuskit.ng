import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageIcon, MessageCircle, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format-time";

export const revalidate = 0;

// A personal inbox rather than an open feed, but still bounded — a link
// that's been shared widely could receive a lot of messages, and this is a
// page load, not a chat scrollback.
const INBOX_LIMIT = 50;

export default async function AnonymousInboxPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account/anonymous");

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();

  const { data: messages } = await supabase
    .from("anonymous_messages")
    .select("id, body, image_path, reply_body, read_at, created_at")
    .neq("status", "removed")
    .neq("status", "expired")
    .order("read_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false })
    .limit(INBOX_LIMIT);

  const unreadCount = (messages ?? []).filter((m) => !m.read_at).length;

  return (
    <div className="shell max-w-xl pb-16 pt-8 sm:pt-10">
      <header>
        <p className="eyebrow">Anonymous</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Your messages</h1>
        <p className="mt-2 flex items-center gap-1.5 text-label text-muted">
          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
          campuskit.ng/anonymous/{profile?.username} · messages disappear after 24 hours
        </p>
        <Link href={`/anonymous/${profile?.username}`} className="mt-1 inline-block text-label font-medium text-brand hover:text-brand-700">
          View your public link
        </Link>
      </header>

      <div className="mt-6 divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
            const isUnread = !message.read_at;
            return (
              <Link
                key={message.id}
                href={`/account/anonymous/${message.id}`}
                className={`flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-canvas ${isUnread ? "bg-brand-soft/30" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? "bg-brand" : "bg-transparent"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-body ${isUnread ? "font-semibold text-ink" : "text-ink/80"}`}>
                    {message.body || "Sent you an image"}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-meta text-muted">
                    <span>{timeAgo(message.created_at)}</span>
                    {message.image_path ? (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" aria-hidden="true" /> Image
                      </span>
                    ) : null}
                    {message.reply_body ? (
                      <span className="flex items-center gap-1 text-brand">
                        <MessageCircle className="h-3 w-3" aria-hidden="true" /> Replied
                      </span>
                    ) : null}
                  </div>
                </div>
                {isUnread ? (
                  <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-meta font-medium text-white">New</span>
                ) : null}
              </Link>
            );
          })
        ) : (
          <p className="p-8 text-center text-label text-muted">
            No messages yet. Share your link to start receiving them.
          </p>
        )}
      </div>

      {messages && messages.length === INBOX_LIMIT ? (
        <p className="mt-3 text-center text-meta text-muted">
          Showing your {INBOX_LIMIT} most recent messages{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}.
        </p>
      ) : null}
    </div>
  );
}
