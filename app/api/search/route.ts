import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { id: string; label: string; group: string; hint: string; href: string };

const PER_GROUP_LIMIT = 5;

/**
 * Unified search across CampusKit-controlled content. All five queries use
 * the RLS-scoped server client, so drafts/unpublished rows never leak here
 * even though this route itself doesn't require auth.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const supabase = createSupabaseServerClient();

  if (!q) {
    // Empty-state: a handful of popular tools, same as the old default.
    const { data: tools } = await supabase
      .from("tools")
      .select("id, name, description, href")
      .eq("status", "published")
      .eq("popular", true)
      .limit(5);
    const results: Result[] = (tools ?? []).map((t) => ({
      id: `tool-${t.id}`,
      label: t.name,
      group: "Tools",
      hint: t.description,
      href: t.href,
    }));
    return NextResponse.json({ results });
  }

  const like = `%${q}%`;

  const [tools, opportunities, marketplace, documents, pastQuestions] = await Promise.all([
    supabase
      .from("tools")
      .select("id, name, description, href")
      .eq("status", "published")
      .or(`name.ilike.${like},description.ilike.${like}`)
      .limit(PER_GROUP_LIMIT),
    supabase
      .from("opportunities")
      .select("id, title, organization, category, href")
      .eq("status", "published")
      .or(`title.ilike.${like},organization.ilike.${like}`)
      .limit(PER_GROUP_LIMIT),
    supabase
      .from("marketplace_items")
      .select("id, title, location, condition")
      .neq("status", "draft")
      .ilike("title", like)
      .limit(PER_GROUP_LIMIT),
    supabase
      .from("document_templates")
      .select("id, name, use_case")
      .eq("status", "published")
      .or(`name.ilike.${like},use_case.ilike.${like}`)
      .limit(PER_GROUP_LIMIT),
    supabase
      .from("past_questions")
      .select("id, title, course_code, department")
      .eq("status", "published")
      .or(`title.ilike.${like},course_code.ilike.${like},department.ilike.${like}`)
      .limit(PER_GROUP_LIMIT),
  ]);

  const results: Result[] = [
    ...(tools.data ?? []).map((t) => ({ id: `tool-${t.id}`, label: t.name, group: "Tools", hint: t.description, href: t.href })),
    ...(opportunities.data ?? []).map((o) => ({
      id: `opp-${o.id}`,
      label: o.title,
      group: "Opportunities",
      hint: `${o.organization} · ${o.category}`,
      href: o.href,
    })),
    ...(marketplace.data ?? []).map((m) => ({
      id: `market-${m.id}`,
      label: m.title,
      group: "Marketplace",
      hint: `${m.location} · ${m.condition}`,
      href: `/marketplace/${m.id}`,
    })),
    ...(documents.data ?? []).map((d) => ({
      id: `doc-${d.id}`,
      label: d.name,
      group: "Documents",
      hint: d.use_case,
      href: `/documents?type=${d.id}`,
    })),
    ...(pastQuestions.data ?? []).map((p) => ({
      id: `pq-${p.id}`,
      label: `${p.course_code} — ${p.title}`,
      group: "Past questions",
      hint: p.department,
      href: `/past-questions/${p.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
