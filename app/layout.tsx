import { ClerkProvider, Show, UserButton } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Geist, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { AuthDialogProvider, AuthTrigger } from '@/components/auth/AuthDialog';
import { HideOnOfferPages } from '@/components/HideOnOfferPages';
import { NavLink } from '@/components/NavLink';
import { SiteHeaderShell } from '@/components/SiteHeaderShell';
import { clerkAppearance, clerkLocalization } from '@/lib/clerk-appearance';
import { serviceCategories } from '@/lib/services';
import { defaultOgImage, siteConfig } from '@/lib/site-config';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} | Web Design + Full Business Presence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: 'Alfreddie Postell II', url: siteConfig.siteUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  keywords: [
    'business website design',
    'web development company',
    'Google Business Profile setup',
    'Google Business verification support',
    'Apple Business Connect setup',
    'Yelp business profile setup',
    'AI automation company',
    'custom software development',
    'business automation',
    'Texas web design company',
    'Texas software company',
    'veteran-owned technology company',
    'business presence services',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteConfig.siteUrl,
    title: `${siteConfig.name} | Web Design + Full Business Presence`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: 'en_US',
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Web Design + Full Business Presence`,
    description: siteConfig.description,
    images: [defaultOgImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05070E',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: siteConfig.legalName,
  url: siteConfig.siteUrl,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  description: siteConfig.description,
  founder: { '@type': 'Person', name: 'Alfreddie Postell II' },
  areaServed: 'United States',
  serviceType: siteConfig.services,
  knowsAbout: [
    'Web Design',
    'Web Development',
    'Google Business Profile',
    'Apple Business Connect',
    'Yelp Business Profiles',
    'AI Automation',
    'Custom Software',
  ],
};

const primaryNav = [
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/work', label: 'Work' },
  { href: '/stack', label: 'How we build' },
];

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} ${geist.variable} font-sans`}
      >
        {hasClerkKeys ? (
          <ClerkProvider
            appearance={clerkAppearance}
            localization={clerkLocalization}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
          >
            <AuthDialogProvider>
              <SiteContent>{children}</SiteContent>
            </AuthDialogProvider>
          </ClerkProvider>
        ) : (
          <SiteContent>{children}</SiteContent>
        )}
      </body>
    </html>
  );
}

function SiteContent({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <HideOnOfferPages>
        <SiteHeaderShell>
          <div className="shell flex items-center justify-between gap-4 py-3">
            <Link
              href="/"
              aria-label="Fee The Developer home"
              className="shrink-0"
            >
              <Image
                src="/brand/ftd-wordmark-header.webp"
                alt="Fee The Developer"
                width={250}
                height={112}
                priority
                className="h-10 w-auto"
              />
            </Link>
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-card/60 p-1 backdrop-blur-xl md:flex"
            >
              {primaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 font-mono text-[0.8rem] font-semibold tracking-[0.02em] text-slate-300 transition hover:text-white"
                  activeClassName="bg-plasma/10 text-plasma shadow-[inset_0_0_0_1px_rgba(0,240,255,0.35)]"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              {hasClerkKeys ? (
                <>
                  <Show when="signed-out">
                    <AuthTrigger
                      mode="sign-in"
                      className="hidden min-h-11 items-center font-mono text-[0.8rem] font-semibold text-slate-300 hover:text-white sm:inline-flex"
                    >
                      Sign in
                    </AuthTrigger>
                    <AuthTrigger
                      mode="sign-up"
                      className="pill-primary min-h-10 px-4 text-xs"
                    >
                      <span aria-hidden="true" className="pulse-dot" />
                      Sign up free
                    </AuthTrigger>
                  </Show>
                  <Show when="signed-in">
                    <Link
                      href="/dashboard"
                      className="font-mono text-[0.8rem] font-semibold text-slate-300 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <UserButton />
                  </Show>
                </>
              ) : (
                <Link
                  href="/services"
                  className="pill-primary min-h-10 px-4 text-xs"
                >
                  <span aria-hidden="true" className="pulse-dot" />
                  See services
                </Link>
              )}
            </div>
          </div>
          <nav
            aria-label="Main navigation, mobile"
            className="shell flex gap-5 overflow-x-auto pb-3 font-mono text-[0.8rem] font-semibold text-slate-300 md:hidden"
          >
            {primaryNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="shrink-0 hover:text-white"
                activeClassName="text-plasma"
              >
                {item.label}
              </NavLink>
            ))}
            {hasClerkKeys && (
              <Show when="signed-out">
                <AuthTrigger
                  mode="sign-in"
                  className="-my-3 ml-auto inline-flex min-h-11 shrink-0 items-center text-plasma hover:text-white sm:hidden"
                >
                  Sign in
                </AuthTrigger>
              </Show>
            )}
          </nav>
        </SiteHeaderShell>
      </HideOnOfferPages>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
      <footer className="relative border-t border-white/[0.08] bg-void/90 pt-16">
        <div className="shell grid gap-10 pb-12 text-sm text-muted sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-4">
            <p className="font-display text-lg font-bold text-white">
              Fee The Developer
            </p>
            <p className="ftd-cyan-text font-display text-base font-semibold">
              Build. Automate. Create. Scale.
            </p>
            <p className="max-w-xs leading-6">
              Veteran-owned web design, software, and automation studio based in
              Texas. Every price is published.
            </p>
            <p className="status-chip">
              <span aria-hidden="true" className="pulse-dot" />
              Veteran-owned · Texas
            </p>
          </div>
          <nav aria-label="Footer services" className="space-y-3">
            <p className="label-mono text-steel">Services</p>
            <ul className="space-y-2.5">
              {serviceCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/services#${category.id}`}
                    className="hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer navigation" className="space-y-3">
            <p className="label-mono text-steel">Company</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/start" className="hover:text-white">
                  Start a project
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-white">
                  Work
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/stack" className="hover:text-white">
                  How we build
                </Link>
              </li>
              {hasClerkKeys && (
                <li>
                  <Link
                    href="/dashboard"
                    className="text-plasma hover:text-white"
                  >
                    Client portal
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="space-y-3">
            <p className="label-mono text-steel">Contact</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="block hover:text-white"
            >
              {siteConfig.email}
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="block hover:text-white"
            >
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="border-t border-white/[0.06]">
          <div className="shell flex flex-col gap-2 py-6 font-mono text-xs text-steel sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Fee The Developer LLC</p>
            <p>feethedeveloper.com</p>
          </div>
        </div>
      </footer>
    </>
  );
}
