import { Show } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { BookingModal } from '@/components/BookingModal';
import { GlobeConsole } from '@/components/GlobeConsole';
import { AuthTrigger } from '@/components/auth/AuthDialog';
import { OfferButton, offerButtonClass } from '@/components/offer/OfferButton';
import { getAsset } from '@/lib/asset-library';
import { veteranDiscount } from '@/lib/catalog';
import {
  serviceCategories,
  services,
  servicesInCategory,
  type ServiceCategoryId,
} from '@/lib/services';
import { stackHighlights, workflowSteps } from '@/lib/stack';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/** Shown only to signed-out visitors when Clerk is configured. */
function SignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerkKeys) return null;
  return <Show when="signed-out">{children}</Show>;
}

/** Lowest published price in a catalog line, e.g. "$199". */
function startingPrice(id: ServiceCategoryId) {
  const items = servicesInCategory(id);
  return items.length ? items[0].price : null;
}

const capabilities: {
  id: ServiceCategoryId;
  title: string;
  tag: string;
  image: string;
  tone: 'cyan' | 'coral' | 'emerald';
}[] = [
  {
    id: 'websites',
    title: 'Business websites',
    tag: 'Web · Design',
    image: 'floating-browser-window-glowing-960a9dfc',
    tone: 'cyan',
  },
  {
    id: 'systems',
    title: 'Software and automation',
    tag: 'Systems · AI',
    image: 'gears-surrounding-glowing-neural-55c25d43',
    tone: 'coral',
  },
  {
    id: 'care',
    title: 'Cloud and care',
    tag: 'Hosting · Upkeep',
    image: 'glass-server-room-with-racks-aa80aea5',
    tone: 'emerald',
  },
];

const toneClass = {
  cyan: { card: '', text: 'text-plasma', chip: 'border-plasma/30 text-plasma' },
  coral: {
    card: 'aether-card--coral',
    text: 'text-coral',
    chip: 'border-coral/30 text-coral',
  },
  emerald: {
    card: 'aether-card--emerald',
    text: 'text-emerald',
    chip: 'border-emerald/30 text-emerald',
  },
};

const stepTones = ['0 240 255', '59 130 246', '255 107 74', '16 185 129'];

/**
 * Home: hero over the globe console, published-fact row, the three main
 * service lines, the five-step build pipeline, and one booking call to action.
 * Every number on this page comes from the catalog; nothing is invented.
 */
export default function Home() {
  const starter = startingPrice('starter');
  const facts = [
    {
      label: 'Pricing',
      value: 'Published',
      detail: 'Every price is on the site before you talk to anyone.',
    },
    {
      label: 'Starter site',
      value: starter ?? '—',
      detail: 'Your own .com with a booking page and Stripe checkout.',
    },
    {
      label: 'Veteran savings',
      value: `${veteranDiscount.percentOff}%`,
      detail: 'On every service for veterans and veteran-owned businesses.',
    },
    {
      label: 'Catalog',
      value: `${services.length} services`,
      detail: 'Each with its own page and secure checkout.',
    },
  ];

  return (
    <main id="main-content" className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pb-16 pt-36 sm:pt-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(0,240,255,0.14),transparent_70%)]"
        />
        <div className="shell relative text-center">
          <p className="status-chip mx-auto">
            <span aria-hidden="true" className="pulse-dot" />
            Veteran-owned · Texas
          </p>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
            Websites and business systems,{' '}
            <span className="ftd-gradient-text">built to sell.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            Web design, software, and automation with published prices. Pick a
            service, check out, and we get to work.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <OfferButton href="/services" label="Explore services" />
            <Link
              href="/work"
              className={offerButtonClass({ variant: 'secondary' })}
            >
              See the work <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <BookingModal
              label="Book a free 15-minute consultation"
              className="font-mono text-sm font-semibold text-plasma underline-offset-4 hover:text-white hover:underline"
            />
            <SignedOut>
              <AuthTrigger
                mode="sign-up"
                className="font-mono text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Sign up free
              </AuthTrigger>
            </SignedOut>
          </div>
        </div>

        <div className="shell relative mt-16">
          <GlobeConsole />
        </div>
      </section>

      {/* Published facts */}
      <section aria-label="At a glance" className="pb-20">
        <ul className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.label} className="aether-card p-6">
              <p className="label-mono text-steel">{fact.label}</p>
              <p className="mt-4 font-display text-3xl font-extrabold tabular-nums text-white">
                {fact.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{fact.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Capabilities */}
      <section
        aria-labelledby="capabilities-heading"
        className="border-t border-white/[0.06] py-20 sm:py-28"
      >
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="label-mono flex items-center gap-2 text-plasma">
                <span aria-hidden="true" className="h-px w-6 bg-plasma" />
                What we build
              </p>
              <h2
                id="capabilities-heading"
                className="mt-4 text-4xl font-bold text-white sm:text-5xl"
              >
                Engineered for <span className="ftd-cyan-text">scale</span> and{' '}
                <span className="ftd-gradient-text">precision.</span>
              </h2>
            </div>
            <p className="text-base leading-7 text-muted lg:text-right">
              No templates pretending to be custom work. Each service is scoped,
              priced, and built on systems we run ourselves.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {capabilities.map((cap) => {
              const line = serviceCategories.find((c) => c.id === cap.id);
              const price = startingPrice(cap.id);
              const tone = toneClass[cap.tone];
              const image = getAsset(cap.image);
              if (!line) return null;
              return (
                <li key={cap.id}>
                  <Link
                    href={`/services#${cap.id}`}
                    className={`aether-card aether-card--interactive group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma/50 ${tone.card}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                      <span
                        className={`label-mono absolute bottom-4 left-4 rounded-full border bg-void/70 px-3 py-1.5 backdrop-blur ${tone.chip}`}
                      >
                        {cap.tag}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-semibold text-white">
                        {cap.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                        {line.summary}
                      </p>
                      <p className="mt-6 flex items-center justify-between">
                        {price && (
                          <span className="font-mono text-sm text-slate-300">
                            From{' '}
                            <span className="font-semibold text-white">
                              {price.replace('Starting at ', '')}
                            </span>
                          </span>
                        )}
                        <span
                          className={`label-mono transition group-hover:translate-x-1 ${tone.text}`}
                        >
                          {line.name} <span aria-hidden="true">→</span>
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Pipeline */}
      <section
        aria-labelledby="pipeline-heading"
        className="relative border-t border-white/[0.06] py-20 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(59,130,246,0.07),transparent_70%)]"
        />
        <div className="shell relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="label-mono text-plasma">The build pipeline</p>
            <h2
              id="pipeline-heading"
              className="mt-4 text-balance text-4xl font-bold text-white sm:text-5xl"
            >
              From brief to live site, one disciplined path.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              Every project moves through the same five steps, with the tools
              named at each one.
            </p>
          </div>

          <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <li
                key={step.title}
                className="aether-card flex flex-col p-6"
                style={
                  {
                    '--node': stepTones[index % stepTones.length],
                  } as React.CSSProperties
                }
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="orbit-node h-11 w-11 text-xs"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="label-mono text-steel">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {step.detail}
                </p>
                <p className="mt-5 border-t border-white/[0.06] pt-4 font-mono text-[0.7rem] leading-5 text-steel">
                  {step.tools.join(' · ')}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col items-center gap-4 rounded-full border border-white/[0.06] bg-card/50 px-6 py-4 backdrop-blur sm:flex-row sm:justify-between">
            <h3 className="label-mono shrink-0 text-steel">Built with</h3>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-300">
              {stackHighlights.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <Link
              href="/stack"
              className="label-mono shrink-0 text-plasma hover:text-white"
            >
              How we build <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="pb-24 pt-4">
        <div className="shell">
          <div className="aether-card relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(0,240,255,0.16),transparent_70%)]"
            />
            <div className="relative">
              <p className="status-chip mx-auto">
                <span aria-hidden="true" className="pulse-dot" />
                Free 15-minute consultation
              </p>
              <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold text-white sm:text-5xl">
                Ready to build something that{' '}
                <span className="ftd-cyan-text">sells?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
                Talk with Fee directly about your site, software, or automation.
                No deposit to talk and no pressure.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <BookingModal
                  label="Book a free consultation"
                  className="pill-primary"
                />
                <Link
                  href="/pricing"
                  className={offerButtonClass({ variant: 'secondary' })}
                >
                  See every price
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
