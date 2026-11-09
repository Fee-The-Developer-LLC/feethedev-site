import type { Metadata } from 'next';
import Link from 'next/link';
import { OfferButton } from '@/components/offer/OfferButton';
import { Section } from '@/components/ui';
import { veteranDiscount } from '@/lib/catalog';
import { serviceCategories, servicesInCategory } from '@/lib/services';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Fee The Developer prices: Starter Sites, business websites, software and automation, AI skills and plugins, setup add-ons, and care plans.',
  alternates: { canonical: new URL('/pricing', siteConfig.siteUrl) },
};

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Section className="pb-4 pt-14 sm:pt-20">
        <h1 className="text-5xl font-extrabold text-white sm:text-6xl">
          Pricing
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          Veterans and veteran-owned businesses save{' '}
          {veteranDiscount.percentOff}%.
        </p>
      </Section>

      {serviceCategories.map((category) => (
        <Section
          key={category.id}
          id={category.id}
          className="scroll-mt-24 py-10"
          aria-labelledby={`${category.id}-pricing`}
        >
          <h2
            id={`${category.id}-pricing`}
            className="border-b border-white/10 pb-4 text-2xl font-extrabold text-white"
          >
            {category.name}
          </h2>
          <ul className="divide-y divide-white/10">
            {servicesInCategory(category.id).map((service) => (
              <li
                key={service.slug}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={service.href}
                    className="text-lg font-bold text-white hover:text-cyan"
                  >
                    {service.name}
                  </Link>
                  <p className="mt-1 text-base font-semibold tabular-nums text-greenglow">
                    {service.price}
                    {service.requiredNote && (
                      <span className="ml-2 text-sm font-medium text-slate-400">
                        {service.requiredNote}
                      </span>
                    )}
                  </p>
                </div>
                {service.primary ? (
                  <OfferButton
                    href={service.primary.href}
                    label={service.primary.label}
                    size="sm"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-400">
                    {service.startsWhen.short}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section className="pt-6">
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          Prices in USD. &quot;Starting at&quot; prices are the entry price of a
          scoped build; a written scope confirms the final price. Stripe fees,
          subscriptions, and domain renewals after year one are separate unless
          listed.
        </p>
      </Section>
    </main>
  );
}
