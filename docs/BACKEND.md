# CampusKit — Backend Guide

This is the practical "how do I actually run this" companion to
`docs/IMPLEMENTATION_STATUS.md` (which explains *what* was built and *why*).
Read that one if you're picking up development; read this one if you're
setting the project up.

## 1. Supabase project setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, **never** commit or expose this)
3. Open the **SQL Editor** and run, in this exact order:
   1. `supabase/schema.sql` — creates every table, RLS policy, and Storage bucket.
   2. `supabase/seed.sql` — sample tools/opportunities/marketplace items/document templates/past-questions metadata.
4. In **Authentication → URL Configuration**, set your Site URL (e.g. `http://localhost:3000` for local dev, your production domain later) and add it to Redirect URLs — this is where Supabase sends people after clicking an email confirmation or password-reset link (handled by `app/auth/callback/route.ts`).
5. In **Authentication → Email Templates**, the defaults work fine; customize later if you want CampusKit branding in the emails.
6. Create your first admin: sign up normally through the app, then in the SQL Editor run:
   ```sql
   update public.profiles set role = 'admin' where username = 'your-username';
   ```
   Every subsequent admin can be promoted from `/admin/team` or `/admin/users/[id]` by an existing admin.

### Uploading real past-question PDFs
The seed data creates *metadata rows only* — `supabase/seed.sql`'s sample
`past_questions` rows point at file paths that don't exist yet. Either:
- Delete the seed rows and add real ones via `/admin/past-questions` (handles the upload for you), or
- Upload matching PDFs to the `past-questions` bucket at the exact `file_path` values in the seed data.

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in every value. Quick reference:

| Variable | Where it's used | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | all Supabase clients | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser/server clients (RLS-scoped) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` only | **No — server only** |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | not currently used client-side (Paystack Standard checkout redirect doesn't need it), kept for future inline-checkout use | Yes |
| `PAYSTACK_SECRET_KEY` | `lib/paystack.ts` (init/verify/webhook) | **No — server only** |
| `NEXT_PUBLIC_SITE_URL` | building Paystack callback URLs, password-reset redirect | Yes |

`.env.local` is git-ignored. Never put `SUPABASE_SERVICE_ROLE_KEY` or
`PAYSTACK_SECRET_KEY` in anything prefixed `NEXT_PUBLIC_`.

## 3. Paystack setup

1. Create an account at [paystack.com](https://paystack.com) (or use your existing one).
2. In **Settings → API Keys & Webhooks**, grab your **test** secret/public keys first — use these until you're ready to go live.
3. Set the **Webhook URL** to `https://<your-domain>/api/paystack/webhook`. This is the backstop that confirms payment even if the user closes their browser right after paying — see `app/api/paystack/webhook/route.ts`. It's not strictly required for the happy path (the client-driven `/documents/payment/callback` → `/api/paystack/verify` flow handles that), but you should still configure it.
4. Test the full flow with [Paystack's test cards](https://paystack.com/docs/payments/test-payments/) before going live.
5. When ready for production, swap in your live keys and update the webhook URL to your production domain.

**How payment security works here** (for your own confidence, not just trust-me):
`/api/paystack/initialize` creates a `pending` row in `payments` and calls Paystack's Initialize Transaction API server-side. The user pays on Paystack's own page. Paystack redirects back to `/documents/payment/callback`, which calls `/api/paystack/verify` — that route calls Paystack's Verify Transaction API server-side (never trusts the redirect itself), checks the amount matches what was requested, and only then marks the payment `success` and inserts a `document_purchases` row. `/api/documents/generate` checks for that row before generating a paid document. The webhook does the exact same verification+fulfillment (`fulfillPaymentByReference` in `lib/paystack.ts`) as a backstop, and is idempotent — if the payment's already marked `success`, it no-ops.

## 4. Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

Visit `http://localhost:3000`. Sign up, promote yourself to admin (see step 6 above), then explore `/admin`.

## 5. Production deployment

Any Next.js host works (Vercel is the path of least resistance for App
Router + Route Handlers + Server Actions). Checklist:
- Set every variable from the table above in your host's environment settings — **not** committed anywhere.
- Update `NEXT_PUBLIC_SITE_URL` to your real domain (used to build the Paystack callback URL and password-reset links).
- Update Supabase Auth's Site URL / Redirect URLs to match your production domain.
- Update the Paystack webhook URL to your production domain.
- Switch Paystack keys from test to live when you're ready to accept real payments.
- Storage buckets, RLS, and the schema itself live in Supabase, not in your app deploy — make sure you've run `schema.sql` + `seed.sql` against your **production** Supabase project (a separate project from your dev one, ideally).

### Scheduled jobs
Two cron routes need scheduling:
- `GET /api/cron/expire-anonymous` — calls `public.expire_anonymous_messages()`
  so messages actually disappear after 24h.
- `GET /api/cron/notify-deadlines` — notifies students who saved an
  opportunity that's closing within 3 days (deduped, safe to run daily).

Pick one approach for both:
- **Vercel Cron**: already configured in `vercel.json` (expire-anonymous
  hourly, notify-deadlines daily at 08:00 UTC). Just set `CRON_SECRET` in
  your environment — Vercel automatically sends it as
  `Authorization: Bearer <CRON_SECRET>`.
- **Supabase pg_cron** (if enabled on your plan): skip the expire route
  entirely and schedule `select public.expire_anonymous_messages();`
  directly in Postgres. `notify-deadlines` has no direct SQL-function
  equivalent (it does a Supabase Storage-free but multi-table dedupe check
  in application code) — call the route via `pg_cron`'s `net.http_get` or
  keep using Vercel Cron for just this one.
- **Any other cron provider**: call each route with `?secret=<CRON_SECRET>`
  on whatever schedule you like.
`CRON_SECRET` is optional but recommended for both routes.

### Google OAuth
1. In [Google Cloud Console](https://console.cloud.google.com/), create an
   OAuth 2.0 Client ID (type: Web application).
2. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` as an
   authorized redirect URI.
3. In the Supabase dashboard → Authentication → Providers → Google, paste
   the Client ID and Client Secret, and enable the provider.
4. No `.env.local` changes needed — Supabase holds these credentials
   itself. Email/password login is unaffected either way.

## 6. Manual testing checklist

Auth
- [ ] Sign up with a new email → confirmation email arrives → clicking it logs you in.
- [ ] Log out, log back in with the same credentials.
- [ ] Request a password reset, follow the email link, set a new password, log in with it.
- [ ] Visit `/account` while logged out → redirected to `/login?redirectTo=/account`.
- [ ] Edit your display name/username/institution on `/account/edit`, confirm it saves.
- [ ] Try a username someone else already has → clear error, no crash.
- [ ] Delete your account → logged out, can't log back in with the old credentials.
- [ ] Click "Continue with Google" while mid-task (e.g. from the paid-document login prompt) → after authenticating, you land back on that original page/step, not the homepage.
- [ ] Sign up with Google for the first time → a profile is created automatically using your Google name/photo, not a generated placeholder.

Anonymous card sharing
- [ ] Open a received message → the themed card shows only one theme at a time.
- [ ] Tap the palette icon on the card → it cycles to the next theme in place (no list/grid ever appears).
- [ ] Reply to a message → the reply appears attached to the same card immediately, without refreshing the page.
- [ ] Tap Download → a PNG downloads with the currently-displayed theme and the reply included.
- [ ] Tap Share on a mobile browser → the OS share sheet opens with the image attached.
- [ ] Report a message → you see the 7-option reason list, and a text box only appears for "Other".

Marketplace WhatsApp
- [ ] As admin, add a WhatsApp number to a listing → the public listing shows a "Message on WhatsApp" button that opens WhatsApp with a prefilled message.
- [ ] Leave the WhatsApp field blank → the button doesn't appear (no broken link, no placeholder button).

Document builder (admin)
- [ ] Go to `/admin/documents/new`, add a heading and a paragraph block, add a custom field, insert it into the paragraph via "Insert field" → the live preview shows `[Field Label]` in the right place.
- [ ] Turn on the signature block, pick a field as the signature name → save, then generate the document as a student and fill that field → the printed PDF shows that value under the signature line.
- [ ] Confirm an old (pre-builder) template's PDF still generates exactly as before if you haven't opened it in the new editor.

Notifications & transactions
- [ ] Receive an anonymous message → a notification appears in the bell within a few seconds, unread dot visible.
- [ ] Complete a paid document purchase → a "Payment successful" notification appears.
- [ ] Open `/account/notifications`, mark all read → the bell's dot disappears.
- [ ] Open `/account/transactions` with more than 20 payments on the account → "Load more" fetches older ones without reloading the page.

Dark mode
- [ ] Set your OS/browser to dark mode with no CampusKit preference set → the site opens in dark mode by default.
- [ ] Go to `/account/edit` → Appearance, switch to Light → whole site (including admin, if you're an admin) switches immediately.
- [ ] Log in as the same user on a different browser → your saved preference applies there too, not just the browser where you set it.

Documents (free)
- [ ] Pick a free template, fill required fields, generate → PDF downloads and opens correctly, correctly formatted (margins, wrapped text, page numbers, signature block).
- [ ] Leave a required field empty → clear validation error, no request sent.
- [ ] While logged in, generate a free doc → shows up in `/account/documents`.

Documents (paid) — use Paystack test keys + test card
- [ ] Pick a paid template while logged out → prompted to log in, form values preserved after login.
- [ ] Fill the form, click Pay → redirected to Paystack.
- [ ] Complete payment with a test card → redirected back, PDF downloads automatically.
- [ ] Refresh `/account/documents` → the paid document appears, re-download works.
- [ ] Try generating the same paid template again without paying again → works (already unlocked), doesn't re-charge.
- [ ] Cancel a Paystack payment instead of completing it → callback page shows a clear error, no document unlocked.
- [ ] Check `payments` table in Supabase → row shows `status = 'success'`, correct amount, `paystack_transaction_id` populated.

Anonymous
- [ ] Visit your own `/anonymous/<username>` link in a private/incognito window, send a message with text only.
- [ ] Send another with an image attached.
- [ ] Message appears in `/account/anonymous` for the recipient; sender identity is nowhere visible.
- [ ] Reply to a message from the inbox.
- [ ] Report a message → it stays visible in your inbox (not deleted) and appears in `/admin/anonymous` pending review.
- [ ] As admin, approve a report → message stays active. Remove a different one → message disappears from the recipient's inbox.
- [ ] Send 10+ messages rapidly to the same recipient → rate limit kicks in with a clear error.
- [ ] Delete a message from your inbox → gone.

Past questions
- [ ] Browse `/past-questions`, filter by department, search by course code.
- [ ] Open a detail page, click Download → PDF opens/downloads (requires a real file uploaded — see §1).
- [ ] As admin, upload a new past question with a PDF → appears immediately in the public list.
- [ ] Try uploading a non-PDF file as admin → rejected with a clear error.

Marketplace / Opportunities / Tools (admin)
- [ ] As admin, create a new tool/opportunity/marketplace item → appears on the public page immediately.
- [ ] Toggle a tool or document template between published/draft → disappears/reappears on the public site accordingly.
- [ ] Delete an item → confirmation step required, then gone from both admin and public views.
- [ ] Log in as a non-admin and try navigating to `/admin` directly → redirected away.

Search
- [ ] Press ⌘K / Ctrl+K (or however the trigger is wired), search a term that matches a tool, an opportunity, a marketplace item, a document template, and a past question — confirm all five categories can surface results.
- [ ] Clear the search box → default "Jump to a tool" list reappears.

Security spot-checks
- [ ] Try to fetch another user's `document_purchases` row by guessing a `purchaseId` in `/api/documents/download?purchaseId=` while logged in as someone else → 404 (RLS blocks it).
- [ ] Try to fetch another user's anonymous inbox image via `/api/anonymous/image?messageId=` → 404/error (ownership check fails).
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` never appear in browser dev tools → Network tab → any response, or in view-source.
