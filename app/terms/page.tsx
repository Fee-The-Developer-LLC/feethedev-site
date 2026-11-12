import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LogoHeader } from '@/components/offer/OfferChrome';
import { Section } from '@/components/ui';
import { TERMS_APPROVED_ON, termsSections } from '@/lib/orders/terms';

export const metadata: Metadata = {
  title: 'Terms, refunds and delivery',
  description:
    'How payment, delivery timelines, refunds and monthly plans work at Fee The Developer.',
};

export default function TermsPage() {
  // Draft until King Fee approves (lib/orders/terms.ts).
  if (!TERMS_APPROVED_ON) notFound();

  return (
    <>
      <LogoHeader />
      <main id="main-content" className="min-h-screen">
        <Section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold text-white">
              Terms, refunds and delivery
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Effective {TERMS_APPROVED_ON}
            </p>
            {termsSections.map((section) => (
              <section key={section.heading} className="mt-10">
                <h2 className="text-xl font-bold text-white">
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
