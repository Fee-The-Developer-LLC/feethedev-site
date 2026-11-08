import { ClerkProvider, Show, UserButton } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Link from 'next/link';
import { BookingModal } from '@/components/BookingModal';
import { SignUpAction } from '@/components/SignUpAction';
import { siteConfig } from '@/lib/site-config';
import '../styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
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
    images: [
      {
        url: '/brand/ftd-logo.svg',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Web Design + Full Business Presence`,
    description: siteConfig.description,
    images: ['/brand/ftd-logo.svg'],
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
  themeColor: '#0A0A0A',
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
      <body className={`${manrope.variable} font-sans`}>
        {hasClerkKeys ? (
          <ClerkProvider>
            <SiteContent>{children}</SiteContent>
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
      <header className="relative z-50 border-b border-white/10 bg-background/85 backdrop-blur-xl">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="text-base font-extrabold uppercase tracking-[0.1em] text-white sm:text-lg"
          >
            Fee The <span className="ftd-gradient-text">Developer</span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center gap-6 overflow-x-auto text-sm text-slate-300 sm:order-none sm:w-auto"
          >
            <Link href="/services" className="shrink-0 hover:text-white">
              Services
            </Link>
            <Link href="/pricing" className="shrink-0 hover:text-white">
              Pricing
            </Link>
            <Link href="/work" className="shrink-0 hover:text-white">
              Work
            </Link>
            {hasClerkKeys && (
              <Show when="signed-out">
                <span className="flex shrink-0 items-center gap-5 lg:hidden">
                  <Link href="/sign-in" className="hover:text-white">
                    Sign in
                  </Link>
                  <SignUpAction className="hover:text-white" />
                </span>
              </Show>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <BookingModal
              label="Free consultation"
              className="hidden rounded-full border border-greenglow/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-greenglow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow md:inline-flex"
            />
            {hasClerkKeys && (
              <Show when="signed-out">
                <span className="hidden items-center gap-3 text-sm lg:flex">
                  <Link
                    href="/sign-in"
                    className="text-slate-300 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <SignUpAction className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-white hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow" />
                </span>
              </Show>
            )}
            {hasClerkKeys && (
              <Show when="signed-in">
                <span className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="hidden text-sm text-slate-300 hover:text-white md:inline"
                  >
                    Dashboard
                  </Link>
                  <UserButton />
                </span>
              </Show>
            )}
            <Link
              href="/start"
              className="rounded-full border border-electric/40 bg-electric/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-electric/25"
            >
              Start a project
            </Link>
          </div>
        </div>
      </header>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
      <footer className="border-t border-white/10 bg-[#04060a] py-10">
        <div className="shell grid gap-8 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="font-bold uppercase tracking-[0.14em] text-white">
              Fee The Developer
            </p>
            <p>Build. Automate. Create. Scale.</p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap content-start gap-x-5 gap-y-3"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/start" className="hover:text-white">
              Start a project
            </Link>
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <Link href="/work" className="hover:text-white">
              Showroom
            </Link>
            <Link href="/credentials" className="hover:text-white">
              Credentials
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            {hasClerkKeys && (
              <Link href="/dashboard" className="hover:text-white">
                Client portal
              </Link>
            )}
            <Link href="/devil-to-developer" className="hover:text-white">
              Initiative
            </Link>
            <Link href="/apprenticeship" className="hover:text-white">
              Learning path
            </Link>
          </nav>
          <div className="space-y-2 lg:text-right">
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
            <p>© {new Date().getFullYear()} Fee The Developer</p>
          </div>
        </div>
      </footer>
    </>
  );
}
