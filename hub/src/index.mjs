import { carryParams, resolve } from './routes.mjs';
import { startPage } from './start-page.mjs';

const PAGE_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, max-age=300',
  'content-security-policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

const APEX = 'realplayscorp.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { allow: 'GET, HEAD' },
      });
    }
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nAllow: /\n', {
        headers: { 'content-type': 'text/plain' },
      });
    }
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    const result = resolve(url, request.headers.get('referer'));

    if (result.type === 'page') {
      return new Response(startPage(carryParams(url.searchParams)), {
        headers: PAGE_HEADERS,
      });
    }
    if (result.type === 'start') {
      return new Response(null, {
        status: 302,
        headers: {
          location: `/start${carryParams(url.searchParams)}`,
          'cache-control': 'no-store',
        },
      });
    }

    // One data point per click: door, tags and country. No IP, no cookie,
    // no user agent, so the hub never holds personal data.
    try {
      env.HUB_CLICKS?.writeDataPoint({
        indexes: [result.door],
        blobs: [
          result.door,
          result.company,
          result.tags.utm_source,
          result.tags.utm_medium,
          result.tags.utm_campaign,
          result.tags.utm_content ?? '',
          String(request.cf?.country ?? ''),
        ],
        doubles: [1],
      });
    } catch {
      // Counting must never block the redirect.
    }

    return new Response(null, {
      status: 302,
      headers: {
        location: result.location,
        'cache-control': 'no-store',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    });
  },
};
