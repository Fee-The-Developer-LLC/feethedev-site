import type { Metadata } from 'next';
import { InteriorHero } from '@/components/InteriorHero';
import { Body, Button as CtaLink, H2, Section } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Developer Apprenticeship',
  description:
    'Explore the Fee The Developer learning path from core development skills to reviewed project work and portfolio evidence.',
  alternates: { canonical: '/apprenticeship' },
};

const stages = [
  {
    number: '01',
    title: 'Learn the tools',
    description:
      'Practice Git, web fundamentals, JavaScript, Python, the command line, and clear documentation.',
  },
  {
    number: '02',
    title: 'Build working software',
    description:
      'Move into React, Next.js, APIs, data, testing, debugging, and deployment with scoped exercises.',
  },
  {
    number: '03',
    title: 'Connect business systems',
    description:
      'Learn how websites, authentication, payments, and automation fit together in practical workflows.',
  },
  {
    number: '04',
    title: 'Contribute with review',
    description:
      'Where opportunities are available, work on bounded documentation, QA, components, or internal tools with supervision.',
  },
  {
    number: '05',
    title: 'Show the work',
    description:
      'Assemble a portfolio grounded in actual repositories, reviewed changes, demos, and lessons learned.',
  },
];

export default function ApprenticeshipPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <InteriorHero
        backgroundImage="/brand/generated/ftd-apprenticeship-hero.webp"
        eyebrow="Fee The Developer / Learning Path"
        title={
          <>
            Learn. Build.{' '}
            <span className="ftd-gradient-text">Show the work.</span>
          </>
        }
        description="A developer learning path built around useful skills, thoughtful review, and visible project evidence. Start with fundamentals, then grow into work you can explain and demonstrate."
        actions={[
          {
            label: 'Ask about the path',
            href: `mailto:${siteConfig.email}?subject=Developer%20learning%20path`,
          },
          {
            label: 'See services',
            href: '/services',
            secondary: true,
          },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            'Practical learning',
            'Reviewed contributions',
            'Portfolio evidence',
          ].map((item) => (
            <div
              key={item}
              className="glass-panel px-5 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-100"
            >
              {item}
            </div>
          ))}
        </div>
      </InteriorHero>

      <Section className="bg-background">
        <div className="mb-10 max-w-3xl space-y-4">
          <p className="status-chip">The path</p>
          <H2 className="text-3xl sm:text-4xl">Progress you can point to.</H2>
          <Body>
            Each stage connects learning to a concrete artifact or demonstrated
            skill. The pace and project access depend on the opportunity and
            readiness.
          </Body>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {stages.map((stage) => (
            <article
              key={stage.number}
              className="glass-panel flex gap-5 p-6 transition hover:border-electric/40"
            >
              <span className="text-2xl font-semibold text-cyan">
                {stage.number}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {stage.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-300">
                  {stage.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-panel/50">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="status-chip">Next step</p>
            <H2 className="text-3xl sm:text-4xl">
              Bring your curiosity. Start with a conversation.
            </H2>
            <Body>
              Tell us what you have built, what you want to learn, and where you
              would like to grow. Participation and project opportunities are
              discussed individually; employment is not guaranteed.
            </Body>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <CtaLink
              href={`mailto:${siteConfig.email}?subject=Developer%20learning%20path`}
            >
              Get in touch
            </CtaLink>
            <CtaLink href="/" variant="outline" glow="green">
              Back to the site
            </CtaLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
