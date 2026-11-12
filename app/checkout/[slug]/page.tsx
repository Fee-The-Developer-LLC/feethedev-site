import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EmbeddedStripeCheckout } from '@/components/EmbeddedStripeCheckout';
import { LogoHeader } from '@/components/offer/OfferChrome';
import { Section } from '@/components/ui';
import {
  depositFor,
  formatPrice,
  getCatalogItem,
  serviceCheckoutLinks,
} from '@/lib/catalog';
import { TERMS_APPROVED_ON } from '@/lib/orders/terms';
import { promiseFor } from '@/lib/orders/promises';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string | string[] }>;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const item = getCatalogItem(slug);
  if (!item) notFound();

  const deposit = depositFor(item);
  const promise = promiseFor(item);
  const wantsDeposit = (await searchParams).plan === 'deposit';
  const plan = wantsDeposit && deposit ? 'deposit' : 'full';
  const fallbackUrl =
    plan === 'deposit' && deposit ? deposit.href : serviceCheckoutLinks[slug];

  return (
    <>
      <LogoHeader />
      <main id="main-content" className="min-h-screen">
        <Section className="py-10 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <Link
                href={`/services/${slug}`}
                className="text-sm text-slate-400 hover:text-white"
              >
                ← {item.name}
              </Link>
              <h1 className="mt-6 text-4xl font-semibold text-white">
                {item.name}
              </h1>
              <p className="mt-4 text-3xl font-semibold tabular-nums text-greenglow">
                {plan === 'deposit' && deposit
                  ? `${deposit.amount} today`
                  : formatPrice(item)}
              </p>
              {plan === 'deposit' && deposit && (
                <p className="mt-2 text-sm text-slate-400">
                  {deposit.percent}% deposit on {formatPrice(item)}. The balance
                  is invoiced at design approval and at launch.
                </p>
              )}
              <ul className="mt-8 space-y-3">
                {item.includes.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-slate-200">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-greenglow"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              {promise.promise && (
                <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                  <span className="font-semibold text-white">
                    When you get it:{' '}
                  </span>
                  {promise.promise.headline}
                </p>
              )}
              <p className="mt-6 text-xs text-slate-400">
                Secure payment by Stripe. You get Stripe&apos;s receipt and an
                order confirmation with your next steps right after paying.
                {TERMS_APPROVED_ON && (
                  <>
                    {' '}
                    <Link href="/terms" className="underline hover:text-white">
                      Terms, refunds and delivery
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
            <EmbeddedStripeCheckout
              slug={slug}
              plan={plan}
              fallbackUrl={fallbackUrl}
            />
          </div>
        </Section>
      </main>
    </>
  );
}
