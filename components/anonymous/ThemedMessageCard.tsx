"use client";

import { MessageCircle } from "lucide-react";
import { ANONYMOUS_CARD_THEME_STYLES } from "@/lib/anonymous-themes";
import type { AnonymousCardTheme } from "@/lib/types";

export function ThemedMessageCard({
  theme,
  body,
  imageUrl,
  replyBody,
  username,
}: {
  theme: AnonymousCardTheme;
  body: string;
  imageUrl?: string | null;
  replyBody?: string | null;
  username: string;
}) {
  const t = ANONYMOUS_CARD_THEME_STYLES[theme];

  return (
    <div
      style={{ background: t.gradient, color: t.text }}
      className="mx-auto flex aspect-[4/5] w-full max-w-sm flex-col justify-between rounded-panel p-6 shadow-note sm:p-7"
    >
      <div>
        <span
          style={{ background: t.chip, color: t.chipText }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-meta font-medium"
        >
          💬 Anonymous message
        </span>

        <p className="mt-6 text-[1.375rem] font-semibold leading-snug tracking-tight sm:text-[1.5rem]">
          {body}
        </p>

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Attached image" className="mt-4 max-h-48 w-full rounded-control object-cover" />
        ) : null}
      </div>

      <div>
        {replyBody ? (
          <div
            style={{ background: t.chip }}
            className="mb-4 rounded-control p-3.5"
          >
            <p style={{ color: t.subtext }} className="flex items-center gap-1.5 text-meta font-medium">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Reply
            </p>
            <p className="mt-1 text-body leading-snug">{replyBody}</p>
          </div>
        ) : null}

        <div style={{ color: t.subtext }} className="flex items-center justify-between text-meta">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-white/20 text-[10px] font-bold">C</span>
            CampusKit
          </span>
          <span>campuskit.ng/anonymous/{username}</span>
        </div>
      </div>
    </div>
  );
}
