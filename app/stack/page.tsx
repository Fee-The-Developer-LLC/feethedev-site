import type { Metadata } from 'next';
import { BookingModal } from '@/components/BookingModal';
import { OfferButton } from '@/components/offer/OfferButton';
import { Section } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';
import {
  stackTrademarkNotice,
  stackVendors,
  supportingStack,
  workflowSteps,
} from '@/lib/stack';

export const metadata: Metadata = {
  title: 'How We Build',
  description:
    'The platforms and workflow behind every Fee The Developer website and business system, from planning and design to build, checks, and launch.',
  alternates: { canonical: new URL('/stack', siteConfig.siteUrl) },
};

export default function StackPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Section className="border-b border-white/10 pb-12 pt-14 sm:pt-20">
        <p className="status-chip text-cyan">How we build</p>
        <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.04] text-white sm:text-6xl">
          Serious tools.{' '}
          <span className="ftd-gradient-text">One owner-developer.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Every Fee The Developer build runs on the same professional stack:
          Cloudflare<sup>®</sup> for domains and hosting, GitHub for code,
          Claude Code and Codex for engineering, and Google Flow for design and
          video. You get big-company tools at small-business prices.
        </p>
      </Section>

      <Section aria-labelledby="workflow-heading">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2
              id="workflow-heading"
              className="text-3xl font-extrabold text-white sm:text-4xl"
            >
              How we move
            </h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-slate-300">
              Five steps, the same order every time. You always know where your
              project stands.
            </p>
          </div>
          <ol className="signal-rail space-y-8">
            {workflowSteps.map((step, index) => (
              <li key={step.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-greenglow">
                  Step {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  {step.detail}
                </p>
                <ul
                  className="mt-3 flex flex-wrap gap-2"
                  aria-label={`Tools used in ${step.title}`}
                >
                  {step.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section
        aria-labelledby="tools-heading"
        className="border-t border-white/10 bg-black/25"
      >
        <h2
          id="tools-heading"
          className="text-3xl font-extrabold text-white sm:text-4xl"
        >
          The tools
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          What each platform does on your project.
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stackVendors.map((vendor) => (
            <li key={vendor.id}>
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                  {vendor.lane}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  {vendor.company}
                </h3>
                <dl className="mt-5 flex-1 space-y-4">
                  {vendor.products.map((product) => (
                    <div key={product.name}>
                      <dt className="text-sm font-semibold text-white">
                        {product.name}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 text-slate-400">
                        {product.use}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={vendor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
                >
                  About {vendor.company}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <h3 className="text-lg font-bold text-white">Also in the stack</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {supportingStack.map((item) => (
              <li
                key={item.name}
                className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4"
              >
                <span className="block text-sm font-semibold text-white">
                  {item.name}
                </span>
                <span className="mt-1 block text-sm text-slate-400">
                  {item.use}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Put this stack to work for your business.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <OfferButton href="/services" label="See services" />
          <OfferButton href="/work" label="See our work" variant="secondary" />
        </div>
        <BookingModal
          label="Or book a free 15-minute consultation"
          className="mt-5 text-sm font-semibold text-cyan underline underline-offset-4 hover:text-white"
        />
      </Section>

      <Section className="pt-0">
        <p className="mx-auto max-w-4xl text-center text-xs leading-5 text-slate-500">
          {stackTrademarkNotice}
        </p>
      </Section>
    </main>
  );
}
