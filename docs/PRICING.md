# Pricing: source of truth and rollout

**Version:** `2026-11-pricing-v2` · locked by King Fee 2026-11-08 · effective on deploy.

`lib/pricing-catalog.json` is the only place a price is set. Four things read it:

| Reader    | What it does                                                                     | Command                            |
| --------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| The site  | `lib/catalog.ts` builds every price on /pricing and /services from it            | `npm run build`                    |
| Stripe    | Products, prices (lookup key `ftd_service_<slug>`) and one Payment Link per item | `npm run pricing:sync`             |
| Supabase  | `public.service_catalog` mirror, via a generated migration                       | `npm run pricing:sql -- <file>`    |
| Campaigns | Offer, price and link for every ad and DM                                        | `npm run campaign:brief -- <slug>` |

Never type a price into a page component, an ad, a caption or a DM. Change the catalog, then run the steps below.

## Price chart (v2)

| Line                                  | Item                                                                                                        | Price                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Own Your Name (fixed, no promo codes) | Own Your .com                                                                                               | $200                                                  |
|                                       | Booked & Paid (payments included)                                                                           | $750                                                  |
|                                       | Shop Bundle (4 chairs) · extra chair                                                                        | from $1,200 · $150                                    |
|                                       | Keep-Live                                                                                                   | $60/year                                              |
|                                       | Get Paid Button · Get Found on Google · Pro Inbox · Extra Page                                              | $99 · $149 · $99 · $75                                |
| Business Websites                     | Business Site Essentials (new)                                                                              | from $2,500                                           |
|                                       | Strategic Website Redesign                                                                                  | from $4,750                                           |
|                                       | Website Launch                                                                                              | from $5,500                                           |
|                                       | Digital Presence Bundle                                                                                     | from $6,750                                           |
|                                       | E-commerce or Custom Website Features                                                                       | from $10,000                                          |
| Software & Automation                 | Lead Capture & CRM · API Integration · AI Assistant                                                         | from $1,400 · $2,100 · $2,100                         |
|                                       | Custom Software · Clerk + Supabase · Analytics Dashboard · Public-Data Tool                                 | from $3,500 each                                      |
|                                       | Full Business System                                                                                        | from $10,000                                          |
| Presence add-ons                      | Payments & Back-End · Yelp · Apple · GA4 Audit · Business Profile · Workspace Email · Alignment · GA4 Setup | $250 · $350 · $350 · $450 · $525 · $525 · $700 · $925 |
| Care plans (monthly)                  | Maintenance · Cloud Mgmt · Monitoring · Change Block · Protection                                           | $175 · $350 · $350 · $525 · $850                      |

Retired: Business Website Design & Development ($5,500, duplicated Website Launch).

**Rules:** Payments & Back-End Integration is included from Booked & Paid up, not with Own Your .com. Promotion codes (YOBUL) never apply to the Own Your Name line. Stripe fees, Google subscriptions and domain renewal after year one are separate unless an item says otherwise.

## Switching all prices at once

Run from the repo root with `STRIPE_SECRET_KEY` in `.env.local` (never committed). Do it in test mode first.

1. **Plan (read-only):** `npm run pricing:sync`. Prints every product, price and link it would create or change. Nothing is written.
2. **Apply:** `npm run pricing:sync -- --apply` (add `--live` with a live key). Creates the new products and prices, moves each lookup key to its new price, creates new Payment Links, and rewrites `lib/service-checkout-links.json`. Items whose price did not change keep their current link. Old links stay active, so the live site keeps selling during the switch.
3. **Database:** apply `supabase/migrations/20261108220000_service_catalog_pricing_v2.sql`.
4. **Deploy:** commit the catalog and the links file, then `npm run deploy` (feethedeveloper.com is not on Workers Builds yet, so deploy by hand).
5. **Retire, after the new site is live:** `npm run pricing:sync -- --retire --live`. Switches off the superseded links, archives their prices and archives the retired product. A link still listed in the committed links file is never touched.

Every phase is safe to re-run. A listed product that is missing or archived stops the run before anything is written.

## Checks

- `npm run pricing:test`: 11 tests against an in-memory Stripe seeded like the live account (plan writes nothing, apply is idempotent, price changes, retire safety, starter links refuse promo codes, Keep-Live bills yearly, campaign briefs).
- Until `--apply` runs, new items fall back to `/start?service=<slug>` so no button is left without a destination.
