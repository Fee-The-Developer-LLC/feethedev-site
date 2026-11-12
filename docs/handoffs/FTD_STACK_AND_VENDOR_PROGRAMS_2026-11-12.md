# Handoff: "How we build" page and vendor business programs

- **Handoff ID:** FTD-2026-11-12-STACK
- **Date:** 2026-11-12, CT · **From:** Claude (cloud session, Fee The Developer project) · **To:** King Fee
- **Company:** Fee The Developer LLC only
- **Repo / branch:** `Fee-The-Developer-LLC/feethedev-site`, `feat/stack-page`
- **Status:** REVIEW. Code built and verified locally. Merge, deploy and program applications need King Fee.

## 1. Objective

1. Show the platforms FTD builds with (Cloudflare, GitHub, Claude Code, Codex, Google Flow, Claude, ChatGPT, Gemini) on feethedeveloper.com, for recognition and as a client-facing resource.
2. Show how FTD moves: the workflow from plan to launch.
3. Find each company's business programs FTD can use.

## 2. What was built

| File                 | Change                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `lib/stack.ts`       | Single source of truth: vendors, products, what each does at FTD, workflow steps, trademark notice, brand rules          |
| `app/stack/page.tsx` | New `/stack` page ("How we build"): hero, 5-step "How we move" rail, tools grid, supporting stack, CTA, trademark notice |
| `app/page.tsx`       | Text-only "Built with" strip under the hero, linking to `/stack`                                                         |
| `app/layout.tsx`     | Footer link "How we build" (main nav kept to Services, Pricing, Work per DESIGN.md)                                      |
| `app/sitemap.ts`     | `/stack` added                                                                                                           |
| `styles/globals.css` | `.signal-rail` scoped to direct children so nested lists don't get rail dots (no other usages)                           |
| `DESIGN.md`          | Documents the page and the vendor-name rules                                                                             |

## 3. Brand rules applied (checked 2026-11-12)

- **Names as text, no logos.** Cloudflare allows names in word form but needs written permission for logos (except its unaltered web badge). Google needs a brand-permission request for logos. OpenAI logos only under its brand terms; requests go to partnercomms@openai.com.
- **No endorsement claims.** The page says these are tools FTD uses and does not say "partner". Cloudflare only lets authorized partners claim partner status.
- **No vendor names in SEO metadata.** Cloudflare's guidelines bar using its marks in meta tags/SEO unless you are an authorized partner. The new page metadata does not list vendor names.
- **First use of Cloudflare carries ®**, and the page ends with a trademark attribution line.

## 4. Verification

| Check                         | Result                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`            | Pass                                                                                                                                                                                         |
| `npm run lint`                | Pass, no warnings                                                                                                                                                                            |
| Prettier on changed files     | Pass. 3 pre-existing warnings on `main` (two handoff docs, `scripts/sync-pricing.test.mjs`) left alone                                                                                       |
| `npm run build`               | Pass, `/stack` prerendered static. Run locally with a mocked Google Fonts response because the build sandbox cannot reach fonts.googleapis.com; CI and Cloudflare builds fetch the real font |
| Browser check                 | `/stack` and the homepage strip at 390px and 1366px, no horizontal scroll, CTA and notice render                                                                                             |
| `opennextjs-cloudflare build` | Not run here; CI runs it                                                                                                                                                                     |

Known: the 2026-11-09 handoff recorded GitHub Actions blocked by an account billing lock. If that is still true, CI will not start on this PR.

## 5. Vendor business programs

Most startup credit programs **exclude agencies, consultancies, and dev shops**. FTD's services business qualifies for **partner** programs. Startup credits need a product company (see 5.3).

### 5.1 Partner programs that fit FTD now (services)

| Company    | Program                                                                                       | Fit                                                                     | How to apply                                                                         |
| ---------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Anthropic  | Claude Partner Network (services partner directory; Anthropic Academy partner certifications) | Strongest fit: FTD sells Claude skills and plugins to clients           | Partner application form at claude.com/partners                                      |
| Cloudflare | PowerUP, **Consult** model (refer customers, no reselling)                                    | All FTD and client domains already run on Cloudflare                    | cloudflare.com/partners, or sales +1 (888) 99 FLARE                                  |
| Google     | Google Cloud Partner Network (Select, Premier, Diamond tiers)                                 | Pairs with FTD's Google Verification Service and Workspace work         | partners.cloud.google.com/enrollment                                                 |
| GitHub     | Services & Channel Partner program                                                            | Requirements are in GitHub's Program Guide PDF; read it before applying | "Apply now" at github.com/partners/service-channel-partners (portal.github.partners) |

Once accepted, partner status unlocks partner directory listings and, per each program's terms, using the partner name and badges on the site. Update `lib/stack.ts` only after written confirmation.

### 5.2 Recognition you can use today

- **Cloudflare web badge:** customers may show the unaltered badge from Cloudflare's press kit. This is the one vendor graphic usable without asking.
- **Logo permission requests:** OpenAI (partnercomms@openai.com), Google (brand permissions request form).

### 5.3 Credit programs (need a product company, not the agency)

| Program                           | Credits                                                           | Blocker for FTD services                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare for Startups           | $10k tier for bootstrapped or under $1M raised; 1 year            | Excludes consultancies and agencies. Needs a live tech product, domain-matched business email, ≤10 years old, first-time applicant |
| Google for Startups Cloud Program | Start tier (amount not stated on FAQ)                             | Excludes dev shops, consultancies, agencies. Needs a Google Cloud billing account and domain-matched email                         |
| GitHub for Startups               | $10k for 12 months                                                | Needs outside funding (Series B or earlier) and an approved partner affiliation                                                    |
| Claude for Startups               | Partner deals up to $45k; up to $100k API credits via partner VCs | Applications closed, cohort full. Subscribe to the newsletter for the next window                                                  |

Path: package one FTD product (for example the booking calendar or FTD OS) as its own product with a live domain, then apply under it. That is an entity and positioning decision for King Fee.

## 6. Decisions needed from King Fee

1. Merge PR and deploy (`npm run deploy`).
2. Which partner applications to submit first. Recommended order: Claude Partner Network, Cloudflare PowerUP (Consult), Google Cloud Partner Network, then GitHub after reading its guide. Submitting forms is an external action and needs your go-ahead.
3. Whether to spin a product off for startup credits.

## 7. Next owner

King Fee for approvals; Claude for applications prep and the site update after any partner acceptance.
