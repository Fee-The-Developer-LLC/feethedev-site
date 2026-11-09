import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfferButton } from '@/components/offer/OfferButton';
import { OfferHeader, OfferPhoneBar } from '@/components/offer/OfferChrome';
import { Section } from '@/components/ui';
import { veteranDiscount } from '@/lib/catalog';
import { getService, services } from '@/lib/services';
import { siteConfig } from '@/lib/site-config';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.hook ?? service.summary} ${service.price}.`,
    alternates: { canonical: new URL(service.href, siteConfig.siteUrl) },
  };
}

export default async function OfferPage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const headline = service.hook ?? service.name;

  return (
    <>
      <OfferHeader action={service.primary} />
      <main id="main-content" className="min-h-screen pb-24 sm:pb-0">
        <Section className="py-12 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                {service.name}
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] text-white sm:text-6xl">
                {headline}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                {service.summary}
              </p>
              <p className="mt-7 text-4xl font-extrabold tabular-nums text-white">
                {service.price}
              </p>
              {service.requiredNote && service.requiredHref && (
                <Link
                  href={service.requiredHref}
                  className="mt-2 inline-block text-sm font-semibold text-slate-300 underline underline-offset-4 hover:text-white"
                >
                  {service.requiredNote}
                </Link>
              )}
              {service.primary ? (
                <div className="mt-7 flex flex-wrap gap-3">
                  <OfferButton
                    href={service.primary.href}
                    label={service.primary.label}
                  />
                  {service.secondary && (
                    <OfferButton
                      href={service.secondary.href}
                      label={service.secondary.label}
                      variant="secondary"
                    />
                  )}
                </div>
              ) : (
                <p className="mt-7 text-base font-semibold text-slate-200">
                  Starts at launch with your Starter Site.
                </p>
              )}
              <p className="mt-4 text-sm text-slate-400">
                Veterans and veteran-owned businesses save{' '}
                {veteranDiscount.percentOff}%.
              </p>
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

        <Section className="border-t border-white/10">
          <h2 className="text-3xl font-extrabold text-white">
            What you get{service.flat ? ` for ${service.price}` : ''}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.includes.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-base leading-7 text-slate-100"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-greenglow"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-500">
            {service.notes}
          </p>
        </Section>

        {service.primary && (
          <Section className="border-t border-white/10 bg-black/25 text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">
              {headline}
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <OfferButton
                href={service.primary!.href}
                label={service.primary!.label}
              />
              {service.secondary && (
                <OfferButton
                  href={service.secondary.href}
                  label={service.secondary.label}
                  variant="secondary"
                />
              )}
            </div>
          </Section>
        )}
      </main>
      {service.primary && <OfferPhoneBar action={service.primary} />}
    </>
  );
}
