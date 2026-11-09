import { NextResponse } from 'next/server';
import {
  checkoutItem,
  createEmbeddedSession,
  type CheckoutPlan,
} from '@/lib/stripe-checkout';
import { siteConfig } from '@/lib/site-config';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return (
      host === request.headers.get('host') ||
      host === new URL(siteConfig.siteUrl).host
    );
  } catch {
    return false;
  }
}

/** Signed-in visitors get their account email prefilled at checkout. */
async function signedInUser() {
  if (!hasClerkKeys) return { email: null, userId: null };
  try {
    const { currentUser } = await import('@clerk/nextjs/server');
    const user = await currentUser();
    return {
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      userId: user?.id ?? null,
    };
  } catch {
    return { email: null, userId: null };
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: 'forbidden' }, 403);

  let body: { slug?: unknown; plan?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const plan: CheckoutPlan = body.plan === 'deposit' ? 'deposit' : 'full';
  const found =
    typeof body.slug === 'string' ? checkoutItem(body.slug, plan) : null;
  if (!found) return json({ error: 'unknown_item' }, 404);

  try {
    const user = await signedInUser();
    const clientSecret = await createEmbeddedSession({ ...found, ...user });
    return json({ clientSecret }, 200);
  } catch (error) {
    console.error('[checkout] session create failed:', String(error));
    return json({ error: 'checkout_unavailable' }, 503);
  }
}
