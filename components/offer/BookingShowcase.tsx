import Image from 'next/image';
import Link from 'next/link';
import { TrackEvents } from '@/components/TrackEvents';
import { OfferButton } from '@/components/offer/OfferButton';
import { SiteStatusBadge } from '@/components/SiteStatusBadge';
import {
  bookingShowcase,
  bookingShowcaseScopeNote,
} from '@/lib/booking-showcase';

/**
 * "See what we've built" on the booking product pages. External links open
 * the client's own site in a new tab; the sales CTA always stays on FTD's
 * own checkout, never a client's booking form.
 */
export function BookingShowcase({
  product,
  cta,
}: {
  product: string;
  cta: { href: string; label: string };
}) {
  if (bookingShowcase.length === 0) return null;

  return (
    <TrackEvents
      view={{ event: 'portfolio_view', product, source: 'booking-showcase' }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
        Built for professionals who take bookings
      </p>
      <h2 className="mt-3 text-3xl font-extrabold text-white">
        See what we&apos;ve built
      </h2>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {bookingShowcase.map((site) => (
          <li key={site.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="relative aspect-[16/10] overflow-hidden bg-panel">
                {site.image ? (
                  <Image
                    src={site.image}
                    alt={`Home page of ${site.name}, ${site.domain}`}
                    fill
                    sizes="(min-width: 768px) 30vw, 92vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-end bg-[radial-gradient(circle_at_70%_20%,rgba(37,120,255,0.25),transparent_60%)] p-5">
                    <p className="text-2xl font-extrabold text-white">
                      {site.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{site.domain}</p>
                  </div>
                )}
                <SiteStatusBadge
                  status={site.status}
                  className="absolute right-3 top-3 bg-background/80 backdrop-blur"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
                  {site.role}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  {site.name}
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-300">
                  {site.value}
                </p>
                <div className="mt-auto pt-5">
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="portfolio_site_click"
                    data-track-product={product}
                    data-track-project={site.id}
                    data-track-source="booking-showcase"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
                  >
                    View website
                    <span className="sr-only">
                      {' '}
                      {site.domain} (opens in a new tab)
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
        {bookingShowcaseScopeNote}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <OfferButton
          href={cta.href}
          label={cta.label}
          track={{
            event: 'booking_product_cta_click',
            product,
            source: 'booking-showcase',
          }}
        />
        <Link
          href="/work"
          className="text-sm font-semibold text-slate-200 underline underline-offset-4 hover:text-white"
        >
          See all our work
        </Link>
      </div>
    </TrackEvents>
  );
}
