"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Download, Flag, Loader2, Palette, Reply, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemedMessageCard } from "@/components/anonymous/ThemedMessageCard";
import { deleteMessageAction, replyAction, reportMessageAction, setCardThemeAction } from "@/lib/anonymous-actions";
import { ANONYMOUS_CARD_THEME_STYLES } from "@/lib/anonymous-themes";
import { ANONYMOUS_CARD_THEMES, ANONYMOUS_REPORT_REASONS, type AnonymousCardTheme } from "@/lib/types";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  body: string;
  image_path: string | null;
  reply_body: string | null;
  created_at: string;
  card_theme: AnonymousCardTheme;
};

function ReplySubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Send reply"}
    </Button>
  );
}

function ReportPanel({ messageId, onDone }: { messageId: string; onDone: () => void }) {
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await reportMessageAction(messageId, reason, detail);
    setPending(false);
    if ("error" in res && res.error) setError(res.error);
    else onDone();
  }

  return (
    <div className="mt-3 rounded-control border border-hairline bg-canvas p-3">
      <p className="text-label font-medium text-ink">Why are you reporting this?</p>
      <div className="mt-2 grid gap-1.5">
        {ANONYMOUS_REPORT_REASONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-label text-ink">
            <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
            {r.label}
          </label>
        ))}
      </div>
      {reason === "other" ? (
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Tell us a bit more (optional)"
          rows={2}
          maxLength={300}
          className="field-input mt-2"
        />
      ) : null}
      {error ? <p className="mt-2 text-meta text-[#B42318]">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Submit report"}
        </Button>
      </div>
    </div>
  );
}

export function MessageDetail({ message, username }: { message: Message; username: string }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<AnonymousCardTheme>(message.card_theme);
  const [replyBody, setReplyBody] = useState(message.reply_body);
  const [replyOpen, setReplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [replyState, replyFormAction] = useFormState(replyAction, null);

  useEffect(() => {
    if (!message.image_path) return;
    fetch(`/api/anonymous/image?messageId=${message.id}`)
      .then((r) => r.json())
      .then((d) => setImageUrl(d.url ?? null))
      .catch(() => {});
  }, [message.id, message.image_path]);

  // The reply lives in local state rather than reading message.reply_body
  // directly: revalidatePath("/account/anonymous") refreshes the inbox list,
  // not this dynamic [id] page's already-mounted props, so without this the
  // card would keep showing "no reply yet" until a manual refresh.
  useEffect(() => {
    if (replyState && "success" in replyState && replyState.success) {
      setReplyBody(replyState.reply);
      setReplyOpen(false);
    }
  }, [replyState]);

  async function chooseTheme(next: AnonymousCardTheme) {
    setTheme(next);
    await setCardThemeAction(message.id, next);
  }

  function cycleTheme() {
    const currentIndex = ANONYMOUS_CARD_THEMES.indexOf(theme);
    const next = ANONYMOUS_CARD_THEMES[(currentIndex + 1) % ANONYMOUS_CARD_THEMES.length];
    chooseTheme(next);
  }

  const cardUrl = `/api/anonymous/card/${message.id}?theme=${theme}`;

  async function shareCard() {
    setSharing(true);
    try {
      const res = await fetch(cardUrl);
      const blob = await res.blob();
      const file = new File([blob], "campuskit-anonymous.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "CampusKit", text: "Sent me this on CampusKit 👀" });
      } else {
        // Fall back to a plain download when the Web Share API (or file
        // sharing specifically) isn't available on this browser.
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "campuskit-anonymous.png";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // Share was cancelled or failed silently — no error state needed for
      // a share sheet the person may have just dismissed.
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      <div className="relative">
        <ThemedMessageCard theme={theme} body={message.body} imageUrl={imageUrl} replyBody={replyBody} username={username} />
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={`Change card theme (currently ${ANONYMOUS_CARD_THEME_STYLES[theme].label})`}
          title="Change theme"
          className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-black/20 text-white shadow-control backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-center text-meta text-muted">Tap the palette to try another look — {ANONYMOUS_CARD_THEME_STYLES[theme].label}</p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={shareCard} disabled={sharing}>
          {sharing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
          Share
        </Button>
        <a href={cardUrl} download="campuskit-anonymous.png" className="inline-flex h-11 items-center justify-center gap-2 rounded-control border border-hairline bg-surface px-4 text-body font-medium text-ink shadow-control transition-colors hover:border-brand/40">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </a>
      </div>

      <div className="mt-6 rounded-card border border-hairline bg-surface p-4">
        {replyBody ? (
          <p className="text-label text-muted">You already replied to this message.</p>
        ) : replyOpen ? (
          <form action={replyFormAction} className="flex items-center gap-2">
            <input type="hidden" name="messageId" value={message.id} />
            <input name="reply" required maxLength={500} className="field-input" placeholder="Write a reply…" autoFocus />
            <ReplySubmit />
          </form>
        ) : (
          <button type="button" onClick={() => setReplyOpen(true)} className="flex items-center gap-1.5 text-label font-medium text-brand hover:text-brand-700">
            <Reply className="h-4 w-4" aria-hidden="true" /> Reply — your reply appears on the shareable card
          </button>
        )}
        {replyState?.error ? <p className="mt-2 text-meta text-[#B42318]">{replyState.error}</p> : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
        <p className="text-meta text-muted">{new Date(message.created_at).toLocaleString()}</p>
        <div className="flex items-center gap-4">
          {!reportSent ? (
            <button type="button" onClick={() => setReportOpen((v) => !v)} className="flex items-center gap-1.5 text-label font-medium text-muted hover:text-ink">
              <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-meta text-muted">
              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Reported
            </span>
          )}
          <button
            type="button"
            onClick={async () => {
              await deleteMessageAction(message.id);
              router.push("/account/anonymous");
            }}
            className="flex items-center gap-1.5 text-label font-medium text-muted hover:text-[#B42318]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
          </button>
        </div>
      </div>
      {reportOpen && !reportSent ? <ReportPanel messageId={message.id} onDone={() => { setReportSent(true); setReportOpen(false); }} /> : null}
    </div>
  );
}
