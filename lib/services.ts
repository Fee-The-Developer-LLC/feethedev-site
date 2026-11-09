/**
 * One page per active catalog item at /services/[slug].
 *
 * Everything a page shows (name, price, description, inclusions, scope note,
 * deposit) comes from `lib/pricing-catalog.json` through `lib/catalog.ts`.
 * This file only adds routing and images.
 *
 * Images: set one per line below, or add a slug to `serviceImages`.
 */
import {
  ctaLabel,
  depositFor,
  formatPrice,
  getCatalogItem,
  pricingLines,
  serviceCheckoutLinks,
  type PricingLineId,
} from '@/lib/catalog';

export type ServiceImage = { src: string; alt: string };

const lineImages: Record<PricingLineId, ServiceImage> = {
  starter: {
    src: '/library/spaces/rain-wet-street-with-storefronts-cf1bfd80.webp',
    alt: 'Storefronts on a city street at night',
  },
  websites: {
    src: '/library/graphics/floating-browser-window-glowing-960a9dfc.webp',
    alt: 'A glowing browser window',
  },
  systems: {
    src: '/library/graphics/gears-surrounding-glowing-neural-55c25d43.webp',
    alt: 'Gears around a glowing network core',
  },
  presence: {
    src: '/library/graphics/chrome-map-pin-above-storefront-ef4ca26c.webp',
    alt: 'A map pin above a storefront',
  },
  care: {
    src: '/library/spaces/futuristic-server-room-corridor-036287e5.webp',
    alt: 'A server room corridor',
  },
};

/** Per-service overrides; anything missing uses its line image. */
const serviceImages: Partial<Record<string, ServiceImage>> = {
  'payments-and-back-end-integration': {
    src: '/library/graphics/payment-card-with-check-mark-31acfea4.webp',
    alt: 'A payment card with a check mark',
  },
  'business-analytics-dashboard': {
    src: '/library/graphics/floating-dashboard-with-bar-charts-b3d74149.webp',
    alt: 'A floating dashboard with bar charts',
  },
  'ai-assistant-or-chatbot-setup': {
    src: '/library/graphics/holographic-globe-with-orbit-rings-31c85b13.webp',
    alt: 'A holographic globe with orbit rings',
  },
};

export const serviceCategories = pricingLines
  .filter((line) => line.items.length > 0)
  .map((line) => ({ id: line.id, name: line.name, summary: line.summary }));

export type ServiceCategoryId = PricingLineId;

export type OfferAction = { label: string; href: string };

const allServices = pricingLines.flatMap((line) =>
  line.items.map((item) => {
    const deposit = depositFor(item);
    const checkout = `/checkout/${item.slug}`;
    const sellable = item.publicCheckout !== false;
    // Deposit items lead with the deposit (storyboard board 6).
    const primary: OfferAction | null = !sellable
      ? null
      : deposit
        ? { label: ctaLabel(item), href: `${checkout}?plan=deposit` }
        : { label: ctaLabel(item), href: checkout };
    const secondary: OfferAction | null =
      sellable && deposit
        ? { label: `Pay in full · ${formatPrice(item)}`, href: checkout }
        : null;
    const required = item.requires ? getCatalogItem(item.requires) : undefined;
    const requiredNote = required
      ? `+ ${formatPrice(required)} ${required.name.toLowerCase()} from launch`
      : null;

    return {
      slug: item.slug,
      category: line.id,
      lineName: line.name,
      name: item.name,
      price: item.price,
      flat: item.priceMode === 'flat',
      hook: item.campaign?.hook ?? null,
      summary: item.description,
      includes: item.includes,
      notes: item.scopeNote,
      hostedCheckoutUrl: serviceCheckoutLinks[item.slug],
      deposit,
      requiredNote,
      requiredHref: required ? `/services/${required.slug}` : null,
      primary,
      secondary,
      monthly: item.interval === 'month',
      yearly: item.interval === 'year',
      href: `/services/${item.slug}`,
      image: serviceImages[item.slug] ?? lineImages[line.id],
    };
  }),
);

export type Service = (typeof allServices)[number];
export const services: readonly Service[] = allServices;

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function servicesInCategory(id: ServiceCategoryId): Service[] {
  return services.filter((service) => service.category === id);
}
