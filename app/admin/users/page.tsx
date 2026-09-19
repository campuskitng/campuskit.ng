import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/admin/StatusPill";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

// Bounded admin list — a growing user base shouldn't mean loading every row
// into the browser on every page visit (brief section 9: "the same principle
// applies to admin pages"). Simple page-number pagination (rather than a
// keyset cursor) is the right fit here: an admin browsing/searching a table
// benefits from "page 2 of 5" and jumping around, which offset pagination
// supports directly and a cursor does not.
const PAGE_SIZE = 25;

export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (searchParams?.q) query = query.or(`username.ilike.%${searchParams.q}%,display_name.ilike.%${searchParams.q}%`);
  const { data: users, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const qParam = searchParams?.q ? `&q=${encodeURIComponent(searchParams.q)}` : "";

  return (
    <div className="max-w-5xl">
      <h1 className="text-section font-semibold text-ink">Users</h1>
      <p className="mt-1 text-label text-muted">{count ?? 0} registered students.</p>

      <form method="get" className="mt-5 max-w-xs">
        <input name="q" defaultValue={searchParams?.q} placeholder="Search name or username" className="field-input" />
      </form>

      <div className="mt-5 overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[640px] text-left text-label">
          <thead>
            <tr className="border-b border-hairline text-meta text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Student</th>
              <th scope="col" className="px-4 py-3 font-medium">Institution</th>
              <th scope="col" className="px-4 py-3 font-medium">Joined</th>
              <th scope="col" className="px-4 py-3 font-medium">Role</th>
              <th scope="col" className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {(users ?? []).map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-canvas">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{user.display_name}</p>
                  <p className="text-meta text-muted">@{user.username}</p>
                </td>
                <td className="px-4 py-3 text-ink">{user.institution ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusPill status={user.role === "admin" ? "active" : "pending"} /></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1 text-label font-medium text-brand hover:text-brand-700">
                    View <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No students match.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-label text-muted">
          <Link
            href={`/admin/users?page=${Math.max(1, page - 1)}${qParam}`}
            aria-disabled={page <= 1}
            className={`flex items-center gap-1 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:text-ink"}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
          </Link>
          <span>Page {page} of {totalPages}</span>
          <Link
            href={`/admin/users?page=${Math.min(totalPages, page + 1)}${qParam}`}
            aria-disabled={page >= totalPages}
            className={`flex items-center gap-1 ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:text-ink"}`}
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
