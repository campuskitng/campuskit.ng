"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper so app/layout.tsx (a Server Component) can render this
 * without itself becoming a Client Component. attribute="class" is what
 * makes it toggle Tailwind's `dark:` variant / our CSS-variable tokens by
 * adding `.dark` to <html>; defaultTheme="system" is the brief's required
 * default, and it only applies before any explicit choice exists in
 * localStorage (see components/ThemeSync.tsx for how a signed-in user's
 * saved preference takes over from there).
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
