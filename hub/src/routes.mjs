/**
 * The router's door table and tagging rules. One place to change where a
 * door goes; every bio link, DM and group post keeps working.
 *
 * Short link params (all optional, lowercase letters, numbers, - and _):
 *   src = utm_source   (instagram, facebook; guessed from the referrer if absent)
 *   m   = utm_medium   (bio, story, reel, dm, group, partner, paid)
 *   c   = utm_campaign (defaults to the door's campaign)
 *   s   = utm_content  (group, film cut or sender handle)
 */

export const DOORS = {
  websites: {
    to: 'https://feethedeveloper.com/services/own-your-bookings',
    company: 'ftd',
    campaign: 'ftd-own-your-bookings',
  },
  switch: {
    to: 'https://feethedeveloper.com/switch',
    company: 'ftd',
    campaign: 'ftd-switch-from-vagaro',
  },
  booking: {
    to: 'https://honeybeeonlinesolutions.com/booking/',
    company: 'honeybee',
    campaign: 'honeybee-switch-from-vagaro',
  },
  build: {
    to: 'https://feethedeveloper.com/services/business-site-essentials',
    company: 'ftd',
    campaign: 'ftd-business-site-essentials',
  },
  ai: {
    to: 'https://feethedeveloper.com/pricing#ai',
    company: 'ftd',
    campaign: 'ftd-ai-plugins',
  },
  hutchrok: {
    to: 'https://www.hutchrok.com/',
    company: 'hutchrok',
    campaign: 'hutchrok-hub',
  },
  music: {
    to: 'https://feetheproducer.com/',
    company: 'feetheproducer',
    campaign: 'producer-hub',
  },
  shop: {
    to: 'https://runnergangls.com/',
    company: 'runnergang',
    campaign: 'runnergang-hub',
  },
  // "See the website": each sector's flagship. Client sites stay off this
  // list until the client signs off; beauty points at the FTD showroom.
  'sites/beauty': {
    to: 'https://feethedeveloper.com/work',
    company: 'ftd',
    campaign: 'ftd-sector-beauty',
  },
  'sites/realestate': {
    to: 'https://deploypropertysg.com/',
    company: 'ftd',
    campaign: 'ftd-sector-realestate',
  },
  'sites/transport': {
    to: 'https://54bravoauto.com/',
    company: 'ftd',
    campaign: 'ftd-sector-transport',
  },
  'sites/apparel': {
    to: 'https://runnergangls.com/',
    company: 'ftd',
    campaign: 'ftd-sector-apparel',
  },
  'sites/music': {
    to: 'https://feetheproducer.com/',
    company: 'ftd',
    campaign: 'ftd-sector-music',
  },
  'sites/pro': {
    to: 'https://www.hutchrok.com/',
    company: 'ftd',
    campaign: 'ftd-sector-pro',
  },
};

const SAFE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/** Returns a cleaned tag value, or undefined if it isn't a safe slug. */
export function cleanTag(value) {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  return SAFE.test(v) ? v : undefined;
}

/** Guesses utm_source from the Referer header when the link didn't say. */
export function sourceFromReferrer(referrer) {
  if (!referrer) return 'direct';
  let host;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return 'direct';
  }
  const is = (domain) => host === domain || host.endsWith(`.${domain}`);
  if (is('instagram.com')) return 'instagram';
  if (is('facebook.com') || is('fb.com') || is('messenger.com'))
    return 'facebook';
  if (is('tiktok.com')) return 'tiktok';
  if (is('linkedin.com') || is('lnkd.in')) return 'linkedin';
  if (is('youtube.com') || is('youtu.be')) return 'youtube';
  return 'web';
}

/** The tags a click carries, from the short params and the referrer. */
export function tagsFor(params, door, referrer) {
  const tags = {
    utm_source: cleanTag(params.get('src')) ?? sourceFromReferrer(referrer),
    utm_medium: cleanTag(params.get('m')) ?? 'link',
    utm_campaign: cleanTag(params.get('c')) ?? door.campaign,
  };
  const content = cleanTag(params.get('s'));
  if (content) tags.utm_content = content;
  return tags;
}

/** Normalizes a request path to a door key: "/Sites/Beauty/" -> "sites/beauty". */
export function doorKey(pathname) {
  return pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
}

/**
 * Decides what a request gets:
 *   { type: 'page' }                       the /start page (also "/")
 *   { type: 'redirect', location, ... }    a door
 *   { type: 'start' }                      unknown path: send to /start
 */
export function resolve(url, referrer) {
  const key = doorKey(url.pathname);
  if (key === '' || key === 'start') return { type: 'page' };
  const door = DOORS[key];
  if (!door) return { type: 'start' };
  const tags = tagsFor(url.searchParams, door, referrer);
  const target = new URL(door.to);
  for (const [name, value] of Object.entries(tags)) {
    if (!target.searchParams.has(name)) target.searchParams.set(name, value);
  }
  return {
    type: 'redirect',
    door: key,
    company: door.company,
    location: target.toString(),
    tags,
  };
}

/** The short params to carry from /start onto each door link. */
export function carryParams(searchParams) {
  const out = new URLSearchParams();
  for (const name of ['src', 'm', 'c', 's']) {
    const v = cleanTag(searchParams.get(name));
    if (v) out.set(name, v);
  }
  const q = out.toString();
  return q ? `?${q}` : '';
}
