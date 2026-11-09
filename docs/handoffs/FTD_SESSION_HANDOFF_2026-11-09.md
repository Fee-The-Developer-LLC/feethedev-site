# Handoff: Pricing v3, offer pages and the Own Your Bookings campaign

- **Handoff ID:** FTD-2026-11-09-SESSION
- **Date:** 2026-11-09, 09:00 CT · **From:** Claude (cloud session, Fee The Developer project) · **To:** Claude Code (VS Code) and any Claude session in this project
- **Company:** Fee The Developer LLC only · **Owner:** King Fee (Alfreddie Postell II)
- **Repo:** `Fee-The-Developer-LLC/feethedev-site`, local clone `C:\Users\uveav\OneDrive\Documents\GitHub\rglifestyle-sit\feethedev-site`
- **Status:** REVIEW. The code is built and the live site is updated. Merge, CI and a few checks remain.
- **Same document in the Claude project:** `claude/2026-11-09__FTD__SESSION-HANDOFF__pricing-offers-campaign.md`

---

## 1. Objective (what King Fee asked for, Nov 8)

1. Repackage and reprice everything so a $199 offer reads as a real product, with prices switched in Stripe all at once from the repo.
2. Cut all prices 30%. Rebrand the starter as **Own Your Bookings**: 2 pages, the client's .com, and a custom booking page with Stripe checkout.
3. 30% off for veterans and veteran-owned businesses. Deposits to start work. Pay-over-time options. Lead with the owner-developer advantage.
4. Build campaigns per service (ads, DMs, posts) with voiced, storyboarded demo videos. Delivery has to be tight.
5. Make each ad's call-to-action button match its product and service page.
6. Make the Upwork profile match.
7. Make the Starter Sites package clear and rule-based (hosting, domain ownership, leaving).

## 2. Current verified state (checked 2026-11-09, 08:55 CT)

| Area | State | Evidence |
| --- | --- | --- |
| Local clone | On `main` @ `87fd5b1`, clean | `git status` |
| `feat/pricing-v3` | Pushed, **PR #29 open** | `b24d8ce` v3 catalog, `c1427a9` service pages, `86df8f5` v3 synced to Stripe |
| `feat/offer-pages` (built on pricing-v3) | Pushed, **PR #30 open** | `5a544a5` offer pages + on-site checkout + Clerk sign-up + Starter Hosting; `83cf268` migration; `43e9cc2` Starter Hosting synced to Stripe; `85ed12c` retire fix; `5ff2fb0` "update" (deletes `public/logo.png` and two showcase PNGs) |
| Production | **Ahead of `main`.** feethedeveloper.com/services/own-your-bookings returns 200 with the hook and "$10/month" | HTTP check from King Fee's machine |
| CI | **Blocked, not failing.** Both PRs: "The job was not started because your account is locked due to a billing issue." | `gh run view 42545903074` |
| Stripe | v3 prices + Starter Hosting ($10/month, link recorded) synced live | commits above, `lib/service-checkout-links.json` |
| Tests | 13 in `scripts/sync-pricing.test.mjs` | file |

Not verified (check before calling this done):
- Embedded checkout end to end, in test mode then live
- Retire run
- Supabase migration applied
- Affirm, Afterpay and Klarna turned on in the Stripe Dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` present at build time (used in code, but not in `wrangler.jsonc` vars or `.env.example`)

## 3. What was built

### Pricing v3 (single source of truth: `lib/pricing-catalog.json`)
- Feeds:
  - the site, via `lib/catalog.ts`
  - Stripe, via `scripts/sync-pricing.mjs`: lookup keys `ftd_service_<slug_with_underscores>` and `…__deposit`; plan, then apply, then retire
  - Supabase, via `scripts/pricing-to-sql.mjs`
  - campaigns, via `npm run campaign:brief -- <slug>`
- Veteran 30%:
  - Stripe coupon `ftd-veteran-30`.
  - Proof (DD-214, VA ID card, VOSB/SDVOSB certificate) is checked by email and never uploaded.
  - Then `npm run veteran:code -- --ref <intake ref> --live` mints a single-use code that expires in 30 days.
- One discount per order. YOBUL 20% never applies to Starter Sites.
- Ways to pay:
  - Pay in full.
  - A 30% deposit on one-time builds from $1,000, each with its own deposit price and link.
  - Affirm, Afterpay or Klarna through Stripe.
- Owner-developer copy on /pricing. Estimating rate $122.50/hour.

### Price chart (v3)

**Starter Sites**

| Item | Price |
| --- | --- |
| Own Your Bookings | $199 |
| Own Your Bookings Plus | $525 |
| Shop Bundle | from $840, extra chair $105 |
| **Starter Hosting** (required, from launch) | $10/month |
| Get Found on Google · Pro Inbox · Extra Page | $99 · $69 · $49 |

**Business Websites** (30% deposit in brackets)

| Item | Price |
| --- | --- |
| Business Site Essentials | from $1,750 (dep $525) |
| Strategic Website Redesign | from $3,325 |
| Website Launch | from $3,850 (dep $1,155) |
| Digital Presence Bundle | from $4,725 (dep $1,418) |
| E-commerce | from $7,000 |

**Systems**

| Item | Price |
| --- | --- |
| Lead Capture & CRM | from $980 |
| API Integration · AI Assistant | $1,470 each |
| Custom Software · Clerk + Supabase · Analytics Dashboard · Public-Data Tool | from $2,450 each |
| Full Business System | from $7,000 |

**Presence add-ons:** Payments & Back-End $175 · Yelp $245 · Apple $245 · GA4 Audit $315 · Business Profile $365 · Workspace Email $365 · Alignment $490 · GA4 Setup $645

**Care plans:** $120 · $245 · $245 · $365 · $595 per month

**Retired:** Business Website Design & Development, Get Paid Button, Keep-Live. Booked & Paid became Own Your Bookings Plus.

### Starter Sites package rules (King Fee, Nov 8)
1. **You own your .com.** It is registered in the client's name.
2. **We host it for $10 a month, from launch.** Covers hosting, SSL, domain renewal, DNS and email forwarding. FTD holds the domain controls while hosting is active, in exchange for the service.
3. **Your money goes to you.** Clients pay into their own Stripe account. Stripe's processing fees apply.
4. **Replies within 24 hours.** This is a reply promise, not a launch promise.
5. **Leave any time.** FTD transfers the domain and sends the site's code. Hosting ends and the site comes off FTD's servers.

Billing: the package checkout is one-time. The Starter Hosting subscription goes out with the go-live approval. In the catalog, `publicCheckout: false` on Starter Hosting, and `requires: "starter-hosting"` on each package.

### Ad to checkout (storyboard canvas: https://claude.ai/artifact/MnEpsx13nQ4cX6L8gMknV5)
- Each ad lands on `/services/<slug>` (the catalog's `campaign.landingPath`).
- The page H1 is `campaign.hook`, word for word. The hero image is the ad's last frame.
- One button phrase, built by `ctaLabel()` in `lib/catalog.ts`, mirrored in `campaign-brief.mjs`, rendered by `components/offer/OfferButton.tsx`. It appears on:
  - the ad's end card
  - the sticky header
  - the hero
  - the phone bar
  - the closing button

| Slug | Hook (= H1) | Button | Ad button |
| --- | --- | --- | --- |
| own-your-bookings | Your clients should book you, not an app. | Own my bookings · $199 | Shop Now |
| own-your-bookings-plus | An empty chair is money you already counted. | Stop no-shows · $525 | Shop Now |
| shop-bundle | One site for the shop. A page for every chair. | Put my shop online · $840 | Shop Now |
| business-site-essentials | Your business grew. Your website didn't. | Start with $525 down | Learn More |
| website-launch | First impressions happen before the first visit. | Start with $1,155 down | Learn More |
| digital-presence-bundle | You do great work. The problem is being found. | Start with $1,418 down | Learn More |
| custom-software-and-automation | Some work should not need a person every time. | Start with $735 down | Learn More |
| full-business-system | At some point the business needs a system, not more tools. | Start with $2,100 down | Learn More |

- Starter price line, everywhere: "$199 one time · then $10/month hosting from launch".
- UTM tags: `?utm_source=<instagram|facebook|tiktok|linkedin>&utm_medium=<paid_social|organic|dm>&utm_campaign=<slug>&utm_content=<creative id>`.
- Checkout:
  - On-site embedded Stripe Checkout at `/checkout/[slug]` via `/api/checkout` (`lib/stripe-checkout.ts`).
  - The welcome page at `/services/[slug]/welcome` verifies payment server-side (`getPaidSession`: status complete, paid, `metadata.catalog_slug` matches) and is noindex. It then shows `WelcomeIntakeForm`.
  - Payment Links still exist with a hosted confirmation message.
- Detailed specs: `docs/handoffs/FTD_AD_TO_CHECKOUT_STORYBOARD_2026-11-08.md` and Addendum A, on `feat/offer-pages`.

### Upwork (live)
- Title: "Army Veteran Full-Stack Developer | Booking Sites, Stripe & AI".
- The overview opens on the owner-developer advantage and lists the v3 starting prices, veteran 30% and a 30% first milestone.
- Hourly rate is still $50. No Project Catalog items yet. No website or Stripe links on Upwork, because Upwork restricts taking payment off the platform.

### Campaign and creative
- Claude Docs: campaign war plan https://claude.ai/artifact/CjyDktioWswYhgX89SHDp3 · product demo storyboards (narration, DM openers) https://claude.ai/artifact/H96SiLFCQHaGtmcZhC88Do. Both use the Own Your Bookings naming.
- Google Flow, "Fee The Developer" project:
  - 9:16 defaults; 4 stills; 3 clips rendered (72 credits); about 964 credits left until Nov 26.
  - Prompts for female characters must stay short, or the policy filter blocks them.
- Voices: Fish Audio FTD library. Narrator M02 Adrian or F02 Abby.
- Project docs: price chart, flow kit, brand bible, system map (see `claude/` in the Fee The Developer project).

## 4. Decisions log
- 2026-11-08: v3 = 30% below v2. Own Your Bookings at $199. Veteran 30% on top of the new prices, verified first, one-time code. Deposits 30% on builds from $1,000. Pay over time through Stripe.
- 2026-11-08: Upwork title and overview published (King Fee: "Publish both").
- 2026-11-08: Landing pages are `/services/<slug>`, not a separate `/offers` route. One button phrase per offer. Deposit-first on builds.
- 2026-11-08: Starter Hosting $10/month from launch, renewal included, Starter Sites only. The client owns the domain. Leaving = domain transfer + site code, and the site comes down. "Within 24 hours" is a reply promise.

## 5. Open decisions (King Fee)
1. Does Starter Hosting include updates? Keep-Live included two text or price updates a year.
2. What happens when a hosting payment fails (grace period, pause)? No copy ships until this is decided.
3. Approve the short logo intro on offer pages (about 1 second, skippable).
4. Credit budget for the Wave 1 renders: Own Your Bookings pilot about 60 Flow credits, Wave 1 about 290.
5. Confirm Fish Audio commercial-use terms before any paid or public use.
6. The `5ff2fb0` "update" commit deletes `public/logo.png` and two showcase images. Confirm this was intended before merging.

## 6. Next actions, in order

| # | Owner | Action |
| --- | --- | --- |
| 1 | King Fee | Clear the GitHub billing lock on Fee-The-Developer-LLC, then re-run CI on PRs #29 and #30. |
| 2 | Claude Code | In **Stripe test mode**, run the embedded checkout for `own-your-bookings` (full) and `website-launch` (deposit). Confirm `/services/<slug>/welcome` renders and the intake saves to `project_intakes`. Confirm `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` reaches the build. Then do one live smoke check with King Fee. |
| 3 | Claude Code | Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (names only) to `.env.example` and the env docs. |
| 4 | Claude Code | Finish Addendum A: add the top-level `packageRules` array to the catalog, render "The rules, in writing" from it, and add the FAQ items (what hosting covers, 24-hour replies, moving the domain). Add a test that every button label matches `formatPrice` or `depositFor`. |
| 5 | King Fee approves | Merge #29, then #30, so `main` matches production. |
| 6 | King Fee | Run `npm run pricing:sync -- --retire --live` if not yet run. Apply the v3 Supabase migration if not yet applied. Turn on Affirm, Afterpay and Klarna. |
| 7 | Claude + King Fee | Ads: export each ad's last-frame still to `public/library/ads/<slug>-last-frame.webp`. After the credit approval, render Wave 1 in Flow. Pull every caption and DM from `npm run campaign:brief -- <slug>`. Schedule in Metricool as drafts for review only. |
| 8 | Claude, with approval | Upwork Project Catalog item for Own Your Bookings at $199. Decide the hourly rate. |

## 7. Env vars (names only, never values)
`STRIPE_SECRET_KEY` (server / Worker secret) · `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` · `CLERK_SECRET_KEY` · `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` · `SUPABASE_URL` · `SUPABASE_SECRET_KEY` · `SUPABASE_PUBLISHABLE_KEY` · `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` · `NEXT_PUBLIC_SITE_URL` · `PORTAL_ADMIN_EMAILS`

## 8. Standing rules
- Every price comes from the catalog. Never type one into a page, ad, caption or DM.
- King Fee approves every deploy, merge to `main`, public post, DM batch, ad budget and credit spend.
- No fake reviews, stats or client counts. Label AI-generated people and scenes. Say "veteran-owned" about FTD only where the certification is on file ("Veteran-led" is fine).
- No dev tags or storyboard spec labels in production.
- The Stripe secret key stays with King Fee and the Worker secrets. Never commit `.env.local`.
- FTD only: no Hutchrok accounts, data or branding.

**Next owner:** King Fee (billing lock), then Claude Code (steps 2–4).

---

## Addendum B (2026-11-09, 09:15 CT): hosting decisions, set by King Fee

These close open decisions 1 and 2.

- **Updates are included in Starter Hosting.** $10/month covers hosting, SSL, domain renewal, DNS, email forwarding and site updates. Add "Site updates" to `starter-hosting.includes` and the hosting copy.
- **Unpaid month = site offline.** If a hosting payment isn't made, the site goes offline until that month is paid, then comes back. Add this as a sixth package rule ("Hosting keeps it live": the site stays up while hosting is paid; a missed month takes it offline until it's paid). Show it on the offer page's rules section and the FAQ.
- **Build note:** this needs a switch per client site. A Stripe webhook on `invoice.payment_failed` / `customer.subscription.updated` (status `past_due` or `unpaid`) flips the site to a "temporarily offline" page; `invoice.paid` flips it back. Keep it manual until there are paying hosting clients, and put it on the client-site template, not in feethedev-site.
- **Updates scope:** define "updates" before launch (for example text, prices, hours and photos; new pages stay at Extra Page $49). Until King Fee confirms, the copy says "site updates" with no number.

## Addendum C (2026-11-09): niche films

The storyboard for four niche films (barbershop, lash, braider, hair and wig shop) lives in Claude Docs: https://claude.ai/artifact/XK1GPVaMHwP4ErW2uxVxSM. Each film records a de-branded demo build of `hairline_matters_site`, `vickys-lash-site`, `mayas_site` or `geminis-hair-styles` in Stripe test mode. The demo work per repo is listed in its "Repo work before filming" section.
