import { Show } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BarberAdReel } from '@/components/BarberAdReel';
import { BookingModal } from '@/components/BookingModal';
import { ProductShelf } from '@/components/ProductShelf';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { VideoBackdrop } from '@/components/VideoBackdrop';
import { AuthTrigger } from '@/components/auth/AuthDialog';
import {
  OfferButtonDot,
  offerButtonClass,
} from '@/components/offer/OfferButton';
import { Section } from '@/components/ui';
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

export default function ServicesPage() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <VideoBackdrop
        videoId="services-hero-web"
        posterId="services-hero-poster"
      />

      <div className="relative z-10">
        <Section className="py-20 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_4px_30px_rgba(5,7,11,0.9)] sm:text-7xl">
                Services
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Pick a service to see what is included, the starting price, and
                buy it through secure Stripe checkout.
              </p>
            </div>
            <BookingModal
              label="Not sure? Free consultation"
              className="inline-flex items-center rounded-full border border-greenglow/40 bg-background/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:bg-greenglow/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
            />
          </div>
        </Section>

        <Section className="border-t border-white/10 bg-background/75 backdrop-blur-sm">
          <ServiceDirectory />
        </Section>

        <Section
          id="products"
          aria-labelledby="products-heading"
          className="scroll-mt-20 border-t border-white/10 bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-greenglow">
                Products
              </p>
              <h2
                id="products-heading"
                className="mt-3 text-4xl font-extrabold text-white sm:text-5xl"
              >
                Pick it. Buy it. We build it.
              </h2>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-cyan underline-offset-4 hover:text-white hover:underline"
            >
              Full price list <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10">
            <ProductShelf />
          </div>
        </Section>

        <Section
          aria-labelledby="barbers-heading"
          className="relative overflow-hidden border-t border-white/10 bg-background/85 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-greenglow">
              For barbers and shops
            </p>
            <h2
              id="barbers-heading"
              className="mt-4 text-balance text-4xl font-extrabold text-white sm:text-5xl"
            >
              Your chair. Your link. Your clients.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Your own .com with a booking page where clients book and pay you
              directly. No app between you and your list.
            </p>
          </div>
          <div className="mt-16">
            <BarberAdReel />
          </div>
        </Section>

        <SignedOut>
          <Section className="border-t border-white/10 bg-background/90 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Get offers first.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
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
