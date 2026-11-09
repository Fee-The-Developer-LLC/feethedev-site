# Handoff: ad to checkout, one button per offer

- **Handoff ID:** FTD-2026-11-08-AD-CTA
- **Date:** 2026-11-08 · **From:** Claude (cloud session) · **To:** Claude Code in VS Code (this repo)
- **Company:** Fee The Developer LLC only · **Repo:** feethedev-site · **Branch:** feat/pricing-v3
- **Status:** READY · **Approval:** King Fee approves deploy and any public post
- **Storyboard (design canvas):** https://claude.ai/artifact/MnEpsx13nQ4cX6L8gMknV5

## Objective

Every ad, post and DM for an offer lands on that offer's `/services/<slug>` page. The page headline is the ad's hook, the hero image is the ad's last frame, and the primary button says the same words in the ad, in the page header, in the hero, on the phone bar and on the final button. Right now the shared template says "Buy now" and campaigns point at `/pricing`.

## Current verified condition (read 2026-11-08, 18:05 CT)

- `app/services/[slug]/page.tsx` + `lib/services.ts` build one page per active catalog item (commit c1427a9).
- `components/ServiceCheckoutCta.tsx` shows `Buy now` (or `Request`), an outline `Pay <amount> deposit`, and `Free consultation`.
- v3 prices are synced to Stripe and `lib/service-checkout-links.json` is updated (commit 86df8f5).
- `campaign.landingPath` in `lib/pricing-catalog.json` is `/pricing` or `/pricing#starter-sites` for all 8 featured items.
- Working tree has uncommitted deletions (public/logo.png and two showcase PNGs). They are King Fee's. Leave them alone.

## CTA map (source of truth goes into the catalog)

| Slug | Hook = page H1 | Button label | Platform button | Checkout |
| --- | --- | --- | --- | --- |
| own-your-bookings | Your clients should book you, not an app. | Own my bookings · $199 | Shop Now | $199 in full |
| own-your-bookings-plus | An empty chair is money you already counted. | Stop no-shows · $525 | Shop Now | $525 in full |
| shop-bundle | One site for the shop. A page for every chair. | Put my shop online · $840 | Shop Now | $840, chair +$105 |
| business-site-essentials | Your business grew. Your website didn't. | Start with $525 down | Learn More | 30% deposit or $1,750 |
| website-launch | First impressions happen before the first visit. | Start with $1,155 down | Learn More | 30% deposit or $3,850 |
| digital-presence-bundle | You do great work. The problem is being found. | Start with $1,418 down | Learn More | 30% deposit or $4,725 |
| custom-software-and-automation | Some work should not need a person every time. | Start with $735 down | Learn More | 30% deposit or $2,450 |
| full-business-system | At some point the business needs a system, not more tools. | Start with $2,100 down | Learn More | 30% deposit or $7,000 |

Hooks are already in `campaign.hook`. Prices and deposits come from the catalog; never type them.

## Requested action

1. **Catalog.** Add `campaign.cta: { "verb": "Own my bookings", "platform": "Shop Now" }` to the 8 featured items. Build the label in code: fixed-price items `"<verb> · <formatPrice>"`, deposit items `"Start with <deposit amount> down"`. Set `campaign.landingPath` to `/services/<slug>`. Extend `validateCatalog` (verb required on featured items; platform is `Shop Now` or `Learn More`), and have `scripts/campaign-brief.mjs` print the exact button label and the UTM link.
2. **`ServiceCheckoutCta`.** When the item has `campaign.cta`: primary button = the label above. For deposit items, primary = deposit link, second = `Pay in full · <price>` (full link). `Free consultation` stays third. Items without a campaign keep today's behavior.
3. **Campaign layout on `/services/[slug]`** (only items with `campaign`), section order from the storyboard:
   - Focused header: wordmark left, the same primary button right, sticky. The full menu moves to the footer.
   - Hero: eyebrow = item name, H1 = `campaign.hook`, description, price line, primary + secondary button, the line "Pay over time at checkout where eligible. Veterans and veteran-owned businesses save 30%."
   - Starter line only: "The app owns the link. Now you do." comparison (link, payments, client list, email). No competitor names, no invented fee numbers.
   - What's included (`includes`), three steps (check out, tell us your services, approve the preview and go live), ways to pay band, add-ons (same line, filtered by `appliesTo`), cross-sell cards to Plus and Shop Bundle on starter pages, FAQ, final CTA repeating the hook and the same button.
   - Phone: new `components/StickyCtaBar.tsx`, a bottom bar with price + button that appears after the hero button leaves the viewport (IntersectionObserver), safe-area padding, 48px+ targets.
4. **Hero image = the ad's last frame.** Add `serviceImages` entries pointing at `/library/ads/<slug>-last-frame.webp` (King Fee exports these from Flow). Keep the line image as fallback until a file exists. Label AI-generated scenes.
5. **Welcome page** `app/services/[slug]/welcome/page.tsx`: server-side, retrieve the Checkout Session from `session_id` with the Stripe secret key, require `payment_status === 'paid'` and a line item on that service's product, otherwise show a neutral "We couldn't confirm that payment" state with contact. On success: "You own your bookings now." (starter) or "You're on the schedule." (builds), the NOW / NEXT / THEN steps, and the intake form preset to the service with `source` encoding `paid=1`. Never trust the query string alone, never put email or PII in the URL, noindex the route.
6. **Stripe redirect.** In `scripts/sync-pricing.mjs`, set each Payment Link's `after_completion` to `{ type: 'redirect', redirect: { url: 'https://feethedeveloper.com/services/<slug>/welcome?session_id={CHECKOUT_SESSION_ID}' } }` (base slug for deposit links). Plan mode lists the change, and King Fee runs `--apply --live`.
7. **Signature intro.** On campaign pages, a logo reveal of about 1 second, skippable, respects `prefers-reduced-motion`, and never blocks the button on first paint. The homepage keeps the full reveal.

## Acceptance criteria

- For each of the 8 slugs, the label in the ad brief, header, hero, phone bar and final CTA is identical (add a test that renders or derives all four from one function).
- A test fails if a button label's price differs from `formatPrice` or `depositFor` for that item.
- Deposit items show the deposit first and pay-in-full second. Starter items show one buy button.
- `/services/<slug>/welcome` refuses unpaid or mismatched sessions.
- No storyboard spec tags (the orange dashed labels) and no dev labels ship to production.
- `npm run pricing:test`, lint, type-check and `npm run build` pass. Check mobile at 390px with no horizontal scroll.

## Env vars

`STRIPE_SECRET_KEY` (server only, already used by the sync scripts) for the welcome page session check. No new public vars.

## Open decisions for King Fee

- Turnaround for the FAQ ("How fast is it live?"), shown as `[YOUR TURNAROUND]` in the storyboard. Do not ship a placeholder.
- Whether each client's .com is registered in the client's name. If yes, add it to the FAQ.
- Approve the short intro on campaign pages.

## UTM convention

`?utm_source=<instagram|facebook|tiktok|linkedin>&utm_medium=<paid_social|organic|dm>&utm_campaign=<slug>&utm_content=<creative id>`

## Decision log

- 2026-11-08: Landing pages are the existing `/services/<slug>` pages, not a new `/offers` route.
- 2026-11-08: One button phrase per offer. Deposit-first for builds from $1,000.

**Next owner:** Claude Code (VS Code) · **Next action:** steps 1–2, then 3, then 5–6.

---

## Addendum A (2026-11-08, 18:40 CT): Starter Sites package rules, set by King Fee

These replace the open decisions above. Build them before more page polish, because they change the price shown in every Starter ad.

### Decisions

- **Turnaround:** "We reply within 24 hours." This is a reply promise, not a launch promise. Use it in the FAQ and on the welcome page.
- **Domain:** the client owns the domain registration (registered in the client's name).
- **Hosting:** $10/month, starting at launch. While hosting is active, FTD hosts the site and holds the domain controls (DNS) in exchange for the service. Domain renewal is included in the $10/month.
- **Leaving:** if the client wants the domain moved to another host, hosting ends, FTD takes the site off its servers, and the client gets the site code and the domain transfer.
- **Scope:** Starter Sites only (Own Your Bookings, Own Your Bookings Plus, Shop Bundle). Business websites keep their care plans.

### Catalog changes (`lib/pricing-catalog.json`)

1. Add the item:

```json
{
  "slug": "starter-hosting",
  "name": "Starter Hosting",
  "line": "starter",
  "status": "active",
  "stripeProductId": null,
  "amountCents": 1000,
  "interval": "month",
  "priceMode": "flat",
  "featured": false,
  "paymentsIncluded": false,
  "sortOrder": 4,
  "description": "Hosting for a Starter site, from launch: hosting, SSL, domain renewal, and the domain settings that keep booking, checkout and email working.",
  "includes": [
    "Hosting and SSL",
    "Domain renewal every year",
    "Domain settings (DNS) managed for you",
    "you@yourdomain.com email forwarding",
    "We reply within 24 hours"
  ],
  "scopeNote": "Required for Own Your Bookings, Own Your Bookings Plus and Shop Bundle sites hosted by Fee The Developer. Starts at launch, billed monthly. You own your domain. To move it to another host, we transfer the domain to you and send your site code; hosting ends and the site comes off our servers.",
  "yobulEligible": false
}
```

2. Set `keep-live` to `"status": "retired"` (replaced by Starter Hosting). Keep-Live's "two updates a year" does not carry over unless King Fee says so.
3. In the three Starter items, replace the scope-note phrase "domain renewal after year one" with "Starter Hosting ($10/month from launch)". Change the include "Your .com domain, first year included" to "Your .com, registered in your name". Domain renewal now sits inside hosting.
4. Add a top-level `"packageRules"` array, so the page, campaign briefs and the welcome page read one list:

```json
"packageRules": [
  { "title": "You own your .com", "body": "Your domain is registered in your name." },
  { "title": "We host it for $10 a month", "body": "From launch: hosting, SSL, domain renewal and the domain settings that keep booking, checkout and email working. We hold the domain controls while hosting is active." },
  { "title": "Your money goes to you", "body": "Clients pay into your own Stripe account. Stripe's processing fees apply." },
  { "title": "Replies within 24 hours", "body": "Forms, change requests and questions get a reply within 24 hours." },
  { "title": "Leave any time", "body": "Want your domain at another host? We transfer the domain to you and send your site's code. Hosting ends and the site comes off our servers." }
]
```

### Stripe

- `npm run pricing:sync` creates the `starter-hosting` product and a monthly price (`ftd_service_starter-hosting`), plus a subscription Payment Link.
- **Billing starts at launch:** the $199 checkout stays one-time. The hosting link goes out with the go-live approval, and the site goes live once the subscription is active. Do not bundle the subscription into the $199 checkout.
- Retire leaves Keep-Live's old link alone if it is in the committed links file. Archive its price after deploy.

### Page and ad changes

- **Price line, everywhere the $199 shows** (hero, phone bar, final CTA, campaign brief, ad end card): "$199 one time · then $10/month hosting from launch". The button label stays "Own my bookings · $199".
- **New section "The rules, in writing"** on starter pages, after "What you get", rendered from `packageRules`.
- **Add-ons:** replace Keep-Live with Starter Hosting, shown as included context, not an optional add-on.
- **FAQ:**
  - "What happens after year one?" becomes "What does hosting cover?" (answer from Starter Hosting)
  - "How fast is it live?" becomes "How fast do you reply?" ("Within 24 hours")
  - Add "Can I move my domain?" (the leave-any-time rule)
- **Welcome page:** NEXT = "We reply within 24 hours with your preview timeline." THEN = "Approve the preview, start hosting at $10/month, and go live."
- **Comparison table:** add the row "Leaving | Your page stays behind | You get your domain and your site's code".

### Still open for King Fee

- What happens if a hosting payment fails (grace period, site paused, and so on). Do not ship copy about it until decided.
