import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { showcaseSites } from '@/lib/showcase';

export const metadata: Metadata = {
  title: 'Live Sites',
  description:
    'Websites designed, built, and run by Fee The Developer, live in production for veteran-owned businesses, local services, and our own brands.',
  alternates: { canonical: '/work' },
};

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export default function WorkPage() {
  const [featured, ...rest] = showcaseSites;

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <section className="border-b border-white/10">
        <div className="shell py-14 sm:py-20">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-greenglow">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.85)]"
            />
            {showcaseSites.length} sites live in production
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
            Built here. <span className="ftd-gradient-text">Running now.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Every site below is designed, built, and operated by Fee The
            Developer. They run on their own domains on Cloudflare&apos;s global
            network. Click through and see them live.
          </p>
        </div>
      </section>

      <div className="shell space-y-6 py-10 sm:py-14">
        <SiteCard site={featured} featured />
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      </div>

      <section className="border-t border-white/10">
        <div className="shell flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Your business could be next.
            </h2>
            <p className="mt-2 text-slate-400">
              Already a client? Send changes, photos, and videos from your
              portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/start"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60"
            >
              Start a project
            </Link>
            <Link
              href="/portal"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60"
            >
              Client portal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SiteCard({
  site,
  featured = false,
}: {
  site: (typeof showcaseSites)[number];
  featured?: boolean;
}) {
  return (
    <a
      href={`https://${site.domain}/`}
      target="_blank"
      rel="noreferrer"
      className={`group block overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-greenglow/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60 ${featured ? 'lg:grid lg:grid-cols-[1.35fr_0.65fr]' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-black lg:border-b-0">
        <Image
          src={site.image}
          alt={`${site.name} homepage`}
          fill
          sizes={
            featured
              ? '(min-width: 1024px) 65vw, 100vw'
              : '(min-width: 768px) 50vw, 100vw'
          }
          className="object-cover object-top transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          priority={featured}
        />
      </div>
      <div
        className={`flex flex-col p-6 ${featured ? 'justify-center sm:p-8' : ''}`}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-cyan">
          {site.industry}
        </p>
        <h2
          className={`mt-2 font-semibold text-white ${featured ? 'text-3xl' : 'text-xl'}`}
        >
          {site.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">{site.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-greenglow group-hover:text-white">
          {site.domain} <ExternalIcon />
        </span>
      </div>
    </a>
  );
}
