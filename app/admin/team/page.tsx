import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RoleToggle } from "../users/[id]/RoleToggle";

export const revalidate = 0;

export default async function AdminTeamPage() {
  const supabase = createSupabaseServerClient();
  const { data: admins } = await supabase.from("profiles").select("*").eq("role", "admin").order("display_name");

  return (
    <div className="max-w-2xl">
      <h1 className="text-section font-semibold text-ink">Team</h1>
      <p className="mt-1 text-label text-muted">{admins?.length ?? 0} admin accounts.</p>
      <p className="mt-1 text-meta text-muted">
        To add someone, have them create a CampusKit account, then promote them from{" "}
        <Link href="/admin/users" className="font-medium text-brand hover:text-brand-700">Users</Link>.
      </p>

      <ul className="mt-5 divide-y divide-hairline rounded-card border border-hairline bg-surface">
        {(admins ?? []).map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-label font-medium text-ink">{member.display_name}</p>
              <p className="text-meta text-muted">@{member.username}</p>
            </div>
            <RoleToggle userId={member.id} role={member.role} />
          </li>
        ))}
        {(!admins || admins.length === 0) ? (
          <li className="p-6 text-center text-meta text-muted">No admins yet — the first admin must be promoted directly in Supabase (set profiles.role = 'admin').</li>
        ) : null}
      </ul>
    </div>
  );
}
