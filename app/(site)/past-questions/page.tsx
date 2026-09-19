import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Search } from "lucide-react";
import { getPastQuestionDepartments, getPastQuestions } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Past Questions", description: "Browse past exam questions by department and course." };
export const revalidate = 0;

export default async function PastQuestionsPage({
  searchParams,
}: {
  searchParams?: { department?: string; q?: string };
}) {
  const [questions, departments] = await Promise.all([
    getPastQuestions({ department: searchParams?.department, q: searchParams?.q }),
    getPastQuestionDepartments(),
  ]);

  return (
    <div className="shell pb-16 pt-8 sm:pt-10">
      <header className="max-w-[46ch]">
        <p className="eyebrow">Academic resources</p>
        <h1 className="mt-1 text-display font-semibold tracking-tight text-ink">Past questions</h1>
        <p className="mt-2 text-body text-muted">Curated by CampusKit. Browse by department or search a course code.</p>
      </header>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            name="q"
            defaultValue={searchParams?.q}
            placeholder="Search by course code or title…"
            className="field-input pl-9"
          />
        </div>
        <select name="department" defaultValue={searchParams?.department ?? ""} className="field-input sm:w-56">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="rounded-control border border-hairline bg-canvas px-4 py-2 text-label font-medium text-ink hover:border-brand/40">
          Filter
        </button>
      </form>

      <ul className="mt-8 divide-y divide-hairline border-t border-hairline">
        {questions.length > 0 ? (
          questions.map((q) => (
            <li key={q.id}>
              <Link href={`/past-questions/${q.id}`} className="group flex min-h-[68px] items-center gap-3.5 py-3.5 transition-colors hover:bg-surface/80 sm:px-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-medium text-ink group-hover:text-brand-700">{q.courseCode} — {q.title}</p>
                  <p className="mt-0.5 text-label text-muted">{q.institution} · {q.department} · {q.session}</p>
                </div>
                <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
              </Link>
            </li>
          ))
        ) : (
          <li className="py-12 text-center text-label text-muted">No past questions match that search yet.</li>
        )}
      </ul>
    </div>
  );
}
