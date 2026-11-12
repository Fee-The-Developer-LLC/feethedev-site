import type { Metadata } from 'next';
import Link from 'next/link';
import { InteriorHero } from '@/components/InteriorHero';
import { SwitchCompare } from '@/components/SwitchCompare';
import { Body, H2, Section } from '@/components/ui';
import { packageRules, veteranDiscount } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';
import { notIncluded, ownYourPlan, switchSteps, vagaro } from '@/lib/switch';

export const metadata: Metadata = {
  title: 'Switch from Vagaro to your own .com',
  description:
    'Own Your .com by Fee The Developer: your own booking site and Stripe checkout for a one-time build price and $10 a month, with a free move from Vagaro.',
  alternates: { canonical: new URL('/switch', siteConfig.siteUrl) },
};

/** Team sizes the comparison offers (1 = solo, 2+ = Shop Bundle). */
const MAX_CALENDARS = 8;

export default function SwitchPage() {
  const plans = Array.from({ length: MAX_CALENDARS }, (_, i) =>
    ownYourPlan(i + 1),
  );
  const solo = plans[0];

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <InteriorHero
        eyebrow="Own Your .com / Switch from Vagaro"
        title={
          <>
            Stop renting your{' '}
            <span className="ftd-gradient-text">booking page.</span>
          </>
        }
        description={`Your own .com, your own booking page and checkout, paid to your own Stripe account. ${solo.name} is $${solo.once} once and $${solo.monthly} a month. We move you over from Vagaro for free.`}
        actions={[
          { label: 'Compare your cost', href: '#compare' },
          {
            label: 'Start my switch',
            href: '/start?service=own-your-bookings',
            secondary: true,
          },
        ]}
      />

      <Section id="compare" className="scroll-mt-24">
        <div className="max-w-3xl space-y-4">
          <p className="status-chip">Your real number</p>
          <H2 className="text-3xl sm:text-4xl">
            A monthly bill forever, or a site you own.
          </H2>
          <Body>
            Vagaro bills every month, and more for each extra calendar. Own Your
            .com is a one-time build plus $10 a month for hosting. Move the
            slider to your team size.
          </Body>
        </div>
        <div className="mt-10">
          <SwitchCompare plans={plans} />
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Sources:{' '}
          {vagaro.sources.map((s, i) => (
            <span key={s.href}>
              {i > 0 && ' · '}
              <a
                href={s.href}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-2 hover:text-white"
              >
                {s.label}
              </a>
            </span>
          ))}
          . Shop prices are &ldquo;from&rdquo; prices: a written scope confirms
          the final price.
        </p>
      </Section>

      <Section className="border-y border-white/10 bg-white/[0.02]">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="status-chip">Free move from Vagaro</p>
            <H2 className="text-3xl sm:text-4xl">
              We switch you. You keep booking.
            </H2>
            <ol className="mt-8 space-y-6">
              {switchSteps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-greenglow/50 text-sm font-bold text-greenglow"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <p className="status-chip">The rules, in writing</p>
            <ul className="space-y-4">
              {packageRules.map((rule) => (
                <li key={rule.id} className="glass-panel p-5">
                  <h3 className="font-semibold text-white">{rule.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {rule.body}
                  </p>
                </li>
              ))}
              <li className="glass-panel border-greenglow/30 p-5 text-sm leading-6 text-slate-200">
                <span className="font-semibold text-greenglow">
                  Veteran-owned business?
                </span>{' '}
                {veteranDiscount.percentOff}% off every price, after proof.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <p className="status-chip">Straight answers</p>
            <H2 className="text-3xl sm:text-4xl">
              What to know before you switch
            </H2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
              {notIncluded.map((t) => (
                <li key={t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-panel space-y-5 p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-white">
              Ready to own your bookings?
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              Solo pros start with {solo.name}. Shops with several chairs start
              with the Shop Bundle. Not sure? Tell us about your setup and we
              will point you to the right one.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services/own-your-bookings"
                className="rounded-full bg-greenglow px-5 py-3 text-sm font-bold text-background transition hover:brightness-110"
              >
                See {solo.name}
              </Link>
              <Link
                href="/services/shop-bundle"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-greenglow"
              >
                See the Shop Bundle
              </Link>
              <Link
                href="/start?service=own-your-bookings"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:border-greenglow"
              >
                Tell us about your setup
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
