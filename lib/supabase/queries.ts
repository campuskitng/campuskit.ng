import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DocumentTemplate, MarketplaceItem, Opportunity, Tool, ToolCategory } from "@/lib/types";

/**
 * Every function here returns exactly the shape lib/types.ts already
 * defines, so page and component code that used to import from /data/*.ts
 * doesn't need to change — only the import source and the `await` do.
 */

// A curated, admin-managed catalogue, not an open feed — bounded as a safety
// net (not a real pagination need yet at CampusKit's current scale), newest
// first so a growing catalogue doesn't silently hide new items behind old
// ones once it does exceed this. Per-user, ever-growing data (payments,
// notifications, anonymous inbox) uses real cursor pagination instead — see
// lib/notifications.ts and lib/account-queries.ts.
const CATALOGUE_LIMIT = 200;

// --- Tools -------------------------------------------------------------

type ToolRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  category: ToolCategory;
  popular: boolean | null;
  is_new: boolean | null;
  note: string | null;
};

function mapTool(row: ToolRow): Tool {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    href: row.href,
    category: row.category,
    popular: row.popular ?? undefined,
    isNew: row.is_new ?? undefined,
    note: row.note ?? undefined,
  };
}

export async function getTools(): Promise<Tool[]> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("tools").select("*").order("name").limit(CATALOGUE_LIMIT);
  if (error) throw error;
  return (data as ToolRow[] | null ?? []).map(mapTool);
}

// --- Opportunities -------------------------------------------------------

type OpportunityRow = {
  id: string;
  title: string;
  organization: string;
  category: Opportunity["category"];
  deadline: string;
  eligibility: string | null;
  location: string | null;
  href: string;
  created_at: string;
};

function mapOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    category: row.category,
    deadline: row.deadline,
    eligibility: row.eligibility ?? undefined,
    location: row.location ?? undefined,
    href: row.href,
    createdAt: row.created_at,
  };
}

export async function getOpportunities(): Promise<Opportunity[]> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("opportunities").select("*").order("deadline").limit(CATALOGUE_LIMIT);
  if (error) throw error;
  return (data as OpportunityRow[] | null ?? []).map(mapOpportunity);
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapOpportunity(data as OpportunityRow) : null;
}

// --- Marketplace ---------------------------------------------------------

type MarketplaceRow = {
  id: string;
  title: string;
  price: number;
  location: string;
  condition: MarketplaceItem["condition"];
  image: string;
  seller: string;
  posted_at: string;
  href: string;
  whatsapp_contact: string | null;
};

function mapMarketplaceItem(row: MarketplaceRow): MarketplaceItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    location: row.location,
    condition: row.condition,
    image: row.image,
    seller: row.seller,
    postedAt: row.posted_at,
    href: row.href,
    whatsappContact: row.whatsapp_contact,
  };
}

export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(CATALOGUE_LIMIT);
  if (error) throw error;
  return (data as MarketplaceRow[] | null ?? []).map(mapMarketplaceItem);
}

export async function getMarketplaceItemById(id: string): Promise<MarketplaceItem | null> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("marketplace_items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapMarketplaceItem(data as MarketplaceRow) : null;
}

// --- Document templates ---------------------------------------------------

type DocumentTemplateRow = {
  id: string;
  name: string;
  use_case: string;
  doc_group: DocumentTemplate["group"];
  price: number | null;
  fields: DocumentTemplate["fields"] | null;
  preview: DocumentTemplate["preview"] | null;
  layout: DocumentTemplate["layout"] | null;
};

function mapDocumentTemplate(row: DocumentTemplateRow): DocumentTemplate {
  return {
    id: row.id,
    name: row.name,
    useCase: row.use_case,
    group: row.doc_group,
    price: row.price ?? undefined,
    fields: row.fields ?? undefined,
    preview: row.preview ?? undefined,
    layout: row.layout ?? undefined,
  };
}

export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("document_templates").select("*").order("name").limit(CATALOGUE_LIMIT);
  if (error) throw error;
  return (data as DocumentTemplateRow[] | null ?? []).map(mapDocumentTemplate);
}

export async function getDocumentTemplate(id: string): Promise<DocumentTemplate | null> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("document_templates").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapDocumentTemplate(data as DocumentTemplateRow) : null;
}

// --- Past questions --------------------------------------------------------

export type PastQuestion = {
  id: string;
  title: string;
  institution: string;
  department: string;
  courseCode: string;
  courseTitle: string | null;
  level: string | null;
  session: string;
  semester: string | null;
  fileSize: number | null;
  downloadCount: number;
  createdAt: string;
};

type PastQuestionRow = {
  id: string;
  title: string;
  institution: string;
  department: string;
  course_code: string;
  course_title: string | null;
  level: string | null;
  session: string;
  semester: string | null;
  file_size: number | null;
  download_count: number;
  created_at: string;
};

function mapPastQuestion(row: PastQuestionRow): PastQuestion {
  return {
    id: row.id,
    title: row.title,
    institution: row.institution,
    department: row.department,
    courseCode: row.course_code,
    courseTitle: row.course_title,
    level: row.level,
    session: row.session,
    semester: row.semester,
    fileSize: row.file_size,
    downloadCount: row.download_count,
    createdAt: row.created_at,
  };
}

export async function getPastQuestions(filters?: { department?: string; q?: string; limit?: number }): Promise<PastQuestion[]> {
   const supabase = createSupabaseServerClient();
  let query = supabase.from("past_questions").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(filters?.limit ?? CATALOGUE_LIMIT);
  if (filters?.department) query = query.eq("department", filters.department);
  if (filters?.q) query = query.or(`title.ilike.%${filters.q}%,course_code.ilike.%${filters.q}%,course_title.ilike.%${filters.q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data as PastQuestionRow[] | null ?? []).map(mapPastQuestion);
}

export async function getPastQuestionById(id: string): Promise<PastQuestion | null> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("past_questions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapPastQuestion(data as PastQuestionRow) : null;
}

export async function getPastQuestionDepartments(): Promise<string[]> {
   const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("past_questions").select("department").eq("status", "published");
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((row) => row.department))).sort();
}
