import { Show } from '@clerk/nextjs';
import { BookingModal } from '@/components/BookingModal';
import { HeroVideo } from '@/components/HeroVideo';
import { OfferButton } from '@/components/offer/OfferButton';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { Section } from '@/components/ui';

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
    <main id="main-content" className="min-h-screen">
      <Section className="border-b border-white/10 py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.04] text-white sm:text-7xl">
              Websites and business systems,{' '}
              <span className="ftd-gradient-text">built to sell.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Veteran-owned web design, software, and automation. Pick a
              service, check out, and we get to work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <OfferButton href="/services" label="See services" />
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
              className="mt-5 text-sm font-semibold text-cyan underline underline-offset-4 hover:text-white"
            />
          </div>
          <HeroVideo />
        </div>
      </Section>

      <Section aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="text-3xl font-extrabold text-white sm:text-4xl"
        >
          Services
        </h2>
        <div className="mt-10">
          <ServiceDirectory headingLevel="h3" />
        </div>
      </Section>

      <SignedOut>
        <Section className="border-t border-white/10 bg-black/25 text-center">
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
    </main>
  );
}
