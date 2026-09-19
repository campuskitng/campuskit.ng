# CampusKit — Implementation Status

Living doc. Read this fully before touching code in a new session — don't
re-audit from scratch or rewrite anything marked DONE unless you find it's
actually broken. This file was substantially reorganized in the session
described under "Session 3" below because it had accumulated some
self-contradicting entries across earlier sessions (e.g. an admin badge
being marked both "not wired" and "done" in different places) — the
`## Status by feature` section below is the current source of truth; treat
anything below `## Session history` as a changelog, not a spec.

## Product-definition guardrails (do not violate)
- Documents = CampusKit-controlled templates users fill in, not user uploads.
- Past questions = CampusKit/admin-controlled content, not user uploads.
- Marketplace = CampusKit/admin-controlled listings with an admin-entered
  WhatsApp contact per listing, not a user-to-user seller marketplace and
  not in-app messaging.
- No moderation workflow for marketplace/opportunities. Moderation only
  applies to Anonymous.
- Document fields are filled in manually by the student every time — never
  pre-filled from their CampusKit profile.

---

## Status by feature

### Database schema (`supabase/schema.sql`, one file, additive sections)
`profiles` (+ `theme_preference`, avatar/display-name auto-populated from
Google metadata on OAuth signup), `tools`, `opportunities` (+ `created_at`
exposed to the app for the homepage freshness section), `marketplace_items`
(+ `whatsapp_contact`), `document_templates` (+ `layout` jsonb — see the
document builder section below), `past_questions`, `payments`,
`document_purchases`, `anonymous_messages` (+ `card_theme`),
`anonymous_reports` (+ structured `reason` check constraint, `reason_detail`
for "other"), `saved_items`, `admin_audit_log`, `site_settings`,
`notifications` (new — see below). RLS + storage bucket policies on
everything. Buckets: `avatars`, `marketplace-images` (public),
`anonymous-images`, `past-questions`, `documents` (private).

Two DB triggers insert notifications (anonymous message received, payment
succeeded); `handle_new_user` was extended to prefer Google OAuth metadata
(`full_name`/`avatar_url`) over the generated-handle fallback.
`expire_anonymous_messages()` SQL function is called by a real cron route
(`/api/cron/expire-anonymous`) — see Setup required from you.

### Authentication
Email/password signup/login/reset — **unchanged from the pre-existing
baseline**, per explicit instruction not to touch it. Added on top:
- **Google OAuth** (`components/auth/GoogleSignInButton.tsx`) on both
  `/login` and `/signup`, client-side `signInWithOAuth`.
- **`lib/safe-redirect.ts`**: validates every `redirectTo`/`next` query
  param against open-redirect (must be a same-site relative path). Used by
  `signInAction`, `signUpAction`, and `/auth/callback`.
- **Fixed a real gap**: `signUpAction` used to drop `redirectTo` on the
  "check your email" redirect — now threads it through to
  `/login?confirm=1&redirectTo=...` so it survives into the eventual login.
- `/auth/callback?next=...` is the shared return point for Google OAuth,
  email confirmation, and password reset — validated, then redirected.
  Google sign-in from a mid-task redirect (e.g. "log in to buy this
  document") correctly returns to that original page, not the homepage.
- Middleware-protected routes (`/account/*`, `/admin/*`) and the document
  purchase flow already appended `redirectTo` before this session — that
  part of the design was correct and untouched.

### Anonymous messaging — redesigned UX, same backend guarantees
Backend (fingerprinting, rate limiting, moderation, expiry) is unchanged.
What's new:
- **Inbox** (`/account/anonymous`) rebuilt as a real unread/read list
  (bounded to 50 most recent), not a flat stack of full cards — unread
  rows are bolded with a dot + "New" pill.
- **Detail page** (`/account/anonymous/[id]`) marks read server-side on
  load, shows the message as a themed shareable card
  (`components/anonymous/ThemedMessageCard.tsx`, 3 themes: aurora/midnight/
  sunset), with a **single palette icon overlaid on the card** that cycles
  themes one tap at a time — deliberately not a row/grid/dropdown of theme
  options, per product direction. The currently-displayed theme is what
  gets downloaded/shared.
- **Reply** flows into the same card (both message and reply render
  together) — held in local component state after submit rather than
  relying on `revalidatePath` to refresh the dynamic `[id]` route (it
  doesn't; only the inbox list path gets revalidated), so the reply appears
  instantly rather than needing a manual refresh.
- **Download/share**: `GET /api/anonymous/card/[id]` renders the card
  server-side as a PNG via `next/og`'s `ImageResponse` (no client
  screenshot library) — ownership-checked through the RLS-scoped server
  client. The person can download it directly or use the Web Share API
  (falls back to a plain download on browsers without file-sharing
  support).
- **Report reason**: structured 7-category radio picker
  (`ANONYMOUS_REPORT_REASONS` in `lib/types.ts`) — free text only appears
  for "Other", capped at 300 chars. Validated server-side in both
  `reportMessageAction` and the (currently unused by any UI, kept for
  consistency) `/api/anonymous/report` route. Admin's moderation view
  (`/admin/anonymous`) now shows the human-readable reason label plus the
  "other" detail text instead of the raw enum value.
- Real-event notification: a DB trigger inserts a `notifications` row for
  the recipient whenever a message arrives (see Notifications below).

### Marketplace — WhatsApp contact (no user-to-user messaging)
`marketplace_items.whatsapp_contact` (nullable text — a phone number or a
full wa.me link). `buildWhatsAppLink()` in `data/marketplace.ts` normalizes
either form and prefills "Hi, I saw [item] on CampusKit. Is it still
available?". The listing detail page's previously-disabled "Message
seller" placeholder ("Messaging turns on with accounts") is now a real
"Message on WhatsApp" button when a contact is configured, hidden
otherwise. Admin create/edit forms have the field; no user-facing seller
flow was added or reintroduced.

### Document generation — admin builder (new) + PDF quality
**Inspected first**: `document_templates` already had flexible `fields`/
`preview` jsonb columns and a working purchase/download pipeline — but
*no create flow existed at all*, only a raw-JSON edit form for templates
seeded via SQL. Built the requested admin builder as an addition, not a
replacement:
- New `document_templates.layout` jsonb column (additive — every template
  seeded before this session keeps using `preview` untouched; a template
  only ever has one of the two in normal use).
- `lib/types.ts`: `DocumentLayout`/`DocumentBlock` types (heading/paragraph/
  list/spacer blocks; header/address-block/date-line/signature-block
  toggles), `SUGGESTED_DOCUMENT_FIELDS` quick-add list.
- `lib/documents/render.ts` rewritten to dispatch on `layout` vs legacy
  `preview` — both paths share one page-cursor/typography engine. PDF
  quality refinements applied to **both** paths: tighter margins (64pt vs
  72pt), larger body size with real line-height, a proper signature block
  (underscore line + printed name + role label + date) instead of no
  signature area at all.
- **Signature name resolution**: legacy templates keep the old
  guarantorName/sponsorName/studentName heuristic (safe — every seeded
  template happens to use one of those field ids). New builder templates
  have no fixed naming convention to guess from, so the builder makes the
  admin explicitly pick which field prints under the line
  (`layout.signature.nameFieldId`) — caught and fixed during this session's
  own verification pass, since the heuristic would otherwise have silently
  printed the wrong field's value (or nothing) on a custom template.
- `components/DocumentPreview.tsx` extended to render both shapes — this
  is genuinely the same renderer the admin builder uses for its live
  preview (fed an empty `values` object, so field tokens show as
  `[Field Label]` placeholders), not a second one to keep in sync.
- `app/admin/documents/DocumentBuilderForm.tsx` (new, shared by
  `/admin/documents/new` and `/admin/documents/[id]/edit`): add/reorder/
  remove blocks, an "Insert field" button per text block that inserts
  `{{fieldId}}` at the cursor position — the admin never types or reads raw
  JSON or placeholder syntax directly, only clicks. Layout toggles
  (header/address/date/signature + placement) are checkboxes/selects, not
  free-form JSON.
- Editing a **legacy** (`preview`-only) template through the new builder
  starts from an empty layout and, on save, adds a `layout` that takes
  priority over the old `preview` — the edit page shows a warning about
  this. Deliberate tradeoff documented here rather than building a
  preview-to-blocks migrator, which felt like over-engineering for the
  brief's "simplest reusable architecture" instruction.
- Student-facing flow (`DocumentGenerator.tsx`, field validation, Paystack
  gating) needed **no changes** — it already rendered `fields` generically
  with no profile prefill, which is exactly what the brief asked for.

### Profile — redesigned as a dashboard
`/account` is now an identity header + shortcut cards (Anonymous with a
unread-count badge, Notifications, Saved, Documents, Transaction history)
plus an admin-dashboard shortcut for admins. All editing (profile fields,
appearance, delete-account) moved to the new `/account/edit`, structured as
Profile -> Appearance -> Danger zone sections — nothing dangerous or
rarely-used competes with the dashboard's first view.

### Notifications (new)
`notifications` table, RLS-scoped to the owner, populated only by two DB
triggers (new anonymous message, payment success — see schema) and a new
cron (`/api/cron/notify-deadlines`, deduped, for saved opportunities with a
deadline inside 3 days) — nothing in application code ever inserts a
notification directly, so the feed can't be spoofed by a compromised
client. `lib/notifications.ts` (cursor-paginated reads, unread count),
`lib/notification-actions.ts` (mark read / mark all read). UI:
`/account/notifications` (paginated feed, "Load more") plus a bell icon
with an unread dot in `Navbar.tsx` for every signed-in page.

### Transaction history (new)
`/account/transactions` — real cursor pagination by `created_at`
(`lib/account-queries.ts`, backed by a new `payments_user_created_idx`
index), never loads more than 20 rows per request regardless of how long
the user's payment history is. Resolves document names via one small
batched follow-up query per page (not per row).

### Dark mode
System/Light/Dark, default System. Implementation: Tailwind color tokens
(`canvas`/`surface`/`ink`/`muted`/`hairline`/`brand-soft`) converted to CSS
variables (`app/globals.css`, `:root` vs `.dark`) so every existing
component that already used those token classes adapts automatically — no
per-component rewrite needed, and confirmed by grepping for hardcoded
`bg-white`/`text-gray-*`/etc. across `app/` and `components/`: the handful
of hits are all intentional (marketing-page mockup cards, a toggle knob,
translucent chips on a themed background), not accidental light-only
surfaces. `next-themes` handles the client mechanics (`ThemeProvider`,
no-flash). `profiles.theme_preference` is the cross-device source of truth
— `ThemeSync` applies it once per session on top of `next-themes`'
localStorage cache. Toggle lives in `/account/edit` -> Appearance, not on
the homepage.

### Loading states & bounded queries
`loading.tsx` added for the homepage, every catalogue page (tools,
opportunities, marketplace, documents, past-questions), the account
dashboard, and the three new account sub-pages. Previously-unbounded
catalogue queries (`getTools`, `getOpportunities`, `getMarketplaceItems`,
`getDocumentTemplates`, `getPastQuestions`) now all carry a 200-row safety
cap with explicit ordering. `admin/users` gained real offset pagination
(25/page) — was a single unbounded query before.

### Homepage "New this week"
`components/RecentlyAdded.tsx` — a horizontal strip built from genuine
`created_at`/`posted_at` timestamps across marketplace/opportunities/past-
questions (top 5 by recency), no fabricated activity. Renders nothing if
there's no real recent data. While wiring this, found and fixed a **real
pre-existing bug**: the marketplace detail page called `.toLowerCase()` on
a raw ISO timestamp (`item.postedAt`) instead of formatting it, so listings
showed a garbled ISO string instead of "Posted 3d ago". Consolidated three
near-duplicate local `timeAgo()` functions (anonymous inbox, notifications
feed, and this new bug fix) into one shared `lib/format-time.ts`.

### Stale-code sweep (this session)
- Removed `markReadAction` from `lib/anonymous-actions.ts` — dead after the
  inbox redesign moved mark-read into the detail page's server component.
- Removed the old raw-JSON `EditDocumentTemplateForm.tsx` and `MessageCard.tsx`
  (superseded by `DocumentBuilderForm.tsx` and the new inbox/detail pages).
- Removed the dead `marketplaceItems`/`homeMarketplaceItems` mock arrays
  from `data/marketplace.ts` (the catalogue has read from Supabase since an
  earlier session; only `formatNaira` and the new `buildWhatsAppLink` are
  still exported from that file).
- Fixed a stale homepage comment claiming "Anonymous inbox isn't built yet"
  (it has been, since an earlier session — the sample messages shown there
  are intentionally curated marketing content, not a placeholder for a
  missing feature).

### Everything from before this session
Auth baseline, Paystack, RLS, admin CRUD, global search, past questions,
save/bookmark buttons, settings, scheduled anonymous expiry — unchanged,
previously verified against actual code (not just prior notes), still
holds. See `## Key architectural decisions` below for the load-bearing
design choices behind all of it.

---

## Key architectural decisions (so nobody re-litigates these)
- **IDs**: `tools`/`opportunities`/`marketplace_items`/`document_templates`
  keep `text` slugs to match existing `href`s; `past_questions`,
  `notifications`, `payments` use `uuid`.
- **Payments table is generic** (`purpose` + `product_id`, resolved to a
  display name via a small follow-up query at read time) so future paid
  features don't need a schema redesign.
- **No PDF binary storage** — documents are re-rendered on demand from
  stored `field_values`. Simpler, still satisfies "redownload anytime."
- **Anonymous images and past-questions files are private buckets**, always
  served via short-lived signed URLs from a server route that checks
  ownership/entitlement first. The anonymous card PNG route follows the
  same pattern for the image it optionally embeds.
- **Notifications are never inserted by application code directly** — only
  by SECURITY DEFINER DB triggers or the cron's admin client — specifically
  so a compromised or buggy client-side call can't fabricate activity in
  someone's feed.
- **Anonymous card themes are a fixed set of 3**, cycled one at a time via
  a single control, not a picker UI — a deliberate product constraint, not
  a scope cut.
- **Document builder templates and legacy seeded templates coexist**
  (`layout` vs `preview`) rather than migrating everything to one shape —
  avoids a risky one-shot migration of every seeded template's exact
  wording/formatting for no functional gain.
- **All writes that need to bypass RLS use `lib/supabase/admin.ts`
  explicitly**; admin mutations in `lib/admin-actions.ts` deliberately use
  the RLS-scoped server client (not the admin client) so Postgres RLS stays
  the actual gate.
- **Anonymous rate limiting is IP+cookie fingerprint based** (hashed), not
  raw IP storage.
- **Admin users list uses offset pagination, not a keyset cursor** — an
  admin browsing/searching benefits from "page 2 of 5" and jumping around,
  which a cursor doesn't support directly. Per-user growing logs
  (notifications, transactions) use real keyset cursors instead, where a
  cursor's lack of "jump to page N" doesn't matter.

## Environment variables required
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only), `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`,
`PAYSTACK_SECRET_KEY` (server-only), `NEXT_PUBLIC_SITE_URL`,
`CRON_SECRET` (optional, protects both cron routes). All documented with
comments in `.env.local.example`.

**New for this session**: Google OAuth requires enabling the Google
provider in the Supabase dashboard (Authentication -> Providers -> Google)
with a Google Cloud OAuth Client ID/Secret, and adding
`https://<your-project>.supabase.co/auth/v1/callback` as an authorized
redirect URI in the Google Cloud Console. No new environment variables —
Supabase holds the OAuth client credentials itself, not `.env.local`.

## Setup required from you (in order)
1. Run `supabase/schema.sql` then `supabase/seed.sql` against a real
   Supabase project (nothing in any sandbox session has touched a live
   instance — every claim above is from code inspection, not a live run).
2. Confirm bucket privacy in the dashboard matches the schema's intent
   (`documents`, `anonymous-images`, `past-questions` private;
   `avatars`, `marketplace-images` public).
3. Enable the Google provider in Supabase Auth (see above) if you want
   Google sign-in live — email/password works without this step.
4. Add Paystack test keys, test the free-document flow, then the paid flow
   with a Paystack test card end-to-end (see `docs/BACKEND.md`'s checklist).
5. Schedule both cron routes (`vercel.json` already lists both if
   deploying to Vercel — `expire-anonymous` hourly, `notify-deadlines`
   daily) or use Supabase's own `pg_cron` instead, per `docs/BACKEND.md`.
6. Promote your own account to admin via the SQL editor (no self-serve
   promotion path, by design): `UPDATE profiles SET role = 'admin' WHERE id = '<your-uuid>'`.
7. `npm install` (adds `next-themes`, small) then `next build` somewhere
   with normal network access — no sandbox in this project's history has
   had egress to `fonts.googleapis.com` or the npm registry, so a live
   build/typecheck has never actually been run. Code has been reviewed
   carefully but a real `npx tsc --noEmit` and `next build` pass is the one
   verification step nobody could complete in any session so far — do this
   before deploying.

## Known limitations
1. **No sandbox in this project's history has run `npm install`, `next
   build`, or `npx tsc --noEmit`** — no network egress to the npm registry
   or Google Fonts in any session. Every change has been written and
   cross-checked by reading the surrounding code, matching existing
   patterns exactly, and reasoning through each data flow end-to-end, but
   this is not a substitute for an actual compile. Run a real build before
   trusting this in production.
2. Paystack and Google OAuth are both untested against live credentials for
   the same reason (no network egress). Code review says both are correct;
   both need a real test with test keys/a real Google Cloud OAuth client
   before launch.
3. Editing a legacy (`preview`-only) document template through the new
   builder replaces it with an empty `layout` on save unless the admin
   fills in blocks first — see the document builder section above. The
   edit page warns about this; it doesn't prevent it.
4. The document builder supports `text`/`textarea` fields only (not the
   `date`/`select` field types `lib/types.ts`'s `DocumentField` already
   allows for legacy templates) — a deliberate scope cut, not a bug; those
   two types can still be added by editing a template's `fields` value
   directly in Supabase if ever needed.
5. `/admin/documents`' own template list query is intentionally unbounded
   (like `/admin/tools`, `/admin/opportunities`) — an admin-curated
   catalogue is expected to stay in the dozens-to-low-hundreds, unlike the
   per-user logs that got real pagination this session.

---

## Session history

### Session 1 — Backend build-out from a frontend-only baseline
Supabase schema, auth, RLS, storage, Paystack, anonymous messaging, past
questions, admin CRUD, global search, save/bookmark buttons, site settings,
scheduled anonymous expiry. Condensed into `## Status by feature` above
rather than kept verbatim, since several entries had gone stale or
self-contradictory by the end of Session 2.

### Session 2 — Admin nav badge, maintenance-mode full block, cleanup pass
Small, self-contained fixes: a real pending-report count on the admin
sidebar (previously unwired), `maintenance_mode` fully blocking the public
site for non-admins (previously banner-only), and one stale leftover UI
string removed from the admin sidebar footer.

### Session 3 — This session
Anonymous UX overhaul, admin document builder, Google OAuth, dark mode,
notifications, transaction history, profile dashboard, PDF quality,
performance/pagination sweep, homepage freshness, and documentation
cleanup. Everything under `## Status by feature` above reflects the end
state of this session. Notable bugs caught during this session's own
verification pass (not left for a future session): the marketplace
`.toLowerCase()` timestamp bug, the reply-not-appearing-without-refresh bug
on the anonymous detail page (stale `revalidatePath` target), and the
missing explicit signature-name-field config for builder-created documents
(the legacy naming-convention heuristic doesn't apply to custom fields).

## Next recommended task (in order)
1. A real `npm install && npx tsc --noEmit && next build` pass — see Known
   limitations #1. This is the single highest-value next step; everything
   else in this document has been reasoned through carefully but not
   compiled.
2. Live testing against real Supabase + Paystack + Google OAuth credentials
   per "Setup required from you" above.
3. If the legacy-template-edit tradeoff (Known limitations #3) turns out to
   be confusing in practice, a "convert preview to blocks" one-time
   migrator would remove it — deliberately not built this session per the
   brief's "simplest reusable architecture" instruction.
