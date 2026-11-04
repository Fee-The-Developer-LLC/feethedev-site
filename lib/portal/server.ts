import 'server-only';

import { currentUser } from '@clerk/nextjs/server';

import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  PortalChangeRequestRow,
  PortalClientRow,
  PortalFileRow,
  PortalProjectRow,
  PortalUpdateRow,
} from '@/lib/supabase/types';

import { ALLOWED_UPLOADS, PORTAL_BUCKET, PORTAL_LIMITS } from './shared';

/**
 * Studio accounts that can manage every client. Set PORTAL_ADMIN_EMAILS as a
 * comma-separated list to override. Only verified Clerk emails count.
 */
const adminEmails = new Set(
  (process.env.PORTAL_ADMIN_EMAILS ?? 'ceo@feethedeveloper.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export type PortalViewer = {
  userId: string;
  firstName: string | null;
  verifiedEmails: string[];
  isAdmin: boolean;
  client: PortalClientRow | null;
};

export type PortalFileView = PortalFileRow & { downloadUrl: string | null };

export type ClientWorkspace = {
  projects: PortalProjectRow[];
  updates: PortalUpdateRow[];
  requests: PortalChangeRequestRow[];
  files: PortalFileView[];
};

/**
 * Resolves the signed-in Clerk user to a portal client by verified email.
 * Returns null when nobody is signed in. `client` is null when the account is
 * not attached to a client record (or the database is not configured).
 */
export async function getPortalViewer(): Promise<PortalViewer | null> {
  const user = await currentUser();
  if (!user) return null;

  const verifiedEmails = user.emailAddresses
    .filter((address) => address.verification?.status === 'verified')
    .map((address) => address.emailAddress.trim().toLowerCase());

  const viewer: PortalViewer = {
    userId: user.id,
    firstName: user.firstName,
    verifiedEmails,
    isAdmin: verifiedEmails.some((email) => adminEmails.has(email)),
    client: null,
  };

  const db = getSupabaseAdmin();
  if (!db || verifiedEmails.length === 0) return viewer;

  const { data, error } = await db
    .from('portal_clients')
    .select('*')
    .in('email', verifiedEmails)
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[portal] client lookup failed', error.message);
    return viewer;
  }
  if (!data) return viewer;

  // Record which Clerk account claimed the record, for the audit trail.
  if (data.clerk_user_id !== user.id) {
    await db
      .from('portal_clients')
      .update({ clerk_user_id: user.id, updated_at: new Date().toISOString() })
      .eq('id', data.id);
  }

  viewer.client = { ...data, clerk_user_id: user.id };
  return viewer;
}

async function signFiles(files: PortalFileRow[]): Promise<PortalFileView[]> {
  const db = getSupabaseAdmin();
  if (!db || files.length === 0) {
    return files.map((file) => ({ ...file, downloadUrl: null }));
  }

  const { data } = await db.storage.from(PORTAL_BUCKET).createSignedUrls(
    files.map((file) => file.storage_path),
    60 * 30,
  );

  const urls = new Map(
    (data ?? []).map((entry) => [entry.path, entry.signedUrl ?? null]),
  );
  return files.map((file) => ({
    ...file,
    downloadUrl: urls.get(file.storage_path) ?? null,
  }));
}

export async function loadClientWorkspace(
  clientId: string,
): Promise<ClientWorkspace | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data: projects, error } = await db
    .from('portal_projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[portal] project load failed', error.message);
    return null;
  }

  const projectIds = (projects ?? []).map((project) => project.id);
  if (projectIds.length === 0) {
    return { projects: [], updates: [], requests: [], files: [] };
  }

  const [updates, requests, files] = await Promise.all([
    db
      .from('portal_updates')
      .select('*')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(50),
    db
      .from('portal_change_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100),
    db
      .from('portal_files')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  return {
    projects: projects ?? [],
    updates: updates.data ?? [],
    requests: requests.data ?? [],
    files: await signFiles(files.data ?? []),
  };
}

export type AdminOverview = {
  clients: PortalClientRow[];
  projects: PortalProjectRow[];
  requests: PortalChangeRequestRow[];
  files: PortalFileView[];
};

export async function loadAdminOverview(): Promise<AdminOverview | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const [clients, projects, requests, files] = await Promise.all([
    db.from('portal_clients').select('*').order('created_at'),
    db.from('portal_projects').select('*').order('created_at'),
    db
      .from('portal_change_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    db
      .from('portal_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (clients.error) {
    console.error('[portal] admin load failed', clients.error.message);
    return null;
  }

  return {
    clients: clients.data ?? [],
    projects: projects.data ?? [],
    requests: requests.data ?? [],
    files: await signFiles(files.data ?? []),
  };
}

/** Pulls real File entries out of a form field, ignoring empty pickers. */
export function readUploads(form: FormData, field: string): File[] {
  return form
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

/** Validates files before anything is written. Returns an error message or null. */
export function checkUploads(files: File[]): string | null {
  if (files.length > PORTAL_LIMITS.filesPerSubmission) {
    return `Attach up to ${PORTAL_LIMITS.filesPerSubmission} files at a time.`;
  }
  let total = 0;
  for (const file of files) {
    total += file.size;
    if (file.size > PORTAL_LIMITS.fileBytes) {
      return `${file.name} is over the 25 MB limit.`;
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_UPLOADS[ext]) {
      return `${file.name} is not a supported file type.`;
    }
  }
  if (total > PORTAL_LIMITS.submissionBytes) {
    return 'Files in one upload must total 25 MB or less.';
  }
  return null;
}

function safeName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(-120);
  return cleaned || 'file';
}

/**
 * Stores already-validated files in the private bucket and records them.
 * Returns how many were stored.
 */
export async function storeUploads(
  files: File[],
  context: {
    clientId: string;
    projectId: string;
    changeRequestId?: string | null;
    note?: string | null;
    uploadedBy: 'client' | 'studio';
  },
): Promise<number> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error('storage_unavailable');

  let stored = 0;
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const contentType = ALLOWED_UPLOADS[ext];
    const path = `${context.clientId}/${context.projectId}/${crypto.randomUUID()}-${safeName(file.name)}`;

    const upload = await db.storage
      .from(PORTAL_BUCKET)
      .upload(path, file, { contentType, upsert: false });
    if (upload.error) {
      console.error('[portal] upload failed', upload.error.message);
      throw new Error('upload_failed');
    }

    const { error } = await db.from('portal_files').insert({
      project_id: context.projectId,
      client_id: context.clientId,
      change_request_id: context.changeRequestId ?? null,
      storage_path: path,
      file_name: file.name.slice(0, 200),
      content_type: contentType,
      size_bytes: file.size,
      note: context.note ?? null,
      uploaded_by: context.uploadedBy,
    });
    if (error) {
      await db.storage.from(PORTAL_BUCKET).remove([path]);
      console.error('[portal] file record failed', error.message);
      throw new Error('upload_failed');
    }
    stored += 1;
  }
  return stored;
}
