import { ProductTabs, type ShelfLine } from '@/components/ProductTabs';
import { serviceCategories, servicesInCategory } from '@/lib/services';

/**
 * Home page product shelf: one tab per catalog line, each product as a clean
 * card with its image, price, a details link and its own buy button.
 * Everything comes from the catalog through `lib/services.ts`.
 */
export function ProductShelf() {
  const lines: ShelfLine[] = serviceCategories.map((category) => ({
    id: category.id,
    name: category.name,
    summary: category.summary,
    products: servicesInCategory(category.id).map((service) => ({
      slug: service.slug,
      name: service.name,
      blurb: service.hook ?? service.summary,
      price: service.price,
      href: service.href,
      buy: service.primary,
    })),
  }));

  return <ProductTabs lines={lines} />;
}
