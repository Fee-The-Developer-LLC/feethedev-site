import { Show } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookingModal } from '@/components/BookingModal';
import { ProductShelf } from '@/components/ProductShelf';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { StarterAdReel } from '@/components/StarterAdReel';
import { VideoBackdrop } from '@/components/VideoBackdrop';
import { AuthTrigger } from '@/components/auth/AuthDialog';
import {
  OfferButtonDot,
  offerButtonClass,
} from '@/components/offer/OfferButton';
import { Section } from '@/components/ui';
import { veteranDiscount } from '@/lib/catalog';
import {
  getService,
  serviceCategories,
  services,
  servicesInCategory,
} from '@/lib/services';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Every Fee The Developer service with its own page, starting price, and secure checkout: websites, business presence, analytics, software, automation, and support.',
  alternates: { canonical: new URL('/services', siteConfig.siteUrl) },
};

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/** Shown only to signed-out visitors when Clerk is configured. */
function SignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerkKeys) return null;
  return <Show when="signed-out">{children}</Show>;
}

/** One headline offer per main line, in the order buyers usually grow. */
const featuredSlugs = [
  'own-your-bookings-plus',
  'website-launch',
  'full-business-system',
];

const featuredTones = [
  { card: '', chip: 'border-plasma/30 text-plasma', dot: 'bg-plasma' },
  { card: '', chip: 'border-electric/40 text-electric', dot: 'bg-electric' },
  {
    card: 'aether-card--coral',
    chip: 'border-coral/30 text-coral',
    dot: 'bg-coral',
  },
];

const engagementSteps = [
  {
    title: 'Pick and check out',
    detail:
      'Choose a service or bundle at its published price and pay through secure Stripe checkout. Larger builds can start on a deposit.',
    tag: 'Stripe checkout',
    node: '0 240 255',
  },
  {
    title: 'Kickoff and scope',
    detail:
      'We confirm what you are getting in writing, collect your brand and content, and set the build plan before work begins.',
    tag: 'Written scope',
    node: '59 130 246',
  },
  {
    title: 'Build and launch',
    detail:
      'Your project moves through plan, design, build, check, and ship, then goes live on your own domain.',
    tag: 'Live on your .com',
    node: '255 107 74',
  },
];

const valueChips = [
  'Published, fixed starting prices',
  'Direct access to the builder',
  'Secure Stripe checkout',
  'Your domain, in your name',
];

export default function ServicesPage() {
  const featured = featuredSlugs
    .map((slug) => getService(slug))
    .filter((service) => service !== undefined);

  return (
    <main id="main-content" className="relative min-h-screen">
      <VideoBackdrop
        videoId="services-hero-web"
        posterId="services-hero-poster"
      />

      <div className="relative z-10">
        {/* Hero */}
        <Section className="pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
          <div className="flex flex-wrap justify-center gap-2">
            <p className="status-chip">
              <span aria-hidden="true" className="pulse-dot" />
              Veteran-owned · Texas
            </p>
            <p className="status-chip border-coral/30 bg-coral/[0.08] text-coral">
              {veteranDiscount.percentOff}% veteran discount
            </p>
          </div>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-[2.5rem] font-extrabold leading-[1.08] text-white sm:text-6xl lg:text-7xl">
            Services with published prices,{' '}
            <span className="ftd-gradient-text">built to sell.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            Pick a service to see what is included and the published price, then
            buy it through secure Stripe checkout.
          </p>

          <nav
            aria-label="Service categories"
            className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2"
          >
            <a
              href="#catalog"
              className="rounded-full bg-plasma px-4 py-2 font-mono text-xs font-semibold text-void shadow-plasma"
            >
              All services ({services.length})
            </a>
            {serviceCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-white/10 bg-card/70 px-4 py-2 font-mono text-xs font-semibold text-slate-300 backdrop-blur transition hover:border-plasma/50 hover:text-white"
              >
                {category.name} ({servicesInCategory(category.id).length})
              </a>
            ))}
          </nav>

          <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
            {valueChips.map((chip) => (
              <li
                key={chip}
                className="label-mono flex items-center gap-2 rounded-full border border-white/[0.06] bg-void/60 px-4 py-2 text-[0.65rem] text-slate-400"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-plasma"
                />
                {chip}
              </li>
            ))}
          </ul>
        </Section>

        {/* Featured tiers */}
        {featured.length > 0 && (
          <Section
            aria-labelledby="featured-heading"
            className="border-t border-white/[0.06] bg-void/70 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="label-mono text-plasma">Most-chosen builds</p>
                <h2
                  id="featured-heading"
                  className="mt-3 max-w-2xl text-4xl font-bold text-white sm:text-5xl"
                >
                  Three ways to start.
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-muted lg:text-right">
                Every build is scoped and priced before work begins, then
                delivered on your own domain.
              </p>
            </div>

            <ul className="mt-12 grid gap-6 lg:grid-cols-3">
              {featured.map((service, index) => {
                const tone = featuredTones[index % featuredTones.length];
                return (
                  <li
                    key={service.slug}
                    className={`aether-card aether-card--interactive flex flex-col p-6 sm:p-8 ${tone.card}`}
                  >
                    <p
                      className={`label-mono inline-flex w-fit items-center gap-2 rounded-full border bg-void/60 px-3 py-1.5 ${tone.chip}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                      />
                      {service.lineName}
                    </p>
                    <h3 className="mt-6 text-2xl font-bold text-white">
                      {service.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {service.summary}
                    </p>
                    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-void/60 px-5 py-4">
                      <p className="font-display text-3xl font-extrabold tabular-nums text-white">
                        {service.price}
                      </p>
                      <p className="mt-1 font-mono text-xs text-coral">
                        {service.veteranPrice} with {veteranDiscount.percentOff}
                        % veteran discount
                      </p>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                      {service.includes.slice(0, 3).map((line) => (
                        <li key={line} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald shadow-green"
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                      {service.primary && (
                        <Link
                          href={service.primary.href}
                          className={offerButtonClass({ size: 'sm' })}
                        >
                          <OfferButtonDot />
                          {service.primary.label}
                        </Link>
                      )}
                      <Link
                        href={service.href}
                        className={offerButtonClass({
                          size: 'sm',
                          variant: 'secondary',
                        })}
                      >
                        Details
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {/* Full catalog */}
        <Section
          id="catalog"
          aria-labelledby="catalog-heading"
          className="scroll-mt-20 border-t border-white/[0.06] bg-void/80 backdrop-blur-sm"
        >
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label-mono text-plasma">Full catalog</p>
              <h2
                id="catalog-heading"
                className="mt-3 text-4xl font-bold text-white sm:text-5xl"
              >
                Every service, every price.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted lg:text-right">
              Buy any service on its own or add it to a larger build. The
              veteran discount applies to veterans and veteran-owned businesses
              after proof, one discount per order.
            </p>
          </div>
          <ServiceDirectory />
        </Section>

        {/* How engagements run */}
        <Section
          aria-labelledby="engagement-heading"
          className="border-t border-white/[0.06] bg-void/85 backdrop-blur-sm"
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <p className="label-mono text-plasma">How it works</p>
              <h2
                id="engagement-heading"
                className="mt-3 text-4xl font-bold text-white sm:text-5xl"
              >
                How engagements run.
              </h2>
            </div>
            <p className="text-base leading-7 text-muted lg:text-right">
              From checkout to a live build without the endless discovery loop.
            </p>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {engagementSteps.map((step, index) => (
              <li
                key={step.title}
                className="aether-card p-6 sm:p-8"
                style={{ '--node': step.node } as React.CSSProperties}
              >
                <span aria-hidden="true" className="orbit-node">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {step.detail}
                </p>
                <p
                  className="label-mono mt-6 text-[0.65rem]"
                  style={{ color: `rgb(${step.node})` }}
                >
                  {step.tag}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="products"
          aria-labelledby="products-heading"
          className="scroll-mt-20 border-t border-white/[0.06] bg-void/85 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-mono text-emerald">Products</p>
              <h2
                id="products-heading"
                className="mt-3 text-4xl font-bold text-white sm:text-5xl"
              >
                Pick it. Buy it. We build it.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="label-mono text-plasma underline-offset-4 hover:text-white hover:underline"
            >
              Full price list <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10">
            <ProductShelf />
          </div>
        </Section>

        <Section
          aria-labelledby="own-your-com-heading"
          className="relative overflow-hidden border-t border-white/[0.06] bg-void/90 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="label-mono text-emerald">
              For small businesses and sole proprietors
            </p>
            <h2
              id="own-your-com-heading"
              className="mt-4 text-balance text-4xl font-bold text-white sm:text-5xl"
            >
              Your business. Your link. Your customers.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              Your own .com with a booking page where customers book and pay you
              directly. No app between you and your list. Built for any small
              business or solo operator: service providers, contractors,
              consultants, coaches, creators and local shops.
            </p>
          </div>
          <div className="mt-16">
            <StarterAdReel />
          </div>
        </Section>

        {/* Consultation */}
        <Section className="border-t border-white/[0.06] bg-void/90">
          <div className="aether-card relative overflow-hidden p-8 sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_90%_at_100%_50%,rgba(0,240,255,0.12),transparent_70%)]"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="label-mono flex items-center gap-2 text-plasma">
                  <span aria-hidden="true" className="pulse-dot" />
                  Talk to the builder
                </p>
                <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                  Not sure which service fits your business?
                </h2>
                <p className="mt-4 text-base leading-7 text-muted">
                  Book a free 15-minute consultation and talk with Fee directly
                  about your site, software, or automation.
                </p>
              </div>
              <BookingModal
                label="Book a free consultation"
                className="pill-primary"
              />
            </div>
          </div>
        </Section>

        <SignedOut>
          <Section className="border-t border-white/[0.06] bg-void/90 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Get offers first.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
              Create your free account for member offers and faster checkout.
            </p>
            <div className="mt-8 flex justify-center">
              <AuthTrigger mode="sign-up" className={offerButtonClass()}>
                <OfferButtonDot />
                Sign up free
              </AuthTrigger>
            </div>
          </Section>
        </SignedOut>
      </div>
    </main>
  );
}
