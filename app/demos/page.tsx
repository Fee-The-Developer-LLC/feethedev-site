import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PageIntro } from '@/components/PageIntro';
import { Tilt3D } from '@/components/Tilt3D';
import {
  characterProfiles,
  wardrobeCapsules,
  watchCapsule,
} from '@/lib/character-studio';
import { getPortalViewer } from '@/lib/portal/server';

export const metadata: Metadata = {
  title: 'Character Studio Demos',
  description:
    'Fee The Developer character, wardrobe, staff-concept, ad-model, and spokesperson demonstrations.',
  robots: { index: false, follow: false },
};

// Internal studio tooling: visible only to PORTAL_ADMIN_EMAILS accounts.
export const dynamic = 'force-dynamic';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const statusStyles = {
  'identity locked': 'border-greenglow/35 bg-greenglow/10 text-greenglow',
  'concept brief': 'border-electric/35 bg-electric/10 text-cyan',
  casting: 'border-redglow/35 bg-redglow/10 text-orange-200',
} as const;

export default async function DemosPage() {
  if (!hasClerkKeys) notFound();
  const viewer = await getPortalViewer();
  if (!viewer) redirect('/sign-in?redirect_url=/demos');
  if (!viewer.isAdmin) notFound();

  return (
    <main id="main-content" className="min-h-screen pb-24">
      <PageIntro
        eyebrow="Demos / Character Studio"
        title={
          <>
            Built once. Cast{' '}
            <span className="ftd-gradient-text">everywhere.</span>
          </>
        }
        description="A reviewable visual system for Fee The Developer, future team roles, campaign models, spokespeople, apparel, footwear, executive tailoring, and product-demo scenes."
        aside={
          <div className="glass-panel p-5 text-sm leading-6 text-slate-300">
            <p className="font-bold text-white">Current production state</p>
            <p className="mt-2">
              Founder identity and FTD apparel references are approved. New
              people shown here remain concepts until a real employee or hired
              model is named, consented, and approved.
            </p>
          </div>
        }
      />

      <section className="shell py-20">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {characterProfiles.map((profile) => (
            <Tilt3D
              key={profile.name}
              className="h-full rounded-[1.75rem]"
              max={4}
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20">
                <div className="relative aspect-[4/5] overflow-hidden bg-panel">
                  <Image
                    src={profile.image}
                    alt={profile.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-transparent to-transparent" />
                  <span
                    className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] ${statusStyles[profile.status]}`}
                  >
                    {profile.status}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {profile.role}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-white">
                    {profile.name}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {profile.description}
                  </p>
                  <ul
                    className="mt-5 flex flex-wrap gap-2"
                    aria-label="Planned uses"
                  >
                    {profile.useCases.map((useCase) => (
                      <li
                        key={useCase}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[0.7rem] text-slate-400"
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Tilt3D>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="status-chip">Wardrobe system / Founder</p>
            <h2 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
              Streetwear to the boardroom.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              The wardrobe direction combines the real FTD apparel line with
              owner-requested work boots, retro basketball silhouettes, knit
              runners, luxury tailoring, leather goods, and watch profiles.
            </p>
            <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100/80">
              Brand names are fit and styling references—not sponsorships.
              Generated concepts omit third-party logos. Exact branded items
              require authentic owner-supplied or licensed product photography.
            </div>
          </div>
          <Tilt3D className="rounded-[2rem]" max={3}>
            <figure className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#ededed] shadow-2xl shadow-black/30">
              <Image
                src="/merch/full-line-reference.png"
                alt="Fee The Developer apparel line with hoodies, joggers, T-shirts, and hats"
                width={1600}
                height={1200}
                className="h-auto w-full"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-20 text-sm font-semibold text-white">
                Approved FTD apparel reference
              </figcaption>
            </figure>
          </Tilt3D>
        </div>

        <div className="shell mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {wardrobeCapsules.map((capsule, index) => (
            <article
              key={capsule.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-electric">
                Look {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 text-xl font-extrabold text-white">
                {capsule.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {capsule.detail}
              </p>
              <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">
                {capsule.footwear}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell grid gap-8 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <div>
          <p className="status-chip">Watch capsule</p>
          <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
            Executive finishing pieces.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {watchCapsule.map((watch) => (
            <div
              key={watch}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-greenglow">
                Unbranded concept profile
              </p>
              <p className="mt-3 text-lg font-semibold leading-7 text-white">
                {watch}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell">
        <div className="neon-border overflow-hidden rounded-[2rem] border border-white/10 bg-panel p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan">
                Demonstration library
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-white">
                Character production is now a system.
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-slate-300">
                The next approved Flow renders can replace concept frames here
                without changing the page structure. Every person, look, and
                claim keeps a visible approval state.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/merch"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-slate-200"
              >
                Shop FTD apparel
              </Link>
              <Link
                href="/start"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Start a project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
