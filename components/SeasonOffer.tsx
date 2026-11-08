import Link from 'next/link';
import { SIXERS_SEASON_PROMOTION } from '@/lib/promotions';

export function SeasonOffer({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="relative overflow-hidden rounded-[1.75rem] border border-[#4d73c8]/40 bg-[linear-gradient(115deg,rgba(21,37,74,.72),rgba(11,16,24,.96)_48%,rgba(87,26,43,.58))] p-6 shadow-[0_18px_60px_rgba(0,0,0,.28)] sm:p-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#ed174c] via-white/80 to-[#006bb6]" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
            2026–27 season fan offer
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {SIXERS_SEASON_PROMOTION.percentOff}% off Fee The Developer services
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Philadelphia 76ers fans can use code{' '}
            <span className="rounded-md border border-white/15 bg-black/30 px-2 py-1 font-mono font-semibold text-white">
              {SIXERS_SEASON_PROMOTION.code}
            </span>{' '}
            when requesting a quote. It applies across every Fee The Developer
            service shown on our Services and Pricing pages, except the fixed
            prices in the Own Your Name starter line. Self-identification as a
            fan is enough.
          </p>
          {!compact && (
            <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-400">
              Valid for quotes accepted by{' '}
              {SIXERS_SEASON_PROMOTION.validThrough}. For monthly services, the
              discount applies to invoices issued during the offer period. Taxes
              and third-party charges are not included. Philadelphia 76ers and
              the NBA do not sponsor or endorse this offer.
            </p>
          )}
        </div>
        <Link
          href={`/start?promo=${SIXERS_SEASON_PROMOTION.code}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.13em] text-[#07101c] transition hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Claim offer
        </Link>
      </div>
    </aside>
  );
}
