import Image from 'next/image';
import { getAsset } from '@/lib/asset-library';

const video = getAsset('hero-globe-web');
const poster = getAsset('hero-globe-poster');

/**
 * Muted, looping brand video for the home hero. The poster is the video's
 * last frame and is what visitors who prefer reduced motion see instead.
 */
export function HeroVideo() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-panel">
      <Image
        src={poster.src}
        alt="Fee The Developer Autonomy Has Levels globe badge"
        fill
        priority
        sizes="(min-width: 1024px) 45vw, 92vw"
        className="object-cover"
      />
      <video
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        src={video.src}
        poster={poster.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
