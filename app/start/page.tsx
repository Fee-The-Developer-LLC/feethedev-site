import type { Metadata } from 'next';
import { InteriorHero } from '@/components/InteriorHero';
import { BookingModal } from '@/components/BookingModal';
import { ProjectIntakeForm } from '@/components/ProjectIntakeForm';
import { Body, H2, Section } from '@/components/ui';
import { intakeServices, veteranDiscount } from '@/lib/catalog';
import { normalizePromotionCode } from '@/lib/promotions';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Start Your Build',
  description:
    'Tell Fee The Developer what you want to build or improve across websites, software, and automation.',
  alternates: { canonical: '/start' },
};

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{
    promo?: string | string[];
    service?: string | string[];
    veteran?: string | string[];
    plan?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const initialPromotionCode = normalizePromotionCode(query.promo) ?? '';
  const initialService =
    intakeServices.find((service) => service.slug === one(query.service))
      ?.name ?? '';

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <InteriorHero
        backgroundImage="/brand/generated/ftd-business-systems-hero.webp"
        eyebrow="Fee The Developer / Start a project"
        title={
          <>
            Let&apos;s build{' '}
            <span className="ftd-gradient-text">what&apos;s next.</span>
          </>
        }
        description="Tell us about the goal, the people it serves, and what is getting in the way. We will use those details to shape a useful first conversation."
        actions={[
          { label: 'Share your project', href: '#project-details' },
          { label: 'See services', href: '/services', secondary: true },
        ]}
      />
      <Section id="project-details" className="scroll-mt-24 bg-background">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div className="space-y-5 lg:sticky lg:top-24">
            <p className="status-chip">Project details</p>
            <H2 className="text-3xl sm:text-4xl">
              Start with the problem you want to solve.
            </H2>
            <Body>
              Tell us what should change, who will use it, and when you hope to
              move. A rough idea is enough to begin.
            </Body>
            <div className="glass-panel space-y-3 p-6 text-sm leading-6 text-slate-300">
              <p>Website, software, and automation projects are all welcome.</p>
              <p>
                Veterans and veteran-owned businesses get{' '}
                {veteranDiscount.percentOff}% off every price. Tick the box and
                we will email you how to verify; proof is never uploaded here.
              </p>
              <p>Prefer to talk first? The 15-minute consultation is free.</p>
              <div className="flex flex-wrap items-center gap-4">
                <BookingModal className="rounded-full border border-greenglow/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-greenglow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow" />
                <a
                  className="font-semibold text-cyan underline underline-offset-4"
                  href={`tel:${siteConfig.phone}`}
                >
                  Call {siteConfig.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
          <ProjectIntakeForm
            initialPromotionCode={initialPromotionCode}
            services={intakeServices.map((service) => service.name)}
            initialService={initialService}
            initialVeteran={one(query.veteran) === '1'}
            initialDeposit={one(query.plan) === 'deposit'}
            veteranPercent={veteranDiscount.percentOff}
          />
        </div>
      </Section>
    </main>
  );
}
