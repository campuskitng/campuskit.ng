"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { ThemePreference } from "@/lib/types";

/**
 * The account's saved preference (profiles.theme_preference) is the source
 * of truth across devices; next-themes' localStorage is only this
 * browser's instant-paint cache on top of it. This applies the DB value
 * once per session so a preference set on one device shows up on another
 * without waiting for the person to visit Appearance settings again.
 */
export function ThemeSync({ preference }: { preference: ThemePreference }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(preference);
    // Intentionally once per mount (this layout persists across client-side
    // navigation) — a live toggle in Appearance settings calls setTheme
    // directly and doesn't need this effect to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
