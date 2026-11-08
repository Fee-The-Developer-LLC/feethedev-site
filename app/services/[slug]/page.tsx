import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  hasCheckout,
  ServiceCheckoutCta,
} from '@/components/ServiceCheckoutCta';
import { Button, Section } from '@/components/ui';
import {
  getService,
  serviceCategories,
  services,
  servicesInCategory,
} from '@/lib/services';
import { siteConfig } from '@/lib/site-config';

export const dynamicParams = false;

export function generateStaticParams() {
  return services
    .filter((service) => !service.custom)
    .map((service) => ({ slug: service.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};

  return {
    title: service.name,
    description: `${service.summary} ${service.price}.`,
    alternates: {
      canonical: new URL(service.href, siteConfig.siteUrl),
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service || service.custom) notFound();
  const live = hasCheckout(service.checkoutUrl);

  const category = serviceCategories.find(
    (item) => item.id === service.category,
  )!;
  const related = servicesInCategory(service.category).filter(
    (item) => item.slug !== service.slug,
  );

  return (
    <main id="main-content" className="min-h-screen">
      <Section className="border-b border-white/10 py-12 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/services" className="hover:text-white">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/services#${category.id}`}
                className="hover:text-white"
              >
                {category.name}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold text-white sm:text-6xl">
              {service.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              {service.summary}
            </p>
            <p className="mt-6 text-3xl font-semibold tabular-nums text-greenglow">
              {service.price}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                href={service.checkoutUrl}
                glow="green"
                aria-label={`${live ? 'Buy' : 'Request'} ${service.name}, ${service.price}`}
              >
                {live ? 'Buy now' : 'Request'}
              </Button>
              <Button
                href={`/start?service=${service.checkoutSlug}`}
                variant="outline"
              >
                Ask a question
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-panel">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 92vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold text-white">
              What is included
            </h2>
            {service.notes && (
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                {service.notes}
              </p>
            )}
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {service.includes.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-slate-200"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-greenglow"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="pt-0">
        <ServiceCheckoutCta service={service} />
      </Section>

      {related.length > 0 && (
        <Section className="border-t border-white/10 pt-16">
          <h2 className="text-2xl font-semibold text-white">
            More in {category.name}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
                >
                  <span className="block font-semibold text-white">
                    {item.name}
                  </span>
                  <span className="mt-1 block text-sm tabular-nums text-slate-400">
                    {item.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
