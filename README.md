# WhiteHill Lifecares — Admin

Private admin panel for the WhiteHill Lifecares website (`../whitehill-lifecare`). The client signs in with email and password and manages the website's Sanity content: products, categories, and site settings. There is no signup.

The plan and decisions are in [`prompts/admin-panel.md`](prompts/admin-panel.md).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - `NEXT_PUBLIC_SANITY_*`: the same project and dataset as the website.
   - `SANITY_API_WRITE_TOKEN`: a Sanity **Editor** token (sanity.io/manage → API → Tokens). Use its own token, e.g. named `admin-panel`.
   - `ADMIN_EMAIL`: the login email.
   - `ADMIN_PASSWORD_HASH`: run `npm run hash-password -- "the-password"` and paste the output (a base64 bcrypt hash).
   - `SESSION_SECRET`: at least 32 random characters, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `NEXT_PUBLIC_SITE_URL`: the public website URL, for "View on site" links and for refreshing the website after saves.
   - `SANITY_REVALIDATE_SECRET`: the same value as the website's `SANITY_REVALIDATE_SECRET` (and the Sanity webhook secret).
3. `npm run dev` → http://localhost:3001 (the website uses 3000).

## Changing the login

Set a new `ADMIN_EMAIL` and/or `ADMIN_PASSWORD_HASH` in Vercel and redeploy. Changing `SESSION_SECRET` signs everyone out.

## How it works

- **Auth:** `proxy.ts` redirects signed-out visitors to `/login`, but that check is optimistic only. The real check is `requireAdmin()` (`lib/auth/dal.ts`), called by every data loader and every Server Action. Sessions are an HS256 JWT in an httpOnly cookie that lasts 8 hours.
- **Sanity:** all reads and writes go through the server-only client in `lib/sanity/client.ts`; the token never reaches the browser. Saving publishes straight to the live document and removes any Studio draft of it.
- **Website updates:** after every save the admin sends the website a signed request to `/api/revalidate` (`lib/website.ts`), so the change shows on the next page load. The Sanity webhook also fires as a backup. If the website can't be reached, the save still succeeds and a warning toast appears.
- **Uploads:** JPEG, PNG and WebP images, and PDF leaflets, up to 4 MB each (Vercel's request limit is 4.5 MB).
- **Schema:** fields, option lists and the claim-word check mirror `whitehill-lifecare/sanity/schemaTypes/` and `sanity/lib/claim-check.ts`. When the schema changes there, update `lib/constants.ts`, `lib/validation/`, `lib/sanity/queries.ts` and the form here.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
