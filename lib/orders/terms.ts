/**
 * Purchase terms: payments, delivery, refunds and cancellations for
 * feethedeveloper.com.
 *
 * Status: DRAFT (2026-11-12) — written from FTD's current published offers for
 * King Fee's approval. Not legal advice; have a Texas business attorney review
 * before publishing. /terms returns 404 and nothing links to it until
 * `TERMS_APPROVED_ON` is set.
 */
export const TERMS_APPROVED_ON: string | null = null;
export const TERMS_VERSION = '2026-11-12-draft';

export type TermsSection = { heading: string; body: string[] };

export const termsSections: TermsSection[] = [
  {
    heading: 'Who you are buying from',
    body: [
      'Fee The Developer LLC, a veteran-owned Texas company. Contact: contact@feethedeveloper.com or (214) 440-0022.',
    ],
  },
  {
    heading: 'How payment works',
    body: [
      'Payments are processed by Stripe. We never see or store your card number.',
      'You get two emails after paying: Stripe’s official receipt, and our order confirmation with your order number and next steps.',
      'Prices on the site are in US dollars. Stripe processing fees on your own Stripe account, domain registrar fees beyond what a package includes, and third-party subscriptions (Google Workspace, app plans, ad spend) are separate unless the package says otherwise.',
    ],
  },
  {
    heading: 'Deposits and balances',
    body: [
      'Projects with a deposit option start with a 30% deposit. The balance is invoiced at design approval and at launch, as listed on your order.',
      'Work beyond the scope on your order is quoted in writing and starts only after you approve it.',
    ],
  },
  {
    heading: 'When you receive your product',
    body: [
      'Every order shows a delivery timeline on your confirmation page and in your confirmation email. Timelines start when we have the details listed under “What we need from you.”',
      'If we will miss a date, we tell you before it passes, with the new date and the reason.',
      'Platform approvals (Google, Apple, Yelp, app stores, payment providers) are controlled by those platforms. We do the setup and track it; we cannot guarantee their approval or timing.',
    ],
  },
  {
    heading: 'Refunds',
    body: [
      'Changed your mind before work starts: full refund if you ask within 3 days of paying and before kickoff.',
      'After kickoff: deposits and one-time payments cover work already done and are not refundable, but if we fail to deliver what your order lists, we fix it at no cost or refund the undelivered part.',
      'Third-party costs already paid on your behalf (domains, subscriptions) are not refundable.',
      'Ask for a refund at contact@feethedeveloper.com with your order number. Approved refunds go back to your original payment method through Stripe, usually within 5–10 business days.',
    ],
  },
  {
    heading: 'Monthly plans',
    body: [
      'Monthly plans (hosting, care, maintenance) renew on your start date. Cancel any time before your next renewal; there are no partial-month refunds.',
      'Starter Sites: Starter Hosting ($10/month) is required from launch. Your .com is registered in your name. If a month goes unpaid, the site stays offline until that month is paid. If you leave, hosting ends, we transfer your domain and send your site code.',
    ],
  },
  {
    heading: 'Veteran discount',
    body: [
      'Veterans and veteran-owned businesses get 30% off after proof is verified; we then send a one-time code. Proof is requested by email, never uploaded on this site.',
    ],
  },
  {
    heading: 'Your accounts and data',
    body: [
      'You own your domain, your content and your Stripe account. We never ask for your passwords by email or text; access is granted through each platform’s own sharing tools.',
    ],
  },
];
