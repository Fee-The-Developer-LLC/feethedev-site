#!/usr/bin/env node
/**
 * Creates one Stripe Payment Link per service on /pricing and writes the
 * slug -> URL map the site reads to `lib/service-checkout-links.json`.
 *
 * Every link uses the product's live default price. The amount in SERVICES is
 * checked against Stripe first, so the site and checkout cannot drift apart
 * without this script failing.
 *
 * Dry run (no writes, the default):
 *   node scripts/create-service-payment-links.mjs
 * Create anything missing:
 *   node scripts/create-service-payment-links.mjs --apply
 *
 * Re-running is safe: a product or link already tagged with the same
 * `catalog_slug` in its metadata is reused instead of duplicated.
 */
import fs from 'node:fs';
import path from 'node:path';
import Stripe from 'stripe';

const NEW_PRODUCT = {
  slug: 'payments-and-back-end-integration',
  name: 'Payments & Back-End Integration',
  description:
    'Connects your website to payments on your own Stripe account and the systems behind your business. Free with any website package. Stripe processing fees are separate.',
  amountCents: 25000,
};

/** slug, Stripe product id (null = NEW_PRODUCT), expected cents, interval. */
const SERVICES = [
  ['website-launch', 'prod_VGjrHAx19yKTIq', 550000],
  ['digital-presence-bundle', 'prod_VGjsalRgji5dqT', 675000],
  ['custom-software-and-automation', 'prod_VGjsbJhpltwP0b', 350000],
  ['full-business-system', 'prod_VGjscI7z3TYfbd', 1000000],
  [NEW_PRODUCT.slug, null, NEW_PRODUCT.amountCents],
  ['yelp-profile-setup-or-cleanup', 'prod_VGpA287OuKvPyg', 35000],
  ['apple-business-connect-setup', 'prod_VGpAn2gN3pl4MQ', 35000],
  ['ga4-property-review-audit', 'prod_VMYXm4LvowqB1p', 45000],
  ['google-business-profile-setup', 'prod_VGpA8TZKqVziri', 52500],
  ['google-workspace-and-business-email', 'prod_VGpAbPNExLsS6I', 52500],
  ['contact-category-location-alignment', 'prod_VMYXcHn2DMLJsm', 70000],
  ['ga4-setup-and-validation', 'prod_VMYXPozyZdIVbz', 92500],
  ['lead-capture-and-crm-automation', 'prod_VGpBZp5ZZQdBwj', 140000],
  ['api-integration-setup', 'prod_VGpA3DkShRrfkY', 210000],
  ['ai-assistant-or-chatbot-setup', 'prod_VGpA2i1uTo0uLV', 210000],
  ['clerk-supabase-completion', 'prod_VMYXMBCNHUGGIj', 350000],
  ['business-analytics-dashboard', 'prod_VGpAgg29b3P8TO', 350000],
  ['custom-public-data-collection-tool', 'prod_VGpAq8aUWsXNcU', 350000],
  ['strategic-website-redesign', 'prod_VMYXmVBPwrnPnz', 475000],
  ['business-website-design-and-development', 'prod_VMYXNYpDbudov1', 550000],
  ['e-commerce-or-custom-website-features', 'prod_VMYXliEposgfiK', 1000000],
  ['website-maintenance-and-support', 'prod_VMYX538VQVhgTu', 17500, 'month'],
  ['cloud-management', 'prod_VMYXpv4C65evaC', 35000, 'month'],
  ['public-data-monitoring-and-alerts', 'prod_VGpAHXYYJ8Wz4j', 35000, 'month'],
  ['developer-change-block', 'prod_VMYXxVFmEBJeGG', 52500, 'month'],
  ['fee-developer-protection', 'prod_VMYXp4kwWjCU4c', 85000, 'month'],
  // Own Your .com Starter, created 2026-11-08 (promotion codes off on its link).
  ['own-your-dotcom-starter', 'prod_VaqAhRsodpGstv', 20000],
];

const OUTPUT = path.join('lib', 'service-checkout-links.json');
const CONFIRMATION =
  'Payment received. Fee The Developer will follow up by email to confirm your scope and next steps.';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
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

readEnvLocal();
const apply = process.argv.includes('--apply');
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) fail('STRIPE_SECRET_KEY is not set (.env.local or the shell).');
const stripe = new Stripe(secretKey);

async function findOrCreateNewProduct() {
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    if (product.metadata?.catalog_slug === NEW_PRODUCT.slug) return product.id;
  }
  if (!apply) return null;

  const product = await stripe.products.create({
    name: NEW_PRODUCT.name,
    description: NEW_PRODUCT.description,
    metadata: {
      brand: 'Fee The Developer LLC',
      catalog_category: 'service',
      catalog_slug: NEW_PRODUCT.slug,
    },
    default_price_data: {
      currency: 'usd',
      unit_amount: NEW_PRODUCT.amountCents,
    },
  });
  console.log(`created product ${product.id}`);
  return product.id;
}

const existingLinks = new Map();
for await (const link of stripe.paymentLinks.list({
  active: true,
  limit: 100,
})) {
  if (link.metadata?.catalog_category === 'service') {
    existingLinks.set(link.metadata.catalog_slug, link);
  }
}

const newProductId = await findOrCreateNewProduct();
const output = {};

for (const [slug, listedProductId, cents, interval] of SERVICES) {
  const productId = listedProductId ?? newProductId;
  if (!productId) {
    console.log(`would create product and link: ${slug}`);
    continue;
  }

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });
  const price = product.default_price;
  if (!product.active) fail(`${slug}: ${productId} is archived.`);
  if (price?.unit_amount !== cents || price?.recurring?.interval !== interval) {
    fail(`${slug}: Stripe default price does not match the amount listed.`);
  }

  const existing = existingLinks.get(slug);
  if (existing) {
    output[slug] = existing.url;
    console.log(`reused  ${slug}`);
    continue;
  }
  if (!apply) {
    console.log(`would create link: ${slug} (${product.name}, ${cents / 100})`);
    continue;
  }

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    phone_number_collection: { enabled: true },
    after_completion: {
      type: 'hosted_confirmation',
      hosted_confirmation: { custom_message: CONFIRMATION },
    },
    metadata: { catalog_category: 'service', catalog_slug: slug },
  });
  output[slug] = link.url;
  console.log(`created ${slug}`);
}

if (apply) {
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`wrote ${Object.keys(output).length} links to ${OUTPUT}`);
} else {
  console.log('Dry run. Re-run with --apply to create the items above.');
}
