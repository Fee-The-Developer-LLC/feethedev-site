import { getAsset } from '@/lib/asset-library';

type VideoBackdropProps = {
  /** Asset-library id of the muted web video. */
  videoId: string;
  /** Asset-library id of the still used as poster and reduced-motion frame. */
  posterId: string;
};

/**
 * A full-viewport video fixed behind a page's content. A dark scrim keeps
 * text readable; content sections scroll over it. Visitors who prefer
 * reduced motion get the still frame only.
 */
export function VideoBackdrop({ videoId, posterId }: VideoBackdropProps) {
  const video = getAsset(videoId);
  const poster = getAsset(posterId);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
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
      <div className="absolute inset-0 bg-void/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,7,14,0)_0%,rgba(5,7,14,0.7)_100%)]" />
    </div>
  );
}
