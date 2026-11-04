/**
 * Client portal constants shared by server code and client components.
 * No secrets or server imports here.
 */

import type {
  PortalPriority,
  PortalProjectStatus,
  PortalRequestStatus,
  PortalUpdateKind,
} from '@/lib/supabase/types';

export const PORTAL_BUCKET = 'client-uploads';

export const PORTAL_LIMITS = {
  fileBytes: 25 * 1024 * 1024,
  filesPerSubmission: 5,
  submissionBytes: 25 * 1024 * 1024,
  titleChars: 200,
  detailsChars: 5000,
  noteChars: 500,
} as const;

/** MIME types the bucket accepts, keyed to the extensions we allow. */
export const ALLOWED_UPLOADS: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
};

export const UPLOAD_ACCEPT = Object.keys(ALLOWED_UPLOADS)
  .map((ext) => `.${ext}`)
  .join(',');

export const PROJECT_STAGES: { id: PortalProjectStatus; label: string }[] = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'design', label: 'Design' },
  { id: 'build', label: 'Build' },
  { id: 'review', label: 'Review' },
  { id: 'live', label: 'Live' },
  { id: 'care', label: 'Ongoing care' },
];

export const REQUEST_STATUS_LABELS: Record<PortalRequestStatus, string> = {
  submitted: 'Received',
  in_review: 'In review',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  done: 'Done',
  declined: 'Not planned',
};

export const PRIORITY_LABELS: Record<PortalPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const UPDATE_KIND_LABELS: Record<PortalUpdateKind, string> = {
  update: 'Update',
  milestone: 'Milestone',
  launch: 'Launch',
  note: 'Note',
};

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fields?: string[] };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
