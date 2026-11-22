import type { Metadata } from 'next';
import Image from 'next/image';
import { OfferButton } from '@/components/offer/OfferButton';
import { SiteStatusBadge } from '@/components/SiteStatusBadge';
import { Tilt3D } from '@/components/Tilt3D';
import { TrackEvents } from '@/components/TrackEvents';
import { Section } from '@/components/ui';
import { showroomSites } from '@/lib/showroom';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Live websites designed, built, and hosted by Fee The Developer for businesses across marketing, music, property, freight, auto, and personal services.',
  alternates: { canonical: new URL('/work', siteConfig.siteUrl) },
};

export default function WorkPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Section className="pb-4 pt-14 sm:pt-20">
        <h1 className="text-5xl font-extrabold text-white sm:text-6xl">Work</h1>
        <p className="mt-4 text-lg text-slate-300">
          Sites we built. Open any of them.
        </p>
      </Section>

      <Section>
        <TrackEvents view={{ event: 'portfolio_view', source: 'work' }}>
          <ul className="grid gap-8 md:grid-cols-2">
            {showroomSites.map((site, index) => (
              <li key={site.domain}>
                <Tilt3D className="h-full rounded-[1.75rem]" max={4}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20">
                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="portfolio_site_click"
                      data-track-project={site.id}
                      data-track-source="work-image"
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
                        <SiteStatusBadge
                          status={site.status}
                          className="ml-auto"
                        />
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-panel">
                        {site.image ? (
                          <Image
                            src={site.image}
                            alt={`Home page of ${site.name}`}
                            fill
                            priority={index < 2}
                            sizes="(min-width: 768px) 46vw, 92vw"
                            className="object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full flex-col justify-end bg-[radial-gradient(circle_at_70%_20%,rgba(37,120,255,0.25),transparent_60%)] p-7">
                            <p className="text-3xl font-extrabold text-white">
                              {site.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {site.domain}
                            </p>
                          </div>
                        )}
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
                          data-track="portfolio_site_click"
                          data-track-project={site.id}
                          data-track-source="work-link"
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
        </TrackEvents>
      </Section>

      <Section className="pt-0 text-center">
        <h2 className="text-3xl font-extrabold text-white">
          Your business is next.
        </h2>
        <div className="mt-6 flex justify-center">
          <OfferButton href="/services" label="See services" />
        </div>
      </Section>
    </main>
  );
}
