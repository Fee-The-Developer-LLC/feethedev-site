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
  /** The 76ers YOBUL quote discount applies. Never on Starter Sites. */
  yobulEligible: boolean;
  paymentsIncluded: boolean;
  sortOrder: number;
  description: string;
  includes: string[];
  scopeNote: string;
  /** Share of the starting price that starts the work; balance invoiced later. */
  depositPercent?: number;
  /** Limits a starter add-on to the listed parent products. */
  appliesTo?: string[];
  /** A recurring item the buyer must also take, e.g. Starter Hosting. */
  requires?: string;
  /** false = no buy button; the link is sent privately (Starter Hosting). */
  publicCheckout?: boolean;
  /** Read by scripts/campaign-brief.mjs; featured items carry one. */
  campaign?: {
    audience: string;
    pain: string;
    hook: string;
    landingPath: string;
    channels: string[];
    demo: string;
    /** Button words before the price, e.g. "Own my bookings". */
    cta?: string;
    /** The platform's own ad button: "Shop Now" or "Learn More". */
    platformButton?: string;
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
  discounts: {
    veteran: { percentOff: number };
    yobul: { percentOff: number };
  };
};

/** Veterans and veteran-owned businesses, on top of every price, after proof. */
export const veteranDiscount = {
  percentOff: catalog.discounts.veteran.percentOff,
} as const;

export const pricingVersion = catalog.version;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** `$199`, `$42/year`, `Starting at $3,850`, `Starting at $120/month`. */
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

/** Deposit link and amount for items that can start on a deposit. */
export function depositFor(
  item: Pick<CatalogItem, 'slug' | 'amountCents' | 'depositPercent'>,
): { percent: number; amount: string; href: string } | null {
  if (!item.depositPercent) return null;
  const cents =
    Math.round((item.amountCents * item.depositPercent) / 100 / 100) * 100;
  return {
    percent: item.depositPercent,
    amount: usd.format(cents / 100),
    href:
      (checkoutLinks as Record<string, string>)[`${item.slug}--deposit`] ??
      `/start?service=${item.slug}&plan=deposit`,
  };
}

/**
 * The one button label shared by the ad end card, the offer page and the
 * phone bar: `Own my bookings · $199`, `Start with $1,155 down`.
 * Mirrors `ctaLabel` in scripts/campaign-brief.mjs.
 */
export function ctaLabel(
  item: Pick<
    CatalogItem,
    | 'slug'
    | 'amountCents'
    | 'interval'
    | 'priceMode'
    | 'depositPercent'
    | 'campaign'
  >,
): string {
  const deposit = depositFor(item);
  if (deposit) return `Start with ${deposit.amount} down`;
  const price = formatPrice(item).replace('Starting at ', 'from ');
  return `${item.campaign?.cta ?? 'Buy now'} · ${price}`;
}

export function getCatalogItem(slug: string): CatalogItem | undefined {
  return activeItems.find((item) => item.slug === slug);
}

type PricedItem = CatalogItem & { price: string };
const withPrice = (item: CatalogItem): PricedItem => ({
  ...item,
  price: formatPrice(item),
});

/** Featured items for the /start service menu, in display order. */
export const intakeServices = activeItems
  .filter((item) => item.featured)
  .map((item) => ({ slug: item.slug, name: item.name }));

/** Every active line with its items, in display order. */
export const pricingLines = catalog.lines.map((line) => ({
  ...line,
  items: activeItems.filter((item) => item.line === line.id).map(withPrice),
}));

/**
 * Starter Sites (Own Your Bookings and its add-ons). Kept apart from the
 * business packages so a $199 template never reads as a custom website.
 */
export const starterPricing = activeItems
  .filter((item) => item.line === 'starter')
  .map(withPrice);

export type PackageRule = { id: string; title: string; body: string };

/** Starter Sites rules ("The rules, in writing"), King Fee 2026-11-08. */
export const packageRules: PackageRule[] =
  (pricingCatalog as { packageRules?: PackageRule[] }).packageRules ?? [];

const ruleBody = (id: string) =>
  packageRules.find((rule) => rule.id === id)?.body;

/**
 * Starter page FAQ, built from the rules and the Starter Hosting item so no
 * answer can drift from what the catalog promises.
 */
export const starterFaq: { question: string; answer: string }[] = [
  {
    question: 'What does hosting cover?',
    answer: (() => {
      const hosting = getCatalogItem('starter-hosting');
      return hosting
        ? `${formatPrice(hosting)}, from launch. ${hosting.description.replace(/^[^:]*:\s*/, 'It covers ')}`
        : undefined;
    })(),
  },
  { question: 'How fast do you reply?', answer: ruleBody('replies') },
  { question: 'Can I move my domain?', answer: ruleBody('leaving') },
].filter((entry): entry is { question: string; answer: string } =>
  Boolean(entry.answer),
);

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
