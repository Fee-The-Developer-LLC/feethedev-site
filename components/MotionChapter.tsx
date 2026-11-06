import Image from 'next/image';
import { Section } from '@/components/ui';

const statement =
  'Websites, software, and online tools that make it easier to run and grow your business.';

const capabilities = [
  'Web design',
  'Custom software',
  'AI automation',
  'Google Workspace',
  'Business presence',
  'Business automation',
];

const layers = [
  {
    title: 'Website',
    description: 'A clear, credible home for your business.',
    image: '/web_software.PNG',
    href: '/services',
  },
  {
    title: 'Business tools',
    description: 'Software and automation that save time on routine work.',
    image: '/google_product_suite.PNG',
    href: '/services',
  },
  {
    title: 'Online presence',
    description:
      'Consistent business information across Google, Apple, and Yelp.',
    image: '/google_apple_yelp.PNG',
    href: '/services',
  },
];

export function MotionChapter() {
  return (
    <Section
      id="services-overview"
      data-motion-section
      className="relative overflow-hidden border-y border-white/10 bg-[#060910] py-28 sm:py-36 lg:py-44"
      containerClassName="max-w-[88rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(37,120,255,0.14),transparent_31%),radial-gradient(circle_at_82%_72%,rgba(20,232,180,0.09),transparent_27%)]" />

      <div className="relative">
        <p
          data-motion-reveal
          className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan"
        >
          Our services
        </p>
        <p
          data-motion-statement
          className="mt-8 max-w-6xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-7xl"
        >
          {statement.split(' ').map((word, index) => (
            <span
              key={`${word}-${index}`}
              data-motion-word
              className="mr-[0.23em] inline-block"
            >
              {word}
            </span>
          ))}
        </p>

        <div className="mt-20 grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-2">
          <div
            data-motion-reveal
            className="rounded-[2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 lg:col-span-8 lg:row-span-2"
          >
            <div className="h-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-panel shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <div className="flex flex-col border-b border-white/10 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-greenglow">
                    Services for your business
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                    Practical tools for your business.
                  </h2>
                </div>
                <a
                  href="/services"
                  className="group mt-5 inline-flex items-center gap-3 text-sm font-semibold text-slate-200 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60 sm:mt-0"
                >
                  Explore services
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
              </div>

              <div
                className="motion-accordion grid min-h-[30rem] grid-cols-1 md:grid-cols-3"
                aria-label="Services"
              >
                {layers.map((layer) => (
                  <a
                    key={layer.title}
                    href={layer.href}
                    className="motion-accordion__panel group relative min-h-64 overflow-hidden border-b border-white/10 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-greenglow/70 md:border-b-0 md:border-r last:md:border-r-0"
                  >
                    <Image
                      src={layer.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover opacity-35 saturate-50 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:opacity-55 group-hover:saturate-100 group-focus-visible:scale-105 group-focus-visible:opacity-55"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 block p-6">
                      <span className="block text-2xl font-semibold text-white">
                        {layer.title}
                      </span>
                      <span className="mt-2 block max-w-52 text-sm leading-6 text-slate-300">
                        {layer.description}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <article
            data-motion-reveal
            className="rounded-[2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 lg:col-span-4 lg:row-span-1"
          >
            <div className="flex h-full min-h-56 flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-[radial-gradient(circle_at_78%_18%,rgba(37,120,255,0.2),transparent_42%),#0B1018] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-8">
              <div className="h-2 w-2 rounded-full bg-electric shadow-[0_0_18px_rgba(37,120,255,0.9)]" />
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Design that guides visitors
                </h3>
                <p className="mt-3 max-w-sm leading-7 text-slate-300">
                  Clear layouts and thoughtful movement help visitors find what
                  they need.
                </p>
              </div>
            </div>
          </article>

          <article
            data-motion-reveal
            className="rounded-[2rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 lg:col-span-4 lg:row-span-1"
          >
            <div className="flex h-full min-h-56 flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-[radial-gradient(circle_at_20%_15%,rgba(20,232,180,0.15),transparent_45%),#0B1018] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-8">
              <div className="h-2 w-2 rounded-full bg-greenglow shadow-[0_0_18px_rgba(20,232,180,0.9)]" />
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Comfortable to use
                </h3>
                <p className="mt-3 max-w-sm leading-7 text-slate-300">
                  A clear, comfortable experience on every screen size.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div
          data-motion-reveal
          className="mt-10 overflow-hidden border-y border-white/10 py-5"
          aria-label="Fee The Developer capabilities"
        >
          <div className="motion-marquee flex w-max items-center gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.26em] text-slate-400">
            {[...capabilities, ...capabilities].map((capability, index) => (
              <span
                key={`${capability}-${index}`}
                className="flex items-center gap-10"
              >
                {capability}
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_rgba(34,211,238,0.75)]"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
