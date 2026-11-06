import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/PageIntro';
import { SeasonOffer } from '@/components/SeasonOffer';
import { Button as CtaLink, Card, Section } from '@/components/ui';
import { serviceGroups } from '@/lib/catalog';
import {
  hairlineMattersCaseStudy,
  paymentsService,
} from '@/lib/payments-integration';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore Fee The Developer services for websites, business presence, software, AI, automation, and integrations.',
  alternates: { canonical: new URL('/services', siteConfig.siteUrl) },
};

export default function ServicesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageIntro
        eyebrow="Services / Connected delivery"
        title={
          <>
            One partner for the{' '}
            <span className="ftd-gradient-text">whole system.</span>
          </>
        }
        description="From the first public touchpoint to the tools behind the business, every service is planned to work with the next one. Start with what you need now and keep a clear path to scale."
        aside={
          <div className="signal-rail rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan">
              Delivery path
            </p>
            <ol className="mt-5 space-y-4 text-sm text-slate-200">
              <li>
                <span>Discover the real constraint</span>
              </li>
              <li>
                <span>Build the right system</span>
              </li>
              <li>
                <span>Launch with the pieces connected</span>
              </li>
            </ol>
          </div>
        }
      />

      <Section className="pb-0">
        <SeasonOffer compact />
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {serviceGroups.map((group, index) => (
            <Card
              key={group.name}
              hover={false}
              accent={index === 1 ? 'green' : index === 2 ? 'red' : 'neutral'}
              className="h-full p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
                Service field {index + 1}
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white">
                {group.name}
              </h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">
                {group.summary}
              </p>
              <ul className="mt-7 space-y-4">
                {group.services.map((service) => (
                  <li
                    key={service}
                    className="flex gap-3 text-sm leading-6 text-slate-200"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.65)]"
                    />
                    {service}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" aria-labelledby="payments-service-heading">
        <div className="signal-rail grid gap-8 rounded-3xl border border-greenglow/25 bg-greenglow/[0.06] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-greenglow">
              New service / Payments + back end
            </p>
            <h2
              id="payments-service-heading"
              className="mt-3 text-3xl font-semibold text-white"
            >
              {paymentsService.name}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              {paymentsService.summary} See how we moved{' '}
              {hairlineMattersCaseStudy.client} from PayPal to a custom Stripe
              build.
            </p>
          </div>
          <CtaLink href={`/services/${paymentsService.slug}`} glow="green">
            See the service
          </CtaLink>
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-black/25">
        <div className="grid gap-8 rounded-3xl border border-electric/25 bg-electric/[0.08] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan">
              Next step
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Not sure where your project fits?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Share the goal and the current bottleneck. We will identify the
              smallest useful starting point before defining scope.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/start">Start a project</CtaLink>
            <Link
              href={new URL('/pricing', siteConfig.siteUrl).toString()}
              className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
