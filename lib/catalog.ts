import checkoutLinks from './service-checkout-links.json';
import pricingCatalog from './pricing-catalog.json';

/**
 * `lib/pricing-catalog.json` is the single source of truth for every price on
 * the site, in Stripe (`npm run pricing:sync`), and in Supabase
 * (`npm run pricing:sql`). Change a price there, never in a page component.
 */

export type PricingLineId =
  | 'starter'
  | 'websites'
  | 'systems'
  | 'presence'
  | 'care';
export type BillingInterval = 'one_time' | 'month' | 'year';
export type PriceMode = 'flat' | 'starting_at';

export type CatalogItem = {
  slug: string;
  name: string;
  line: PricingLineId;
  status: 'active' | 'retired';
  stripeProductId: string | null;
  amountCents: number;
  interval: BillingInterval;
  priceMode: PriceMode;
  featured: boolean;
  promoEligible: boolean;
  paymentsIncluded: boolean;
  sortOrder: number;
  description: string;
  includes: string[];
  scopeNote: string;
  /** Limits a starter add-on to the listed parent products. */
  appliesTo?: string[];
  /** Read by scripts/campaign-brief.mjs; featured items carry one. */
  campaign?: {
    audience: string;
    pain: string;
    hook: string;
    landingPath: string;
    channels: string[];
    demo: string;
  };
};

export type PricingLine = {
  id: PricingLineId;
  name: string;
  audience: string;
  summary: string;
};

const catalog = pricingCatalog as {
  version: string;
  effectiveDate: string;
  lines: PricingLine[];
  items: CatalogItem[];
};

export const pricingVersion = catalog.version;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** `$200`, `$60/year`, `Starting at $5,500`, `Starting at $175/month`. */
export function formatPrice(
  item: Pick<CatalogItem, 'amountCents' | 'interval' | 'priceMode'>,
): string {
  const amount = usd.format(item.amountCents / 100);
  const suffix =
    item.interval === 'month'
      ? '/month'
      : item.interval === 'year'
        ? '/year'
        : '';
  const prefix = item.priceMode === 'starting_at' ? 'Starting at ' : '';
  return `${prefix}${amount}${suffix}`;
}

const activeItems = catalog.items
  .filter((item) => item.status === 'active')
  .sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Stripe-hosted checkout URLs, written by `npm run pricing:sync -- --apply`.
 * An item without a link yet (new before the first sync) falls back to the
 * project intake form, so a button never renders without a destination.
 */
export const serviceCheckoutLinks: Record<string, string> = Object.fromEntries(
  activeItems.map((item) => [
    item.slug,
    (checkoutLinks as Record<string, string>)[item.slug] ??
      `/start?service=${item.slug}`,
  ]),
);
export type CheckoutSlug = string;

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return activeItems.find((item) => item.slug === slug);
}

type PricedItem = CatalogItem & { price: string };
const withPrice = (item: CatalogItem): PricedItem => ({
  ...item,
  price: formatPrice(item),
});

/** Every active line with its items, in display order. */
export const pricingLines = catalog.lines.map((line) => ({
  ...line,
  items: activeItems.filter((item) => item.line === line.id).map(withPrice),
}));

/**
 * Solo-pro template products (Own Your .com and its add-ons). Kept apart from
 * the business packages so a $200 template never reads as a custom website.
 */
export const starterPricing = activeItems
  .filter((item) => item.line === 'starter')
  .map(withPrice);

const businessLines: PricingLineId[] = ['websites', 'systems'];

/** Featured business packages: the cards on /pricing. */
export const pricingOptions = activeItems
  .filter((item) => item.featured && businessLines.includes(item.line))
  .map(withPrice);

/** Every other business item: the add-on list on /pricing. */
export const addOnPricing = activeItems
  .filter((item) => item.line !== 'starter')
  .filter((item) => !(item.featured && businessLines.includes(item.line)))
  .map(withPrice);

export const serviceGroups = [
  {
    name: 'Web presence',
    summary: 'A credible, conversion-ready home for your business.',
    services: [
      'Business websites and strategic redesigns',
      'E-commerce storefronts and customer journeys',
      'Mobile-first UX, accessibility, SEO, and analytics foundations',
      'Booking, lead capture, payments, and launch support',
    ],
  },
  {
    name: 'Business discovery',
    summary: 'Consistent business information where customers search.',
    services: [
      'Google Business Profile setup and verification support',
      'Apple Business Connect setup',
      'Yelp profile setup or cleanup',
      'Contact, category, location, and service-area alignment',
    ],
  },
  {
    name: 'Software + automation',
    summary: 'Purpose-built systems that remove operational friction.',
    services: [
      'Client portals, dashboards, and custom applications',
      'AI-assisted workflows and business automation',
      'API, CRM, Workspace, and back-office integrations',
      'Architecture, deployment, and ongoing improvement',
    ],
  },
] as const;
