import Image from 'next/image';
import { BookingModal } from '@/components/BookingModal';
import { ServiceDirectory } from '@/components/ServiceDirectory';
import { Button, Section } from '@/components/ui';

const steps = [
  {
    title: 'Pick a service',
    detail: 'Every service has its own page with a starting price.',
  },
  {
    title: 'Check out securely',
    detail: 'Pay through Stripe, or book a free 15-minute consultation first.',
  },
  {
    title: 'Confirm the scope',
    detail: 'A written scope confirms deliverables before work begins.',
  },
];

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <Section className="border-b border-white/10 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
              Websites and business systems,{' '}
              <span className="ftd-gradient-text">built to sell.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Veteran-owned web design, software, and automation for businesses
              that want to show up strong on the web, Google, Apple, and Yelp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/services" glow="green">
                See services
              </Button>
              <BookingModal
                label="Free consultation"
                className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
              />
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-panel">
            {/* Replace with the new hero image when it is uploaded. */}
            <Image
              src="/brand/generated/ftd-business-systems-hero.webp"
              alt="Connected websites, cloud, analytics, and automation systems"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="text-3xl font-semibold text-white sm:text-4xl"
        >
          Services
        </h2>
        <div className="mt-10">
          <ServiceDirectory headingLevel="h3" />
        </div>
      </Section>

      <Section
        className="border-t border-white/10 bg-black/25"
        aria-labelledby="how-heading"
      >
        <h2 id="how-heading" className="text-3xl font-semibold text-white">
          How it works
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Step {index + 1}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}
