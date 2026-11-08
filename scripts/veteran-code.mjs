#!/usr/bin/env node
/**
 * Mints one single-use veteran code (30% off any Fee The Developer checkout)
 * AFTER King Fee has checked the client's proof: DD-214, VA ID card, or a
 * VOSB/SDVOSB certificate. Never store the proof or the client's email here;
 * pass the intake reference instead.
 *
 *   npm run veteran:code -- --ref <intake reference> [--days 30] [--live]
 *
 * Prints the code to send to the client. The code works once, on any Payment
 * Link, and expires after --days (default 30).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { CATALOG_PATH } from './sync-pricing.mjs';

// No 0/O/1/I so codes read cleanly over the phone or in a DM.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode() {
  const bytes = crypto.randomBytes(6);
  return `VET-${[...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('')}`;
}

export async function mintVeteranCode({
  stripe,
  catalog,
  ref,
  days = 30,
  now = Math.floor(Date.now() / 1000),
}) {
  const vet = catalog.discounts?.veteran;
  if (!vet?.stripeCouponId)
    throw new Error('The catalog has no veteran discount.');
  if (!ref || !/^[A-Za-z0-9_-]{3,64}$/.test(ref))
    throw new Error(
      '--ref must be the intake reference (letters, numbers, - or _).',
    );
  if (!Number.isInteger(days) || days < 1 || days > 90)
    throw new Error('--days must be 1-90.');
  try {
    await stripe.coupons.retrieve(vet.stripeCouponId);
  } catch {
    throw new Error(
      `Stripe coupon ${vet.stripeCouponId} does not exist yet. Run npm run pricing:sync -- --apply first.`,
    );
  }
  return stripe.promotionCodes.create({
    coupon: vet.stripeCouponId,
    code: randomCode(),
    max_redemptions: 1,
    expires_at: now + days * 86400,
    metadata: {
      brand: 'Fee The Developer LLC',
      discount: 'veteran',
      verification_ref: ref,
    },
  });
}

function readEnvLocal() {
  const file = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim().replace(/^"(.*)"$/, '$1');
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const value = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  readEnvLocal();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)
    throw new Error('STRIPE_SECRET_KEY is not set (.env.local or the shell).');
  if (/^(sk|rk)_live_/.test(key) && !args.includes('--live'))
    throw new Error(
      'This is a live Stripe key. Add --live to mint a real code.',
    );
  const { default: Stripe } = await import('stripe');
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const code = await mintVeteranCode({
    stripe: new Stripe(key),
    catalog,
    ref: value('--ref'),
    days: value('--days') ? Number(value('--days')) : 30,
  });
  const expires = new Date(code.expires_at * 1000).toISOString().slice(0, 10);
  console.log(
    `${code.code}  (single use, ${catalog.discounts.veteran.percentOff}% off, expires ${expires})`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
}
