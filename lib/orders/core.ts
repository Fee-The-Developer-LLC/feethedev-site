/**
 * Pure order helpers shared by the Stripe webhook, the order confirmation
 * page and the onboarding messages. No imports, so `node --test` can load this
 * file directly (see lib/orders/core.test.mjs).
 */

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const encoder = new TextEncoder();

function toBase32(bytes: Uint8Array, length: number): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < length) {
      out += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    if (out.length >= length) break;
  }
  return out;
}

/**
 * The buyer-facing order number. Derived from the Checkout Session id, so the
 * confirmation page, the email and the database all show the same number
 * without waiting on each other. Example: FTD-7K2M-9QXA.
 */
export async function orderNumberFor(
  checkoutSessionId: string,
): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', encoder.encode(checkoutSessionId)),
  );
  const code = toBase32(digest, 8);
  return `FTD-${code.slice(0, 4)}-${code.slice(4)}`;
}

export type SignatureCheck =
  | { ok: true; timestamp: number }
  | {
      ok: false;
      reason: 'missing_header' | 'malformed_header' | 'stale' | 'mismatch';
    };

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies a `Stripe-Signature` header (scheme v1, HMAC-SHA256 over
 * `${t}.${payload}`) with Web Crypto, so it runs on Cloudflare Workers
 * without the Node Stripe SDK.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  options: { toleranceSeconds?: number; nowSeconds?: number } = {},
): Promise<SignatureCheck> {
  if (!header) return { ok: false, reason: 'missing_header' };
  const tolerance = options.toleranceSeconds ?? 300;
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);

  let timestamp = Number.NaN;
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const [key, value] = part.split('=', 2).map((s) => s?.trim());
    if (key === 't') timestamp = Number(value);
    if (key === 'v1' && value) signatures.push(value);
  }
  if (!Number.isInteger(timestamp) || signatures.length === 0) {
    return { ok: false, reason: 'malformed_header' };
  }
  if (Math.abs(now - timestamp) > tolerance) {
    return { ok: false, reason: 'stale' };
  }

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = hex(
    await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${timestamp}.${payload}`),
    ),
  );
  return signatures.some((sig) => constantTimeEqual(sig, expected))
    ? { ok: true, timestamp }
    : { ok: false, reason: 'mismatch' };
}

/** Formats cents as US dollars, e.g. 19900 -> "$199.00". */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/** Escapes text for safe use inside HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
