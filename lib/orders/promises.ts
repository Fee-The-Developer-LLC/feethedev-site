import type { CatalogItem, PricingLineId } from '@/lib/catalog';

/**
 * What a buyer is told happens after they pay: the steps, how long each takes,
 * and the welcome video for that product line.
 *
 * These are promises to paying customers. Nothing here is shown on the site or
 * in an email until King Fee approves it: set `APPROVED_ON` to the approval
 * date. Until then buyers see only the generic next step (`pendingSteps`).
 *
 * Status: DRAFT (2026-11-12) — awaiting King Fee's sign-off.
 */
export const APPROVED_ON: string | null = null;

export type PromiseStep = {
  /** Short label, e.g. "Kickoff". */
  title: string;
  /** When it happens, counted from payment unless the text says otherwise. */
  when: string;
  detail: string;
};

export type LinePromise = {
  /** One-line headline: when they have their product. */
  headline: string;
  steps: PromiseStep[];
  /** What the buyer needs to do so the clock can start. */
  youDo: string[];
  /**
   * Welcome video (King Fee presenter) for this product line. A public HTTPS
   * URL to an .mp4 (R2 or Stream); null until the video is produced.
   */
  videoUrl: string | null;
};

const kickoff: PromiseStep = {
  title: 'Kickoff',
  when: 'Within 1 business day',
  detail:
    'King Fee or the FTD team reaches out by email (and text once enabled) to confirm details and answer questions.',
};

export const linePromises: Record<PricingLineId, LinePromise> = {
  starter: {
    headline:
      'Your site and bookings go live within 5 business days of getting your details.',
    steps: [
      kickoff,
      {
        title: 'Preview',
        when: 'Within 3 business days of your details',
        detail:
          'You get a private preview link on ftdsitepreviews.com to approve or request changes.',
      },
      {
        title: 'Live',
        when: 'Within 5 business days of your details',
        detail:
          'Your domain, pages and booking checkout go live. Hosting starts at launch.',
      },
    ],
    youDo: [
      'Send your business name, services and prices, hours, and two or three domain choices.',
      'Tell us if you already have a Stripe account.',
    ],
    videoUrl: null,
  },
  websites: {
    headline:
      'First design preview in 7–10 business days; launch in about 3–4 weeks.',
    steps: [
      kickoff,
      {
        title: 'Discovery call',
        when: 'Booked within 2 business days',
        detail: 'A 30-minute call to lock pages, content and goals.',
      },
      {
        title: 'Design preview',
        when: '7–10 business days after your content arrives',
        detail:
          'Review it on ftdsitepreviews.com. If you paid a deposit, the next payment is invoiced at design approval.',
      },
      {
        title: 'Launch',
        when: 'About 3–4 weeks from kickoff',
        detail:
          'Final QA, go-live on your domain, and a walkthrough of how to make changes. Any balance is invoiced at launch.',
      },
    ],
    youDo: [
      'Book the discovery call from the link in your email.',
      'Send your logo, photos and any existing text.',
    ],
    videoUrl: null,
  },
  systems: {
    headline:
      'Written scope and build schedule within 5 business days of discovery.',
    steps: [
      kickoff,
      {
        title: 'Discovery call',
        when: 'Booked within 2 business days',
        detail:
          'We map the workflow, the systems involved and what "done" means.',
      },
      {
        title: 'Scope and schedule',
        when: 'Within 5 business days of discovery',
        detail:
          'A written scope with milestones and dates. Nothing beyond your starting allowance is billed without your approval.',
      },
      {
        title: 'Build and demos',
        when: 'Per the schedule',
        detail:
          'Progress demos at each milestone, then handoff and documentation.',
      },
    ],
    youDo: [
      'Book the discovery call.',
      'List the accounts and tools involved; we send a secure way to grant access — never send passwords by email or text.',
    ],
    videoUrl: null,
  },
  presence: {
    headline:
      'Started within 2 business days; most setups done in 5–7 business days.',
    steps: [
      kickoff,
      {
        title: 'Setup',
        when: 'Within 5–7 business days',
        detail:
          'We set up or clean up the profile with you. Verification steps are completed with you on a short call.',
      },
      {
        title: 'Platform review',
        when: 'Set by the platform',
        detail:
          'Google, Apple and Yelp control verification and approval times. We track it and tell you when it clears.',
      },
    ],
    youDo: [
      'Have the owner account login handy for a short screen-share — we never ask for your password.',
    ],
    videoUrl: null,
  },
  ai: {
    headline: 'Your AI plugin is installed within 5 business days of access.',
    steps: [
      kickoff,
      {
        title: 'Access',
        when: 'At kickoff',
        detail:
          'You add FTD to your workspace with the access level we walk you through.',
      },
      {
        title: 'Install and training',
        when: 'Within 5 business days of access',
        detail:
          'Plugin installed, tested on your real tasks, and a short how-to video recorded for your team.',
      },
    ],
    youDo: ['Tell us which workspace or account the plugin goes in.'],
    videoUrl: null,
  },
  care: {
    headline: 'Your plan is active now; first check-in within 1 business day.',
    steps: [
      kickoff,
      {
        title: 'Monthly service',
        when: 'Every month',
        detail:
          'Updates, checks and your included hours. Requests go through your dashboard or contact@feethedeveloper.com.',
      },
      {
        title: 'Billing',
        when: 'Monthly on your start date',
        detail: 'Cancel any time before your next renewal date.',
      },
    ],
    youDo: ['Send your first request or confirm there is nothing urgent.'],
    videoUrl: null,
  },
};

/** Shown until the promises above are approved. Makes no timing claim beyond contact. */
export const pendingSteps: PromiseStep[] = [
  {
    title: 'Next step',
    when: 'Coming up',
    detail:
      'The FTD team reaches out personally to confirm your details and schedule. Reply or call any time.',
  },
];

export function promiseFor(item: Pick<CatalogItem, 'line'>): {
  approved: boolean;
  promise: LinePromise | null;
  steps: PromiseStep[];
} {
  const promise = linePromises[item.line] ?? null;
  const approved = APPROVED_ON !== null && promise !== null;
  return {
    approved,
    promise: approved ? promise : null,
    steps: approved && promise ? promise.steps : pendingSteps,
  };
}
