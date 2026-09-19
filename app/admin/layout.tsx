import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · CampusKit Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gates /admin/* to admin role — this is just for the
  // nav badge, not a security boundary, so a failed/zero count degrades
  // gracefully rather than throwing.
  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("anonymous_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return <AdminShell pendingReportsCount={count ?? 0}>{children}</AdminShell>;
}
