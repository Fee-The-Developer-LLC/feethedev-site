import { NextResponse } from 'next/server';
import { getCatalogItem, serviceCheckoutLinks } from '@/lib/catalog';
import { orderNumberFor, verifyStripeSignature } from '@/lib/orders/core';
import { orderConfirmationEmail } from '@/lib/orders/email';
import { sendEmail } from '@/lib/orders/send';
import {
  claimMessage,
  markRefund,
  recordEvent,
  recordMessageResult,
  upsertOrder,
} from '@/lib/orders/store';
import { siteConfig } from '@/lib/site-config';
import { stripeApi } from '@/lib/stripe-checkout';

/**
 * Stripe → order of record → onboarding message.
 *
 * Fires the moment Stripe confirms payment, whether or not the buyer ever
 * reaches the confirmation page. Every step is idempotent, so Stripe retries
 * are safe. Sessions from other FTD systems on the same Stripe account (e.g.
 * the booking calendar) are acknowledged and ignored.
 *
 * Stripe destination: https://feethedeveloper.com/api/webhooks/stripe
 * Events: checkout.session.completed, checkout.session.async_payment_succeeded,
 *         charge.refunded
 */

export const dynamic = 'force-dynamic';

type Session = {
  id: string;
  object: 'checkout.session';
  mode: 'payment' | 'subscription' | 'setup';
  status: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  created: number;
  livemode: boolean;
  client_reference_id: string | null;
  customer: string | null;
  payment_intent: string | null;
  subscription: string | null;
  payment_link: string | null;
  metadata: Record<string, string> | null;
  customer_details: {
    email: string | null;
    name: string | null;
    phone: string | null;
  } | null;
};

type Charge = {
  object: 'charge';
  payment_intent: string | null;
  refunded: boolean;
};

type StripeEvent = {
  id: string;
  type: string;
  livemode: boolean;
  data: { object: Session | Charge };
};

const reply = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Payment Link URL → catalog key ("slug" or "slug--deposit"). */
const linkKeyByUrl = new Map(
  Object.entries(serviceCheckoutLinks).map(([key, url]) => [url, key]),
);

async function resolveCatalog(
  session: Session,
): Promise<{ slug: string; plan: 'full' | 'deposit'; source: string } | null> {
  const meta = session.metadata ?? {};
  if (meta.source === 'feethedev-site:checkout' && meta.catalog_slug) {
    return {
      slug: meta.catalog_slug,
      plan: meta.catalog_kind === 'deposit' ? 'deposit' : 'full',
      source: meta.source,
    };
  }
  if (session.payment_link) {
    const link = await stripeApi<{ url: string }>(
      'GET',
      `/payment_links/${encodeURIComponent(session.payment_link)}`,
    );
    const key = linkKeyByUrl.get(link.url);
    if (key) {
      const deposit = key.endsWith('--deposit');
      return {
        slug: deposit ? key.slice(0, -'--deposit'.length) : key,
        plan: deposit ? 'deposit' : 'full',
        source: 'feethedev-site:payment-link',
      };
    }
  }
  return null;
}

async function handlePaidSession(session: Session): Promise<string | null> {
  const paid =
    session.status === 'complete' &&
    ['paid', 'no_payment_required'].includes(session.payment_status);
  if (!paid) return null;

  const found = await resolveCatalog(session);
  const item = found ? getCatalogItem(found.slug) : undefined;
  if (!found || !item) return null; // Not a feethedeveloper.com catalog sale.

  const orderNumber = await orderNumberFor(session.id);
  const details = session.customer_details;
  const orderId = await upsertOrder({
    order_number: orderNumber,
    checkout_session_id: session.id,
    catalog_slug: item.slug,
    plan: found.plan,
    mode: session.mode === 'subscription' ? 'subscription' : 'payment',
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    customer_email: details?.email ?? null,
    customer_name: details?.name ?? null,
    customer_phone: details?.phone ?? null,
    stripe_customer_id: session.customer,
    stripe_payment_intent_id: session.payment_intent,
    stripe_subscription_id: session.subscription,
    clerk_user_id: session.client_reference_id,
    source: found.source,
    livemode: session.livemode,
    paid_at: new Date(session.created * 1000).toISOString(),
  });

  const email = details?.email ?? null;
  const message = orderConfirmationEmail({
    orderNumber,
    item,
    plan: found.plan,
    amountCents: session.amount_total ?? 0,
    recurring: session.mode === 'subscription',
    customerName: details?.name ?? null,
    orderUrl: `${siteConfig.siteUrl}/services/${item.slug}/welcome?session_id=${session.id}`,
  });
  const messageId = await claimMessage({
    orderId,
    channel: 'email',
    template: message.template,
    recipient: email,
  });
  if (messageId && email) {
    const result = await sendEmail({
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: siteConfig.email,
    });
    await recordMessageResult(messageId, result);
  } else if (messageId) {
    await recordMessageResult(messageId, {
      status: 'failed',
      provider: null,
      error: 'no_customer_email',
    });
  }

  // Texts wait on carrier registration; recorded so the gap is visible.
  const smsId = await claimMessage({
    orderId,
    channel: 'sms',
    template: 'order_confirmation_sms_v1',
    recipient: details?.phone ?? null,
  });
  if (smsId) {
    await recordMessageResult(smsId, {
      status: 'not_configured',
      provider: null,
    });
  }
  return orderId;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return reply({ error: 'webhook_unconfigured' }, 503);

  const payload = await request.text();
  const check = await verifyStripeSignature(
    payload,
    request.headers.get('stripe-signature'),
    secret,
  );
  if (!check.ok) return reply({ error: 'invalid_signature' }, 400);

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return reply({ error: 'invalid_json' }, 400);
  }

  try {
    let orderId: string | null = null;
    const object = event.data?.object;
    if (
      (event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded') &&
      object?.object === 'checkout.session'
    ) {
      orderId = await handlePaidSession(object);
    } else if (
      event.type === 'charge.refunded' &&
      object?.object === 'charge' &&
      object.payment_intent
    ) {
      await markRefund(object.payment_intent, object.refunded);
    }
    await recordEvent({
      id: event.id,
      type: event.type,
      livemode: event.livemode,
      orderId,
    });
    return reply({ received: true, order: Boolean(orderId) });
  } catch (error) {
    // Non-2xx makes Stripe retry; every step above is safe to repeat.
    console.error('[stripe-webhook] failed:', event.type, String(error));
    return reply({ error: 'processing_failed' }, 500);
  }
}
