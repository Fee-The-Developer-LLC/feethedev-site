# Pricing: source of truth and rollout

**Version:** `2026-11-pricing-v3` · set by King Fee 2026-11-08 · effective on deploy.

`lib/pricing-catalog.json` is the only place a price, discount or payment option is set. Four things read it:

| Reader    | What it does                                                                                                          | Command                            |
| --------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| The site  | `lib/catalog.ts` builds /pricing, /services, the payments page and the /start service menu                            | `npm run build`                    |
| Stripe    | Products, full and deposit prices (lookup keys `ftd_service_<slug>`, `…__deposit`), Payment Links, the veteran coupon | `npm run pricing:sync`             |
| Supabase  | `public.service_catalog` mirror, via a generated migration                                                            | `npm run pricing:sql -- <file>`    |
| Campaigns | Offer, price, discounts, ways to pay and link for every ad and DM                                                     | `npm run campaign:brief -- <slug>` |

Never type a price into a page component, an ad, a caption or a DM.

## Why the prices are lower

Owner-developer model: the owner builds the work, reuses proven Fee The Developer systems (booking, Stripe checkout, site templates), and carries no agency layers. v3 cut every v2 price by 30%, rounded down to a clean number. Estimating rate for scoped work: $122.50/hour.

## Price chart (v3)

| Line                  | Item                                                                                                              | Price                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Starter Sites (fixed) | **Own Your Bookings**: .com in the client's name, home + services pages, custom booking page with Stripe checkout | $199                                                  |
|                       | Own Your Bookings Plus: up to 4 pages, deposits at checkout                                                       | $525                                                  |
|                       | Shop Bundle (4 chairs, booking page per chair) · extra chair                                                      | from $840 · $105                                      |
|                       | **Starter Hosting** (required, from launch): hosting, SSL, domain renewal, DNS and email forwarding               | $10/month                                             |
|                       | Get Found on Google · Pro Inbox · Extra Page                                                                      | $99 · $69 · $49                                       |
| Business Websites     | Business Site Essentials                                                                                          | from $1,750                                           |
|                       | Strategic Website Redesign                                                                                        | from $3,325                                           |
|                       | Website Launch                                                                                                    | from $3,850                                           |
|                       | Digital Presence Bundle                                                                                           | from $4,725                                           |
|                       | E-commerce or Custom Website Features                                                                             | from $7,000                                           |
| Software & Automation | Lead Capture & CRM · API Integration · AI Assistant                                                               | from $980 · $1,470 · $1,470                           |
|                       | Custom Software · Clerk + Supabase · Analytics Dashboard · Public-Data Tool                                       | from $2,450 each                                      |
|                       | Full Business System                                                                                              | from $7,000                                           |
| Presence add-ons      | Payments & Back-End · Yelp · Apple · GA4 Audit · Business Profile · Workspace Email · Alignment · GA4 Setup       | $175 · $245 · $245 · $315 · $365 · $365 · $490 · $645 |
| Care plans (monthly)  | Maintenance · Cloud Mgmt · Monitoring · Change Block · Protection                                                 | $120 · $245 · $245 · $365 · $595                      |

Retired: Business Website Design & Development (duplicated Website Launch), Get Paid Button (checkout is now in every Starter Site), Keep-Live (replaced by Starter Hosting). Booked & Paid became Own Your Bookings Plus.

## Starter Sites package rules (King Fee, 2026-11-08)

Applies to Own Your Bookings, Own Your Bookings Plus and Shop Bundle. Business websites keep their care plans.

1. **You own your .com.** The domain is registered in the client's name.
2. **We host it for $10 a month, from launch.** Covers hosting, SSL, domain renewal and the domain settings (DNS) that keep booking, checkout and email working. FTD holds the domain controls while hosting is active, in exchange for the service.
3. **Your money goes to you.** Clients pay into the client's own Stripe account. Stripe's processing fees apply.
4. **Replies within 24 hours.** Forms, change requests and questions.
5. **Leave any time.** To move the domain to another host, FTD transfers the domain to the client and sends the site's code. Hosting ends and the site comes off FTD's servers.

Billing: the $199/$525/$840 checkout is one-time. The Starter Hosting subscription link goes out with the go-live approval, and the site goes live once it is active. In the catalog, Starter Hosting has `publicCheckout: false` (no buy button on the site) and each package has `requires: "starter-hosting"` (the offer page shows "+ $10/month starter hosting from launch"). Open: what happens when a hosting payment fails.

## Discounts

- **Veterans and veteran-owned businesses: 30% off every item, on top of these prices.** Proof first (DD-214, VA ID card, or a VOSB/SDVOSB certificate), sent by email, never uploaded to the site. Then `npm run veteran:code -- --ref <intake reference> --live` mints a single-use code that expires in 30 days. Stripe coupon: `ftd-veteran-30`.
- **YOBUL (76ers fans): 20%,** as a quote discount, never on Starter Sites.
- **One discount per order.**

## Ways to pay

- **Pay in full** on any item.
- **30% deposit to start** on one-time builds from $1,000 (each has its own deposit Payment Link). The balance is invoiced at design approval and at launch through Stripe Invoicing.
- **Pay over time:** turn on Affirm, Afterpay and Klarna in the Stripe Dashboard (Settings → Payment methods). Payment Links then offer them automatically to eligible buyers. FTD is paid in full; the provider approves the buyer and sets the terms. Stripe's limits: Affirm $50–$30,000, Afterpay $1–$4,000, Klarna from $10.

## Switching all prices at once

Run from the repo root with `STRIPE_SECRET_KEY` in `.env.local` (never committed). Test mode first.

1. **Plan (read-only):** `npm run pricing:sync`.
2. **Apply:** `npm run pricing:sync -- --apply` (add `--live` with a live key). New prices take over each lookup key, deposit prices and links are created, the veteran coupon is created, every link accepts promotion codes, and `lib/service-checkout-links.json` is rewritten. Old links stay active so the live site keeps selling.
3. **Payment methods:** turn on Affirm, Afterpay and Klarna in the Stripe Dashboard.
4. **Database:** apply `supabase/migrations/20261108220000_service_catalog_pricing_v3.sql`.
5. **Deploy:** commit the catalog and links file, then `npm run deploy` (feethedeveloper.com deploys by hand).
6. **Retire, after the new site is live:** `npm run pricing:sync -- --retire --live` switches off superseded links, archives their prices and archives retired products. A link in the committed links file is never touched.

Every phase is safe to re-run. A listed product that is missing or archived stops the run before anything is written.

## Checks

`npm run pricing:test`: 13 tests against an in-memory Stripe seeded at today's live prices. Covers plan writes nothing, every price at least 30% lower, deposits on the right items and never the default price, idempotent apply, promotion codes on every link, one veteran coupon, single-use expiring veteran codes with no email stored, retire safety, missing or archived products, the migration, and campaign briefs.
