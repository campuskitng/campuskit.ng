# CampusKit — frontend

Next.js (App Router) + React + TypeScript + Tailwind + Lucide. Mock data only: no
Supabase, no auth, no payments, no PDF generation yet.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Featured slider, popular tools, anonymous, documents, opportunities, marketplace |
| `/tools` | Full catalogue grouped by Academics / Documents / Community / Opportunities |
| `/tools/[slug]` | Per-tool placeholder for tools whose UI isn't built yet |
| `/documents` | 5-step generator; accepts `?type=guarantor-letter` to skip straight to a form |
| `/anonymous/[username]` | Message composer with local image preview |
| `/opportunities`, `/opportunities/[id]` | Filterable feed and detail view |
| `/marketplace`, `/marketplace/[id]` | Sortable listings and detail view |
| `/login`, `/signup` | Placeholders until accounts exist |

## Design system

Tokens live in `tailwind.config.ts` (colors, radii, type scale, shadows) and a
handful of shared classes in `app/globals.css` (`.shell`, `.field-input`,
`.field-label`, `.row-link`, `.eyebrow`). Buttons are in
`components/ui/Button.tsx` — `Button` and `ButtonLink` share one variant table,
so every interactive surface picks up the same hover/pressed/focus behaviour.
Icons are looked up by string key in `components/ui/Icon.tsx`, which is what lets
`icon` be a plain column in a database row later.

## Mock data

Everything in `data/` is typed against `lib/types.ts`. Replacing a module with a
Supabase query is a one-file change per collection:

- `data/tools.ts` → `tools` table; `popular` and `isNew` are flags, `icon` is a key into the icon registry
- `data/opportunities.ts` → `opportunities` table; `deadlineLabel()` is pure formatting and stays client-side
- `data/marketplace.ts` → `listings` table + Storage URLs
- `data/documents.ts` → `document_templates` and `document_fields`; `renderTemplateLine()` resolves `{{fieldId}}` tokens and should move server-side when PDFs are generated
- `data/featured.ts` → a `featured_slides` table, or drop the event slide and let the tool slides be the default

## Where the backend plugs in

- **Auth** — `/login` and `/signup` are standalone placeholder pages; the navbar's two buttons are the only other place that cares.
- **Payments** — `startMockPayment()` in `app/documents/DocumentGenerator.tsx` is the single seam. It sets `processing`, waits, then moves to step 5. Swap the timer for a Paystack transaction init plus webhook confirmation and nothing else in the flow changes.
- **PDF download** — the disabled button on step 5, same file.
- **Storage** — `AnonymousComposer` keeps the selected file as an object URL and never uploads. The upload call belongs in `send()`, next to the message mutation.
- **Images** — mock art is local SVG in `public/mock/`, which is why `next.config.mjs` sets `dangerouslyAllowSVG`. Once real photos land, drop that flag and add the Storage hostname to `images.remotePatterns`.

## Notes

- No state library. Everything is `useState` in the component that owns the interaction.
- The featured slider does not autoplay, by design.
- Mobile is the primary target: checked at 375 / 390 / 430px. The marketplace strip and filter chips scroll horizontally on purpose; nothing else does.
