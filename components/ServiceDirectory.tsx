import Link from 'next/link';
import { serviceCategories, servicesInCategory } from '@/lib/services';

/** Every service, grouped by category, each linking to its own page. */
export function ServiceDirectory({
  headingLevel = 'h2',
}: {
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;

  return (
    <div className="space-y-14">
      {serviceCategories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          aria-labelledby={`${category.id}-heading`}
          className="scroll-mt-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 pb-4">
            <Heading
              id={`${category.id}-heading`}
              className="text-2xl font-semibold text-white"
            >
              {category.name}
            </Heading>
            <p className="text-sm text-slate-400">{category.summary}</p>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicesInCategory(category.id).map((service) => (
              <li key={service.slug}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
                >
                  <span className="text-lg font-semibold text-white">
                    {service.name}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                    {service.summary}
                  </span>
                  <span className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-semibold tabular-nums text-greenglow">
                      {service.price}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
