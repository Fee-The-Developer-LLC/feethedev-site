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
 *
 * Items with `depositPercent` also get a deposit price on the same product
 * (lookup key `ftd_service_<slug>__deposit`) and its own Payment Link, keyed
 * `<slug>--deposit` in the links file. Every link accepts promotion codes so
 * single-use veteran codes (scripts/veteran-code.mjs) work everywhere; the
 * veteran coupon itself is created here if it is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const CATALOG_PATH = path.join('lib', 'pricing-catalog.json');
export const LINKS_PATH = path.join('lib', 'service-checkout-links.json');
const LINES = ['starter', 'websites', 'systems', 'presence', 'care'];
const INTERVALS = ['one_time', 'month', 'year'];
const PRICE_MODES = ['flat', 'starting_at'];
export const DEPOSIT_SUFFIX = '--deposit';
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
    if (item.depositPercent !== undefined) {
      if (
        !Number.isInteger(item.depositPercent) ||
        item.depositPercent < 1 ||
        item.depositPercent > 90
      )
        errors.push(`${at}: depositPercent must be a whole number 1-90`);
      if (item.priceMode !== 'starting_at' || item.interval !== 'one_time')
        errors.push(`${at}: deposits apply only to one-time starting_at items`);
    }
    for (const flag of ['featured', 'yobulEligible', 'paymentsIncluded']) {
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
export const depositCents = (item) =>
  Math.round((item.amountCents * item.depositPercent) / 100 / 100) * 100;

/** The things a customer can buy: each item, plus its deposit if it has one. */
export function sellablesFor(item) {
  const full = {
    key: item.slug,
    amountCents: item.amountCents,
    interval: item.interval,
    deposit: false,
  };
  if (!item.depositPercent) return [full];
  return [
    full,
    {
      key: `${item.slug}${DEPOSIT_SUFFIX}`,
      amountCents: depositCents(item),
      interval: 'one_time',
      deposit: true,
    },
  ];
}

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

  const keys = catalog.items
    .flatMap((i) => sellablesFor(i))
    .map((s) => lookupKeyFor(s.key));
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
  let coupon = null;
  if (catalog.discounts?.veteran?.stripeCouponId) {
    try {
      coupon = await stripe.coupons.retrieve(
        catalog.discounts.veteran.stripeCouponId,
      );
    } catch (error) {
      if (error?.statusCode !== 404 && error?.code !== 'resource_missing')
        throw error;
    }
  }
  return { byId, bySlug, byLookup, linksBySlug, coupon };
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

    for (const sell of sellablesFor(item)) {
      const sellKey = lookupKeyFor(sell.key);
      const label = sell.deposit
        ? `${item.slug} deposit (${item.depositPercent}%)`
        : item.slug;

      // 2. Price: lookup-key price, else the product default (full price
      // only), else a new one.
      let price = null;
      const keyed = state.byLookup.get(sellKey);
      if (
        product &&
        keyed &&
        keyed.product === product.id &&
        priceMatches(keyed, sell)
      ) {
        price = keyed;
      } else if (product && !sell.deposit) {
        const full = await stripe.products.retrieve(product.id, {
          expand: ['default_price'],
        });
        const def =
          full.default_price && typeof full.default_price === 'object'
            ? full.default_price
            : null;
        if (priceMatches(def, sell)) price = def;
        else if (def)
          step(label, `reprice ${def.unit_amount / 100} -> ${money(sell)}`);
      }

      if (!price) {
        step(label, `create price ${money(sell)} (lookup key ${sellKey})`);
        if (apply) {
          price = await stripe.prices.create(
            {
              product: product.id,
              currency: 'usd',
              unit_amount: sell.amountCents,
              ...(sell.interval === 'one_time'
                ? {}
                : { recurring: { interval: sell.interval } }),
              lookup_key: sellKey,
              transfer_lookup_key: true,
              ...(sell.deposit
                ? { nickname: `Deposit (${item.depositPercent}%)` }
                : {}),
              metadata: {
                catalog_slug: item.slug,
                catalog_kind: sell.deposit ? 'deposit' : 'full',
                pricing_version: version,
              },
            },
            {
              idempotencyKey: `${version}:${sell.key}:price:${sell.amountCents}:${sell.interval}`,
            },
          );
        }
      } else if (price.lookup_key !== sellKey) {
        step(label, `set lookup key ${sellKey} on ${price.id}`);
        if (apply)
          price = await stripe.prices.update(price.id, {
            lookup_key: sellKey,
            transfer_lookup_key: true,
          });
      }

      if (product && price && !sell.deposit) {
        const full = await stripe.products.retrieve(product.id);
        const defId =
          typeof full.default_price === 'object'
            ? full.default_price?.id
            : full.default_price;
        if (defId !== price.id) {
          step(label, `make ${price.id} the default price`);
          if (apply)
            await stripe.products.update(product.id, {
              default_price: price.id,
            });
        }
      }
      if (price) currentPriceBySlug.set(sell.key, price.id);

      // 3. Payment Link pointing at the current price. Every link accepts
      // promotion codes so verified veteran codes work on everything.
      const existing = (state.linksBySlug.get(sell.key) ?? []).find(
        (l) => price && l.priceId === price.id,
      );
      if (existing) {
        links[sell.key] = existing.link.url;
        if (mode !== 'retire' && !existing.link.allow_promotion_codes) {
          step(label, 'turn promotion codes on');
          if (apply) {
            await stripe.paymentLinks.update(existing.link.id, {
              allow_promotion_codes: true,
            });
          }
        }
      } else if (mode !== 'retire') {
        step(label, 'create payment link');
        if (apply) {
          const link = await stripe.paymentLinks.create(
            {
              line_items: [{ price: price.id, quantity: 1 }],
              allow_promotion_codes: true,
              phone_number_collection: { enabled: true },
              after_completion: {
                type: 'hosted_confirmation',
                hosted_confirmation: {
                  custom_message: sell.deposit
                    ? `Deposit received. Fee The Developer will email your written scope and the balance schedule.`
                    : CONFIRMATION,
                },
              },
              metadata: {
                catalog_category: 'service',
                catalog_slug: sell.key,
                catalog_kind: sell.deposit ? 'deposit' : 'full',
                pricing_version: version,
              },
            },
            { idempotencyKey: `${version}:${sell.key}:link:${price.id}` },
          );
          links[sell.key] = link.url;
        }
      }
    }
  }

  // Veteran coupon: 30% off, forever (applies once to one-time payments and
  // to every invoice of a care plan). Codes are minted per verified person.
  const vet = catalog.discounts?.veteran;
  if (vet?.stripeCouponId && mode !== 'retire') {
    if (!state.coupon) {
      act(
        'veteran-discount',
        `create coupon ${vet.stripeCouponId} (${vet.percentOff}% off)`,
      );
      if (apply) {
        await stripe.coupons.create(
          {
            id: vet.stripeCouponId,
            percent_off: vet.percentOff,
            duration: 'forever',
            name: `Veteran ${vet.percentOff}% (verified)`,
            metadata: {
              brand: 'Fee The Developer LLC',
              pricing_version: version,
            },
          },
          { idempotencyKey: `${version}:coupon:${vet.stripeCouponId}` },
        );
      }
    } else if (state.coupon.percent_off !== vet.percentOff) {
      warnings.push(
        `coupon ${vet.stripeCouponId} is ${state.coupon.percent_off}% in Stripe but ${vet.percentOff}% in the catalog. Stripe coupons cannot change; give the catalog a new coupon id.`,
      );
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
      const isRetired = retiredSlugs.has(slug.split(DEPOSIT_SUFFIX)[0]);
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
          try {
            await stripe.prices.update(priceId, { active: false });
            act(slug, `archive price ${priceId}`);
          } catch (error) {
            // A product's default price cannot be archived; archiving the
            // retired product below takes it off sale instead.
            if (!/default price/i.test(String(error?.message))) throw error;
            warnings.push(
              `${slug}: ${priceId} is its product's default price. Kept; the product is archived if retired.`,
            );
          }
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
