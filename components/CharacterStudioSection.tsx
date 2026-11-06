import Image from 'next/image';
import Link from 'next/link';
import { Tilt3D } from '@/components/Tilt3D';

const roles = ['Founder', 'Staff concepts', 'Ad models', 'Spokespeople'];

export function CharacterStudioSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/10 blur-[130px]"
      />
      <div className="shell relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-xl">
          <p className="status-chip">Character Studio / New demo system</p>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            One identity. A complete{' '}
            <span className="ftd-gradient-text">visual cast.</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Fee The Developer now has a structured character and wardrobe system
            for product demos, campaign concepts, website scenes, and future
            video work—anchored to approved founder and apparel assets.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300"
              >
                {role}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demos"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
            >
              Enter Character Studio
            </Link>
            <Link
              href="/merch"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white hover:border-greenglow/50 hover:bg-greenglow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
            >
              View the FTD line
            </Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Concept people are labeled as concepts and are not presented as
            current employees. Final commercial assets remain subject to
            identity, wardrobe, and trademark review.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
          <Tilt3D className="min-h-[28rem] rounded-[2rem]" max={4}>
            <figure className="relative h-full min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-panel shadow-2xl shadow-electric/10">
              <Image
                src="/brand/ftd-founder-hero.webp"
                alt="Fee The Developer founder character reference"
                fill
                sizes="(min-width: 1024px) 38vw, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                  Identity locked
                </p>
                <p className="mt-2 text-2xl font-extrabold text-white">
                  Fee The Developer
                </p>
              </figcaption>
            </figure>
          </Tilt3D>
          <div className="grid gap-4 sm:grid-rows-2">
            {[
              ['/merch/model-hoodie-royal-blue.jpg', 'Technical guide concept'],
              ['/merch/model-hoodie-vivid-red.jpg', 'Campaign model concept'],
            ].map(([src, label]) => (
              <Tilt3D key={src} className="min-h-52 rounded-3xl" max={5}>
                <figure className="relative h-full min-h-52 overflow-hidden rounded-3xl border border-white/10 bg-panel">
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="(min-width: 1024px) 22vw, 44vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <figcaption className="absolute bottom-0 p-4 text-sm font-bold text-white">
                    {label}
                  </figcaption>
                </figure>
              </Tilt3D>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
