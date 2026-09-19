"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LayoutDashboard, Menu, Search, User, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SearchOverlay } from "@/components/SearchOverlay";
import { signOutAction } from "@/lib/auth-actions";

const navLinks = [
  { label: "Tools", href: "/tools" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Marketplace", href: "/marketplace" },
];

type NavProfile = { username: string; display_name: string; role: string } | null;

export function Navbar({ profile, unreadNotifications = 0 }: { profile?: NavProfile; unreadNotifications?: number }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Route changes should never leave the mobile sheet hanging open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Cmd/Ctrl+K is what people already expect from a product like this.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur">
        <div className="shell flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-control text-title font-semibold tracking-tight text-ink"
            >
              <span
                aria-hidden="true"
                className="grid h-7 w-7 place-items-center rounded-[9px] bg-brand text-[13px] font-bold text-white"
              >
                C
              </span>
              CampusKit
            </Link>

            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={`rounded-control px-3 py-2 text-label font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-brand-soft text-brand-700"
                          : "text-muted hover:bg-brand-soft/60 hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              aria-label="Search CampusKit"
              className="text-muted hover:text-ink"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden text-muted lg:inline">Search</span>
              <kbd className="ml-1 hidden rounded border border-hairline bg-surface px-1.5 py-0.5 text-[11px] font-medium text-muted lg:inline">
                ⌘K
              </kbd>
            </Button>

            {profile ? (
              <ButtonLink
                href="/account/notifications"
                variant="ghost"
                size="sm"
                aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
                className="relative text-muted hover:text-ink"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
                {unreadNotifications > 0 ? (
                  <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-canvas" />
                ) : null}
              </ButtonLink>
            ) : null}

            <div className="hidden items-center gap-1.5 md:flex">
              {profile ? (
                <>
                  {profile.role === "admin" ? (
                    <ButtonLink href="/admin" variant="ghost" size="sm" className="text-muted hover:text-ink">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Admin
                    </ButtonLink>
                  ) : null}
                  <ButtonLink href="/account" variant="ghost" size="sm" className="text-muted hover:text-ink">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {profile.display_name}
                  </ButtonLink>
                  <form action={signOutAction}>
                    <Button variant="secondary" size="sm" type="submit">
                      Log out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <ButtonLink href="/login" variant="ghost" size="sm" className="text-muted hover:text-ink">
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/signup" size="sm">
                    Get started
                  </ButtonLink>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu: a short list, not a full-screen takeover. */}
        <div
          id="mobile-menu"
          hidden={!menuOpen}
          className="border-t border-hairline bg-surface md:hidden"
        >
          <nav aria-label="Mobile" className="shell py-2">
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`flex h-12 items-center rounded-control px-3 text-body font-medium ${
                      isActive(link.href) ? "text-brand-700" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2 border-t border-hairline pt-3 pb-1">
              {profile ? (
                <>
                  <ButtonLink href="/account" variant="secondary" className="flex-1">
                    {profile.display_name}
                  </ButtonLink>
                  <form action={signOutAction} className="flex-1">
                    <Button variant="secondary" type="submit" className="w-full">
                      Log out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <ButtonLink href="/login" variant="secondary" className="flex-1">
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/signup" className="flex-1">
                    Get started
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
