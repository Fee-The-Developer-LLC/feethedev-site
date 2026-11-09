import type { Metadata } from 'next';
import { BookingModal } from '@/components/BookingModal';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { Section } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Every Fee The Developer service with its own page, starting price, and secure checkout: websites, business presence, analytics, software, automation, and support.',
  alternates: { canonical: new URL('/services', siteConfig.siteUrl) },
};

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Section className="border-b border-white/10 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold text-white sm:text-6xl">
              Services
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Pick a service to see what is included, the starting price, and
              buy it through secure Stripe checkout.
            </p>
          </div>
          <BookingModal
            label="Not sure? Free consultation"
            className="inline-flex items-center rounded-full border border-greenglow/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-greenglow/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
          />
        </div>
      </Section>
      <Section>
        <ServiceDirectory />
      </Section>
    </main>
  );
}
