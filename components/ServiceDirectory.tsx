import Link from 'next/link';
import { veteranDiscount } from '@/lib/catalog';
import { serviceCategories, servicesInCategory } from '@/lib/services';

const lineTone: Record<string, string> = {
  starter: 'text-plasma',
  websites: 'text-electric',
  systems: 'text-coral',
  ai: 'text-plasma',
  presence: 'text-emerald',
  care: 'text-coral',
};

/** Every service, grouped by category, each card linking to its own page. */
export function ServiceDirectory({
  headingLevel = 'h2',
}: {
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;

  return (
    <div className="space-y-16">
      {serviceCategories.map((category) => {
        const items = servicesInCategory(category.id);
        const tone = lineTone[category.id] ?? 'text-plasma';
        return (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-heading`}
            className="scroll-mt-28"
          >
            <div className="flex flex-col gap-2 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`label-mono ${tone}`}>
                  {items.length} {items.length === 1 ? 'service' : 'services'}
                </p>
                <Heading
                  id={`${category.id}-heading`}
                  className="mt-2 text-2xl font-bold text-white sm:text-3xl"
                >
                  {category.name}
                </Heading>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted sm:text-right">
                {category.summary}
              </p>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={service.href}
                    className="aether-card aether-card--interactive group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma/50"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-lg font-semibold leading-snug text-white">
                        {service.name}
                      </span>
                    </span>
                    <span className="mt-3 flex-1 text-sm leading-6 text-muted">
                      {service.hook ?? service.summary}
                    </span>
                    <span className="mt-5 block">
                      <span className="block font-display text-xl font-bold tabular-nums text-white">
                        {service.price}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-coral">
                        {service.veteranPrice} with {veteranDiscount.percentOff}
                        % veteran discount
                      </span>
                    </span>
                    <span className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="label-mono text-steel">
                        {category.name}
                      </span>
                      <span
                        className={`label-mono transition group-hover:translate-x-1 ${tone}`}
                      >
                        Details <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
