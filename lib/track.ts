/**
 * First-party, consent-aware event tracking (issue #43).
 *
 * Events go only to this site's own `/api/events` endpoint. No cookies, no
 * third-party scripts, no personal data: each event carries the event name
 * and fixed identifiers (page path, product slug, project id, source).
 * Nothing is sent when the browser signals Global Privacy Control or Do Not
 * Track.
 */
export const trackedEvents = [
  'portfolio_view',
  'portfolio_site_click',
  'booking_product_cta_click',
  'qualified_lead',
] as const;

export type TrackedEvent = (typeof trackedEvents)[number];

export type TrackProps = {
  product?: string;
  project?: string;
  source?: string;
};

/** Identifiers only: lowercase slugs, at most 64 characters. */
export const trackIdPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;

function trackingAllowed(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true) return false;
  if (nav.doNotTrack === '1') return false;
  return true;
}

export function track(event: TrackedEvent, props: TrackProps = {}): void {
  if (!trackingAllowed()) return;
  const body = JSON.stringify({
    event,
    page: window.location.pathname,
    ...props,
  });
  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/events', blob)) return;
    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking never breaks the page.
  }
}
