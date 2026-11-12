import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../src/index.mjs';
import {
  DOORS,
  carryParams,
  cleanTag,
  resolve,
  sourceFromReferrer,
} from '../src/routes.mjs';

const go = (path, referrer) =>
  resolve(new URL(path, 'https://realplayscorp.com'), referrer);

test('home and /start serve the page; unknown paths go to /start', () => {
  assert.equal(go('/').type, 'page');
  assert.equal(go('/start').type, 'page');
  assert.equal(go('/START/').type, 'page');
  assert.equal(go('/nope').type, 'start');
});

test('a DM link arrives at the offer page fully tagged', () => {
  const r = go('/websites?src=instagram&m=dm&c=beauty-film&s=fee_got_plays');
  assert.equal(r.type, 'redirect');
  const to = new URL(r.location);
  assert.equal(to.origin + to.pathname, DOORS.websites.to);
  assert.equal(to.searchParams.get('utm_source'), 'instagram');
  assert.equal(to.searchParams.get('utm_medium'), 'dm');
  assert.equal(to.searchParams.get('utm_campaign'), 'beauty-film');
  assert.equal(to.searchParams.get('utm_content'), 'fee_got_plays');
});

test('a bare bio link gets its source from the referrer and the door campaign', () => {
  const r = go('/hutchrok', 'https://l.instagram.com/?u=x');
  const to = new URL(r.location);
  assert.equal(to.searchParams.get('utm_source'), 'instagram');
  assert.equal(to.searchParams.get('utm_medium'), 'link');
  assert.equal(to.searchParams.get('utm_campaign'), 'hutchrok-hub');
  assert.equal(to.searchParams.has('utm_content'), false);
});

test('a hash on the target survives tagging', () => {
  const to = new URL(go('/ai?m=story').location);
  assert.equal(to.hash, '#ai');
  assert.equal(to.searchParams.get('utm_medium'), 'story');
});

test('unsafe tag values are dropped, not passed through', () => {
  assert.equal(cleanTag('<script>'), undefined);
  assert.equal(cleanTag('a'.repeat(65)), undefined);
  assert.equal(cleanTag('Vetpreneur-Tribe'), 'vetpreneur-tribe');
  const to = new URL(go('/websites?s=%3Cb%3E&c=ok-1').location);
  assert.equal(to.searchParams.has('utm_content'), false);
  assert.equal(to.searchParams.get('utm_campaign'), 'ok-1');
});

test('referrers map to sources', () => {
  assert.equal(
    sourceFromReferrer('https://m.facebook.com/groups/x'),
    'facebook',
  );
  assert.equal(sourceFromReferrer('https://lm.facebook.com/l.php'), 'facebook');
  assert.equal(sourceFromReferrer('https://evilfacebook.com/'), 'web');
  assert.equal(sourceFromReferrer(null), 'direct');
  assert.equal(sourceFromReferrer('not a url'), 'direct');
});

test('every door goes to https on a company domain', () => {
  const allowed = [
    'feethedeveloper.com',
    'www.hutchrok.com',
    'feetheproducer.com',
    'runnergangls.com',
    'deploypropertysg.com',
    '54bravoauto.com',
    'honeybeeonlinesolutions.com',
  ];
  for (const [key, door] of Object.entries(DOORS)) {
    const u = new URL(door.to);
    assert.equal(u.protocol, 'https:', key);
    assert.ok(allowed.includes(u.hostname), `${key} -> ${u.hostname}`);
    assert.ok(door.campaign && door.company, key);
  }
});

test('/start carries only clean short params onto its buttons', () => {
  assert.equal(carryParams(new URLSearchParams('m=bio&x=1&s=%3C')), '?m=bio');
});

test('the worker redirects, counts the click and never sets a cookie', async () => {
  const points = [];
  const env = { HUB_CLICKS: { writeDataPoint: (p) => points.push(p) } };
  const res = await worker.fetch(
    new Request('https://realplayscorp.com/shop?m=group&s=sneaker-bot-talk'),
    env,
  );
  assert.equal(res.status, 302);
  assert.match(res.headers.get('location'), /^https:\/\/runnergangls\.com\//);
  assert.equal(res.headers.get('set-cookie'), null);
  assert.equal(points.length, 1);
  assert.deepEqual(points[0].indexes, ['shop']);
  assert.ok(!JSON.stringify(points[0]).includes('cf-connecting-ip'));
});

test('the worker serves the page with a strict CSP, and www goes to the apex', async () => {
  const page = await worker.fetch(
    new Request('https://realplayscorp.com/'),
    {},
  );
  assert.equal(page.status, 200);
  assert.match(
    page.headers.get('content-security-policy'),
    /default-src 'none'/,
  );
  const html = await page.text();
  assert.match(html, /href="\/websites"/);
  assert.ok(!/\$\d/.test(html), 'no prices on the router page');
  const www = await worker.fetch(
    new Request('https://www.realplayscorp.com/websites?m=bio'),
    {},
  );
  assert.equal(www.status, 301);
  assert.equal(
    www.headers.get('location'),
    'https://realplayscorp.com/websites?m=bio',
  );
});

test('counting failures never block the redirect', async () => {
  const env = {
    HUB_CLICKS: {
      writeDataPoint: () => {
        throw new Error('down');
      },
    },
  };
  const res = await worker.fetch(
    new Request('https://realplayscorp.com/music'),
    env,
  );
  assert.equal(res.status, 302);
});

test('switch doors send Vagaro switchers to each company edition', () => {
  const ftd = new URL(go('/switch?m=group').location);
  assert.equal(ftd.origin + ftd.pathname, 'https://feethedeveloper.com/switch');
  assert.equal(ftd.searchParams.get('utm_campaign'), 'ftd-switch-from-vagaro');
  const hbo = new URL(go('/booking?m=dm').location);
  assert.equal(
    hbo.origin + hbo.pathname,
    'https://honeybeeonlinesolutions.com/booking/',
  );
  assert.equal(
    hbo.searchParams.get('utm_campaign'),
    'honeybee-switch-from-vagaro',
  );
});
