/**
 * Content shapes used across CampusKit.
 *
 * Every array in /data is typed with these, so replacing the mock modules with
 * Supabase queries later is a swap of the data source, not a UI rewrite.
 */

export type ToolCategory = "academics" | "documents" | "community" | "opportunities";

export type Tool = {
  id: string;
  name: string;
  description: string;
  /** Key into components/ui/Icon.tsx — kept as a string so it can come from a DB row. */
  icon: string;
  href: string;
  category: ToolCategory;
  popular?: boolean;
  isNew?: boolean;
  /** Shown as small metadata, e.g. "Free" or "From ₦500". */
  note?: string;
};

export type OpportunityCategory =
  | "Scholarship"
  | "Internship"
  | "Competition"
  | "Event"
  | "Fellowship";

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  /** ISO date string so it can be sorted and formatted per locale. */
  deadline: string;
  eligibility?: string;
  location?: string;
  href: string;
  createdAt?: string;
};

export type MarketplaceItem = {
  id: string;
  title: string;
  price: number;
  location: string;
  condition: "New" | "Like new" | "Good" | "Fair";
  image: string;
  seller: string;
  postedAt: string;
  href: string;
  /** Phone number or wa.me link the admin configured for this listing. */
  whatsappContact?: string | null;
};

// --- Anonymous report reasons ----------------------------------------------
// A fixed, structured set rather than free text — "other" is the only one
// that reveals a text field. Kept in one place so the picker UI, the report
// action, the API route, and the DB check constraint all agree.

export const ANONYMOUS_REPORT_REASONS = [
  { value: "harassment", label: "Harassment / bullying" },
  { value: "sexual_content", label: "Sexual content" },
  { value: "threats", label: "Threats" },
  { value: "hate_discrimination", label: "Hate / discrimination" },
  { value: "spam", label: "Spam" },
  { value: "personal_information", label: "Personal information" },
  { value: "other", label: "Other" },
] as const;

export type AnonymousReportReason = (typeof ANONYMOUS_REPORT_REASONS)[number]["value"];

export const ANONYMOUS_CARD_THEMES = ["aurora", "midnight", "sunset"] as const;
export type AnonymousCardTheme = (typeof ANONYMOUS_CARD_THEMES)[number];

export type ThemePreference = "system" | "light" | "dark";

export type NotificationType = "anonymous_message" | "payment_success" | "opportunity_deadline" | "system";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type DocumentField = {
  id: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "date" | "select";
  options?: string[];
  optional?: boolean;
};

export type DocumentTemplate = {
  id: string;
  name: string;
  /** One line describing when a student needs this. */
  useCase: string;
  group: "Academic" | "Financial" | "Career" | "Administrative";
  /** Interactive mock forms exist for templates with fields; others are listed only. */
  fields?: DocumentField[];
  preview?: {
    to: string;
    subject: string;
    body: string[];
  };
  /**
   * The admin-builder document structure (see below). New templates created
   * via /admin/documents/new use this; templates seeded before the builder
   * existed only have `preview` — lib/documents/render.ts supports both, so
   * neither needs migrating. A template never has both in normal use.
   */
  layout?: DocumentLayout;
  price?: number;
};

// --- Admin document builder ------------------------------------------------
// A small, fixed vocabulary of block types is deliberately simpler than a
// real document-editing model (no nested structures, no inline bold/italic
// runs within a paragraph) — enough to build a real Nigerian university
// letter without becoming a Word/Canva clone (brief section "ADMIN DOCUMENT
// TEMPLATE BUILDER"). Block text may contain `{{fieldId}}` tokens, inserted
// by the builder's "Insert field" control rather than typed by the admin.

export type DocumentBlockAlign = "left" | "center" | "right";

export type DocumentBlock =
  | { type: "heading"; text: string; size: "sm" | "md" | "lg"; align: DocumentBlockAlign; underline: boolean }
  | { type: "paragraph"; text: string; align: DocumentBlockAlign }
  | { type: "list"; style: "bullet" | "number"; items: string[] }
  | { type: "spacer"; size: "sm" | "md" | "lg" };

export type DocumentLayout = {
  /** Only A4 is supported for now (brief: "A4/document size") — kept as an
   * explicit field rather than a hardcoded assumption so a second page size
   * is a small addition later, not a rewrite. */
  pageSize: "A4";
  showDateLine: boolean;
  header: { show: boolean; institutionName: string } | null;
  addressBlock: { show: boolean; align: "left" | "right"; text: string } | null;
  /** `nameFieldId` is which of the template's own fields prints under the
   * signature line — explicit, because a new template's fields have no
   * fixed naming convention to guess from (unlike the handful of legacy
   * templates that all happen to use guarantorName/sponsorName/studentName). */
  signature: { show: boolean; placement: "left" | "right"; label: string; nameFieldId?: string } | null;
  blocks: DocumentBlock[];
};

export function emptyDocumentLayout(): DocumentLayout {
  return {
    pageSize: "A4",
    showDateLine: true,
    header: null,
    addressBlock: null,
    signature: { show: true, placement: "left", label: "Applicant" },
    blocks: [{ type: "paragraph", text: "", align: "left" }],
  };
}

/** Common fields a Nigerian-university document tends to need — quick-add
 * suggestions in the builder, not an exhaustive or required list. An admin
 * can still type any custom field/label. */
export const SUGGESTED_DOCUMENT_FIELDS: { label: string; type: DocumentField["type"] }[] = [
  { label: "Full Name", type: "text" },
  { label: "Matric Number", type: "text" },
  { label: "Department", type: "text" },
  { label: "Programme", type: "text" },
  { label: "Faculty", type: "text" },
  { label: "Academic Session", type: "text" },
  { label: "Level", type: "text" },
  { label: "Address", type: "textarea" },
  { label: "Phone Number", type: "text" },
];

export type FeaturedSlide = {
  id: string;
  kind: "event" | "tool";
  /** Small label above the title: "Upcoming", "Popular this week", etc. */
  tag: string;
  title: string;
  blurb: string;
  meta?: string[];
  image: string;
  imageAlt: string;
  ctaLabel: string;
  href: string;
};

export type AnonymousProfile = {
  id: string;
  username: string;
  displayName: string;
};

export type AnonymousReply = {
  body: string;
  createdAt: string;
};

// --- Admin dashboard -------------------------------------------------------
// Kept in the same file as the rest of the content shapes: one place to swap
// for generated Supabase types later.

export type AdminUserStatus = "active" | "suspended" | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  institution: string;
  joinedAt: string;
  status: AdminUserStatus;
  documentsCount: number;
  listingsCount: number;
  anonymousMessagesCount: number;
};

export type AdminActivityKind = "document" | "marketplace" | "anonymous" | "opportunity" | "user";

export type AdminActivity = {
  id: string;
  kind: AdminActivityKind;
  summary: string;
  actor: string;
  occurredAt: string;
};

export type ModerationStatus = "flagged" | "approved" | "removed";

export type AnonymousModerationItem = {
  id: string;
  body: string;
  reportedReason: string;
  reportedAt: string;
  status: ModerationStatus;
};

export type MarketplaceModerationItem = {
  id: string;
  listingId: string;
  reportedReason: string;
  reportedAt: string;
  status: ModerationStatus;
};

export type DocumentOrderStatus = "paid" | "pending" | "refunded";

export type DocumentOrder = {
  id: string;
  documentName: string;
  buyer: string;
  amount: number;
  status: DocumentOrderStatus;
  createdAt: string;
};

export type AdminRole = "Owner" | "Admin" | "Moderator" | "Support";

export type AdminTeamMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastActive: string;
};

export type AnonymousMessage = {
  id: string;
  body: string;
  receivedAt: string;
  image?: { src: string; alt: string };
  /** Optional so the existing homepage teaser samples stay valid unchanged. */
  read?: boolean;
  reply?: AnonymousReply;
};
