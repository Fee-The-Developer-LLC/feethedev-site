import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OfferButton } from '@/components/offer/OfferButton';
import { OfferHeader, OfferPhoneBar } from '@/components/offer/OfferChrome';
import { ProductBuyCut } from '@/components/offer/ProductBuyCut';
import { ProductConcierge } from '@/components/offer/ProductConcierge';
import { Section } from '@/components/ui';
import { packageRules, starterFaq, veteranDiscount } from '@/lib/catalog';
import { conciergeFor } from '@/lib/concierge';
import { getBuyCut } from '@/lib/product-stories';
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
  const cut = getBuyCut(service.slug);
  const concierge = conciergeFor(service.slug);

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
                  {service.startsWhen.full}
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

        {cut && (
          <Section className="overflow-hidden border-t border-white/10">
            <ProductBuyCut cut={cut} action={service.primary} />
          </Section>
        )}

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

        {concierge && (
          <Section className="border-t border-white/10">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                  Concierge
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-white">
                  Ask before you buy
                </h2>
                <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
                  Tap a question or type your own. Answers come from the same
                  price list as checkout. Anything else goes straight to King
                  Fee.
                </p>
              </div>
              <ProductConcierge script={concierge} checkout={service.primary} />
            </div>
          </Section>
        )}

        {service.category === 'starter' && packageRules.length > 0 && (
          <Section className="border-t border-white/10">
            <h2 className="text-3xl font-extrabold text-white">
              The rules, in writing
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packageRules.map((rule, index) => (
                <li
                  key={rule.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                    {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {rule.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-300">
                    {rule.body}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {service.category === 'starter' && starterFaq.length > 0 && (
          <Section className="border-t border-white/10">
            <h2 className="text-3xl font-extrabold text-white">Questions</h2>
            <dl className="mt-8 grid max-w-3xl gap-6">
              {starterFaq.map((entry) => (
                <div key={entry.question}>
                  <dt className="text-lg font-bold text-white">
                    {entry.question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-300">
                    {entry.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

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
