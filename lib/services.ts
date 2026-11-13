/**
 * One page per active catalog item at /services/[slug].
 *
 * Everything a page shows (name, price, description, inclusions, scope note,
 * deposit) comes from `lib/pricing-catalog.json` through `lib/catalog.ts`.
 * This file only adds routing.
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
      ? `+ ${formatPrice(required)} ${item.line === 'starter' ? required.name.toLowerCase() : required.name} from ${item.line === 'starter' ? 'launch' : 'delivery'}`
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
      // Items with no public checkout start alongside the thing they support.
      startsWhen:
        item.line === 'starter'
          ? {
              short: 'Starts at launch',
              full: 'Starts at launch with your Starter Site.',
            }
          : {
              short: 'Starts at delivery',
              full: 'Starts at delivery with your package.',
            },
      monthly: item.interval === 'month',
      yearly: item.interval === 'year',
      href: `/services/${item.slug}`,
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
