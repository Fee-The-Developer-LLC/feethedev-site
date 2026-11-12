import 'server-only';

/**
 * Supabase REST writes for orders, using the server-only secret key (same
 * model as /api/intake). Tables deny anon/authenticated access entirely.
 */

export class StoreError extends Error {}

function config() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  )?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new StoreError('store_unconfigured');
  return { url, key };
}

async function rest<T>(
  path: string,
  init: { method: 'POST' | 'PATCH'; body: unknown; prefer: string },
): Promise<T[]> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: init.method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: init.prefer,
    },
    body: JSON.stringify(init.body),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new StoreError(`store_${response.status}:${path.split('?')[0]}`);
  }
  if (init.prefer.includes('return=minimal')) return [];
  return (await response.json()) as T[];
}

export type OrderRow = {
  order_number: string;
  checkout_session_id: string;
  catalog_slug: string;
  plan: 'full' | 'deposit';
  mode: 'payment' | 'subscription';
  amount_cents: number;
  currency: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  clerk_user_id: string | null;
  source: string;
  livemode: boolean;
  paid_at: string;
};

/** Inserts or refreshes the order for a Checkout Session; returns its id. */
export async function upsertOrder(row: OrderRow): Promise<string> {
  const rows = await rest<{ id: string }>(
    'orders?on_conflict=checkout_session_id&select=id',
    {
      method: 'POST',
      body: { ...row, updated_at: new Date().toISOString() },
      prefer: 'resolution=merge-duplicates,return=representation',
    },
  );
  if (!rows[0]?.id) throw new StoreError('store_no_order_id');
  return rows[0].id;
}

/**
 * Claims a message slot. Returns the message id when this call created it, or
 * null when the message was already claimed (a webhook retry): never send twice.
 */
export async function claimMessage(input: {
  orderId: string;
  channel: 'email' | 'sms';
  template: string;
  recipient: string | null;
}): Promise<string | null> {
  const rows = await rest<{ id: string }>(
    'order_messages?on_conflict=order_id,channel,template&select=id',
    {
      method: 'POST',
      body: {
        order_id: input.orderId,
        channel: input.channel,
        template: input.template,
        recipient: input.recipient,
        status: 'held',
      },
      prefer: 'resolution=ignore-duplicates,return=representation',
    },
  );
  return rows[0]?.id ?? null;
}

export async function recordMessageResult(
  id: string,
  result: {
    status: string;
    provider: string | null;
    providerMessageId?: string;
    error?: string;
  },
): Promise<void> {
  await rest(`order_messages?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: {
      status: result.status,
      provider: result.provider,
      provider_message_id: result.providerMessageId ?? null,
      error: result.error ?? null,
    },
    prefer: 'return=minimal',
  });
}

export async function markRefund(
  paymentIntentId: string,
  full: boolean,
): Promise<void> {
  await rest(
    `orders?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}`,
    {
      method: 'PATCH',
      body: {
        status: full ? 'refunded' : 'partially_refunded',
        updated_at: new Date().toISOString(),
      },
      prefer: 'return=minimal',
    },
  );
}

export async function recordEvent(event: {
  id: string;
  type: string;
  livemode: boolean;
  orderId: string | null;
}): Promise<void> {
  await rest('order_events?on_conflict=stripe_event_id', {
    method: 'POST',
    body: {
      stripe_event_id: event.id,
      type: event.type,
      livemode: event.livemode,
      order_id: event.orderId,
    },
    prefer: 'resolution=ignore-duplicates,return=minimal',
  });
}
