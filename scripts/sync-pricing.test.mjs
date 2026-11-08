/**
 * Runs scripts/sync-pricing.mjs against an in-memory Stripe seeded like the
 * live account today (26 products at the pre-v2 prices, one active link each).
 *   npm run pricing:test
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import {
  DEPOSIT_SUFFIX,
  depositCents,
  lookupKeyFor,
  syncPricing,
  validateCatalog,
} from './sync-pricing.mjs';
import { catalogToSql } from './pricing-to-sql.mjs';
import { campaignBrief } from './campaign-brief.mjs';
import { mintVeteranCode } from './veteran-code.mjs';

const catalogFile = new URL('../lib/pricing-catalog.json', import.meta.url);
const loadCatalog = () => JSON.parse(fs.readFileSync(catalogFile, 'utf8'));

/** Prices live in Stripe on 2026-11-08 (from the retired link script). */
const LIVE_PRICES = {
  'website-launch': 550000,
  'digital-presence-bundle': 675000,
  'custom-software-and-automation': 350000,
  'full-business-system': 1000000,
  'yelp-profile-setup-or-cleanup': 35000,
  'apple-business-connect-setup': 35000,
  'ga4-property-review-audit': 45000,
  'google-business-profile-setup': 52500,
  'google-workspace-and-business-email': 52500,
  'contact-category-location-alignment': 70000,
  'ga4-setup-and-validation': 92500,
  'lead-capture-and-crm-automation': 140000,
  'api-integration-setup': 210000,
  'ai-assistant-or-chatbot-setup': 210000,
  'clerk-supabase-completion': 350000,
  'business-analytics-dashboard': 350000,
  'custom-public-data-collection-tool': 350000,
  'strategic-website-redesign': 475000,
  'business-website-design-and-development': 550000,
  'e-commerce-or-custom-website-features': 1000000,
  'website-maintenance-and-support': 17500,
  'cloud-management': 35000,
  'public-data-monitoring-and-alerts': 35000,
  'developer-change-block': 52500,
  'fee-developer-protection': 85000,
};

const iter = (rows) =>
  (async function* () {
    for (const row of rows) yield structuredClone(row);
  })();

class FakeStripe {
  constructor() {
    this.seq = 0;
    this.writes = 0;
    const db = {
      products: new Map(),
      prices: new Map(),
      links: new Map(),
      coupons: new Map(),
      promotionCodes: new Map(),
    };
    this.db = db;
    const id = (p) => `${p}_${++this.seq}`;
    const write = () => {
      this.writes += 1;
    };
    const missing = () =>
      Object.assign(new Error('No such resource'), {
        statusCode: 404,
        code: 'resource_missing',
      });
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
        Object.assign(db.products.get(pid), structuredClone(params));
        return structuredClone(db.products.get(pid));
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
    this.coupons = {
      retrieve: async (cid) => {
        if (!db.coupons.has(cid)) throw missing();
        return structuredClone(db.coupons.get(cid));
      },
      create: async (params) => {
        write();
        db.coupons.set(params.id, { valid: true, ...structuredClone(params) });
        return structuredClone(db.coupons.get(params.id));
      },
    };
    this.promotionCodes = {
      create: async (params) => {
        write();
        const pc = {
          id: id('promo'),
          active: true,
          ...structuredClone(params),
        };
        db.promotionCodes.set(pc.id, pc);
        return structuredClone(pc);
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

/** The account as it stands on 2026-11-08. */
function seededStripe(catalog) {
  const stripe = new FakeStripe();
  for (const item of catalog.items) {
    if (item.stripeProductId) {
      assert.ok(LIVE_PRICES[item.slug], `${item.slug} has a live price`);
      stripe.seed({
        productId: item.stripeProductId,
        slug: item.slug,
        cents: LIVE_PRICES[item.slug],
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
const seedLinks = (stripe) =>
  Object.fromEntries(
    [...stripe.db.links.values()].map((l) => [l.metadata.catalog_slug, l.url]),
  );
const linkByUrl = (stripe, url) =>
  [...stripe.db.links.values()].find((l) => l.url === url);
const keyed = (stripe, key) =>
  [...stripe.db.prices.values()].filter(
    (p) => p.lookup_key === lookupKeyFor(key),
  );

test('the shipped catalog is valid', () => {
  assert.deepEqual(validateCatalog(loadCatalog()), []);
});

test('validation catches duplicate slugs, bad amounts, intervals and deposits', () => {
  const catalog = loadCatalog();
  catalog.items[1].slug = catalog.items[0].slug;
  catalog.items[2].amountCents = 199.5;
  catalog.items[3].interval = 'week';
  catalog.items[4].depositPercent = 30; // a monthly or flat item cannot take a deposit
  const errors = validateCatalog(catalog).join('\n');
  assert.match(errors, /duplicate slug/);
  assert.match(errors, /amountCents/);
  assert.match(errors, /interval/);
  assert.match(errors, /deposits apply only/);
});

test('v3 prices: Own Your Bookings $199 and every other price 30% lower', () => {
  const catalog = loadCatalog();
  const bySlug = Object.fromEntries(catalog.items.map((i) => [i.slug, i]));
  assert.equal(bySlug['own-your-bookings'].amountCents, 19900);
  assert.equal(bySlug['own-your-bookings'].paymentsIncluded, true);
  for (const [slug, live] of Object.entries(LIVE_PRICES)) {
    const item = bySlug[slug];
    if (item.status !== 'active') continue;
    assert.ok(
      item.amountCents <= Math.round(live * 0.7),
      `${slug} is at least 30% below ${live / 100}`,
    );
    assert.ok(
      item.amountCents >= Math.round(live * 0.7) - 1000,
      `${slug} is within $10 of exactly 30% off`,
    );
  }
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
        a.slug === 'own-your-bookings' && a.what.startsWith('create product'),
    ),
  );
  assert.ok(actions.some((a) => a.slug === 'veteran-discount'));
});

test('apply reprices everything, adds deposits, keeps full price as default, and is idempotent', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const before = seedLinks(stripe);
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });

  const active = catalog.items.filter((i) => i.status === 'active');
  const expectedKeys = active.flatMap((i) =>
    i.depositPercent ? [i.slug, `${i.slug}${DEPOSIT_SUFFIX}`] : [i.slug],
  );
  assert.deepEqual(Object.keys(links).sort(), expectedKeys.sort());

  for (const item of active) {
    const full = keyed(stripe, item.slug);
    assert.equal(full.length, 1, `${item.slug} has one full price`);
    assert.equal(full[0].unit_amount, item.amountCents);
    if (item.stripeProductId) {
      assert.equal(
        stripe.db.products.get(item.stripeProductId).default_price,
        full[0].id,
        `${item.slug} default is the full price`,
      );
      assert.notEqual(
        links[item.slug],
        before[item.slug],
        `${item.slug} got a new link`,
      );
    }
    if (item.depositPercent) {
      const dep = keyed(stripe, `${item.slug}${DEPOSIT_SUFFIX}`);
      assert.equal(dep.length, 1);
      assert.equal(dep[0].unit_amount, depositCents(item));
      assert.equal(
        dep[0].product,
        full[0].product,
        'deposit sits on the same product',
      );
    }
  }
  assert.equal(
    links['website-launch--deposit'] &&
      keyed(stripe, 'website-launch--deposit')[0].unit_amount,
    115500,
  );

  const second = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });
  assert.deepEqual(second.actions, [], 'a second apply changes nothing');
  assert.deepEqual(second.links, links);
});

test('every link accepts promotion codes and the veteran coupon is created once', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });
  for (const url of Object.values(links)) {
    assert.equal(linkByUrl(stripe, url).allow_promotion_codes, true, url);
  }
  const coupon = stripe.db.coupons.get('ftd-veteran-30');
  assert.equal(coupon.percent_off, 30);
  assert.equal(coupon.duration, 'forever');
  await syncPricing({ stripe, catalog, mode: 'apply', log: quiet });
  assert.equal(stripe.db.coupons.size, 1);
});

test('veteran codes are single-use, expire, and need the coupon', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  await assert.rejects(
    mintVeteranCode({ stripe, catalog, ref: 'intake-123', days: 30 }),
    /coupon/,
  );
  await syncPricing({ stripe, catalog, mode: 'apply', log: quiet });
  const now = Date.UTC(2026, 10, 8) / 1000;
  const code = await mintVeteranCode({
    stripe,
    catalog,
    ref: 'intake-123',
    days: 30,
    now,
  });
  assert.match(code.code, /^VET-[A-HJ-NP-Z2-9]{6}$/);
  assert.equal(code.coupon, 'ftd-veteran-30');
  assert.equal(code.max_redemptions, 1);
  assert.equal(code.expires_at, now + 30 * 86400);
  assert.equal(code.metadata.verification_ref, 'intake-123');
  assert.ok(!JSON.stringify(code).includes('@'), 'no email stored on the code');
});

test('keep-live is billed yearly at $42', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  await syncPricing({ stripe, catalog, mode: 'apply', log: quiet });
  const price = keyed(stripe, 'keep-live')[0];
  assert.deepEqual(price.recurring, { interval: 'year' });
  assert.equal(price.unit_amount, 4200);
});

test('retire switches off old links only after the new links are deployed', async () => {
  const catalog = loadCatalog();
  const stripe = seededStripe(catalog);
  const live = seedLinks(stripe);
  const { links } = await syncPricing({
    stripe,
    catalog,
    mode: 'apply',
    log: quiet,
  });

  const oldLaunch = linkByUrl(stripe, live['website-launch']);
  assert.equal(oldLaunch.active, true, 'apply never switches off a live link');

  const early = await syncPricing({
    stripe,
    catalog,
    mode: 'retire',
    deployedLinks: live,
    log: quiet,
  });
  assert.equal(oldLaunch.active, true);
  assert.ok(early.warnings.some((w) => w.startsWith('website-launch')));

  await syncPricing({
    stripe,
    catalog,
    mode: 'retire',
    deployedLinks: links,
    log: quiet,
  });
  assert.equal(linkByUrl(stripe, live['website-launch']).active, false);
  assert.equal(stripe.db.prices.get(oldLaunch.price).active, false);
  assert.equal(stripe.db.products.get('prod_VMYXNYpDbudov1').active, false);
  for (const url of Object.values(links)) {
    assert.equal(linkByUrl(stripe, url).active, true, `${url} stays active`);
  }
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

test('campaign briefs use catalog prices, discounts and payment options', () => {
  const catalog = loadCatalog();
  const own = campaignBrief(catalog, 'own-your-bookings');
  assert.match(own, /- Price: \$199\n/);
  assert.match(own, /Veteran: 30% off/);
  assert.match(own, /YOBUL: not available/);
  assert.doesNotMatch(own, /Extra Chair/);
  assert.match(
    campaignBrief(catalog, 'shop-bundle'),
    /Shop Bundle Extra Chair: \$105/,
  );
  const launch = campaignBrief(catalog, 'website-launch');
  assert.match(launch, /Price: Starting at \$3,850/);
  assert.match(launch, /30% deposit \(\$1,155\)/);
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
