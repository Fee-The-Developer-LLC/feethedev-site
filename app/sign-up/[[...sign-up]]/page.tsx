import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';

export const metadata: Metadata = {
  title: 'Sign up',
  robots: { index: false, follow: false },
};

export default function Page() {
  if (
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    !process.env.CLERK_SECRET_KEY
  )
    notFound();
  return (
    <AuthShell
      title="Create your free account."
      description="Get offers first, track your projects, and check out faster."
    >
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </AuthShell>
  );
}
