import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getPastQuestionById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isItemSaved } from "@/lib/saved-actions";
import { SaveButton } from "@/components/SaveButton";
import { DownloadButton } from "./DownloadButton";

export const revalidate = 0;

export default async function PastQuestionDetailPage({ params }: { params: { id: string } }) {
  const question = await getPastQuestionById(params.id);
  if (!question) notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const saved = await isItemSaved("past_question", params.id);

  return (
    <div className="shell max-w-2xl pb-16 pt-8 sm:pt-10">
      <p className="eyebrow">Past questions</p>
      <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">{question.courseCode} — {question.title}</h1>
      <div className="mt-3">
        <SaveButton itemType="past_question" itemId={params.id} initialSaved={saved} isAuthenticated={!!user} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-label sm:grid-cols-3">
        <div><dt className="text-muted">Institution</dt><dd className="text-ink">{question.institution}</dd></div>
        <div><dt className="text-muted">Department</dt><dd className="text-ink">{question.department}</dd></div>
        <div><dt className="text-muted">Session</dt><dd className="text-ink">{question.session}</dd></div>
        {question.level ? <div><dt className="text-muted">Level</dt><dd className="text-ink">{question.level}</dd></div> : null}
        {question.semester ? <div><dt className="text-muted">Semester</dt><dd className="text-ink">{question.semester}</dd></div> : null}
        <div><dt className="text-muted">Downloads</dt><dd className="text-ink">{question.downloadCount}</dd></div>
      </dl>

      <div className="mt-8 flex items-center gap-4 rounded-card border border-hairline bg-surface p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-700">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-ink">PDF{question.fileSize ? ` · ${(question.fileSize / 1024).toFixed(0)} KB` : ""}</p>
          <p className="text-meta text-muted">Published by CampusKit</p>
        </div>
        <DownloadButton id={question.id} />
      </div>
    </div>
  );
}
