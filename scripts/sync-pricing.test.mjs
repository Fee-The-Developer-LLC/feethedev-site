/**
 * Runs scripts/sync-pricing.mjs against an in-memory Stripe seeded like the
 * live account before pricing v2 (26 products, one active link each).
 *   npm run pricing:test
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { lookupKeyFor, syncPricing, validateCatalog } from './sync-pricing.mjs';
import { catalogToSql } from './pricing-to-sql.mjs';

const catalogFile = new URL('../lib/pricing-catalog.json', import.meta.url);
const loadCatalog = () => JSON.parse(fs.readFileSync(catalogFile, 'utf8'));

const iter = (rows) =>
  (async function* () {
    for (const row of rows) yield structuredClone(row);
  })();

class FakeStripe {
  constructor() {
    this.seq = 0;
    this.writes = 0;
    const db = { products: new Map(), prices: new Map(), links: new Map() };
    this.db = db;
    const id = (p) => `${p}_${++this.seq}`;
    const write = () => {
      this.writes += 1;
    };
    this.products = {
      list: () => iter([...db.products.values()]),
      retrieve: async (pid, opts = {}) => {
        const p = structuredClone(db.products.get(pid));
        if (opts.expand?.includes('default_price') && p.default_price) {
          p.default_price = structuredClone(db.prices.get(p.default_price));
        }
        return p;
      },
      create: async (params) => {
        write();
        const p = {
          id: id('prod'),
          active: true,
          default_price: null,
          ...structuredClone(params),
        };
        db.products.set(p.id, p);
        return structuredClone(p);
      },
      update: async (pid, params) => {
        write();
        const p = db.products.get(pid);
        Object.assign(p, structuredClone(params));
        return structuredClone(p);
      },
    };
    const takeKey = (key) => {
      for (const price of db.prices.values())
        if (price.lookup_key === key) price.lookup_key = null;
    };
    this.prices = {
      list: ({ lookup_keys }) =>
        iter(
          [...db.prices.values()].filter((p) =>
            lookup_keys.includes(p.lookup_key),
          ),
        ),
      create: async (params) => {
        write();
        const { transfer_lookup_key, ...rest } = params;
        if (transfer_lookup_key) takeKey(rest.lookup_key);
        const price = {
          id: id('price'),
          active: true,
          lookup_key: null,
          recurring: null,
          ...structuredClone(rest),
        };
        db.prices.set(price.id, price);
        return structuredClone(price);
      },
      update: async (pid, params) => {
        write();
        const { transfer_lookup_key, ...rest } = params;
        if (transfer_lookup_key) takeKey(rest.lookup_key);
        Object.assign(db.prices.get(pid), structuredClone(rest));
        return structuredClone(db.prices.get(pid));
      },
    };
    this.paymentLinks = {
      list: ({ active }) =>
        iter([...db.links.values()].filter((l) => l.active === active)),
      listLineItems: async (lid) => ({
        data: [{ price: { id: db.links.get(lid).price } }],
      }),
      create: async (params) => {
        write();
        const lid = id('plink');
        const link = {
          id: lid,
          url: `https://buy.stripe.com/test_${lid}`,
          active: true,
          price: params.line_items[0].price,
          allow_promotion_codes: params.allow_promotion_codes,
          metadata: params.metadata,
        };
        db.links.set(lid, link);
        return structuredClone(link);
      },
      update: async (lid, params) => {
        write();
        Object.assign(db.links.get(lid), params);
        return structuredClone(db.links.get(lid));
      },
    };
  }

  /** Seeds a product as the pre-v2 scripts left it. */
  seed({ productId, slug, cents, interval = 'one_time', bySlugOnly = false }) {
    const priceId = `price_seed_${slug}`;
    this.db.prices.set(priceId, {
      id: priceId,
      product: productId,
      active: true,
      currency: 'usd',
      unit_amount: cents,
      recurring: interval === 'one_time' ? null : { interval },
      lookup_key: null,
    });
    this.db.products.set(productId, {
      id: productId,
      active: true,
      name: `Old ${slug}`,
      description: 'old',
      default_price: priceId,
      metadata: bySlugOnly
        ? { catalog_category: 'service', catalog_slug: slug }
        : {},
    });
    const lid = `plink_seed_${slug}`;
    this.db.links.set(lid, {
      id: lid,
      url: `https://buy.stripe.com/old_${slug}`,
      active: true,
      price: priceId,
      allow_promotion_codes: true,
      metadata: { catalog_category: 'service', catalog_slug: slug },
    });
  }
}

/** The account as it stood on 2026-11-08: every catalog item that has a product. */
function seededStripe(catalog) {
  const stripe = new FakeStripe();
  for (const item of catalog.items) {
    if (item.stripeProductId) {
      stripe.seed({
        productId: item.stripeProductId,
        slug: item.slug,
        cents: item.amountCents,
        interval: item.interval,
      });
    }
  }
  stripe.seed({
    productId: 'prod_payments',
    slug: 'payments-and-back-end-integration',
    cents: 25000,
    bySlugOnly: true,
  });
  return stripe;
}

const quiet = () => {};
const oldLinks = (stripe) =>
  Object.fromEntries(
    [...stripe.db.links.values()].map((l) => [l.metadata.catalog_slug, l.url]),
  );

test('the shipped catalog is valid', () => {
  assert.deepEqual(validateCatalog(loadCatalog()), []);
});

test('validation catches duplicate slugs, bad amounts and unknown intervals', () => {
  const catalog = loadCatalog();
  catalog.items[1].slug = catalog.items[0].slug;
  catalog.items[2].amountCents = 199.5;
  catalog.items[3].interval = 'week';
  const errors = validateCatalog(catalog).join('\n');
  assert.match(errors, /duplicate slug/);
  assert.match(errors, /amountCents/);
  assert.match(errors, /interval/);
});

test('plan mode writes nothing', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const { actions } = await syncPricing({
    stripe,
    catalog,
    mode: 'plan',
    log: quiet,
  });
  assert.equal(stripe.writes, 0);
  assert.ok(
    actions.some(
      (a) =>
        a.slug === 'own-your-dotcom' && a.what.startsWith('create product'),
    ),
  );
});

test('apply creates every new item, reuses unchanged links, and is idempotent', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const before = oldLinks(stripe);
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });

  const active = catalog.items.filter((i) => i.status === 'active');
  assert.deepEqual(Object.keys(links).sort(), active.map((i) => i.slug).sort());
  // Unchanged prices keep the exact checkout URL the live site uses today.
  assert.equal(links['website-launch'], before['website-launch']);
  assert.equal(
    links['payments-and-back-end-integration'],
    before['payments-and-back-end-integration'],
  );
  assert.ok(!('business-website-design-and-development' in links));

  for (const item of active) {
    const keyed = [...stripe.db.prices.values()].filter(
      (p) => p.lookup_key === lookupKeyFor(item.slug),
    );
    assert.equal(
      keyed.length,
      1,
      `${item.slug} has exactly one lookup-keyed price`,
    );
    assert.equal(keyed[0].unit_amount, item.amountCents);
  }

  const second = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });
  assert.deepEqual(second.actions, [], 'a second apply changes nothing');
  assert.deepEqual(second.links, links);
});

test('starter checkout refuses promotion codes; business checkout allows them', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });
  const byUrl = (url) =>
    [...stripe.db.links.values()].find((l) => l.url === url);
  assert.equal(byUrl(links['own-your-dotcom']).allow_promotion_codes, false);
  assert.equal(byUrl(links['keep-live']).allow_promotion_codes, false);
  assert.equal(byUrl(links['website-launch']).allow_promotion_codes, true);
});

test('keep-live is billed yearly', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  await syncPricing({ stripe, catalog, mode: 'apply', log: quiet });
  const price = [...stripe.db.prices.values()].find(
    (p) => p.lookup_key === lookupKeyFor('keep-live'),
  );
  assert.deepEqual(price.recurring, { interval: 'year' });
  assert.equal(price.unit_amount, 6000);
});

test('a price change moves the lookup key, adds a link, and retire switches off the old one only after deploy', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const live = oldLinks(stripe);
  await syncPricing({ stripe, catalog, mode: 'apply', log: quiet });

  const item = catalog.items.find((i) => i.slug === 'website-launch');
  item.amountCents = 600000;
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });
  assert.notEqual(links['website-launch'], live['website-launch']);

  const keyed = [...stripe.db.prices.values()].filter(
    (p) => p.lookup_key === lookupKeyFor('website-launch'),
  );
  assert.equal(keyed.length, 1);
  assert.equal(keyed[0].unit_amount, 600000);
  assert.equal(
    stripe.db.products.get(item.stripeProductId).default_price,
    keyed[0].id,
  );

  const oldLink = [...stripe.db.links.values()].find(
    (l) => l.url === live['website-launch'],
  );
  assert.equal(
    oldLink.active,
    true,
    'apply never switches off the link the live site uses',
  );

  // Retire before the new links are deployed: the old link is protected.
  const early = await syncPricing({
    stripe,
    catalog,
    mode: 'retire',
    deployedLinks: live,
    log: quiet,
  });
  assert.equal(oldLink.active, true);
  assert.ok(early.warnings.some((w) => w.startsWith('website-launch')));

  // Retire after deploy: old link off, old price archived, retired product archived.
  await syncPricing({
    stripe,
    catalog,
    mode: 'retire',
    deployedLinks: links,
    log: quiet,
  });
  const after = [...stripe.db.links.values()].find(
    (l) => l.url === live['website-launch'],
  );
  assert.equal(after.active, false);
  assert.equal(stripe.db.prices.get(after.price).active, false);
  assert.equal(stripe.db.products.get('prod_VMYXNYpDbudov1').active, false);
  const newLink = [...stripe.db.links.values()].find(
    (l) => l.url === links['website-launch'],
  );
  assert.equal(newLink.active, true);
});

test('an archived listed product stops the sync before any write', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  stripe.db.products.get('prod_VGjrHAx19yKTIq').active = false;
  await assert.rejects(
    syncPricing({ stripe, catalog, mode: 'apply', log: quiet }),
    /archived/,
  );
  assert.equal(stripe.writes, 0);
});

test('a listed product missing from the account stops the sync before any write', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  stripe.db.products.delete('prod_VMYXp4kwWjCU4c');
  await assert.rejects(
    syncPricing({ stripe, catalog, mode: 'apply', log: quiet }),
    /not found/,
  );
  assert.equal(stripe.writes, 0);
});

test('the Supabase migration covers every catalog item', () => {
  const catalog = loadCatalog();
  const sql = catalogToSql(catalog);
  for (const item of catalog.items)
    assert.ok(sql.includes(`'${item.slug}'`), item.slug);
  assert.match(
    sql,
    /check \(billing_interval in \('one_time', 'month', 'year'\)\)/,
  );
});

test('campaign briefs use catalog prices, scope add-ons, and refuse retired items', async () => {
  const { campaignBrief } = await import('./campaign-brief.mjs');
  const catalog = loadCatalog();
  const own = campaignBrief(catalog, 'own-your-dotcom');
  assert.match(own, /- Price: \$200\n/);
  assert.match(own, /Promotion codes: not allowed/);
  assert.doesNotMatch(own, /Extra Chair/);
  assert.match(
    campaignBrief(catalog, 'shop-bundle'),
    /Shop Bundle Extra Chair: \$150/,
  );
  assert.match(
    campaignBrief(catalog, 'website-launch'),
    /Price: Starting at \$5,500/,
  );
  assert.throws(
    () => campaignBrief(catalog, 'business-website-design-and-development'),
    /retired/,
  );
  for (const item of catalog.items.filter(
    (i) => i.featured && i.status === 'active',
  )) {
    assert.ok(item.campaign, `${item.slug} has a campaign block`);
  }
});
