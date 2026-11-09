'use client';

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCallback, useState } from 'react';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/**
 * Stripe's embedded checkout on our own page. If it cannot load, the visitor
 * gets the Stripe-hosted payment link for the same item instead.
 */
export function EmbeddedStripeCheckout({
  slug,
  plan,
  fallbackUrl,
}: {
  slug: string;
  plan: 'full' | 'deposit';
  fallbackUrl: string;
}) {
  const [failed, setFailed] = useState(!stripePromise);

  const fetchClientSecret = useCallback(async () => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, plan }),
    });
    const data = (await response.json()) as { clientSecret?: string };
    if (!response.ok || !data.clientSecret) {
      setFailed(true);
      throw new Error('checkout_unavailable');
    }
    return data.clientSecret;
  }, [slug, plan]);

  if (failed || !stripePromise) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-lg font-semibold text-white">
          Checkout opens on Stripe.
        </p>
        <a
          href={fallbackUrl}
          className="mt-5 inline-flex min-h-12 items-center rounded-full bg-silver px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-background"
        >
          Continue to secure checkout
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
