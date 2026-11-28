import Image from 'next/image';
import { getAsset } from '@/lib/asset-library';

const video = getAsset('hero-globe-web');
const poster = getAsset('hero-globe-poster');
const badge = getAsset('autonomy-has-levels-badge');

const pillars = ['Build', 'Automate', 'Create', 'Scale'];

/**
 * The brand globe inside a glass console frame (home hero). Decorative: the
 * corner labels describe the brand, never live system data. Reduced-motion
 * visitors get the still poster.
 */
export function GlobeConsole() {
  return (
    <figure className="mx-auto max-w-4xl">
      <div className="neon-border rounded-[2rem]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-plasma/20 bg-void shadow-float sm:aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
          <video
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            src={video.src}
            poster={poster.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,7,14,0.75)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ftd-grid bg-[length:40px_40px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_90%)]"
          />

          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-void/70 px-3 py-1.5 backdrop-blur sm:left-6 sm:top-6">
            <span aria-hidden="true" className="pulse-dot" />
            <span className="label-mono text-[0.65rem] text-slate-300">
              feethedeveloper.com
            </span>
          </div>

          <div className="absolute bottom-4 left-4 hidden items-center gap-3 rounded-2xl border border-white/10 bg-void/70 p-2 pr-4 backdrop-blur sm:bottom-6 sm:left-6 sm:flex">
            <Image
              src={badge.src}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-display text-sm font-bold text-white">
                Autonomy has levels
              </p>
              <p className="label-mono text-[0.6rem] text-plasma">
                Fee The Developer
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-right backdrop-blur sm:bottom-6 sm:right-6">
            <p className="label-mono text-[0.6rem] text-steel">Deploys to</p>
            <p className="font-display text-sm font-bold text-white">
              Global edge network
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-6 flex flex-wrap justify-center gap-2">
        {pillars.map((pillar) => (
          <span
            key={pillar}
            className="label-mono rounded-full border border-white/10 bg-card/70 px-4 py-2 text-slate-300"
          >
            {pillar}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
