import Image from 'next/image';
import Link from 'next/link';
import { OfferButton } from '@/components/offer/OfferButton';
import { barberAds, barberAdsPath } from '@/lib/barber-ads';
import { getService } from '@/lib/services';

/**
 * Middle-of-home ad reel for barbers: three vertical ads in phone frames,
 * each ending on the product's own buy button.
 */
export function BarberAdReel() {
  const slots = barberAds.flatMap((ad) => {
    const service = getService(ad.slug);
    return service ? [{ ad, service }] : [];
  });

  if (slots.length === 0) return null;

  return (
    <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {slots.map(({ ad, service }, index) => {
        const poster = `${barberAdsPath}/${ad.slug}.webp`;

        return (
          <li
            key={ad.slug}
            className={
              index === 1
                ? 'flex flex-col items-center lg:-translate-y-8'
                : 'flex flex-col items-center'
            }
          >
            <div className="relative w-full max-w-[17.5rem]">
              <div
                aria-hidden="true"
                className="absolute -inset-8 rounded-full bg-electric/15 blur-3xl"
              />
              <div className="relative aspect-[9/16] overflow-hidden rounded-[2.4rem] border border-white/15 bg-background p-2 shadow-[0_30px_80px_-24px_rgba(37,120,255,0.5)]">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-panel bg-[radial-gradient(circle_at_50%_70%,rgba(37,120,255,0.28),transparent_60%),radial-gradient(circle_at_30%_100%,rgba(20,232,180,0.18),transparent_50%)]">
                  {ad.video && (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                  )}
                  {ad.video && (
                    <video
                      className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                      src={`${barberAdsPath}/${ad.slug}.mp4`}
                      poster={poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  )}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/95 via-background/60 to-transparent px-5 pb-14 pt-9">
                    <p className="text-balance text-lg font-extrabold leading-snug text-white">
                      {service.hook}
                    </p>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-10">
                    {!ad.video && (
                      <span className="rounded-full border border-white/15 bg-background/70 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-300">
                        Ad in production
                      </span>
                    )}
                    {ad.aiGenerated && ad.video && (
                      <span className="ml-auto rounded-full bg-background/70 px-2.5 py-1 text-[0.65rem] font-semibold text-slate-400">
                        AI-generated
                      </span>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 w-full max-w-[17.5rem] text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                {ad.audience}
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-white">
                <Link
                  href={service.href}
                  className="hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
                >
                  {service.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm tabular-nums text-slate-400">
                {service.price}
              </p>
              {service.primary && (
                <OfferButton
                  href={service.primary.href}
                  label={service.primary.label}
                  size="sm"
                  className="mt-5"
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
