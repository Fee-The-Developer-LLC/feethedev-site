import 'server-only';

import { depositFor, getCatalogItem, type CatalogItem } from '@/lib/catalog';
import { siteConfig } from '@/lib/site-config';

/**
 * On-site Stripe checkout (embedded) for catalog items. Prices are looked up
 * by the lookup keys `npm run pricing:sync` maintains, so the amount charged
 * always comes from Stripe, never from the browser.
 */

const API = 'https://api.stripe.com/v1';
const STRIPE_API_VERSION = '2026-03-25.dahlia';

type Params = Record<string, string | number | boolean | undefined>;

async function stripe<T>(
  method: 'GET' | 'POST',
  path: string,
  params: Params = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('stripe_unconfigured');
  const body = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) body.append(name, String(value));
  }
  const query = method === 'GET' && body.size ? `?${body}` : '';
  const response = await fetch(`${API}${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      // Embedded checkout (`ui_mode: embedded_page`) needs this API version.
      'Stripe-Version': STRIPE_API_VERSION,
      ...(method === 'POST'
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : {}),
    },
    body: method === 'POST' ? body : undefined,
    cache: 'no-store',
  });
  const json = (await response.json()) as T & { error?: { message: string } };
  if (!response.ok) {
    throw new Error(`stripe_${response.status}: ${json.error?.message ?? ''}`);
  }
  return json;
}

export const lookupKeyFor = (key: string) =>
  `ftd_service_${key.replaceAll('-', '_')}`;

export type CheckoutPlan = 'full' | 'deposit';

export function checkoutItem(
  slug: string,
  plan: CheckoutPlan,
): { item: CatalogItem; plan: CheckoutPlan } | null {
  const item = getCatalogItem(slug);
  if (!item || item.publicCheckout === false) return null;
  if (plan === 'deposit' && !depositFor(item)) return null;
  return { item, plan };
}

/** Creates an embedded Checkout Session and returns its client secret. */
export async function createEmbeddedSession({
  item,
  plan,
  email,
  userId,
}: {
  item: CatalogItem;
  plan: CheckoutPlan;
  email?: string | null;
  userId?: string | null;
}): Promise<string> {
  const sellKey = plan === 'deposit' ? `${item.slug}--deposit` : item.slug;
  const prices = await stripe<{ data: { id: string; active: boolean }[] }>(
    'GET',
    '/prices',
    { 'lookup_keys[]': lookupKeyFor(sellKey), active: true, limit: 1 },
  );
  const price = prices.data[0];
  if (!price) throw new Error(`no_price:${sellKey}`);

  const recurring = plan === 'full' && item.interval !== 'one_time';
  const returnUrl = `${siteConfig.siteUrl}/services/${item.slug}/welcome?session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe<{ client_secret: string }>(
    'POST',
    '/checkout/sessions',
    {
      ui_mode: 'embedded_page',
      mode: recurring ? 'subscription' : 'payment',
      'line_items[0][price]': price.id,
      'line_items[0][quantity]': 1,
      return_url: returnUrl,
      allow_promotion_codes: true,
      'phone_number_collection[enabled]': true,
      customer_email: email ?? undefined,
      client_reference_id: userId ?? undefined,
      ...(recurring ? {} : { customer_creation: 'always' }),
      'metadata[catalog_slug]': item.slug,
      'metadata[catalog_kind]': plan,
      'metadata[source]': 'feethedev-site:checkout',
    },
  );
  return session.client_secret;
}

export type PaidSession = {
  id: string;
  email: string | null;
  name: string | null;
  amount: string;
  plan: CheckoutPlan;
};

/** Confirms a finished, paid session for this catalog item, server-side. */
export async function getPaidSession(
  sessionId: string,
  slug: string,
): Promise<PaidSession | null> {
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return null;
  try {
    const session = await stripe<{
      id: string;
      status: string;
      payment_status: string;
      amount_total: number | null;
      metadata: Record<string, string>;
      customer_details: { email: string | null; name: string | null } | null;
    }>('GET', `/checkout/sessions/${sessionId}`);
    const paid =
      session.status === 'complete' &&
      ['paid', 'no_payment_required'].includes(session.payment_status);
    if (!paid || session.metadata?.catalog_slug !== slug) return null;
    return {
      id: session.id,
      email: session.customer_details?.email ?? null,
      name: session.customer_details?.name ?? null,
      amount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format((session.amount_total ?? 0) / 100),
      plan: session.metadata.catalog_kind === 'deposit' ? 'deposit' : 'full',
    };
  } catch (error) {
    console.error('[checkout] session lookup failed:', String(error));
    return null;
  }
}

/** Low-level Stripe REST call for other server modules (webhook lookups). */
export { stripe as stripeApi };
