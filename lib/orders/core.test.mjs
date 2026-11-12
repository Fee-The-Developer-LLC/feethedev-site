// Run: npm run orders:test
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import {
  escapeHtml,
  formatUsd,
  orderNumberFor,
  verifyStripeSignature,
} from './core.ts';

const secret = 'whsec_test_secret';
const payload = JSON.stringify({
  id: 'evt_1',
  type: 'checkout.session.completed',
});
const now = 1_763_000_000;
const sign = (t, body = payload, key = secret) =>
  createHmac('sha256', key).update(`${t}.${body}`).digest('hex');

test('accepts a valid v1 signature', async () => {
  const header = `t=${now},v1=${sign(now)}`;
  const result = await verifyStripeSignature(payload, header, secret, {
    nowSeconds: now,
  });
  assert.deepEqual(result, { ok: true, timestamp: now });
});

test('accepts when one of several v1 signatures matches (secret rotation)', async () => {
  const header = `t=${now},v1=${'0'.repeat(64)},v1=${sign(now)}`;
  const result = await verifyStripeSignature(payload, header, secret, {
    nowSeconds: now,
  });
  assert.equal(result.ok, true);
});

test('rejects a tampered payload', async () => {
  const header = `t=${now},v1=${sign(now)}`;
  const result = await verifyStripeSignature(payload + ' ', header, secret, {
    nowSeconds: now,
  });
  assert.deepEqual(result, { ok: false, reason: 'mismatch' });
});

test('rejects the wrong secret', async () => {
  const header = `t=${now},v1=${sign(now, payload, 'whsec_other')}`;
  const result = await verifyStripeSignature(payload, header, secret, {
    nowSeconds: now,
  });
  assert.deepEqual(result, { ok: false, reason: 'mismatch' });
});

test('rejects a replay outside the 5-minute tolerance', async () => {
  const old = now - 301;
  const header = `t=${old},v1=${sign(old)}`;
  const result = await verifyStripeSignature(payload, header, secret, {
    nowSeconds: now,
  });
  assert.deepEqual(result, { ok: false, reason: 'stale' });
});

test('rejects missing and malformed headers', async () => {
  assert.deepEqual(await verifyStripeSignature(payload, null, secret), {
    ok: false,
    reason: 'missing_header',
  });
  assert.deepEqual(await verifyStripeSignature(payload, 'v1=abc', secret), {
    ok: false,
    reason: 'malformed_header',
  });
  assert.deepEqual(await verifyStripeSignature(payload, `t=${now}`, secret), {
    ok: false,
    reason: 'malformed_header',
  });
});

test('order numbers are stable, formatted and distinct per session', async () => {
  const a = await orderNumberFor('cs_test_a1B2c3D4e5F6g7H8');
  const again = await orderNumberFor('cs_test_a1B2c3D4e5F6g7H8');
  const b = await orderNumberFor('cs_test_z9Y8x7W6v5U4t3S2');
  assert.match(a, /^FTD-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.equal(a, again);
  assert.notEqual(a, b);
});

test('formats USD and escapes HTML', () => {
  assert.equal(formatUsd(19900), '$199.00');
  assert.equal(
    escapeHtml(`<a href="x">'&'</a>`),
    '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
  );
});
