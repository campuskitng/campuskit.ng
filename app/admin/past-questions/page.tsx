import { StatusPill } from "@/components/admin/StatusPill";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deletePastQuestionAction } from "@/lib/admin-actions";
import { NewPastQuestionForm } from "./NewPastQuestionForm";

export const revalidate = 0;

export default async function AdminPastQuestionsPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase.from("past_questions").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <h1 className="text-section font-semibold text-ink">Past questions</h1>
      <p className="mt-1 text-label text-muted">{rows?.length ?? 0} uploaded. Files are stored privately; downloads use signed URLs.</p>

      <NewPastQuestionForm />

      <div className="mt-8 overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[640px] text-left text-label">
          <thead>
            <tr className="border-b border-hairline text-meta text-muted">
              <th scope="col" className="px-4 py-3 font-medium">Course</th>
              <th scope="col" className="px-4 py-3 font-medium">Department</th>
              <th scope="col" className="px-4 py-3 font-medium">Session</th>
              <th scope="col" className="px-4 py-3 font-medium">Downloads</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-canvas">
                <td className="px-4 py-3">
                  <p className="text-ink">{row.course_code}</p>
                  <p className="text-meta text-muted">{row.title}</p>
                </td>
                <td className="px-4 py-3 text-muted">{row.department}</td>
                <td className="px-4 py-3 text-muted">{row.session}</td>
                <td className="px-4 py-3 text-ink">{row.download_count}</td>
                <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                <td className="px-4 py-3 text-right"><DeleteButton id={row.id} onDelete={deletePastQuestionAction} label="past question" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
