import { Show } from '@clerk/nextjs';
import Link from 'next/link';
import { BarberAdReel } from '@/components/BarberAdReel';
import { BookingModal } from '@/components/BookingModal';
import { GlobeBackdrop } from '@/components/GlobeBackdrop';
import { OfferButton } from '@/components/offer/OfferButton';
import { ProductShelf } from '@/components/ProductShelf';
import { Section } from '@/components/ui';
import { stackHighlights } from '@/lib/stack';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/** Shown only to signed-out visitors when Clerk is configured. */
function SignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerkKeys) return null;
  return <Show when="signed-out">{children}</Show>;
}

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen">
      <GlobeBackdrop />

      <div className="relative z-10">
        <Section className="flex min-h-[calc(100svh-4.5rem)] items-center py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="status-chip mx-auto">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-greenglow"
              />
              Veteran-owned · Texas
            </p>
            <h1 className="mt-8 text-balance text-5xl font-extrabold leading-[1.02] text-white drop-shadow-[0_4px_30px_rgba(5,7,11,0.9)] sm:text-7xl lg:text-8xl">
              Websites and business systems,{' '}
              <span className="ftd-gradient-text">built to sell.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Web design, software, and automation with published prices. Pick a
              product, check out, and we get to work.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <OfferButton href="#products" label="Shop products" />
              <SignedOut>
                <OfferButton
                  href="/sign-up"
                  label="Sign up free"
                  variant="secondary"
                />
              </SignedOut>
            </div>
            <BookingModal
              label="Or book a free 15-minute consultation"
              className="mt-6 text-sm font-semibold text-cyan underline underline-offset-4 hover:text-white"
            />
          </div>
        </Section>

        <Section
          aria-labelledby="built-with-heading"
          className="border-y border-white/10 bg-background/70 py-8 backdrop-blur-md sm:py-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2
              id="built-with-heading"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
            >
              Built with
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-200">
              {stackHighlights.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <Link
              href="/stack"
              className="text-sm font-semibold text-cyan underline-offset-4 hover:text-white hover:underline"
            >
              How we build <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Section>

        <Section
          aria-labelledby="barbers-heading"
          className="relative overflow-hidden bg-background/80 backdrop-blur-sm"
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

        <Section
          id="products"
          aria-labelledby="products-heading"
          className="scroll-mt-20 border-t border-white/10 bg-background/85 backdrop-blur-sm"
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

        <SignedOut>
          <Section className="border-t border-white/10 bg-background/90 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Get offers first.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Create your free account for member offers and faster checkout.
            </p>
            <div className="mt-8 flex justify-center">
              <OfferButton href="/sign-up" label="Sign up free" />
            </div>
          </Section>
        </SignedOut>
      </div>
    </main>
  );
}
