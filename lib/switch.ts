/**
 * "Switch from Vagaro" comparison for the Own Your .com line (/switch).
 *
 * Our side reads name and price from the pricing catalog, so the page can
 * never show a price that /pricing does not. Vagaro's side is its published
 * US pricing as read on `vagaro.checked`; re-check vagaro.com and update the
 * date before an ad or page change repeats these figures.
 */
import { getCatalogItem } from '@/lib/catalog';

export const vagaro = {
  checked: 'November 11, 2026',
  firstCalendar: 23.99,
  extraCalendar: 10,
  /** Eight or more calendars cost the same as seven. */
  maxBilledCalendars: 7,
  /** Vagaro's website builder add-on, estimated from third-party pricing guides. */
  websiteEstimate: 10,
  sources: [
    { label: 'Vagaro Pro', href: 'https://www.vagaro.com/pro' },
    {
      label: 'Pabau: Vagaro pricing 2026',
      href: 'https://pabau.com/blog/vagaro-pricing/',
    },
    {
      label: 'GlossGenius: Vagaro vs Square',
      href: 'https://glossgenius.com/blog/vagaro-vs-square',
    },
  ],
} as const;

/** Vagaro's monthly subscription for a calendar count, before card processing. */
export function vagaroMonthly(calendars: number, website: boolean): number {
  const n = Math.max(1, Math.floor(calendars));
  const extras = Math.min(n, vagaro.maxBilledCalendars) - 1;
  const total =
    vagaro.firstCalendar +
    extras * vagaro.extraCalendar +
    (website ? vagaro.websiteEstimate : 0);
  return Math.round(total * 100) / 100;
}

export type OwnYourPlan = {
  /** Catalog item the plan is sold as. */
  slug: string;
  name: string;
  /** One-time build price in dollars (a "from" price for the Shop Bundle). */
  once: number;
  startingAt: boolean;
  /** Starter Hosting, per month, in dollars. */
  monthly: number;
};

const dollars = (cents: number) => cents / 100;

function requireItem(slug: string) {
  const item = getCatalogItem(slug);
  if (!item) throw new Error(`Catalog item ${slug} is missing or retired`);
  return item;
}

/** The Own Your .com plan that fits a team: solo, or a shop with chairs. */
export function ownYourPlan(calendars: number): OwnYourPlan {
  const n = Math.max(1, Math.floor(calendars));
  const hosting = dollars(requireItem('starter-hosting').amountCents);
  if (n === 1) {
    const solo = requireItem('own-your-bookings');
    return {
      slug: solo.slug,
      name: solo.name,
      once: dollars(solo.amountCents),
      startingAt: solo.priceMode === 'starting_at',
      monthly: hosting,
    };
  }
  const shop = requireItem('shop-bundle');
  const chair = requireItem('shop-bundle-extra-chair');
  const includedChairs = 4;
  const extraChairs = Math.max(0, n - includedChairs);
  return {
    slug: shop.slug,
    name: shop.name,
    once: dollars(shop.amountCents + extraChairs * chair.amountCents),
    startingAt: shop.priceMode === 'starting_at',
    monthly: hosting,
  };
}

/** Total paid over `months`, rounded to cents. */
export const totalOver = (months: number, monthly: number, once = 0) =>
  Math.round((once + months * monthly) * 100) / 100;

export const switchSteps = [
  {
    title: 'Send us your booking link',
    body: 'We look at your services, prices and photos, and check your Vagaro card-reader terms with you so the timing costs you nothing extra.',
  },
  {
    title: 'We build your .com',
    body: 'Your domain in your name, your pages and your booking page with Stripe checkout. You approve a preview link before launch.',
  },
  {
    title: 'We move you over, free',
    body: 'We set up your services and prices and bring over your client list, then point your bio links at your own site.',
  },
  {
    title: 'Clients book you, not an app',
    body: 'Payments land in your own Stripe account. Hosting is $10 a month and you can leave any time.',
  },
];

export const notIncluded = [
  'Text-marketing campaigns, payroll and inventory are not part of Own Your .com.',
  "Vagaro's card rates can be lower than Stripe's standard rates. Stripe's fees apply to your payments.",
  "If you took Vagaro's free card reader in the last 12 months, Vagaro may charge an early cancellation fee. We check this with you before you switch.",
  'Vagaro is a trademark of Vagaro, Inc. Fee The Developer is not affiliated with Vagaro.',
];
