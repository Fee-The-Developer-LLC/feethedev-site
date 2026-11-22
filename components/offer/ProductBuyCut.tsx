import { OfferButton } from '@/components/offer/OfferButton';
import type { BuyCut } from '@/lib/product-stories';

/**
 * The finished buy cut on a product page: the real clip, the proof line and
 * the same end card button the ad uses.
 *
 * Only renders once the clip is committed (`cut.media` is set). Storyboard
 * beats are production notes for Flow and stay in `lib/product-stories.ts`;
 * they are never shown to visitors. Visitors who prefer reduced motion get
 * the poster frame and can still press play.
 */
export function ProductBuyCut({
  cut,
  action,
}: {
  cut: BuyCut;
  action: { href: string; label: string } | null;
}) {
  if (!cut.media) return null;

  const poster = `${cut.mediaPath}/end.webp`;
  const landscape = cut.media.aspect === 'landscape';

  const player = (
    <video
      className="h-full w-full object-cover"
      src={`${cut.mediaPath}/cut.mp4`}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={`${cut.hook} ${cut.proof}`}
    />
  );

  return (
    <div
      className={
        landscape
          ? 'grid gap-10'
          : 'grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]'
      }
    >
      {landscape ? (
        <div className="relative mx-auto w-full max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[3rem] bg-electric/15 blur-3xl"
          />
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/15 bg-background shadow-[0_30px_80px_-20px_rgba(37,120,255,0.45)]">
            {player}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[19rem]">
          <div
            aria-hidden="true"
            className="absolute -inset-10 rounded-full bg-electric/20 blur-3xl"
          />
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.6rem] border border-white/15 bg-background p-2.5 shadow-[0_30px_80px_-20px_rgba(37,120,255,0.45)]">
            <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-panel">
              {player}
            </div>
          </div>
        </div>
      )}

      <div className={landscape ? 'mx-auto max-w-4xl text-center' : ''}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
          See it work
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
          {cut.proof}
        </h2>
        {action && (
          <div className="mt-6">
            <OfferButton href={action.href} label={action.label} />
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">AI-generated video.</p>
      </div>
    </div>
  );
}
