import { ClerkProvider, Show, UserButton } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { HideOnOfferPages } from '@/components/HideOnOfferPages';
import { clerkAppearance } from '@/lib/clerk-appearance';
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
          <ClerkProvider appearance={clerkAppearance}>
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
      <HideOnOfferPages>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-xl">
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
              className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex"
            >
              <Link href="/services" className="hover:text-white">
                Services
              </Link>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
              <Link href="/work" className="hover:text-white">
                Work
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {hasClerkKeys ? (
                <>
                  <Show when="signed-out">
                    <Link
                      href="/sign-in"
                      className="hidden text-sm font-semibold text-slate-300 hover:text-white sm:inline"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-silver px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-background shadow-electric transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-[#0FAF86]"
                      />
                      Sign up free
                    </Link>
                  </Show>
                  <Show when="signed-in">
                    <Link
                      href="/dashboard"
                      className="text-sm font-semibold text-slate-300 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <UserButton />
                  </Show>
                </>
              ) : (
                <Link
                  href="/services"
                  className="inline-flex min-h-10 items-center rounded-full bg-silver px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-background"
                >
                  See services
                </Link>
              )}
            </div>
          </div>
          <nav
            aria-label="Main navigation, mobile"
            className="shell flex gap-6 pb-3 text-sm font-semibold text-slate-300 md:hidden"
          >
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/work" className="hover:text-white">
              Work
            </Link>
          </nav>
        </header>
      </HideOnOfferPages>
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
              Work
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/stack" className="hover:text-white">
              How we build
            </Link>
            {hasClerkKeys && (
              <Link href="/dashboard" className="hover:text-white">
                Client portal
              </Link>
            )}
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
