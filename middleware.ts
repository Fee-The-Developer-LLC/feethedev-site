import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/portal(.*)']);
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

export default function middleware(
  ...args: Parameters<NonNullable<typeof withClerk>>
) {
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
