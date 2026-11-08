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
  depositFor,
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

/** Items whose page is hand-built instead of using the shared template. */
const customRoutes: Partial<Record<string, string>> = {
  'payments-and-back-end-integration': 'payments-integration',
};

export const serviceCategories = pricingLines
  .filter((line) => line.items.length > 0)
  .map((line) => ({ id: line.id, name: line.name, summary: line.summary }));

export type ServiceCategoryId = PricingLineId;

const allServices = pricingLines.flatMap((line) =>
  line.items.map((item) => {
    const slug = customRoutes[item.slug] ?? item.slug;
    return {
      slug,
      checkoutSlug: item.slug,
      category: line.id,
      name: item.name,
      price: item.price,
      summary: item.description,
      includes: item.includes,
      notes: item.scopeNote,
      checkoutUrl: serviceCheckoutLinks[item.slug],
      deposit: depositFor(item),
      monthly: item.interval === 'month',
      yearly: item.interval === 'year',
      custom: Boolean(customRoutes[item.slug]),
      href: `/services/${slug}`,
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
