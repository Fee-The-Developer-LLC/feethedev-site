import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { safeReturnPath } from '@/lib/safe-redirect';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  )
    notFound();
  // Validate the return destination here, on the server, so an external or
  // looping redirect_url can never be followed after sign-in.
  const destination = safeReturnPath((await searchParams).redirect_url);
  return (
    <AuthShell
      title="Your next build starts here."
      description="One account for your projects, requests, and checkout."
    >
      <SignIn
        forceRedirectUrl={destination}
        signUpForceRedirectUrl={destination}
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
