/**
 * Client portal contract shared by /portal and the /api/portal routes.
 * Rows live in Supabase `public.client_requests` / `public.client_files`;
 * file bytes live in the private `client-uploads` Storage bucket.
 */

import { showcaseSlugs } from '@/lib/showcase';

export const PORTAL_BUCKET = 'client-uploads';

export const PORTAL_LIMITS = {
  title: 160,
  details: 5000,
  websiteUrl: 2048,
  files: 10,
  fileName: 255,
  fileBytes: 500 * 1024 * 1024,
  bodyBytes: 16_384,
} as const;

export const REQUEST_KINDS = [
  {
    value: 'change',
    label: 'Change request',
    hint: 'Something on your site or project that needs to be different.',
  },
  {
    value: 'suggestion',
    label: 'Suggestion',
    hint: 'An idea, feature, or direction you want us to consider.',
  },
  {
    value: 'website',
    label: 'Website / link',
    hint: 'A site to review, a reference you like, or a page to fix.',
  },
  {
    value: 'assets',
    label: 'Photos + videos',
    hint: 'Upload media, logos, or documents for your project.',
  },
] as const;

export type RequestKind = (typeof REQUEST_KINDS)[number]['value'];
export type RequestPriority = 'normal' | 'urgent';

export const REQUEST_STATUSES = [
  'new',
  'in_review',
  'in_progress',
  'done',
  'declined',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Received',
  in_review: 'In review',
  in_progress: 'In progress',
  done: 'Done',
  declined: 'Declined',
};

export const KIND_LABELS: Record<RequestKind, string> = Object.fromEntries(
  REQUEST_KINDS.map((kind) => [kind.value, kind.label]),
) as Record<RequestKind, string>;

const ALLOWED_MIME_EXACT = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/** Mirrors the bucket's `allowed_mime_types`. */
export function isAllowedMime(mime: string): boolean {
  return (
    mime.startsWith('image/') ||
    mime.startsWith('video/') ||
    ALLOWED_MIME_EXACT.has(mime)
  );
}

export const ACCEPT_ATTRIBUTE = 'image/*,video/*,.pdf,.zip,.txt,.doc,.docx';

export type PortalFileDeclaration = {
  name: string;
  type: string;
  size: number;
};

export type PortalRequestInput = {
  kind: RequestKind;
  priority: RequestPriority;
  siteSlug: string | null;
  title: string;
  details: string | null;
  websiteUrl: string | null;
  files: PortalFileDeclaration[];
};

export type PortalValidation =
  | { ok: true; request: PortalRequestInput }
  | { ok: false; errors: string[] };

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeUrl(value: string): string | null {
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Storage-safe file name that keeps the extension readable. */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[._]+/, '');
  return (cleaned || 'file').slice(-100);
}

export function validatePortalRequest(input: unknown): PortalValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['body'] };
  }
  const raw = input as Record<string, unknown>;
  const errors: string[] = [];

  const kind = text(raw.kind) as RequestKind;
  if (!REQUEST_KINDS.some((option) => option.value === kind)) {
    errors.push('kind');
  }
  const priority: RequestPriority =
    text(raw.priority) === 'urgent' ? 'urgent' : 'normal';

  const siteSlug = text(raw.siteSlug) || null;
  if (siteSlug && !showcaseSlugs.has(siteSlug)) errors.push('siteSlug');

  const title = text(raw.title);
  if (!title || title.length > PORTAL_LIMITS.title) errors.push('title');

  const details = text(raw.details) || null;
  if ((details?.length ?? 0) > PORTAL_LIMITS.details) errors.push('details');
  if ((kind === 'change' || kind === 'suggestion') && !details) {
    errors.push('details');
  }

  const rawUrl = text(raw.websiteUrl);
  const websiteUrl = normalizeUrl(rawUrl);
  if (rawUrl && (!websiteUrl || websiteUrl.length > PORTAL_LIMITS.websiteUrl)) {
    errors.push('websiteUrl');
  }
  if (kind === 'website' && !websiteUrl) errors.push('websiteUrl');

  const files: PortalFileDeclaration[] = [];
  if (raw.files !== undefined) {
    if (!Array.isArray(raw.files) || raw.files.length > PORTAL_LIMITS.files) {
      errors.push('files');
    } else {
      for (const entry of raw.files) {
        const file = (entry ?? {}) as Record<string, unknown>;
        const name = text(file.name);
        const type = text(file.type).toLowerCase();
        const size = typeof file.size === 'number' ? file.size : NaN;
        if (
          !name ||
          name.length > PORTAL_LIMITS.fileName ||
          !isAllowedMime(type) ||
          !Number.isInteger(size) ||
          size < 1 ||
          size > PORTAL_LIMITS.fileBytes
        ) {
          errors.push('files');
          break;
        }
        files.push({ name, type, size });
      }
    }
  }
  if (kind === 'assets' && files.length === 0) errors.push('files');

  return errors.length
    ? { ok: false, errors: [...new Set(errors)] }
    : {
        ok: true,
        request: {
          kind,
          priority,
          siteSlug,
          title,
          details,
          websiteUrl,
          files,
        },
      };
}

export type ShareProvider = 'dropbox' | 'google_drive' | 'onedrive' | 'other';

export const SHARE_PROVIDER_LABELS: Record<ShareProvider, string> = {
  dropbox: 'Dropbox',
  google_drive: 'Google Drive',
  onedrive: 'OneDrive',
  other: 'Shared folder',
};

/** Accepts only https links; detects the provider from the host. */
export function parseShareFolderUrl(
  value: string,
): { url: string; provider: ShareProvider } | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    const provider: ShareProvider =
      host === 'dropbox.com' || host.endsWith('.dropbox.com')
        ? 'dropbox'
        : host === 'drive.google.com' || host === 'docs.google.com'
          ? 'google_drive'
          : host === '1drv.ms' ||
              host.endsWith('.sharepoint.com') ||
              host === 'onedrive.live.com'
            ? 'onedrive'
            : 'other';
    return { url: url.toString(), provider };
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
