import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site-config';

/** JSON response that is never cached. */
export function noStoreJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** CSRF guard for browser-initiated POSTs: Origin must be this site. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    return (
      originHost === request.headers.get('host') ||
      originHost === new URL(siteConfig.siteUrl).host
    );
  } catch {
    return false;
  }
}
