import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site-config';
import { trackIdPattern, trackedEvents, type TrackedEvent } from '@/lib/track';

// First-party event sink (issue #43). Accepts only allow-listed event names
// and slug-shaped identifiers, drops anything else, and writes one structured
// log line to Workers observability. No IP, user agent, cookie or other
// personal data is read or stored.

const empty = () =>
  new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  });

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return (
      host === request.headers.get('host') ||
      host === new URL(siteConfig.siteUrl).host
    );
  } catch {
    return false;
  }
}

function slug(value: unknown): string | null {
  return typeof value === 'string' && trackIdPattern.test(value) ? value : null;
}

function pagePath(value: unknown): string | null {
  return typeof value === 'string' && /^\/[a-z0-9/_-]{0,127}$/i.test(value)
    ? value
    : null;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return empty();
  if (request.headers.get('sec-gpc') === '1') return empty();

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 1024) return empty();
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return empty();
  }

  const event = body.event;
  if (!trackedEvents.includes(event as TrackedEvent)) return empty();

  console.log(
    JSON.stringify({
      type: 'ftd_event',
      event,
      page: pagePath(body.page),
      product: slug(body.product),
      project: slug(body.project),
      source: slug(body.source),
      at: new Date().toISOString(),
    }),
  );
  return empty();
}
