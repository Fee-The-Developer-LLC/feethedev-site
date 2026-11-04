import type { Metadata } from 'next';
import Image from 'next/image';
import { PageIntro } from '@/components/PageIntro';
import { Tilt3D } from '@/components/Tilt3D';
import { Button as CtaLink, Section } from '@/components/ui';
import { showroomSites, showroomVerifiedOn } from '@/lib/showroom';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Showroom',
  description:
    'Live websites designed, built, and hosted by Fee The Developer for businesses across apparel, music, property, freight, auto, and personal services.',
  alternates: { canonical: new URL('/work', siteConfig.siteUrl) },
};

const verifiedLabel = new Date(
  `${showroomVerifiedOn}T12:00:00Z`,
).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export default function WorkPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <PageIntro
        eyebrow="Showroom / Live work"
        title={
          <>
            Real sites.{' '}
            <span className="ftd-gradient-text">Live right now.</span>
          </>
        }
        description="Every site here is built and running on our platform today. Open any of them and look around. This is the same standard your business gets."
        aside={
          <div className="signal-rail rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan">
              On the floor
            </p>
            <p className="mt-4 text-5xl font-semibold text-white">
              {showroomSites.length}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              live sites across{' '}
              {new Set(showroomSites.map((s) => s.industry)).size} industries
            </p>
            <p className="mt-5 text-xs text-slate-500">
              Checked live {verifiedLabel}
            </p>
          </div>
        }
      />

      <Section>
        <ul className="grid gap-8 md:grid-cols-2">
          {showroomSites.map((site, index) => (
            <li key={site.domain}>
              <Tilt3D className="h-full rounded-[1.75rem]" max={4}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20">
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block focus-visible:outline-none"
                    aria-label={`Open ${site.name} (${site.domain}) in a new tab`}
                  >
                    <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-white/15"
                      />
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-white/15"
                      />
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full bg-white/15"
                      />
                      <span className="ml-3 truncate rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                        {site.domain}
                      </span>
                      <span className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-greenglow/40 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-greenglow">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-greenglow shadow-[0_0_10px_rgba(20,232,180,.8)]"
                        />
                        Live
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-panel">
                      <Image
                        src={site.image}
                        alt={`Home page of ${site.name}`}
                        fill
                        priority={index < 2}
                        sizes="(min-width: 768px) 46vw, 92vw"
                        className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  </a>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                      {site.industry}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {site.name}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {site.summary}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {site.highlights.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-6">
                      <a
                        href={`https://${site.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
                      >
                        Visit {site.domain}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              </Tilt3D>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <div className="signal-rail flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Your business belongs in this room.
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Tell us what you run and we will map the site that fits it.
            </p>
          </div>
          <CtaLink href="/start">Start a project</CtaLink>
        </div>
      </Section>
    </main>
  );
}
