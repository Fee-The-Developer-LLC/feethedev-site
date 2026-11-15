/**
 * Return destinations after sign-in or sign-up.
 *
 * Only same-site paths are allowed. External URLs, protocol-relative URLs
 * (`//evil.example`), backslash tricks (`/\evil.example`), control characters
 * and the auth routes themselves (which would loop) all fall back to the
 * dashboard. Used on the server by the full-page routes and in the browser by
 * the sign-in popup; Clerk applies its own allowed-origin check on top.
 */
export const DEFAULT_AUTH_DESTINATION = '/dashboard';

const AUTH_ROUTE = /^\/(sign-in|sign-up)(\/|$|\?|#)/i;
const PLACEHOLDER_ORIGIN = 'https://ftd.invalid';

export function safeReturnPath(
  value: unknown,
  fallback: string = DEFAULT_AUTH_DESTINATION,
): string {
  if (typeof value !== 'string') return fallback;
  const candidate = value.trim();
  if (!candidate || candidate.length > 2048) return fallback;
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  // Browsers treat "\" like "/" in URLs, and control characters can be used
  // to smuggle a host past naive checks.
  if (/[\\\u0000-\u001f\u007f]/.test(candidate)) return fallback;

  let url: URL;
  try {
    url = new URL(candidate, PLACEHOLDER_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== PLACEHOLDER_ORIGIN) return fallback;

  const path = `${url.pathname}${url.search}${url.hash}`;
  if (AUTH_ROUTE.test(path)) return fallback;
  return path;
}
