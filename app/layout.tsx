import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CampusKit",
    template: "%s · CampusKit",
  },
  description:
    "Past questions, formal documents, opportunities and a campus marketplace for Nigerian students.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F9FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout only owns <html>/<body>, fonts, theming and the skip link.
 * Chrome (Navbar/Footer for the public site, the sidebar shell for /admin)
 * lives in each route group's own layout, so admin never renders the
 * public nav. suppressHydrationWarning on <html> is the documented
 * next-themes requirement — it sets the class attribute before React
 * hydrates, which would otherwise mismatch server/client markup by design.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-canvas">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50
              focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-label focus:shadow-lift"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
