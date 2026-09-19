"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Every mutation here runs through the RLS-scoped server client — the
// `is_admin()` policies on each table are the actual enforcement. If the
// caller isn't an admin, these silently affect 0 rows (RLS denies), which
// is why each action also re-checks and surfaces a clear error.

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, user, isAdmin: profile?.role === "admin" };
}

async function audit(supabase: ReturnType<typeof createSupabaseServerClient>, adminId: string, action: string, entityType: string, entityId: string) {
  await supabase.from("admin_audit_log").insert({ admin_id: adminId, action, entity_type: entityType, entity_id: entityId });
}

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

// --- Tools -----------------------------------------------------------------

export async function createToolAction(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const name = String(formData.get("name") ?? "").trim();
  const id = slugify(String(formData.get("id") ?? name));
  const row = {
    id,
    name,
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? "sparkles"),
    href: String(formData.get("href") ?? `/tools/${id}`),
    category: String(formData.get("category") ?? "academics"),
    popular: formData.get("popular") === "on",
    is_new: formData.get("is_new") === "on",
    status: "published",
  };
  const { error } = await supabase.from("tools").insert(row);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "create", "tool", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return { ok: true };
}

export async function deleteToolAction(id: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };
  await supabase.from("tools").delete().eq("id", id);
  await audit(supabase, user.id, "delete", "tool", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export async function toggleToolStatusAction(id: string, currentStatus: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  const next = currentStatus === "published" ? "draft" : "published";
  await supabase.from("tools").update({ status: next }).eq("id", id);
  await audit(supabase, user.id, "update_status", "tool", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export async function updateToolAction(id: string, formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const row = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? "sparkles"),
    href: String(formData.get("href") ?? ""),
    category: String(formData.get("category") ?? "academics"),
    popular: formData.get("popular") === "on",
    is_new: formData.get("is_new") === "on",
    note: String(formData.get("note") ?? "") || null,
  };
  if (!row.name) return { error: "Name is required." };

  const { error } = await supabase.from("tools").update(row).eq("id", id);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "update", "tool", id);
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/admin/tools/${id}/edit`);
  return { ok: true };
}

// --- Opportunities -----------------------------------------------------------

export async function createOpportunityAction(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const title = String(formData.get("title") ?? "").trim();
  const id = slugify(`${title}-${Date.now().toString(36)}`);
  const row = {
    id,
    title,
    organization: String(formData.get("organization") ?? ""),
    category: String(formData.get("category") ?? "Scholarship"),
    deadline: String(formData.get("deadline") ?? new Date().toISOString().slice(0, 10)),
    eligibility: String(formData.get("eligibility") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    href: `/opportunities/${id}`,
    status: "published",
    created_by: user.id,
  };
  const { error } = await supabase.from("opportunities").insert(row);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "create", "opportunity", id);
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  return { ok: true };
}

export async function deleteOpportunityAction(id: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("opportunities").delete().eq("id", id);
  await audit(supabase, user.id, "delete", "opportunity", id);
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
}

export async function updateOpportunityAction(id: string, formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const row = {
    title: String(formData.get("title") ?? "").trim(),
    organization: String(formData.get("organization") ?? ""),
    category: String(formData.get("category") ?? "Scholarship"),
    deadline: String(formData.get("deadline") ?? new Date().toISOString().slice(0, 10)),
    eligibility: String(formData.get("eligibility") ?? "") || null,
    location: String(formData.get("location") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    status: String(formData.get("status") ?? "published"),
  };
  if (!row.title) return { error: "Title is required." };

  const { error } = await supabase.from("opportunities").update(row).eq("id", id);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "update", "opportunity", id);
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
  revalidatePath(`/admin/opportunities/${id}/edit`);
  return { ok: true };
}

// --- Marketplace ---------------------------------------------------------

export async function createMarketplaceItemAction(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const title = String(formData.get("title") ?? "").trim();
  const id = slugify(`${title}-${Date.now().toString(36)}`);
  const image = String(formData.get("image") ?? "");
  const row = {
    id,
    title,
    description: String(formData.get("description") ?? "") || null,
    price: Number(formData.get("price") ?? 0),
    location: String(formData.get("location") ?? ""),
    category: String(formData.get("category") ?? "General"),
    condition: String(formData.get("condition") ?? "Good"),
    image,
    images: image ? [image] : [],
    seller: "CampusKit",
    status: "available",
    href: `/marketplace/${id}`,
    whatsapp_contact: String(formData.get("whatsappContact") ?? "").trim() || null,
  };
  const { error } = await supabase.from("marketplace_items").insert(row);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "create", "marketplace_item", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace");
  return { ok: true };
}

export async function deleteMarketplaceItemAction(id: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("marketplace_items").delete().eq("id", id);
  await audit(supabase, user.id, "delete", "marketplace_item", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace");
}

export async function setMarketplaceStatusAction(id: string, status: "available" | "reserved" | "sold" | "draft") {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("marketplace_items").update({ status }).eq("id", id);
  await audit(supabase, user.id, "update_status", "marketplace_item", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace");
}

export async function updateMarketplaceItemAction(id: string, formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const image = String(formData.get("image") ?? "");
  const row = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    price: Number(formData.get("price") ?? 0),
    location: String(formData.get("location") ?? ""),
    category: String(formData.get("category") ?? "General"),
    condition: String(formData.get("condition") ?? "Good"),
    image,
    images: image ? [image] : [],
    status: String(formData.get("status") ?? "available"),
    whatsapp_contact: String(formData.get("whatsappContact") ?? "").trim() || null,
  };
  if (!row.title) return { error: "Title is required." };

  const { error } = await supabase.from("marketplace_items").update(row).eq("id", id);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "update", "marketplace_item", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/marketplace");
  revalidatePath(`/admin/marketplace/${id}/edit`);
  return { ok: true };
}

// --- Document templates -----------------------------------------------------

export async function toggleDocumentStatusAction(id: string, currentStatus: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  const next = currentStatus === "published" ? "draft" : "published";
  await supabase.from("document_templates").update({ status: next }).eq("id", id);
  await audit(supabase, user.id, "update_status", "document_template", id);
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}

export async function setDocumentPriceAction(id: string, price: number) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("document_templates").update({ price, is_free: price <= 0 }).eq("id", id);
  await audit(supabase, user.id, "update_price", "document_template", id);
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
}

export async function createDocumentTemplateAction(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const id = slugify(`${name}-${Date.now().toString(36)}`);
  const price = Number(formData.get("price") ?? 0);

  const row: Record<string, unknown> = {
    id,
    name,
    use_case: String(formData.get("use_case") ?? ""),
    doc_group: String(formData.get("doc_group") ?? "Academic"),
    price,
    is_free: price <= 0,
    status: String(formData.get("status") ?? "draft"),
  };

  // Both come from the admin builder UI as JSON already assembled by the
  // client component — the admin never types or edits raw JSON directly
  // (see app/admin/documents/DocumentBuilderForm.tsx).
  try {
    row.fields = JSON.parse(String(formData.get("fields") ?? "[]"));
    row.layout = JSON.parse(String(formData.get("layout") ?? "null"));
  } catch {
    return { error: "Could not read the document structure. Try again." };
  }

  const { error } = await supabase.from("document_templates").insert(row);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "create", "document_template", id);
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
  return { ok: true, id };
}

export async function updateDocumentTemplateAction(id: string, formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const price = Number(formData.get("price") ?? 0);

  const row: Record<string, unknown> = {
    name,
    use_case: String(formData.get("use_case") ?? ""),
    doc_group: String(formData.get("doc_group") ?? "Academic"),
    price,
    is_free: price <= 0,
    status: String(formData.get("status") ?? "published"),
  };

  // The builder always resubmits the full structure it's editing — built
  // by the UI, not typed as raw JSON by the admin.
  const fieldsRaw = String(formData.get("fields") ?? "").trim();
  if (fieldsRaw) {
    try {
      row.fields = JSON.parse(fieldsRaw);
    } catch {
      return { error: "Could not read the fields. Try again." };
    }
  }
  const layoutRaw = String(formData.get("layout") ?? "").trim();
  if (layoutRaw) {
    try {
      row.layout = JSON.parse(layoutRaw);
    } catch {
      return { error: "Could not read the document structure. Try again." };
    }
  }

  const { error } = await supabase.from("document_templates").update(row).eq("id", id);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "update", "document_template", id);
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
  revalidatePath(`/admin/documents/${id}/edit`);
  return { ok: true };
}

// --- Past questions ----------------------------------------------------------

export async function createPastQuestionAction(formData: FormData) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Attach a PDF file." };
  if (file.type !== "application/pdf") return { error: "Only PDF files are supported." };

  const courseCode = String(formData.get("courseCode") ?? "").trim();
  const id = randomUUID();
  const path = `${slugify(String(formData.get("department") ?? "general"))}/${id}.pdf`;

  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage.from("past-questions").upload(path, bytes, { contentType: "application/pdf" });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase.from("past_questions").insert({
    id,
    title: String(formData.get("title") ?? courseCode),
    institution: String(formData.get("institution") ?? ""),
    department: String(formData.get("department") ?? ""),
    course_code: courseCode,
    course_title: String(formData.get("courseTitle") ?? "") || null,
    level: String(formData.get("level") ?? "") || null,
    session: String(formData.get("session") ?? ""),
    semester: String(formData.get("semester") ?? "") || null,
    file_path: path,
    file_size: file.size,
    status: "published",
    uploaded_by: user.id,
  });
  if (error) return { error: error.message };
  await audit(supabase, user.id, "create", "past_question", id);
  revalidatePath("/admin/past-questions");
  revalidatePath("/past-questions");
  return { ok: true };
}

export async function deletePastQuestionAction(id: string) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("past_questions").delete().eq("id", id);
  await audit(supabase, user.id, "delete", "past_question", id);
  revalidatePath("/admin/past-questions");
  revalidatePath("/past-questions");
}

// --- Anonymous moderation -----------------------------------------------------

export async function reviewReportAction(reportId: string, messageId: string, decision: "approved" | "removed") {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return;
  await supabase.from("anonymous_reports").update({ status: "reviewed", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", reportId);
  await supabase.from("anonymous_messages").update({ status: decision === "removed" ? "removed" : "active" }).eq("id", messageId);
  await audit(supabase, user.id, `report_${decision}`, "anonymous_message", messageId);
  revalidatePath("/admin/anonymous");
}

// --- Users ---------------------------------------------------------------

export async function setUserRoleAction(userId: string, role: "user" | "admin") {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Admin access required." };
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };
  await audit(supabase, user.id, "set_role", "profile", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}
