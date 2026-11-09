# Cloudflare Workers Deployment

This Next.js application deploys to Cloudflare Workers through the OpenNext adapter.

- Worker name: `fee-the-developer`
- Account: `Fee@feethedeveloper.com's Account` (`62738e2bb751720449f1cd904f6d175f`, pinned as `account_id` in `wrangler.jsonc`)

## Authentication

`wrangler deploy` needs the `workers_scripts:write` scope. A token holding only
the legacy `workers:write` scope fails with `No access to the specified resource`
against `/workers/scripts/...`. Refresh it with:

```bash
npx wrangler login
```

Or export a scoped API token (Workers Scripts:Edit) instead:

```bash
export CLOUDFLARE_API_TOKEN=...
```

Check what the current token holds with `npx wrangler whoami`.

## Configuration split

`wrangler.jsonc` → `vars` holds only values that are safe to commit: the site
and booking URLs, the Clerk publishable key, and the Supabase project URL plus
publishable key.

Secrets are never committed. Push them from `.env.local` with:

```bash
npm run cf:secrets            # dry run, prints names and lengths
node scripts/set-cloudflare-secrets.mjs --apply
```

That covers `CLERK_SECRET_KEY`, `SUPABASE_SECRET_KEY`, and `STRIPE_SECRET_KEY`.
The merch store was removed on 2026-11-08; the `MERCH_*_STRIPE_LINK` Worker
secrets are no longer read and can be deleted with `wrangler secret delete`.

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is a build-time value, not a Worker
secret or var. `components/EmbeddedStripeCheckout.tsx` reads it in the browser,
so Next.js inlines it during `next build`; it must be in `.env.local` (or the
CI build environment) on the machine that builds. Adding it to `wrangler.jsonc`
`vars` alone does nothing for the client bundle. Without it, `/checkout/[slug]`
falls back to the Stripe-hosted Payment Link. See `.env.example` for every
variable name.

`CLERK_SECRET_KEY` is load-bearing. `middleware.ts` enforces `/dashboard`
protection when both Clerk keys are present and fails closed with `404` when
they are not.

## Build

```bash
npm run deploy    # opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

### Windows caveat

OpenNext warns that it is not fully supported on Windows, and in this repo its
child `npm run build` aborts with status 134 while the same build succeeds when
run directly. Work around it by producing the standalone output first and
letting OpenNext reuse it:

```bash
NEXT_PRIVATE_STANDALONE=true npm run build
npx opennextjs-cloudflare build --skipNextBuild
npx wrangler deploy
```

Prefer WSL or Linux CI for a clean single-command build.

`wrangler.jsonc` deliberately has no `build.command`. `npm run deploy` already
runs the OpenNext build, so a custom build command there makes `wrangler deploy`
re-enter that build.

## Local verification

```bash
npx wrangler dev --local --port 8787
```

Runtime secrets come from `.dev.vars` (gitignored). This runs the real `workerd`
runtime and is the production-parity check. Verified routes:

- `/` returns 200
- `/dashboard` returns 307 to `/sign-in` (Clerk middleware active)
- `/services/<slug>` pages render their Stripe checkout links
- `/api/supabase/health` reports key wiring and `service_catalog` reachability

## Supabase

The project is `gbsqtusozqvfxaojfflt`. The new-format keys
(`sb_publishable_…` / `sb_secret_…`) are wired through `lib/supabase/`.

`/api/supabase/health` returns 503 until
`supabase/migrations/20261001190207_create_fee_developer_service_catalog_20261001.sql`
is applied to that project.

## Domain cutover

Cut over on 2026-10-14 to Worker version
`e562c976-83f1-473f-a524-a669a2c7d994` at 100% traffic. The staged code upload
was version `df11e695-8840-4d58-b1b4-a68cf7aabd82`; the second version adds the
seven required Worker secrets without briefly serving the application without
them.

The two pre-cutover DNS records were unproxied CNAMEs:

- `feethedeveloper.com` → `c2ee0eef8c97ab4f.vercel-dns-016.com`
- `www.feethedeveloper.com` → `c2ee0eef8c97ab4f.vercel-dns-016.com`

Cloudflare now owns both hostnames as Worker custom domains. The account API
reports proxied placeholder records for both and public resolver `1.1.1.1`
returns Cloudflare anycast addresses. Google mail and domain-verification
records were not changed.

Post-cutover checks:

- `/`, `/merch`, `/sign-in`, `/start`, `/robots.txt`, and
  `/sitemap.xml` return `200` from the Cloudflare edge.
- `/dashboard` returns `307` to `/sign-in?redirect_url=%2Fdashboard`, and the
  Clerk sign-in widget loads in Chrome.
- `/merch` renders all four Stripe checkout links.
- The browser console showed no warnings or errors on the checked Fee The
  Developer routes.
- `/api/supabase/health` returns `503` because `public.service_catalog` has not
  been created in Supabase. The response confirms that the publishable key,
  secret key, project reference, and JWKS URL are present; this optional catalog
  migration remains follow-up work.

## Recovery

The Vercel project has been removed, so restoring the two old CNAMEs is not a
working rollback. Recover by deploying a corrected Worker version and moving
100% traffic to it with `wrangler versions deploy`. Keep version
`e562c976-83f1-473f-a524-a669a2c7d994` available as the first known-good
Cloudflare release. Removing the custom domains without a replacement would
turn the public site back into an outage.

## Security and operations

- Worker observability is enabled in `wrangler.jsonc`.
- Static Next.js assets use immutable one-year caching.
- Runtime compatibility uses `nodejs_compat`.
- `NEXT_PUBLIC_RESEND_API_KEY` in `.env.local` is a live `re_…` key carrying a
  browser-exposed prefix and is read by nothing in the source. It is not set on
  Cloudflare; rotate and remove it.
