import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { siteConfig } from '@/lib/site-config';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const withClerk = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        const { isAuthenticated } = await auth();
        if (!isAuthenticated) {
          const signInUrl = new URL('/sign-in', request.url);
          signInUrl.searchParams.set(
            'redirect_url',
            `${request.nextUrl.pathname}${request.nextUrl.search}`,
          );
          return NextResponse.redirect(signInUrl);
        }
      }
    })
  : null;

/**
 * One canonical host. Page loads on www (or any other alias) 301 to the
 * NEXT_PUBLIC_SITE_URL host so search engines see one URL per page. API
 * calls and non-GET requests (Stripe and Clerk webhooks) pass through
 * untouched, because a redirect would drop their body.
 */
function redirectToCanonicalHost(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/__clerk')) {
    return null;
  }
  const canonical = new URL(siteConfig.siteUrl);
  const host = request.headers.get('host')?.toLowerCase();
  if (host !== `www.${canonical.host}`) return null;
  const target = new URL(
    `${pathname}${request.nextUrl.search}`,
    canonical.origin,
  );
  return NextResponse.redirect(target, 301);
}

export default function middleware(
  ...args: Parameters<NonNullable<typeof withClerk>>
) {
  const redirect = redirectToCanonicalHost(args[0]);
  if (redirect) return redirect;
  if (withClerk) return withClerk(...args);
  // Without Clerk the dashboard cannot authenticate anyone: fail closed.
  if (isProtectedRoute(args[0])) {
    return new NextResponse('Not found', { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
