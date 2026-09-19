"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  LayoutGrid,
  Menu,
  Settings,
  ShieldAlert,
  ShoppingBag,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: number };

function useNavItems(pendingReportsCount: number): NavItem[] {
  return [
    { label: "Overview", href: "/admin", icon: LayoutGrid },
    { label: "Users", href: "/admin/users", icon: Users },
    {
      label: "Anonymous",
      href: "/admin/anonymous",
      icon: ShieldAlert,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
    },
    { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
    { label: "Opportunities", href: "/admin/opportunities", icon: GraduationCap },
    { label: "Documents", href: "/admin/documents", icon: FileText },
    { label: "Past questions", href: "/admin/past-questions", icon: BookOpen },
    { label: "Tools", href: "/admin/tools", icon: Wrench },
    { label: "Team", href: "/admin/team", icon: UserCog },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];
}

export function AdminShell({
  children,
  pendingReportsCount = 0,
}: {
  children: React.ReactNode;
  pendingReportsCount?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = useNavItems(pendingReportsCount);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const activeLabel = navItems.find((item) => isActive(item.href))?.label ?? "Overview";

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-hairline bg-surface lg:flex lg:flex-col">
        <SidebarHeader />
        <nav aria-label="Admin" className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </nav>
        <SidebarFooter />
      </aside>

      {/* Mobile topbar + slide-over */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline bg-surface px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="rounded-control p-1.5 text-muted transition-colors hover:bg-brand-soft/60 hover:text-ink"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="text-title font-semibold text-ink">{activeLabel}</p>
          <Link
            href="/"
            className="text-meta font-medium text-muted transition-colors hover:text-ink"
          >
            Exit
          </Link>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex">
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            />
            <div className="relative flex h-full w-72 max-w-[80vw] flex-col bg-surface shadow-note">
              <div className="flex items-center justify-between px-4">
                <SidebarHeader compact />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close admin menu"
                  className="rounded-control p-1.5 text-muted hover:bg-brand-soft/60 hover:text-ink"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Admin" className="flex-1 space-y-0.5 px-3 py-4">
                {navItems.map((item) => (
                  <SidebarLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </nav>
              <SidebarFooter />
            </div>
          </div>
        ) : null}
      </div>

      <main id="main" className="min-w-0">
        {/* Desktop topbar */}
        <div className="hidden h-14 items-center justify-between border-b border-hairline bg-surface px-6 lg:flex">
          <p className="text-title font-semibold text-ink">{activeLabel}</p>
          <Link href="/" className="text-label font-medium text-muted transition-colors hover:text-ink">
            Exit to site
          </Link>
        </div>
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 ${compact ? "py-4" : "h-14 border-b border-hairline"}`}>
      <span
        aria-hidden="true"
        className="grid h-7 w-7 place-items-center rounded-[9px] bg-brand text-[13px] font-bold text-white"
      >
        C
      </span>
      <span className="text-title font-semibold text-ink">CampusKit</span>
      <span className="ml-auto rounded-full border border-hairline px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
        Admin
      </span>
    </div>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-label font-medium transition-colors ${
        active ? "bg-brand-soft text-brand-700" : "text-muted hover:bg-canvas hover:text-ink"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-hairline p-4">
      <p className="text-meta text-muted">CampusKit Admin</p>
    </div>
  );
}
