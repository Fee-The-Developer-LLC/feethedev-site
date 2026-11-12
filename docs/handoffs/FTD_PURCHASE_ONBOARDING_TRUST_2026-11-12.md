# FTD Purchase → Onboarding Trust System — 2026-11-12

| Field         | Value                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------- |
| Handoff ID    | FTD-2026-11-12-PURCHASE-ONBOARDING                                                        |
| Company       | Fee The Developer LLC                                                                     |
| Repo / branch | FeeTheDeveloper/feethedev-site · `feat/purchase-onboarding-trust` (from `main` @ ce1110f) |
| Owner now     | King Fee (approvals)                                                                      |
| Next owner    | Claude (activation after approvals)                                                       |
| Status        | REVIEW                                                                                    |

## Objective

When a customer pays on feethedeveloper.com they should immediately know: it worked, what they bought, their order number, when they get it, what to do next, and how to reach a real person — by page, email, and (later) text, with a King Fee welcome video.

## Audit (before this branch)

- Checkout: embedded Stripe on `/checkout/[slug]`, Payment Link fallback. Confirmation: `/services/[slug]/welcome` → intake form. Receipt: Stripe default only.
- **No order record** unless the buyer stayed and filled the form. **No Stripe webhook** on the site. **No delivery timeline** on any product. **No terms/refund page.** **No email/SMS sender.**

## What this branch adds

| Piece                                                                                                                                                               | File(s)                                                                         | State                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Orders of record (orders, order_events, order_messages; RLS on, anon/auth revoked)                                                                                  | `supabase/migrations/20261112160000_create_orders.sql`                          | Not applied                                           |
| Stripe webhook: signature-verified, idempotent, records order even if tab closed; maps Payment Link sales; ignores booking-calendar sessions; refunds update status | `app/api/webhooks/stripe/route.ts`, `lib/orders/core.ts`, `lib/orders/store.ts` | Needs secret + Stripe destination                     |
| Order number (e.g. `FTD-7K2M-9QXA`), same on page, email and DB                                                                                                     | `lib/orders/core.ts`                                                            | Live on deploy                                        |
| Confirmation page: order number, receipt note, timeline, what we need, welcome video slot, contact, "Stripe holds your card"                                        | `components/orders/OrderNextSteps.tsx`, welcome page                            | Live on deploy (generic step until promises approved) |
| Checkout page: "When you get it" + secure-payment note                                                                                                              | `app/checkout/[slug]/page.tsx`                                                  | Shows once promises approved                          |
| Delivery promises per product line                                                                                                                                  | `lib/orders/promises.ts`                                                        | **DRAFT — needs approval**                            |
| Terms, refunds and delivery page                                                                                                                                    | `lib/orders/terms.ts`, `app/terms/page.tsx`                                     | **DRAFT — 404 until approved**                        |
| Order confirmation email (HTML + text)                                                                                                                              | `lib/orders/email.ts`                                                           | Built                                                 |
| Sender (Cloudflare Email Service or Resend), **off by default**, every message logged                                                                               | `lib/orders/send.ts`                                                            | **OFF — needs approval + provider**                   |
| Text message slot (logged as `not_configured`)                                                                                                                      | webhook                                                                         | Waits on A2P 10DLC                                    |

## Verification

- `npm run orders:test` — 8/8 pass (signature valid/rotation/tamper/wrong secret/replay/malformed; order number; formatting).
- `npm run lint` clean · `npx tsc --noEmit` clean · `npm run build` passes (sandbox used a mocked Google Fonts response because fonts.googleapis.com is blocked there).
- Local smoke: bad/missing signature → 400; valid signature → processing (500 without Supabase, so Stripe would retry); `/terms` → 404 while draft.
- Not verified: live Supabase writes, live Stripe delivery, real email send (not configured in sandbox).
- `format:check` flags 3 files already unformatted on `main` (not touched here).

## Decisions for King Fee

1. **Approve delivery promises** (`lib/orders/promises.ts`) — edit any number, then set `APPROVED_ON`.
2. **Approve terms** (`lib/orders/terms.ts`) — strongly recommend a Texas business attorney read the refund section; then set `TERMS_APPROVED_ON`.
3. **Email provider:** Cloudflare Email Service needs **Workers Paid (~$5/mo)** to email any customer (you're on Free), _or_ **Resend** free tier. Billing change = your call.
4. **Turn sending on** (`ONBOARDING_SEND_ENABLED=true`) after you receive a test order email yourself.
5. **Texting:** start A2P 10DLC brand + campaign registration with an SMS provider (e.g. Twilio); carriers take days–weeks.

## Activation steps (after approvals)

1. Apply the migration to Supabase project `dtwgakrkcdksghsyykqb`.
2. Stripe (FTD account) → Webhooks → add destination `https://feethedeveloper.com/api/webhooks/stripe`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`. Copy the signing secret yourself (never paste it in chat).
3. Cloudflare Worker `fee-the-developer` → Secrets: `STRIPE_WEBHOOK_SECRET`; vars `ONBOARDING_EMAIL_PROVIDER`, `ONBOARDING_FROM_EMAIL=orders@feethedeveloper.com`; `RESEND_API_KEY` if Resend; or add `"send_email": [{ "name": "EMAIL" }]` to `wrangler.jsonc` + onboard the domain in Email Service if Cloudflare.
4. Stripe Settings → Customer emails → confirm **successful payments** and **refunds** receipts are ON.
5. Test-mode purchase → confirm order row, `order_messages` row, email in inbox → then `ONBOARDING_SEND_ENABLED=true`.

## Welcome videos — King Fee presenter

**Plan:** one ~45-second video per product line (6), shown on the confirmation page and linked in the email. Recorded once, reused for every buyer in that line.

**What King Fee provides:** 2–3 minutes of himself talking to camera (good light, plain background, steady phone at eye level) + a clean 1-minute voice sample. Consent is his own; label the videos as AI-generated from King Fee's likeness in the page caption.

**Tools available in this workspace:** Fish Audio (`create_voice_clone`, `create_avatar`, `generate_video` talking avatar), ElevenLabs (voice), Runway. Each generation spends credits — estimates get shown before any spend.

**Hosting:** upload finals to an R2 bucket (public read) and set each line's `videoUrl` in `lib/orders/promises.ts`.

### Scripts (draft — timelines match the draft promises; update if you change them)

**Starter Sites (Own Your Bookings, Shop Bundle)**

> What's up, I'm King Fee, founder of Fee The Developer. You just bought your own site and booking system — thank you, and welcome. Here's exactly what happens: within one business day my team reaches out. Your job is simple: send your business name, services and prices, hours, and two or three domain ideas. Within three business days of that, you get a private preview link — approve it or ask for changes. Within five business days, you're live on your own .com, taking bookings and payments straight to your Stripe. Questions? Reply to your confirmation email or call the number on your order page. Let's get you booked up.

**Websites (Website Launch, Essentials, Redesign, E-commerce)**

> I'm King Fee, founder of Fee The Developer — thank you for trusting us with your website. Here's the road: within one business day we reach out, and within two you'll have a discovery call on the calendar. Send your logo, photos, and any text you have. Seven to ten business days after your content lands, you'll review your design on a private preview link. Launch is about three to four weeks from kickoff. If you paid a deposit, the next invoice comes at design approval and the last at launch — no surprises. Your order number is on your page; use it any time you reach out.

**Systems (Software, Automation, API, AI assistants, Dashboards)**

> King Fee here, Fee The Developer. You just started a custom build — welcome. First, we book a discovery call within two business days to map your workflow and what "done" looks like. Within five business days of that call you get a written scope with milestones and dates. Nothing beyond your starting allowance is ever billed without your approval. One rule: never send passwords by email or text — we'll walk you through granting access the safe way. You'll see demos at every milestone. Let's build.

**Presence (Google, Apple, Yelp, GA4, Workspace)**

> I'm King Fee with Fee The Developer — thanks for getting your business found. We start within two business days and most setups finish in five to seven. We'll do verification with you on a short screen-share, and we never ask for your password. Heads up: Google, Apple, and Yelp control their own approval times — we track it and tell you the moment it clears. Your order number and our contact info are on your order page.

**AI Plugins (Claude, ChatGPT, Gemini, Microsoft 365, GitHub)**

> King Fee here. You just added an AI plugin built by Fee The Developer — welcome. At kickoff we'll walk you through adding us to your workspace with the right access. Within five business days of that, your plugin is installed, tested on your real work, and you get a short how-to video for your team. Reply to your confirmation email with which workspace it goes in, and we're moving.

**Care plans (Maintenance, Cloud, Protection, Change blocks)**

> I'm King Fee — your Fee The Developer plan is active right now. We check in within one business day. Each month you get your updates, checks, and included hours; send requests through your dashboard or our email. Billing runs monthly on your start date, and you can cancel anytime before renewal. Thanks for letting us keep your business running.

## Security notes

- Webhook rejects unsigned/forged/replayed (>5 min) events; HMAC compared in constant time.
- Only the server holds `SUPABASE_SECRET_KEY`; new tables deny anon/authenticated.
- Email bodies HTML-escaped; message rows store no secrets; errors clipped to 500 chars.
- Order page link carries the Checkout Session id (Stripe's own pattern); the page shows only order summary, name and email.

## Rollback

Revert the branch merge. Migration is additive; tables can stay unused. Delete the Stripe webhook destination.
