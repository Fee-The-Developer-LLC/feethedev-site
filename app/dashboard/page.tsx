import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { BookingModal } from '@/components/BookingModal';
import { Card } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Client Dashboard',
  robots: { index: false, follow: false },
};

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function DashboardPage() {
  if (!hasClerkKeys) notFound();

  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect('/sign-in?redirect_url=/dashboard');

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <section className="border-b border-white/10">
        <div className="shell py-10 sm:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-greenglow">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.85)]"
                />
                Secure client workspace
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Your work, in one clear place.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Reach your project tools, schedule time, handle the next payment
                step, and stay connected to the Fee The Developer community.
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-electric/40 bg-electric/15 px-5 py-3 text-sm font-semibold text-white hover:bg-electric/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            >
              Start another project <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 sm:py-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Card hover={false} className="p-7 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan">
                  Project center
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Your client portal
                </h2>
              </div>
              <span className="rounded-full border border-greenglow/30 bg-greenglow/10 px-3 py-1.5 text-xs font-medium text-greenglow">
                Open
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Upload photos and videos, request changes to your site, send
              suggestions or links, and open your shared folder for large files
              and downloads. Track every request&apos;s status in one place.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {['Photos + videos', 'Change requests', 'Shared folder'].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300"
                  >
                    <span
                      aria-hidden="true"
                      className="mb-3 block h-1 w-8 rounded-full bg-electric/70"
                    />
                    {item}
                  </div>
                ),
              )}
            </div>
            <Link
              href="/portal"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60"
            >
              Open client portal <ArrowIcon />
            </Link>
          </Card>

          <section aria-labelledby="community-heading">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Community
                </p>
                <h2
                  id="community-heading"
                  className="mt-2 text-2xl font-semibold text-white"
                >
                  Stay close to the build.
                </h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {siteConfig.communities.map((community) => (
                <div
                  key={community.name}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">
                      {community.name}
                    </h3>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${community.url ? 'bg-greenglow shadow-[0_0_12px_rgba(20,232,180,.8)]' : 'bg-slate-600'}`}
                      aria-label={community.url ? 'Available' : 'Coming soon'}
                    />
                  </div>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                    {community.description}
                  </p>
                  {community.url ? (
                    <a
                      href={community.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
                    >
                      {community.action} <ArrowIcon />
                    </a>
                  ) : (
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Link coming soon
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6" aria-label="Client actions">
          <div className="rounded-3xl border border-greenglow/25 bg-greenglow/[0.07] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-greenglow">
              Book time
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Schedule your next conversation
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Choose an available time through the verified Fee The Developer
              Google Calendar.
            </p>
            <BookingModal className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Secure payment
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Booking deposit
            </h2>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
              $100
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use the live Stripe-hosted payment page only when Fee The
              Developer has asked you to submit the consultation deposit.
            </p>
            <a
              href={siteConfig.depositUrl}
              target={
                siteConfig.depositUrl.startsWith('https://')
                  ? '_blank'
                  : undefined
              }
              rel={
                siteConfig.depositUrl.startsWith('https://')
                  ? 'noreferrer'
                  : undefined
              }
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            >
              Pay securely with Stripe <ArrowIcon />
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Need help?
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              Talk to a person
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <a
                className="block text-slate-300 hover:text-white"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              <a
                className="block text-slate-300 hover:text-white"
                href={`tel:${siteConfig.phone}`}
              >
                {siteConfig.phoneDisplay}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
