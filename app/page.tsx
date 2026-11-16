import { Show } from '@clerk/nextjs';
import Link from 'next/link';
import { BookingModal } from '@/components/BookingModal';
import { GlobeBackdrop } from '@/components/GlobeBackdrop';
import { AuthTrigger } from '@/components/auth/AuthDialog';
import {
  OfferButton,
  offerButtonClass,
} from '@/components/offer/OfferButton';
import { stackHighlights } from '@/lib/stack';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/** Shown only to signed-out visitors when Clerk is configured. */
function SignedOut({ children }: { children: React.ReactNode }) {
  if (!hasClerkKeys) return null;
  return <Show when="signed-out">{children}</Show>;
}

/**
 * Home is one screen: the header floats over the spinning globe, the pitch
 * sits on top, and everything to buy lives on /services.
 */
export default function Home() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      <GlobeBackdrop />

      <div className="shell relative z-10 flex flex-1 items-center pb-12 pt-36 sm:pt-40">
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
            service, check out, and we get to work.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <OfferButton href="/services" label="See services" />
            <SignedOut>
              <AuthTrigger
                mode="sign-up"
                className={offerButtonClass({ variant: 'secondary' })}
              >
                Sign up free
              </AuthTrigger>
            </SignedOut>
          </div>
          <BookingModal
            label="Or book a free 15-minute consultation"
            className="mt-6 text-sm font-semibold text-cyan underline underline-offset-4 hover:text-white"
          />
        </div>
      </div>

      <div
        aria-labelledby="built-with-heading"
        role="region"
        className="relative z-10 border-t border-white/10 bg-background/60 py-6 backdrop-blur-md"
      >
        <div className="shell flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
      </div>
    </main>
  );
}
