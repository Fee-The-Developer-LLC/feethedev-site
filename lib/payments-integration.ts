/**
 * Payments & Back-End Integration service.
 *
 * Case study facts come from the Hairline Matters client repository
 * (FeeTheDeveloper/hairline_matters_site, docs/DECISIONS.md D8, D10, D12,
 * D15 as of 2026-11-05). "Live" means deployed and taking real traffic on
 * hairlinematters.com; "Built" means implemented and verified in the repo but
 * held behind a launch switch until the client approves it. Do not move an
 * item to "Live" without checking the client repo and the production site.
 */

export type DeliveryStatus = 'Live' | 'Built';

export const paymentsService = {
  slug: 'payments-integration',
  name: 'Payments & Back-End Integration',
  shortName: 'Payments integration',
  summary:
    'Replace a borrowed checkout with payments that run on your own Stripe account and connect to the systems behind your business.',
  // Pricing set by King Fee 2026-11-06.
  price: '$250',
  checkoutSlug: 'payments-and-back-end-integration',
  // Pricing v2 (2026-11): Own Your .com does not include it; see
  // lib/pricing-catalog.json `rules.paymentsIncluded`.
  priceNote:
    'Included with Business Site Essentials and every website package above it',
  feeNote: 'Stripe’s own processing fees are separate and paid to Stripe.',
} as const;

export const paymentsCapabilities = [
  {
    title: 'Processor migration',
    detail:
      'Move off PayPal buttons, Square links, or a website builder checkout onto Stripe, without losing the way customers already pay.',
  },
  {
    title: 'Deposits, bookings, and products',
    detail:
      'Stripe Checkout and Payment Links for booking deposits, one-time products, and recurring plans, matched to how you actually sell.',
  },
  {
    title: 'Server-side pricing',
    detail:
      'Prices are read from your catalog on the server at checkout, so a total can never be edited in the browser.',
  },
  {
    title: 'Verified webhooks',
    detail:
      'Signed Stripe events confirm a payment before anything happens next, and repeat deliveries never create a second order.',
  },
  {
    title: 'Fulfillment and back office',
    detail:
      'Paid orders flow into the tools you run on: print-on-demand, scheduling, CRM, email, and Google Workspace.',
  },
  {
    title: 'Accounts and client portals',
    detail:
      'Secure sign-in and customer areas built on a production identity provider, ready for order history and member features.',
  },
] as const;

export const paymentsProcess = [
  {
    step: 'Audit',
    detail:
      'Map every place money changes hands today: buttons, links, plugins, and the manual steps after a sale.',
  },
  {
    step: 'Design the money path',
    detail:
      'Decide what is a deposit, a product, or a plan, where prices live, and what each confirmed payment must trigger.',
  },
  {
    step: 'Build in test mode',
    detail:
      'Implement checkout, webhooks, and integrations against Stripe test mode, with live keys refused until launch.',
  },
  {
    step: 'Verify',
    detail:
      'Run test payments, replay webhooks, and check that retries, refunds, and failed cards behave correctly.',
  },
  {
    step: 'Launch behind a switch',
    detail:
      'Each payment feature goes live on its own launch switch, so it can be turned on, or off, without a redeploy.',
  },
  {
    step: 'Hand off',
    detail:
      'You receive the account map, the environment variable list, and a runbook. Your Stripe account stays yours.',
  },
] as const;

export const paymentsGuarantees = [
  'Payments land in your own Stripe account, never ours.',
  'Keys live in your hosting secrets, never in code or chat.',
  'No price, total, or payment status is trusted from the browser.',
  'Every live change is approved by you before it ships.',
] as const;

export const hairlineMattersCaseStudy = {
  client: 'Hairline Matters',
  domain: 'hairlinematters.com',
  industry: 'Barbershop',
  image: '/work/hairline-matters.jpg',
  before: [
    'Template site on a website builder',
    'Booking handled on an outside scheduling page',
    'Payments taken through PayPal',
  ],
  after: [
    {
      status: 'Live' as DeliveryStatus,
      text: 'Custom site on Cloudflare at hairlinematters.com, replacing the builder site',
    },
    {
      status: 'Live' as DeliveryStatus,
      text: 'Every Book button opens a Stripe-hosted booking deposit on the client’s own Stripe account',
    },
    {
      status: 'Live' as DeliveryStatus,
      text: 'Production sign-in for the client portal on the shop’s own domain',
    },
    {
      status: 'Built' as DeliveryStatus,
      text: 'Merch checkout that reprices every cart on the server from the shop’s print-on-demand catalog',
    },
    {
      status: 'Built' as DeliveryStatus,
      text: 'Signed Stripe webhooks that open fulfillment orders, with retries that never duplicate an order',
    },
  ],
} as const;
