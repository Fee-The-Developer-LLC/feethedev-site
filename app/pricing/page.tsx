import type { Metadata } from 'next';
import { BookingModal } from '@/components/BookingModal';
import { PageIntro } from '@/components/PageIntro';
import { SeasonOffer } from '@/components/SeasonOffer';
import { Button as CtaLink, Card, Section } from '@/components/ui';
import {
  addOnPricing,
  depositFor,
  pricingOptions,
  serviceCheckoutLinks,
  starterPricing,
  veteranDiscount,
} from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

const starterPackages = starterPricing.filter((item) => item.featured);
const starterAddOns = starterPricing.filter((item) => !item.featured);

const smallButton =
  'rounded-full border border-greenglow/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-greenglow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow';
const textLink =
  'text-sm font-semibold text-cyan underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Fee The Developer prices: starter booking sites from $199, business websites, software and automation. Deposits, pay-over-time, and 30% off for veterans.',
  alternates: { canonical: new URL('/pricing', siteConfig.siteUrl) },
};

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageIntro
        eyebrow="Pricing / Owner-built, priced to start"
        title={
          <>
            Quality work,{' '}
            <span className="ftd-gradient-text">
              priced to get you started.
            </span>
          </>
        }
        description="You work directly with the owner who builds your project. No agency layers, no account managers, and proven systems we reuse, so the price stays low and the work stays ours to stand behind. A written scope confirms deliverables, schedule, and price before work begins."
        aside={
          <div className="rounded-3xl border border-greenglow/25 bg-greenglow/[0.07] p-6">
            <p className="text-sm font-semibold text-white">
              Free 15-minute consultation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Talk it through first at no cost, or buy any service below through
              secure Stripe checkout.
            </p>
            <BookingModal
              className={`mt-4 ${smallButton}`}
              label="Book free consultation"
            />
          </div>
        }
      />

      <Section className="pb-0" aria-labelledby="ways-to-pay-heading">
        <h2 id="ways-to-pay-heading" className="sr-only">
          Ways to pay and discounts
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[#4d73c8]/40 bg-[linear-gradient(135deg,rgba(21,37,74,.7),rgba(11,16,24,.95))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
              Veterans
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {veteranDiscount.percentOff}% off everything
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              For veterans and veteran-owned businesses, on top of the prices
              below. Verify once and we send a single-use checkout code.
            </p>
            <a
              href="/start?veteran=1#project-details"
              className={`mt-4 inline-block ${textLink}`}
            >
              Verify and get your code
            </a>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
              Deposit to start
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              30% gets work going
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              On builds from $1,000, pay a 30% deposit to start. The balance is
              invoiced at design approval and at launch.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
              Pay over time
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              Split it at checkout
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Choose Affirm, Afterpay, or Klarna at Stripe checkout where
              eligible. The provider approves you and sets the terms.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-0">
        <SeasonOffer />
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {pricingOptions.map((option, index) => {
            const deposit = depositFor(option);
            return (
              <Card
                key={option.name}
                hover={false}
                accent={index === 1 ? 'green' : index === 3 ? 'red' : 'neutral'}
                className="h-full p-7 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Core service
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {option.name}
                    </h2>
                  </div>
                  <p className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-lg font-semibold tabular-nums text-greenglow">
                    {option.price}
                  </p>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {option.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {option.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-slate-200"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-electric"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <CtaLink
                    href={serviceCheckoutLinks[option.slug]}
                    glow="green"
                    aria-label={`Buy ${option.name}, ${option.price}`}
                  >
                    Buy now
                  </CtaLink>
                  {deposit && (
                    <a
                      href={deposit.href}
                      className={textLink}
                      aria-label={`Start ${option.name} with a ${deposit.percent}% deposit of ${deposit.amount}`}
                    >
                      Start with {deposit.amount} deposit
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section
        id="starter-sites"
        aria-labelledby="starter-sites-heading"
        className="border-t border-white/10"
      >
        <div className="max-w-3xl">
          <p className="status-chip">Starter Sites · fixed prices</p>
          <h2
            id="starter-sites-heading"
            className="mt-5 text-3xl font-semibold text-white"
          >
            Your clients book you, not an app.
          </h2>
          <p className="mt-4 leading-7 text-slate-300">
            For barbers, stylists, lash techs, braiders, and musicians: your own
            .com with a custom booking page and Stripe checkout, so payments
            land in your own account. Built on proven Fee The Developer systems
            at a fixed price. Need a custom-designed site? Start with the
            business packages above.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {starterPackages.map((item) => (
            <Card key={item.slug} hover={false} className="h-full p-7">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">
                  {item.name}
                </h3>
                <p className="shrink-0 text-lg font-semibold tabular-nums text-greenglow">
                  {item.price}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
              <ul className="mt-5 space-y-2">
                {item.includes.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <CtaLink
                href={serviceCheckoutLinks[item.slug]}
                className="mt-6"
                aria-label={`Buy ${item.name}, ${item.price}`}
              >
                Buy now
              </CtaLink>
            </Card>
          ))}
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <ul className="divide-y divide-white/10">
            {starterAddOns.map(({ name, slug, price, description }) => (
              <li
                key={slug}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-200">
                    {name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {description}
                  </span>
                </span>
                <span className="flex shrink-0 items-center justify-between gap-4">
                  <span className="text-sm font-semibold tabular-nums text-greenglow">
                    {price}
                  </span>
                  <a
                    href={serviceCheckoutLinks[slug]}
                    aria-label={`Buy ${name}, ${price}`}
                    className={smallButton}
                  >
                    Buy
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Starter prices are fixed. The veteran discount applies; the 76ers fan
          offer does not. Domain renewal after the first year is Keep-Live or
          the domain at cost. Stripe processing fees are separate.
        </p>
      </Section>

      <Section className="border-y border-white/10 bg-black/25">
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <div>
            <p className="status-chip">Focused add-ons</p>
            <h2 className="mt-5 text-3xl font-semibold text-white">
              Add only what moves the system forward.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Each service covers one defined implementation scope. Larger or
              multi-system work is quoted after discovery.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <ul className="divide-y divide-white/10">
              {addOnPricing.map((item) => {
                const deposit = depositFor(item);
                return (
                  <li
                    key={item.slug}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <span className="text-sm font-medium text-slate-200">
                      {item.name}
                    </span>
                    <span className="flex shrink-0 flex-wrap items-center justify-between gap-4">
                      <span className="text-sm font-semibold tabular-nums text-greenglow">
                        {item.price}
                      </span>
                      {deposit && (
                        <a
                          href={deposit.href}
                          aria-label={`Start ${item.name} with a ${deposit.percent}% deposit of ${deposit.amount}`}
                          className="text-xs font-semibold text-cyan underline-offset-4 hover:underline"
                        >
                          {deposit.amount} deposit
                        </a>
                      )}
                      <a
                        href={serviceCheckoutLinks[item.slug]}
                        aria-label={`Buy ${item.name}, ${item.price}`}
                        className={smallButton}
                      >
                        Buy
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm leading-7 text-slate-400">
            Prices are in USD. Buying a service pays its starting price, or its
            deposit where offered. We confirm your written scope before work
            begins, and anything beyond the starting scope is quoted for your
            approval first. One discount per order: the veteran discount or the
            76ers fan offer. Pay-over-time options are provided by Affirm,
            Afterpay, and Klarna, subject to their approval and terms.
            Third-party fees, taxes, domains, hosting, paid software, content
            production, and work outside the agreed scope may be separate.
            Platform approvals are controlled by each platform and are not
            guaranteed.
          </p>
          <div className="mt-7 flex justify-center">
            <CtaLink href="/start">Plan my project</CtaLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
