#!/usr/bin/env node
/**
 * Syncs Stripe to `lib/pricing-catalog.json` and writes the slug -> checkout
 * URL map the site reads (`lib/service-checkout-links.json`).
 *
 * Three phases, so the switch is all-at-once and nothing breaks in between:
 *
 *   1. Plan (default, read-only):
 *        npm run pricing:sync
 *   2. Apply: create/update products and prices, create a Payment Link for
 *      every new or changed price, write the links file. Old links stay
 *      active, so the site that is live right now keeps working.
 *        npm run pricing:sync -- --apply
 *      Then commit the catalog + links file and deploy the site.
 *   3. Retire, AFTER the new site is live: deactivate the superseded links
 *      and prices and archive retired products. A link still listed in the
 *      links file is never touched.
 *        npm run pricing:sync -- --retire
 *
 * Live keys (sk_live_ / rk_live_) also need --live. Test keys never do.
 *
 * Prices are matched by lookup key `ftd_service_<slug>`. When an amount
 * changes, the new price takes over the lookup key atomically
 * (`transfer_lookup_key`) and becomes the product's default price. Stripe
 * prices are never edited or deleted; old ones are archived in phase 3.
 * Re-running any phase is safe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const CATALOG_PATH = path.join('lib', 'pricing-catalog.json');
export const LINKS_PATH = path.join('lib', 'service-checkout-links.json');
const LINES = ['starter', 'websites', 'systems', 'presence', 'care'];
const INTERVALS = ['one_time', 'month', 'year'];
const PRICE_MODES = ['flat', 'starting_at'];
const CONFIRMATION =
  'Payment received. Fee The Developer will follow up by email to confirm your scope and next steps.';

export const lookupKeyFor = (slug) =>
  `ftd_service_${slug.replaceAll('-', '_')}`;

/** Returns a list of problems; an empty list means the catalog is usable. */
export function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || !Array.isArray(catalog.items))
    return ['catalog.items is missing'];
  if (catalog.currency !== 'usd') errors.push('currency must be usd');
  if (!catalog.version) errors.push('version is required');
  const slugs = new Set();
  const orders = new Set();
  for (const item of catalog.items) {
    const at = item.slug ?? '(no slug)';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug ?? ''))
      errors.push(`${at}: slug must be kebab-case`);
    if (slugs.has(item.slug)) errors.push(`${at}: duplicate slug`);
    slugs.add(item.slug);
    if (orders.has(item.sortOrder))
      errors.push(`${at}: duplicate sortOrder ${item.sortOrder}`);
    orders.add(item.sortOrder);
    if (!Number.isInteger(item.amountCents) || item.amountCents <= 0)
      errors.push(`${at}: amountCents must be a positive integer`);
    if (!INTERVALS.includes(item.interval))
      errors.push(`${at}: interval must be ${INTERVALS.join('|')}`);
    if (!PRICE_MODES.includes(item.priceMode))
      errors.push(`${at}: priceMode must be ${PRICE_MODES.join('|')}`);
    if (!LINES.includes(item.line))
      errors.push(`${at}: line must be ${LINES.join('|')}`);
    if (!['active', 'retired'].includes(item.status))
      errors.push(`${at}: status must be active|retired`);
    if (
      item.stripeProductId !== null &&
      !/^prod_[A-Za-z0-9]+$/.test(item.stripeProductId ?? '')
    )
      errors.push(`${at}: stripeProductId must be prod_… or null`);
    if (!item.name || !item.description || !item.scopeNote)
      errors.push(`${at}: name, description and scopeNote are required`);
    if (!Array.isArray(item.includes))
      errors.push(`${at}: includes must be an array`);
    for (const flag of ['featured', 'promoEligible', 'paymentsIncluded']) {
      if (typeof item[flag] !== 'boolean')
        errors.push(`${at}: ${flag} must be true or false`);
    }
  }
  return errors;
}

const intervalOf = (price) => price?.recurring?.interval ?? 'one_time';
const priceMatches = (price, item) =>
  Boolean(price) &&
  price.active !== false &&
  price.currency === 'usd' &&
  price.unit_amount === item.amountCents &&
  intervalOf(price) === item.interval;
const money = (item) =>
  `$${(item.amountCents / 100).toLocaleString('en-US')}${item.interval === 'one_time' ? '' : `/${item.interval}`}`;

async function collect(listing) {
  const out = [];
  for await (const row of listing) out.push(row);
  return out;
}

/** Reads everything the sync needs from Stripe in one pass. */
async function readStripe(stripe, catalog) {
  const products = await collect(stripe.products.list({ limit: 100 }));
  const byId = new Map(products.map((p) => [p.id, p]));
  const bySlug = new Map();
  for (const p of products) {
    const slug = p.metadata?.catalog_slug;
    if (slug && (!bySlug.has(slug) || p.active)) bySlug.set(slug, p);
  }

  const keys = catalog.items.map((i) => lookupKeyFor(i.slug));
  const byLookup = new Map();
  for (let i = 0; i < keys.length; i += 10) {
    const page = await collect(
      stripe.prices.list({ lookup_keys: keys.slice(i, i + 10), limit: 100 }),
    );
    for (const price of page) byLookup.set(price.lookup_key, price);
  }

  const links = await collect(
    stripe.paymentLinks.list({ active: true, limit: 100 }),
  );
  const linksBySlug = new Map();
  for (const link of links) {
    if (link.metadata?.catalog_category !== 'service') continue;
    const items = await stripe.paymentLinks.listLineItems(link.id, {
      limit: 1,
    });
    const priceId = items.data?.[0]?.price?.id ?? null;
    const slug = link.metadata.catalog_slug;
    if (!linksBySlug.has(slug)) linksBySlug.set(slug, []);
    linksBySlug.get(slug).push({ link, priceId });
  }
  return { byId, bySlug, byLookup, linksBySlug };
}

function productFields(item, version) {
  return {
    name: item.name,
    description: item.description,
    metadata: {
      brand: 'Fee The Developer LLC',
      catalog_category: 'service',
      catalog_slug: item.slug,
      catalog_line: item.line,
      pricing_version: version,
    },
  };
}

function productDiffers(product, fields) {
  if (
    product.name !== fields.name ||
    (product.description ?? '') !== fields.description
  )
    return true;
  return Object.entries(fields.metadata).some(
    ([k, v]) => product.metadata?.[k] !== v,
  );
}

/**
 * mode: 'plan' | 'apply' | 'retire'.
 * deployedLinks: the links file as committed (retire never touches these).
 */
export async function syncPricing({
  stripe,
  catalog,
  mode = 'plan',
  deployedLinks = {},
  log = console.log,
}) {
  const problems = validateCatalog(catalog);
  if (problems.length)
    throw new Error(`Catalog is invalid:\n- ${problems.join('\n- ')}`);
  const apply = mode === 'apply';
  const version = catalog.version;
  const state = await readStripe(stripe, catalog);
  const actions = [];
  const warnings = [];
  const links = {};
  const currentPriceBySlug = new Map();
  const act = (slug, what) => actions.push({ slug, what });
  // Retire only reads the current state for steps 1-3; it never creates.
  const step = mode === 'retire' ? () => {} : act;

  const active = catalog.items
    .filter((i) => i.status === 'active')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Check every listed product before the first write, so a bad id or an
  // archived product stops the run with Stripe untouched.
  for (const item of active) {
    const product = item.stripeProductId
      ? state.byId.get(item.stripeProductId)
      : state.bySlug.get(item.slug);
    if (item.stripeProductId && !product) {
      throw new Error(
        `${item.slug}: Stripe product ${item.stripeProductId} not found in this account.`,
      );
    }
    if (product && product.active === false) {
      throw new Error(
        `${item.slug}: Stripe product ${product.id} is archived. Unarchive it or set stripeProductId to null.`,
      );
    }
  }

  for (const item of active) {
    const key = lookupKeyFor(item.slug);
    const fields = productFields(item, version);
    let product = item.stripeProductId
      ? state.byId.get(item.stripeProductId)
      : state.bySlug.get(item.slug);
    if (item.stripeProductId && !product) {
      throw new Error(
        `${item.slug}: Stripe product ${item.stripeProductId} not found in this account.`,
      );
    }
    if (product && product.active === false) {
      throw new Error(
        `${item.slug}: Stripe product ${product.id} is archived. Unarchive it or set stripeProductId to null.`,
      );
    }

    // 1. Product
    if (!product) {
      step(item.slug, `create product "${item.name}"`);
      if (apply) {
        product = await stripe.products.create(fields, {
          idempotencyKey: `${version}:${item.slug}:product`,
        });
      }
    } else if (mode !== 'retire' && productDiffers(product, fields)) {
      step(item.slug, 'update product name/description/metadata');
      if (apply) product = await stripe.products.update(product.id, fields);
    }

    // 2. Price: lookup-key price, else the product default, else a new one.
    let price = null;
    const keyed = state.byLookup.get(key);
    if (
      product &&
      keyed &&
      keyed.product === product.id &&
      priceMatches(keyed, item)
    ) {
      price = keyed;
    } else if (product) {
      const full = await stripe.products.retrieve(product.id, {
        expand: ['default_price'],
      });
      const def =
        full.default_price && typeof full.default_price === 'object'
          ? full.default_price
          : null;
      if (priceMatches(def, item)) price = def;
      else if (def)
        step(item.slug, `reprice ${def.unit_amount / 100} -> ${money(item)}`);
    }

    if (!price) {
      step(item.slug, `create price ${money(item)} (lookup key ${key})`);
      if (apply) {
        price = await stripe.prices.create(
          {
            product: product.id,
            currency: 'usd',
            unit_amount: item.amountCents,
            ...(item.interval === 'one_time'
              ? {}
              : { recurring: { interval: item.interval } }),
            lookup_key: key,
            transfer_lookup_key: true,
            metadata: { catalog_slug: item.slug, pricing_version: version },
          },
          {
            idempotencyKey: `${version}:${item.slug}:price:${item.amountCents}:${item.interval}`,
          },
        );
      }
    } else if (price.lookup_key !== key) {
      step(item.slug, `set lookup key ${key} on ${price.id}`);
      if (apply)
        price = await stripe.prices.update(price.id, {
          lookup_key: key,
          transfer_lookup_key: true,
        });
    }

    if (product && price) {
      const full = await stripe.products.retrieve(product.id);
      const defId =
        typeof full.default_price === 'object'
          ? full.default_price?.id
          : full.default_price;
      if (defId !== price.id) {
        step(item.slug, `make ${price.id} the default price`);
        if (apply)
          await stripe.products.update(product.id, { default_price: price.id });
      }
    }
    if (price) currentPriceBySlug.set(item.slug, price.id);

    // 3. Payment Link pointing at the current price.
    const existing = (state.linksBySlug.get(item.slug) ?? []).find(
      (l) => price && l.priceId === price.id,
    );
    if (existing) {
      links[item.slug] = existing.link.url;
      if (
        mode !== 'retire' &&
        Boolean(existing.link.allow_promotion_codes) !== item.promoEligible
      ) {
        step(
          item.slug,
          `set promotion codes ${item.promoEligible ? 'on' : 'off'}`,
        );
        if (apply) {
          await stripe.paymentLinks.update(existing.link.id, {
            allow_promotion_codes: item.promoEligible,
          });
        }
      }
    } else if (mode !== 'retire') {
      step(item.slug, 'create payment link');
      if (apply) {
        const link = await stripe.paymentLinks.create(
          {
            line_items: [{ price: price.id, quantity: 1 }],
            allow_promotion_codes: item.promoEligible,
            phone_number_collection: { enabled: true },
            after_completion: {
              type: 'hosted_confirmation',
              hosted_confirmation: { custom_message: CONFIRMATION },
            },
            metadata: {
              catalog_category: 'service',
              catalog_slug: item.slug,
              pricing_version: version,
            },
          },
          { idempotencyKey: `${version}:${item.slug}:link:${price.id}` },
        );
        links[item.slug] = link.url;
      }
    }
  }

  // 4. Retire superseded links/prices and retired products.
  if (mode === 'retire') {
    const deployed = new Set(Object.values(deployedLinks));
    const retiredSlugs = new Set(
      catalog.items.filter((i) => i.status === 'retired').map((i) => i.slug),
    );
    for (const [slug, entries] of state.linksBySlug) {
      const current = currentPriceBySlug.get(slug);
      const isRetired = retiredSlugs.has(slug);
      if (!current && !isRetired) continue; // not in catalog: leave it alone
      const hasCurrentLink = entries.some((e) => e.priceId === current);
      for (const { link, priceId } of entries) {
        if (!isRetired && priceId === current) continue;
        if (!isRetired && !hasCurrentLink) {
          warnings.push(
            `${slug}: no link for the current price yet; run --apply first. Old link kept.`,
          );
          continue;
        }
        if (deployed.has(link.url)) {
          warnings.push(
            `${slug}: ${link.url} is still in the links file. Deploy the new links first. Kept.`,
          );
          continue;
        }
        act(slug, `deactivate link ${link.url}`);
        await stripe.paymentLinks.update(link.id, { active: false });
        if (priceId && priceId !== current) {
          act(slug, `archive price ${priceId}`);
          await stripe.prices.update(priceId, { active: false });
        }
      }
    }
    for (const item of catalog.items.filter((i) => i.status === 'retired')) {
      const product = item.stripeProductId
        ? state.byId.get(item.stripeProductId)
        : state.bySlug.get(item.slug);
      if (product?.active) {
        act(item.slug, `archive product ${product.id}`);
        await stripe.products.update(product.id, { active: false });
      }
    }
  }

  for (const a of actions)
    log(`${mode === 'plan' ? 'would ' : ''}${a.slug}: ${a.what}`);
  for (const w of warnings) log(`warning ${w}`);
  return { actions, warnings, links };
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
  const args = new Set(process.argv.slice(2));
  const mode = args.has('--retire')
    ? 'retire'
    : args.has('--apply')
      ? 'apply'
      : 'plan';
  readEnvLocal();
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key)
    throw new Error('STRIPE_SECRET_KEY is not set (.env.local or the shell).');
  const live = /^(sk|rk)_live_/.test(key);
  if (live && mode !== 'plan' && !args.has('--live')) {
    throw new Error(
      'This is a live Stripe key. Add --live to change live prices.',
    );
  }
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(key);
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const deployedLinks = fs.existsSync(LINKS_PATH)
    ? JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'))
    : {};

  console.log(
    `Pricing ${catalog.version} · ${live ? 'LIVE' : 'test'} mode · ${mode}`,
  );
  const { actions, links } = await syncPricing({
    stripe,
    catalog,
    mode,
    deployedLinks,
  });

  if (mode === 'apply') {
    fs.writeFileSync(LINKS_PATH, `${JSON.stringify(links, null, 2)}\n`);
    console.log(`wrote ${Object.keys(links).length} links to ${LINKS_PATH}`);
  } else if (mode === 'plan') {
    console.log(
      actions.length
        ? 'Plan only. Re-run with --apply.'
        : 'Stripe already matches the catalog.',
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
}
