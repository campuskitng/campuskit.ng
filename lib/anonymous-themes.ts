import type { AnonymousCardTheme } from "@/lib/types";

/**
 * A small, tasteful set of themes (brief: "not dozens of options") shared by
 * the on-screen preview (components/anonymous/ThemedMessageCard.tsx) and the
 * server-rendered downloadable PNG (app/api/anonymous/card/[id]/route.tsx).
 * Plain inline-style tokens rather than Tailwind classes because the PNG
 * route runs through `next/og`'s satori renderer, which doesn't process
 * Tailwind — keeping both consumers on the same token object is what keeps
 * them looking like the same card.
 */
export const ANONYMOUS_CARD_THEME_STYLES: Record<
  AnonymousCardTheme,
  { label: string; gradient: string; text: string; subtext: string; chip: string; chipText: string }
> = {
  aurora: {
    label: "Aurora",
    gradient: "linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%)",
    text: "#FFFFFF",
    subtext: "rgba(255,255,255,0.8)",
    chip: "rgba(255,255,255,0.16)",
    chipText: "#FFFFFF",
  },
  midnight: {
    label: "Midnight",
    gradient: "linear-gradient(135deg, #0F172A 0%, #312E81 100%)",
    text: "#F8FAFC",
    subtext: "rgba(248,250,252,0.72)",
    chip: "rgba(248,250,252,0.12)",
    chipText: "#F8FAFC",
  },
  sunset: {
    label: "Sunset",
    gradient: "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
    text: "#FFFFFF",
    subtext: "rgba(255,255,255,0.85)",
    chip: "rgba(255,255,255,0.18)",
    chipText: "#FFFFFF",
  },
};
