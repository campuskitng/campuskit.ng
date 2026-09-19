-- ============================================================================
-- CampusKit — full production schema
-- Run in Supabase SQL editor (or `supabase db push`) BEFORE supabase/seed.sql.
-- Safe to re-run: everything is `if not exists` / `or replace`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null,
  institution text,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  anonymous_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Auto-create a profile row whenever a new auth user signs up.
-- username/display_name come from signup metadata (see app code); falls back
-- to a generated handle so the insert never fails.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', initcap(final_username))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Convenience helper used throughout RLS policies below.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================================================================
-- 2. CAMPUSKIT-CONTROLLED CONTENT (tools, opportunities, marketplace, docs)
-- ============================================================================

create table if not exists public.tools (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  href text not null,
  category text not null check (category in ('academics', 'documents', 'community', 'opportunities')),
  popular boolean not null default false,
  is_new boolean not null default false,
  note text,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  organization text not null,
  category text not null check (category in ('Scholarship', 'Internship', 'Competition', 'Event', 'Fellowship')),
  deadline date not null,
  eligibility text,
  location text,
  href text not null default '',
  description text,
  status text not null default 'published' check (status in ('published', 'draft', 'expired')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_deadline_idx on public.opportunities (deadline);
create index if not exists opportunities_category_idx on public.opportunities (category);

create table if not exists public.marketplace_items (
  id text primary key,
  title text not null,
  description text,
  price integer not null check (price >= 0),
  location text not null,
  category text not null default 'General',
  condition text not null check (condition in ('New', 'Like new', 'Good', 'Fair')),
  image text not null,
  images text[] not null default '{}',
  seller text not null default 'CampusKit',
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'draft')),
  posted_at timestamptz not null default now(),
  href text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_items_status_idx on public.marketplace_items (status);

create table if not exists public.document_templates (
  id text primary key,
  name text not null,
  use_case text not null,
  doc_group text not null check (doc_group in ('Academic', 'Administrative', 'Financial', 'Career')),
  price integer not null default 0,
  is_free boolean not null default true,
  fields jsonb,
  preview jsonb,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tools_set_updated_at on public.tools;
create trigger tools_set_updated_at before update on public.tools for each row execute function public.set_updated_at();
drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at before update on public.opportunities for each row execute function public.set_updated_at();
drop trigger if exists marketplace_items_set_updated_at on public.marketplace_items;
create trigger marketplace_items_set_updated_at before update on public.marketplace_items for each row execute function public.set_updated_at();
drop trigger if exists document_templates_set_updated_at on public.document_templates;
create trigger document_templates_set_updated_at before update on public.document_templates for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. PAST QUESTIONS / ACADEMIC RESOURCES (admin-managed, Storage-backed)
-- ============================================================================

create table if not exists public.past_questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  institution text not null,
  department text not null,
  course_code text not null,
  course_title text,
  level text,
  session text not null,
  semester text check (semester in ('First', 'Second', 'Combined')),
  file_path text not null,
  file_size integer,
  download_count integer not null default 0,
  status text not null default 'published' check (status in ('published', 'draft')),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists past_questions_dept_idx on public.past_questions (department);
create index if not exists past_questions_course_idx on public.past_questions (course_code);
create index if not exists past_questions_search_idx on public.past_questions
  using gin (to_tsvector('english', title || ' ' || department || ' ' || course_code || ' ' || coalesce(course_title, '')));

drop trigger if exists past_questions_set_updated_at on public.past_questions;
create trigger past_questions_set_updated_at before update on public.past_questions for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. PAYMENTS (Paystack) — generic, so future paid features reuse it
-- ============================================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reference text not null unique,
  purpose text not null check (purpose in ('document_template')),
  -- Polymorphic-ish pointer to the thing being paid for. For 'document_template'
  -- this is the document_templates.id. Future purposes reuse this column.
  product_id text not null,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'abandoned')),
  channel text,
  paystack_transaction_id text,
  metadata jsonb not null default '{}',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_reference_idx on public.payments (reference);
create index if not exists payments_status_idx on public.payments (status);

-- One record per successful *unlock* — decoupled from `payments` so future
-- purposes don't need a document-specific column on payments.
create table if not exists public.document_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id text not null references public.document_templates(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  field_values jsonb not null default '{}',
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, template_id, payment_id)
);

create index if not exists document_purchases_user_idx on public.document_purchases (user_id);

drop trigger if exists document_purchases_set_updated_at on public.document_purchases;
create trigger document_purchases_set_updated_at before update on public.document_purchases for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. ANONYMOUS MESSAGING
-- ============================================================================

create table if not exists public.anonymous_messages (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  image_path text,
  sender_fingerprint text not null,
  status text not null default 'active' check (status in ('active', 'reported', 'removed', 'expired')),
  reply_body text,
  replied_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint anonymous_messages_has_content check (length(trim(body)) > 0 or image_path is not null)
);

create index if not exists anonymous_messages_recipient_idx on public.anonymous_messages (recipient_id, created_at desc);
create index if not exists anonymous_messages_expiry_idx on public.anonymous_messages (expires_at);
create index if not exists anonymous_messages_fingerprint_idx on public.anonymous_messages (sender_fingerprint, created_at desc);

create table if not exists public.anonymous_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.anonymous_messages(id) on delete cascade,
  reason text not null,
  reporter_fingerprint text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists anonymous_reports_status_idx on public.anonymous_reports (status);
create index if not exists anonymous_reports_message_idx on public.anonymous_reports (message_id);

-- Reported messages must survive their normal 24h expiry while under review.
create or replace function public.protect_reported_messages()
returns trigger language plpgsql as $$
begin
  update public.anonymous_messages set status = 'reported' where id = new.message_id and status = 'active';
  return new;
end;
$$;

drop trigger if exists anonymous_reports_flag_message on public.anonymous_reports;
create trigger anonymous_reports_flag_message
  after insert on public.anonymous_reports
  for each row execute function public.protect_reported_messages();

-- ============================================================================
-- 6. SAVED / BOOKMARKED CONTENT
-- ============================================================================

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('tool', 'opportunity', 'marketplace_item', 'document_template', 'past_question')),
  item_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists saved_items_user_idx on public.saved_items (user_id);

-- ============================================================================
-- 7. ADMIN AUDIT LOG
-- ============================================================================

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.tools enable row level security;
alter table public.opportunities enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.document_templates enable row level security;
alter table public.past_questions enable row level security;
alter table public.payments enable row level security;
alter table public.document_purchases enable row level security;
alter table public.anonymous_messages enable row level security;
alter table public.anonymous_reports enable row level security;
alter table public.saved_items enable row level security;
alter table public.admin_audit_log enable row level security;

-- profiles: publicly readable (no email/sensitive data stored here) so
-- anonymous-link resolution and public profile pages work for anyone; only
-- the owner (or an admin) can write.
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = 'user' or public.is_admin());
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin());

-- Public content: readable by anyone when published; writable by admins only.
create policy "Tools are publicly readable" on public.tools for select using (status = 'published' or public.is_admin());
create policy "Admins manage tools" on public.tools for insert with check (public.is_admin());
create policy "Admins update tools" on public.tools for update using (public.is_admin());
create policy "Admins delete tools" on public.tools for delete using (public.is_admin());

create policy "Opportunities are publicly readable" on public.opportunities for select using (status = 'published' or public.is_admin());
create policy "Admins insert opportunities" on public.opportunities for insert with check (public.is_admin());
create policy "Admins update opportunities" on public.opportunities for update using (public.is_admin());
create policy "Admins delete opportunities" on public.opportunities for delete using (public.is_admin());

create policy "Marketplace items are publicly readable" on public.marketplace_items for select using (status != 'draft' or public.is_admin());
create policy "Admins insert marketplace items" on public.marketplace_items for insert with check (public.is_admin());
create policy "Admins update marketplace items" on public.marketplace_items for update using (public.is_admin());
create policy "Admins delete marketplace items" on public.marketplace_items for delete using (public.is_admin());

create policy "Document templates are publicly readable" on public.document_templates for select using (status = 'published' or public.is_admin());
create policy "Admins insert document templates" on public.document_templates for insert with check (public.is_admin());
create policy "Admins update document templates" on public.document_templates for update using (public.is_admin());
create policy "Admins delete document templates" on public.document_templates for delete using (public.is_admin());

create policy "Past questions are publicly readable" on public.past_questions for select using (status = 'published' or public.is_admin());
create policy "Admins insert past questions" on public.past_questions for insert with check (public.is_admin());
create policy "Admins update past questions" on public.past_questions for update using (public.is_admin());
create policy "Admins delete past questions" on public.past_questions for delete using (public.is_admin());

-- payments / document_purchases: users see only their own rows. All writes
-- happen through API routes using the service-role key (never the anon key),
-- so there are deliberately no insert/update policies for regular users.
create policy "Users read own payments" on public.payments for select using (auth.uid() = user_id or public.is_admin());
create policy "Users read own document purchases" on public.document_purchases for select using (auth.uid() = user_id or public.is_admin());

-- anonymous_messages: only the recipient (or admin) may read; only the
-- recipient may update (mark read / reply / delete their own). Inserts are
-- server-only (service role) so rate limiting/validation can't be bypassed.
create policy "Recipients read own messages" on public.anonymous_messages for select using (auth.uid() = recipient_id or public.is_admin());
create policy "Recipients update own messages" on public.anonymous_messages for update using (auth.uid() = recipient_id or public.is_admin());
create policy "Recipients delete own messages" on public.anonymous_messages for delete using (auth.uid() = recipient_id or public.is_admin());

create policy "Admins read reports" on public.anonymous_reports for select using (public.is_admin());
create policy "Admins update reports" on public.anonymous_reports for update using (public.is_admin());

create policy "Users manage own saved items" on public.saved_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admins read audit log" on public.admin_audit_log for select using (public.is_admin());

-- ============================================================================
-- 9. STORAGE BUCKETS + POLICIES
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('marketplace-images', 'marketplace-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('anonymous-images', 'anonymous-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('past-questions', 'past-questions', false, 20971520, array['application/pdf']),
  ('documents', 'documents', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- avatars: owner-scoped folder (userId/filename), public read.
create policy "Avatar images are publicly readable" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update own avatar" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own avatar" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- marketplace-images: public read, admin-only write (service role used from
-- the admin app, so no authenticated insert policy is needed/granted).
create policy "Marketplace images are publicly readable" on storage.objects for select using (bucket_id = 'marketplace-images');

-- anonymous-images: private. No public/select policy — every read goes
-- through a server route that issues a short-lived signed URL after
-- confirming the requester is the recipient.

-- past-questions / documents: private, same pattern — signed URLs only,
-- issued server-side after an entitlement check (free vs paid, ownership).

-- ============================================================================
-- 10. SITE SETTINGS (small set of admin-controlled feature flags)
-- ============================================================================

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.site_settings enable row level security;
create policy "Site settings are publicly readable" on public.site_settings for select using (true);
create policy "Admins manage site settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('anonymous_messaging_enabled', 'true'),
  ('maintenance_mode', 'false')
on conflict (key) do nothing;

-- ============================================================================
-- 11. HOUSEKEEPING FUNCTIONS
-- ============================================================================

-- Expire normal (non-reported) anonymous messages. Call from a scheduled
-- Edge Function / pg_cron job; safe to run repeatedly.
create or replace function public.expire_anonymous_messages()
returns void language sql as $$
  update public.anonymous_messages
  set status = 'expired'
  where status = 'active' and expires_at < now();
$$;

-- ============================================================================
-- 12. UX REFINEMENT ADDITIONS (anonymous sharing/report reasons, marketplace
--     WhatsApp contact, theme preference, notifications)
-- Session 2 addendum — appended rather than rewriting section 5-7 above so a
-- diff against the original schema stays readable. Safe to re-run.
-- ============================================================================

-- Anonymous: a small, fixed set of shareable card themes, and a structured
-- report-reason category (free text only for "other").
alter table public.anonymous_messages
  add column if not exists card_theme text not null default 'aurora'
    check (card_theme in ('aurora', 'midnight', 'sunset'));

alter table public.anonymous_reports
  add column if not exists reason_detail text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'anonymous_reports_reason_check'
  ) then
    alter table public.anonymous_reports
      add constraint anonymous_reports_reason_check
      check (reason in ('harassment', 'sexual_content', 'threats', 'hate_discrimination', 'spam', 'personal_information', 'other'));
  end if;
end $$;

-- Marketplace: a single configured contact per listing. Free-form (a phone
-- number or a full wa.me/https://wa.me link) — normalized client-side when
-- building the link. No user-to-user messaging table; this is CampusKit's
-- admin-entered seller contact, per the product brief.
alter table public.marketplace_items add column if not exists whatsapp_contact text;

-- Profiles: explicit theme preference, synced across the user's devices
-- (browser-local state — e.g. localStorage — is only a same-device cache on
-- top of this).
alter table public.profiles
  add column if not exists theme_preference text not null default 'system'
    check (theme_preference in ('system', 'light', 'dark'));

-- Notifications: bounded, user-scoped, real-event-only. Inserted by the
-- triggers below (anonymous message received, payment success) and by the
-- opportunity-deadline cron — never by ordinary client code, so an unread
-- feed can't be spoofed.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('anonymous_message', 'payment_success', 'opportunity_deadline', 'system')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Keyset pagination (created_at, id) for "load more", and a partial index
-- for the common unread-count query.
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc, id desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id) where read_at is null;
-- Backs the dedupe check in the opportunity-deadline cron (has this user
-- already been notified about this link recently?).
create index if not exists notifications_user_link_idx on public.notifications (user_id, link, created_at desc);

alter table public.notifications enable row level security;
create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
-- No insert/delete policy for regular users — every insert goes through a
-- SECURITY DEFINER trigger function or the service-role client (cron route).

-- Admin document builder (see lib/types.ts DocumentLayout) — additive and
-- optional: templates seeded before the builder existed keep using `preview`
-- only; lib/documents/render.ts checks `layout` first, falling back to the
-- legacy `preview` shape, so nothing needs migrating.
alter table public.document_templates add column if not exists layout jsonb;
-- (`payments` already had a plain user_id index; this adds the ordering).
create index if not exists payments_user_created_idx on public.payments (user_id, created_at desc);

-- --- Notification event triggers -------------------------------------------

create or replace function public.notify_new_anonymous_message()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.recipient_id, 'anonymous_message', 'New anonymous message', left(new.body, 100), '/account/anonymous/' || new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists anonymous_messages_notify on public.anonymous_messages;
create trigger anonymous_messages_notify
  after insert on public.anonymous_messages
  for each row execute function public.notify_new_anonymous_message();

create or replace function public.notify_payment_success()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'success' and old.status is distinct from 'success' then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.user_id, 'payment_success', 'Payment successful', 'Your document is ready to download.', '/account/documents');
  end if;
  return new;
end;
$$;

drop trigger if exists payments_notify_success on public.payments;
create trigger payments_notify_success
  after update on public.payments
  for each row execute function public.notify_payment_success();

-- Google OAuth sign-ups don't carry `username`/`display_name` metadata (only
-- email/password signup does, via options.data — see lib/auth-actions.ts) —
-- they carry Google's `full_name`/`name`/`avatar_url` instead. Extend the
-- existing handle_new_user() to prefer those before falling back to the
-- generated handle, and to seed avatar_url when Google provides one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', initcap(final_username)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
