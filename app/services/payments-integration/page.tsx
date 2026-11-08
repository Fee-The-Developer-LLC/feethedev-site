import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { Button as CtaLink, Card, Section } from '@/components/ui';
import { serviceCheckoutLinks } from '@/lib/catalog';
import {
  hairlineMattersCaseStudy as caseStudy,
  paymentsCapabilities,
  paymentsGuarantees,
  paymentsProcess,
  paymentsService,
  type DeliveryStatus,
} from '@/lib/payments-integration';
import { siteConfig } from '@/lib/site-config';

const pageUrl = new URL(
  `/services/${paymentsService.slug}`,
  siteConfig.siteUrl,
);

export const metadata: Metadata = {
  title: paymentsService.name,
  description:
    'Stripe payments and back-end integration for small businesses: processor migration, deposits, checkout, verified webhooks, and fulfillment, on your own Stripe account.',
  alternates: { canonical: pageUrl },
};

const statusStyles: Record<DeliveryStatus, string> = {
  Live: 'border-greenglow/40 text-greenglow',
  Built: 'border-electric/40 text-cyan',
};

const statusLabels: Record<DeliveryStatus, string> = {
  Live: 'Live',
  Built: 'Built, launching on approval',
};

export default function PaymentsIntegrationPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageIntro
        eyebrow="Services / Payments + back end"
        title={
          <>
            Payments that run on{' '}
            <span className="ftd-gradient-text">your own system.</span>
          </>
        }
        description={paymentsService.summary}
        aside={
          <div className="signal-rail rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan">
              Money path
            </p>
            <ol className="mt-5 space-y-4 text-sm text-slate-200">
              <li>
                <span>Customer pays on Stripe-hosted checkout</span>
              </li>
              <li>
                <span>A signed webhook confirms the payment</span>
              </li>
              <li>
                <span>Your back office acts on it automatically</span>
              </li>
            </ol>
          </div>
        }
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
              What is included
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              From the pay button to the order that follows it.
            </h2>
          </div>
          <div
            className="rounded-3xl border border-greenglow/30 bg-greenglow/[0.07] p-6 sm:min-w-[18rem]"
            aria-labelledby="payments-price-heading"
            role="group"
          >
            <p
              id="payments-price-heading"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-greenglow"
            >
              Pricing
            </p>
            <p className="mt-3 text-4xl font-semibold tabular-nums text-white">
              {paymentsService.price}
              <span className="ml-2 text-sm font-medium text-slate-300">
                on its own
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold text-greenglow">
              {paymentsService.priceNote}
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              {paymentsService.feeNote}
            </p>
            <CtaLink
              href={serviceCheckoutLinks[paymentsService.checkoutSlug]}
              glow="green"
              className="mt-5"
              aria-label={`Buy ${paymentsService.name}, ${paymentsService.price}`}
            >
              Buy now
            </CtaLink>
          </div>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paymentsCapabilities.map((item, index) => (
            <li key={item.title}>
              <Card
                hover={false}
                accent={
                  index % 3 === 1
                    ? 'green'
                    : index % 3 === 2
                      ? 'red'
                      : 'neutral'
                }
                className="h-full p-7"
              >
                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.detail}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        className="border-y border-white/10 bg-black/25"
        aria-labelledby="case-study-heading"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
              Case study / {caseStudy.industry}
            </p>
            <h2
              id="case-study-heading"
              className="mt-3 text-3xl font-semibold text-white sm:text-4xl"
            >
              {caseStudy.client}: from PayPal to a custom Stripe build.
            </h2>
            <a
              href={`https://${caseStudy.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${caseStudy.client} (${caseStudy.domain}) in a new tab`}
              className="mt-8 block overflow-hidden rounded-[1.5rem] border border-white/10 bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={caseStudy.image}
                  alt={`Home page of ${caseStudy.client}`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  className="object-cover object-top"
                />
              </div>
            </a>
            <p className="mt-4 text-sm text-slate-400">
              <a
                href={`https://${caseStudy.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                Visit {caseStudy.domain}
                <span aria-hidden="true"> ↗</span>
              </a>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Before
              </h3>
              <ul className="mt-5 space-y-3">
                {caseStudy.before.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/25"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-electric/25 bg-electric/[0.08] p-7">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
                What we built
              </h3>
              <ul className="mt-5 space-y-4">
                {caseStudy.after.map((item) => (
                  <li
                    key={item.text}
                    className="flex flex-col gap-2 text-sm leading-6 text-slate-200 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <span
                      className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] ${statusStyles[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="process-heading">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
              How we deliver
            </p>
            <h2
              id="process-heading"
              className="mt-3 text-3xl font-semibold text-white sm:text-4xl"
            >
              Tested before a single real dollar moves.
            </h2>
            <ul className="mt-8 space-y-3">
              {paymentsGuarantees.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-slate-200"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.65)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {paymentsProcess.map((item, index) => (
              <li
                key={item.step}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Step {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {item.step}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-black/25">
        <div className="grid gap-8 rounded-3xl border border-electric/25 bg-electric/[0.08] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan">
              Next step
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Still taking payments through a builder or a button?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              {paymentsService.price} on its own, or included with every Starter
              Site, Business Site Essentials and every website package above it.
              Tell us how money moves through your business today and we will
              map the switch.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaLink
              href={serviceCheckoutLinks[paymentsService.checkoutSlug]}
              glow="green"
              aria-label={`Buy ${paymentsService.name}, ${paymentsService.price}`}
            >
              Buy now
            </CtaLink>
            <CtaLink href="/start" variant="outline">
              Start a project
            </CtaLink>
            <Link
              href="/services"
              className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            >
              All services
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
