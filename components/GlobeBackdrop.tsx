import { getAsset } from '@/lib/asset-library';

const video = getAsset('hero-globe-web');
const poster = getAsset('hero-globe-poster');

/**
 * The spinning brand globe as the background of the home hero. It fills its
 * positioned parent (the hero section), runs up under the see-through header,
 * and fades into the page background at the bottom so it reads as one piece
 * with the header rather than a layer behind the whole page.
 *
 * "Transparent" is done in CSS rather than with an alpha video: the clip is
 * screen-blended (its black space drops out), dimmed, and faded at the edges
 * with a radial mask, then a scrim keeps headline contrast. Visitors who
 * prefer reduced motion get the still frame.
 */
export function GlobeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="ftd-globe-layer absolute left-1/2 top-1/2 aspect-square w-[175vmin] -translate-x-1/2 -translate-y-1/2 sm:w-[150vmin] lg:w-[135vmin]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
        />
        <video
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          src={video.src}
          poster={poster.src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,11,0.1)_0%,rgba(5,7,11,0.5)_60%,rgba(5,7,11,0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
