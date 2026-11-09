import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LogoHeader } from '@/components/offer/OfferChrome';
import { Section } from '@/components/ui';
import { WelcomeIntakeForm } from '@/components/WelcomeIntakeForm';
import { getCatalogItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { getPaidSession } from '@/lib/stripe-checkout';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payment received',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function WelcomePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) notFound();

  const raw = (await searchParams).session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;
  const paid = sessionId ? await getPaidSession(sessionId, slug) : null;

  return (
    <>
      <LogoHeader />
      <main id="main-content" className="min-h-screen">
        <Section className="py-12 sm:py-16">
          {paid ? (
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                  Payment received · {paid.amount}
                </p>
                <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
                  You&apos;re in. {item.name} starts now.
                </h1>
                <p className="mt-5 text-lg text-slate-300">
                  Send your details and we start. Stripe emails your receipt.
                </p>
              </div>
              <WelcomeIntakeForm
                serviceName={item.name}
                serviceSlug={item.slug}
                checkoutSession={paid.id}
                email={paid.email}
                name={paid.name}
                amount={paid.amount}
                contactEmail={siteConfig.email}
              />
            </div>
          ) : (
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold text-white">
                We couldn&apos;t confirm that payment.
              </h1>
              <p className="mt-5 text-lg text-slate-300">
                If you were charged, email{' '}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-semibold text-cyan underline"
                >
                  {siteConfig.email}
                </a>{' '}
                and we will sort it out.
              </p>
              <Link
                href={`/services/${slug}`}
                className="mt-8 inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 text-sm font-extrabold uppercase tracking-[0.14em] text-white hover:bg-white/[0.08]"
              >
                Back to {item.name}
              </Link>
            </div>
          )}
        </Section>
      </main>
    </>
  );
}
