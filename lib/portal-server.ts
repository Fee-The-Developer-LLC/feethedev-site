import 'server-only';

import { auth, currentUser } from '@clerk/nextjs/server';

export const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export type PortalClient = {
  userId: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
};

function adminEmails(): Set<string> {
  return new Set(
    (process.env.PORTAL_ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** The signed-in Clerk user, or null. Admin = verified primary email in PORTAL_ADMIN_EMAILS. */
export async function getPortalClient(): Promise<PortalClient | null> {
  if (!hasClerkKeys) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const primary = user?.primaryEmailAddress ?? null;
  const email = primary?.emailAddress?.toLowerCase() ?? null;
  const verified = primary?.verification?.status === 'verified';
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.username ||
    null;

  return {
    userId,
    email,
    name,
    isAdmin: Boolean(email && verified && adminEmails().has(email)),
  };
}
