import Image from 'next/image';
import { OfferButton } from '@/components/offer/OfferButton';
import { Tilt3D } from '@/components/Tilt3D';
import type { BuyCut } from '@/lib/product-stories';

/**
 * The 8-second buy cut on a product page: the vertical clip in a phone frame,
 * the 3D product layer floating beside it, the three storyboard beats, and
 * the same end card button the ad uses.
 *
 * Until the clip is committed (`cut.media === false`) the phone shows the 3D
 * layer as a still, so the section never renders an empty player. Visitors
 * who prefer reduced motion always get the poster frame.
 */
export function ProductBuyCut({
  cut,
  action,
}: {
  cut: BuyCut;
  action: { href: string; label: string } | null;
}) {
  const poster = cut.media
    ? `${cut.mediaPath}/end.webp`
    : cut.layerFallback.src;
  const layer = cut.media
    ? `${cut.mediaPath}/layer.webp`
    : cut.layerFallback.src;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="relative mx-auto w-full max-w-[19rem]">
        <div
          aria-hidden="true"
          className="absolute -inset-10 rounded-full bg-electric/20 blur-3xl"
        />
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.6rem] border border-white/15 bg-background p-2.5 shadow-[0_30px_80px_-20px_rgba(37,120,255,0.45)]">
          <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-panel">
            <Image
              src={poster}
              alt={cut.layerFallback.alt}
              fill
              sizes="304px"
              className="object-cover"
            />
            {cut.media && (
              <video
                className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                src={`${cut.mediaPath}/cut.mp4`}
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
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/90 via-background/50 to-transparent px-5 pb-12 pt-10">
              <p className="text-balance text-lg font-extrabold leading-snug text-white">
                {cut.hook}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-background"
            />
          </div>
        </div>
        <Tilt3D
          className="absolute -right-10 bottom-10 hidden w-36 sm:block lg:-right-16 lg:w-44"
          max={12}
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-background shadow-[0_20px_60px_-15px_rgba(20,232,180,0.35)]">
            <Image
              src={layer}
              alt=""
              width={352}
              height={352}
              className="h-auto w-full"
            />
          </div>
        </Tilt3D>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
          8 seconds
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          {cut.proof}
        </h2>
        <ol className="mt-8 space-y-0">
          {cut.beats.map((beat, index) => (
            <li
              key={beat.at.join('-')}
              className="relative flex gap-5 pb-7 last:pb-0"
            >
              {index < cut.beats.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.15rem] top-10 h-[calc(100%-2.5rem)] w-px bg-gradient-to-b from-electric/70 to-greenglow/30"
                />
              )}
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-electric/50 bg-panel text-xs font-bold tabular-nums text-silver">
                {beat.at[0]}s
              </span>
              <div className="pt-1.5">
                <p className="text-base font-semibold text-white">
                  {beat.visual}
                </p>
                {beat.overlay && (
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {beat.overlay}
                  </p>
                )}
                {!beat.overlay && action && (
                  <div className="mt-4">
                    <OfferButton href={action.href} label={action.label} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
