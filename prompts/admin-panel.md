# Admin panel for WhiteHill Lifecares

## Goal

A separate, responsive Next.js admin app where the client signs in with email and password and fully manages the website's Sanity content: products, categories, and site settings.

## Decisions (confirmed with the user)

- **Separate project** at `E:\Web Dev\whitehill-lifecare-admin`, deployed on its own (e.g. `admin.<domain>` on Vercel). The public site (`whitehill-lifecare`) is unchanged: it keeps its public read-only CDN client, and the Sanity write token never touches it.
- **Per-item control, fixed schema.** The admin can create, edit, duplicate, hide/show, reorder and delete every document. On each item it can fill or clear any field, add, remove and reorder list rows (ingredients, supports, gallery), and replace or remove images and the leaflet. The schema stays as it is in `whitehill-lifecare/sanity/schemaTypes/`. A new *kind* of field still needs website code, so there is no schema builder.
- **Single admin, email + password, no signup.** The credentials live in env variables, the password stored as a bcrypt hash. There is no user table, because Sanity is the only datastore.
- **Writes go straight to published documents** (`product-xyz`, not `drafts.product-xyz`). The client sees changes on the site after the existing Sanity webhook → `/api/revalidate` fires, which happens for API mutations too. If a Studio draft exists for a document, the edit page shows a notice ("A draft from Studio exists; saving here publishes this version and discards the draft"), and save deletes the draft.
- Sanity Studio at `/studio` on the main site stays as a fallback for developers.

## Skills and docs read

- `whitehill-lifecare/AGENTS.md`, `DESIGN.md` (palette, fonts), schemas: `sanity/schemaTypes/product.ts`, `category.ts`, `site-settings.ts`, `sanity/lib/claim-check.ts`
- `whitehill-lifecare/app/api/revalidate/route.ts` (tag revalidation by `_type`)
- `node_modules/next/dist/docs/01-app/02-guides/authentication.md` and `authentication-with-cache-components.md`: session reads sit behind `<Suspense>`; `cookies()` is not allowed in plain `use cache`; checks belong in a DAL, and the proxy check is optimistic only
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- Pattern reference: `E:\Web Dev\locallify-admin` (`@sanity/client` + `jose` cookie session). Hardened here: that app only checks that the cookie *exists* in `proxy.ts`. This one verifies the JWT in the proxy **and** in every server action and page.

## Existing state (already done)

- `create-next-app` (Next 16.4.2, React 19.3, TS, Tailwind v4, ESLint, App Router, `cacheComponents: true`)
- Installed: `@sanity/client`, `@sanity/image-url`, `jose`, `bcryptjs`, `zod`, `lucide-react`, `sonner`, `@base-ui/react`, `class-variance-authority`, `tw-animate-css`, `cn`
- shadcn base-nova (Base UI) components in `components/ui/`: button, input, label, textarea, select, switch, checkbox, dialog, sheet, alert-dialog, table, badge, card, tabs, dropdown-menu, separator, skeleton, sonner
- `lib/utils.ts` re-exports `cn` from `cn` (same as the main site)

## Files to create or modify

```
.env.example                      env list (see below); add !.env.example to .gitignore
next.config.ts                    images.remotePatterns: cdn.sanity.io only; X-Robots-Tag noindex header
proxy.ts                          verify JWT; redirect unauth → /login, auth on /login → /
app/globals.css                   WhiteHill palette tokens, shadcn vars mapped, no .dark block
app/layout.tsx                    IBM Plex Sans + Source Serif 4 via next/font, Toaster, robots noindex
app/login/page.tsx                login card (server) + login-form.tsx (client, useActionState)
app/(admin)/layout.tsx            shell: sidebar ≥1024px, top bar + Sheet menu below
app/(admin)/page.tsx              dashboard
app/(admin)/products/page.tsx     list
app/(admin)/products/new/page.tsx
app/(admin)/products/[id]/page.tsx edit
app/(admin)/categories/page.tsx   list + inline create/edit dialog
app/(admin)/settings/page.tsx     site settings form
lib/auth/session.ts               server-only: sign/verify JWT (jose HS256), set/delete cookie
lib/auth/dal.ts                   server-only: requireAdmin() (verifies; redirects to /login)
lib/auth/actions.ts               login / logout server actions
lib/sanity/client.ts              server-only write client (token, useCdn: false)
lib/sanity/queries.ts             GROQ for list/detail/counts/references
lib/sanity/image.ts               image URL builder (public, for previews)
lib/sanity/types.ts               TS types for the three document shapes
lib/validation/*.ts               Zod schemas mirroring the Sanity schema rules
lib/claim-check.ts                copy of the site's claim-check (same regex)
lib/actions/products.ts           create, update, delete, duplicate, toggleVisible, reorder
lib/actions/categories.ts         create, update, delete, reorder
lib/actions/settings.ts           update
lib/actions/assets.ts             upload image / PDF to Sanity assets
components/admin/*                shell, nav, page header, empty state, confirm dialog,
                                  image-field, file-field, repeatable-list, field-row (with Clear)
components/products/*             product-table, product-card (mobile), product-form + tab panels
components/categories/*, components/settings/*
scripts/hash-password.mjs         `npm run hash-password -- "secret"` → prints base64 bcrypt hash
```

## Authentication

- Env: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (bcrypt cost 12, **base64-encoded** because Next's env loader expands `$` in raw bcrypt hashes), `SESSION_SECRET` (≥ 32 random chars).
- `/login`: email + password, labels above, show/hide password toggle, generic error "Email or password is incorrect" (never which one). Submit is disabled while pending.
- On success, sign a JWT `{ sub: "admin", email }` with HS256 and an 8 h expiry. Set cookie `wh_admin_session` with `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`, `maxAge` 8 h.
- Brute-force slowing: compare with `bcrypt.compare` even when the email doesn't match (constant work) and add a ~500 ms delay on failure. Flag in "Needs your attention": no persistent rate limit without a store (Upstash later if needed).
- `proxy.ts`: verifies the JWT (jose works on the edge). Unauthenticated → `/login?next=<path>` (only same-origin relative paths accepted). It is an optimistic check only.
- `requireAdmin()` in `lib/auth/dal.ts` (`server-only`), called at the **top of every server action** and in the admin layout behind `<Suspense>`. This is the real security boundary.
- Logout: server action deletes the cookie and redirects to `/login`. There is no `/signup` route and no password-reset UI. To change the password, the developer updates the env and redeploys (documented in README).

## Sanity access

- `lib/sanity/client.ts`: `import "server-only"`, `createClient({ projectId, dataset, apiVersion, token: SANITY_API_WRITE_TOKEN, useCdn: false, perspective: "published" })`. Reads also use this client (fresh, uncached data: `connection()` / dynamic, behind Suspense with skeletons).
- Only server actions mutate. No client component imports the client or the token.
- Mutations use transactions:
  - update: `patch(id).set({...}).unset([...cleared fields])`, plus `delete("drafts."+id)` if a draft exists.
  - delete product: first query `*[references($id)]`. If other products reference it in `relatedProducts`, the confirm dialog lists them, and the transaction unsets those references and then deletes the product and its draft.
  - delete category: blocked when products reference it. The dialog shows "Used by N products. Move them to another category first." with links.
  - reorder: patch `order` on the affected docs in one transaction (up/down buttons, not drag-and-drop, which is more accessible and has no extra library).
- Image upload: `client.assets.upload("image", file, { filename })`, then set `{_type:"image", asset:{_ref}, alt}`. Only JPEG/PNG/WebP is accepted, and the leaflet must be a PDF; each file ≤ 4 MB (Vercel caps request bodies at 4.5 MB; `serverActions.bodySizeLimit` is 4.5mb). Validation is checked again on the server. Removing an image unsets the field (orphan assets stay in Sanity media; fine).
- Slugs: auto-generated from name/title (lowercase, `-`), editable, with a uniqueness check against other docs of the same type before save.
- Every action returns `{ ok: true } | { ok: false, error, fieldErrors }` and calls `revalidatePath` for the admin pages it changed.

## Pages and behaviour

**Dashboard**: tiles for Products (visible / hidden), Categories, and "Incomplete products" (missing any field the site needs: name, composition, category, packImage + alt, which the site skips). There are quick links to Add product, Site settings, and View website. Counts are real numbers from Sanity only.

**Products list**
- Columns: pack thumbnail (contain, `--blue-25` bg), name + mark, composition, category, schedule badge (OTC / Rx H / Rx H1), visible switch (inline toggle, toast), order (↑/↓), actions menu (Edit, Duplicate, View on site, Delete).
- Toolbar: search (name/composition, debounced 250 ms, client-side), filters for category, product type, and visibility. "Add product" button.
- Incomplete products show a warning badge "Not shown on site: missing pack image alt", and so on.
- Below 768 px the table becomes stacked cards with the same actions.
- Empty state: "No products yet" + Add product.

**Product form** (new and edit share one component). Tabs match Studio: Basics · Composition · Details · Images · Website.
- Basics: name (rejects ™/®), trademark radio (None/™/®), slug, product type radio, category select (+ "New category" opens the category dialog inline), dosage form select, schedule radio.
- Composition: composition (required), unit statement, ingredient rows {ingredient (req), standard IP/BP/USP/none, strength} with add / remove / move up / move down, excipients, colour.
- Details: description (claim-word → yellow warning, still saveable), supports rows (max 6, a claim word **blocks save**; the section is hidden with a note when schedule is H/H1, and its values are kept but not shown on the site), directions, pack size (warns on letter x, offers "Replace x with ×"), pack type, storage, shelf life, manufacturer {name, address, licence no}.
- Images: pack image (required) with preview, replace, remove, alt (required); gallery rows {image, alt (req), caption (req)} add / remove / reorder; leaflet PDF upload / replace / remove with a file name link.
- Website: related products multi-select (max 3, excludes self), display order, show on website switch, SEO title (≤ 60 counter), SEO description (≤ 160 counter).
- Every optional field has a "Clear" action. Clearing unsets the field in Sanity, and the site already hides empty fields.
- Initial values for new products match Studio: dosage form Tablets, schedule OTC, excipients "q.s.", directions "As directed by the Physician.", storage default text, visible true.
- Sticky save bar: Save / Cancel; "Unsaved changes" indicator; `beforeunload` warning when dirty. Errors show inline, with a summary at the top that names the tab with the error, and focus moves to the first invalid field.
- Edit page header: name, View on site (`NEXT_PUBLIC_SITE_URL/medicines/<slug>`), Duplicate, Delete.

**Categories**: list (title, slug, product count, order ↑/↓), Add / Edit in a dialog (title, slug, order), Delete with the reference guard above.

**Site settings**: one form for all `siteSettings` fields (company name, logo upload, address, phone, email (validated), WhatsApp, CIN, GSTIN, drug licence, FSSAI licence), each clearable. If the singleton doesn't exist, the first save creates it with `_id: "siteSettings"` via `createIfNotExists` (the same fixed id used in `whitehill-lifecare/sanity/structure.ts`, verified).

## UI: reference image (source of truth, supplied by the user on approval)

The user attached a "Pipeline" CRM board (dark sidebar + white rounded work panel + kanban columns). Interpretation:

- **Frame:** the whole viewport is a near-black frame (`--frame`). The sidebar sits directly on it, and the content is a white panel with ~24 px radius inset 12 px from the top/right/bottom. Below 1024 px the sidebar is replaced by a dark top bar (logo + hamburger → Sheet), and the panel is full width with rounded top corners.
- **Sidebar:** logo mark + "WhiteHill" wordmark at the top; an account box (`--frame-raised`, 12 px radius) with "Signed in as / email" and a chevron menu (Sign out). Nav items have small coloured outline icons (Dashboard, Products, Categories, Site settings); the active item gets the `--frame-active` pill. A divider, then a collapsible **CATEGORIES** group (like "STORE") listing each category with a square tile and a link to the products board filtered by it. A divider, then a collapsible **ARCHIVE** group → hidden products.
- **Panel header:** page title (left, 26 px medium); search pill (`--muted` bg, 44 px tall, search icon) + outlined primary button "+ New product" (blue border/text, 12 px radius) on the right. A second row holds grey pill buttons: Filter ▾ (left), Sort ▾ and "Group by: Category" ▾ (right). A hairline divider sits under the toolbar.
- **Board (products page):** columns grouped by Category (default) or by Visibility / Schedule / Product type. Column header: coloured dot + title (20 px) + dark count pill ("8 products"). Cards are white with a 1 px `--card-border` and 14 px radius. Top row: pack thumbnail (24 px tile) + name+mark + ⋮ menu. Next line: pack size in green semibold (the "money" line). A hairline, then a 2-line description/composition. Footer: schedule badge (avatar spot) + "updated 5 min ago" with a clock icon. Columns scroll horizontally inside the panel; each column scrolls vertically.
- **Drag a card to another column** (native HTML5 DnD on pointer devices) to change its category / visibility / schedule / type. The dragged card tilts slightly with a lavender `--drag` tint and leaves a dashed placeholder; the target column shows a dashed drop zone. Keyboard/touch fallback: ⋮ → "Move to…".
- An empty column shows a dashed box with large faint text ("No products").
- **List view** toggle next to Group by (for dense editing), which is the table described below.
- Font: Plus Jakarta Sans for all UI (closest Google font to the reference's geometric sans).
- Accent: WhiteHill `--blue-600` replaces the reference indigo; green (`--success`) for the highlight line; red for Lost/hidden/destructive; column dot colours from a fixed 6-colour list.

## UI (general)

- Palette: same `DESIGN.md` §2 blue/white tokens as the site, defined once in `app/globals.css` with shadcn vars (`--primary`, `--border`, `--ring`, `--destructive` …) mapped onto them. Light only; remove the `.dark` block; `components/ui/sonner.tsx` drops `next-themes` and uses `theme="light"`. Uninstall `next-themes`.
  The reference adds neutrals for the dark frame (`--frame*`), `--muted` for pill controls, `--success`, `--danger` and `--drag`. Those are the only colours outside §2, used by the admin only.
- Fonts: Plus Jakarta Sans (per reference). Lucide icons, 1.8 stroke.
- Layout: per the reference section above.
- Content max-width 1200 px; form max-width 880 px; 16 px gutters on mobile and 32 px on desktop.
- Responsive at 360 / 768 / 1024 / 1440 px; no horizontal page scroll; 44 px touch targets; visible focus rings; real labels; `aria-describedby` errors.
- States: loading skeletons (Suspense), empty states, pending buttons, success/error toasts, confirm dialogs for every delete (AlertDialog, destructive button, "This cannot be undone").
- The site's compliance rules apply to helper texts written in the admin (no claims). Field descriptions are copied from the Sanity schema so editors get the same guidance as in Studio.

## Security requirements

- `SANITY_API_WRITE_TOKEN`, `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` are server only (`server-only` imports). Only `NEXT_PUBLIC_SANITY_*` and `NEXT_PUBLIC_SITE_URL` are public.
- Every server action calls `requireAdmin()` first and validates input with Zod on the server. Client-side validation is UX only.
- Server actions accept document ids only of the expected `_type` (checked by query before mutating), so a crafted id can't touch other documents.
- Uploads: MIME + size checked on the server.
- `next=` redirect param accepts only relative paths starting with `/` (and not `//`).
- Whole app `noindex, nofollow` (metadata + `X-Robots-Tag` header); `robots.ts` disallows all.
- Never log form values or tokens.

## Environment variables (`.env.example`)

| Variable | Purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | same project as the site | public |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | public |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2026-10-01` | public |
| `NEXT_PUBLIC_SITE_URL` | public site URL, for "View on site" | public |
| `SANITY_API_WRITE_TOKEN` | Editor token (new token named "admin-panel") | server |
| `ADMIN_EMAIL` | login email | server |
| `ADMIN_PASSWORD_HASH` | base64 bcrypt hash from `npm run hash-password` | server |
| `SESSION_SECRET` | JWT signing key, ≥ 32 chars | server |

## Compliance check

The admin is private and not indexed. The only copy it shows the public is what the client enters. The claim-word check (same regex as the site) warns on description and blocks supports, matching Studio. Supports are hidden for H/H1. No prices fields exist.

## Acceptance criteria

1. `/` and every admin route redirect to `/login` without a valid session, and a tampered or expired cookie is rejected. No `/signup` route exists.
2. Correct credentials sign in; wrong ones show one generic error. Sign out clears the session.
3. Calling a server action without a session (e.g. a replayed request after logout) fails.
4. Products: create with all fields → appears on the public site (after webhook) at its `order`. Edit any field, clear any optional field, toggle visible, reorder, duplicate, and delete (incl. related-product cleanup) all work.
5. Categories: add / edit / reorder / delete; delete is blocked while in use.
6. Site settings: every field editable and clearable; logo upload works.
7. Image and PDF uploads work and reject wrong types and oversize files.
8. Claim words: warning on description, save blocked on supports.
9. Layout works at 360 / 768 / 1024 / 1440 with no horizontal scroll; full keyboard use; visible focus.
10. `npx tsc --noEmit`, `npm run lint`, `npm run build` pass.

## Checks to run

`npx tsc --noEmit` · `npm run lint` · `npm run build` · `npm run dev` + manual tests below.

## Manual test steps

1. `npm run hash-password -- "<password>"` → put the output in `.env.local` with the other variables. Create an Editor token in sanity.io/manage → API → Tokens.
2. `npm run dev` (port 3001 if the site runs on 3000) → open `/` → redirected to `/login`.
3. Wrong password → generic error. Correct → dashboard shows real counts.
4. Products → Add product → fill every tab, upload pack image + 1 gallery image + PDF → Save → appears in the list. Open the public site → visible in Our Medicines and at `/medicines/<slug>`.
5. Edit: clear Shelf life → Save → line gone from the detail page. Set schedule H → Supports section hidden.
6. Type "cures" in a Supports row → Save blocked with message.
7. Toggle visible off → product disappears from the site after revalidation.
8. Move a product ↑ → order changes on the site.
9. Duplicate → copy named "<name> (copy)", hidden, new slug.
10. Delete a product that is another product's related product → dialog lists it → confirm → both updated.
11. Categories: try deleting one in use → blocked; add a new one → selectable in the product form.
12. Settings: clear phone → site hides it; set it back.
13. Resize to 360 px → hamburger menu, product cards; tab through the login and product form with the keyboard.
14. Sign out → back to `/login`; browser Back does not show admin data.

## Needs your attention (before / after build)

- Create a separate Sanity **Editor** token for the admin and add the admin URL to Sanity CORS only if browser-side calls are added (not planned; all calls are server-side).
- Confirm the Sanity webhook to `/api/revalidate` is set up on the live site; without it, admin edits appear only after the cache expires.
- Single admin account. More users or password reset by email would need a store, which is out of scope.
- No persistent login rate limit (serverless memory resets). Upstash/Redis can be added later if needed.
