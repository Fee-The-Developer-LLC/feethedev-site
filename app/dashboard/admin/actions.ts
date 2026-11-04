'use server';

import { revalidatePath } from 'next/cache';

import {
  checkUploads,
  getPortalViewer,
  readUploads,
  storeUploads,
} from '@/lib/portal/server';
import type { ActionResult } from '@/lib/portal/shared';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  PortalProjectStatus,
  PortalRequestStatus,
  PortalTier,
  PortalUpdateKind,
} from '@/lib/supabase/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES: PortalProjectStatus[] = [
  'discovery',
  'design',
  'build',
  'review',
  'live',
  'care',
];
const REQUEST_STATUSES: PortalRequestStatus[] = [
  'submitted',
  'in_review',
  'scheduled',
  'in_progress',
  'done',
  'declined',
];
const KINDS: PortalUpdateKind[] = ['update', 'milestone', 'launch', 'note'];

function text(form: FormData, field: string, max = 5000): string {
  const value = form.get(field);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function requireAdmin() {
  const viewer = await getPortalViewer();
  const db = getSupabaseAdmin();
  if (!viewer?.isAdmin || !db) return null;
  return db;
}

const denied: ActionResult = { ok: false, message: 'Studio access required.' };
const failed = (message: string): ActionResult => ({ ok: false, message });

function done(message: string): ActionResult {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin');
  return { ok: true, message };
}

export async function createPortalClient(
  form: FormData,
): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const email = text(form, 'email', 320).toLowerCase();
  const displayName = text(form, 'displayName', 200);
  const company = text(form, 'company', 200) || null;
  const tier = (text(form, 'tier') || 'premium') as PortalTier;

  if (!EMAIL.test(email)) return failed('Enter a valid email address.');
  if (!displayName) return failed('Enter the client name.');
  if (tier !== 'premium' && tier !== 'standard') return failed('Pick a plan.');

  const { error } = await db
    .from('portal_clients')
    .upsert(
      { email, display_name: displayName, company, tier, active: true },
      { onConflict: 'email' },
    );
  if (error) return failed(`Could not save client: ${error.message}`);
  return done(`${displayName} is attached to ${email}.`);
}

export async function createPortalProject(
  form: FormData,
): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const clientId = text(form, 'clientId');
  const name = text(form, 'name', 200);
  const siteUrl = text(form, 'siteUrl', 500) || null;
  const status = (text(form, 'status') || 'discovery') as PortalProjectStatus;
  const summary = text(form, 'summary', 2000) || null;

  if (!UUID.test(clientId)) return failed('Pick a client.');
  if (!name) return failed('Enter a project name.');
  if (siteUrl && !siteUrl.startsWith('https://')) {
    return failed('The site link must start with https://');
  }
  if (!STATUSES.includes(status)) return failed('Pick a stage.');

  const { error } = await db.from('portal_projects').insert({
    client_id: clientId,
    name,
    site_url: siteUrl,
    status,
    summary,
  });
  if (error) return failed(`Could not create project: ${error.message}`);
  return done(`Project “${name}” created.`);
}

export async function updatePortalProject(
  form: FormData,
): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const projectId = text(form, 'projectId');
  const status = text(form, 'status') as PortalProjectStatus;
  const siteUrl = text(form, 'siteUrl', 500) || null;
  const nextMilestone = text(form, 'nextMilestone', 200) || null;
  const due = text(form, 'nextMilestoneDue', 10) || null;

  if (!UUID.test(projectId)) return failed('Pick a project.');
  if (!STATUSES.includes(status)) return failed('Pick a stage.');
  if (siteUrl && !siteUrl.startsWith('https://')) {
    return failed('The site link must start with https://');
  }
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return failed('Invalid date.');

  const { error } = await db
    .from('portal_projects')
    .update({
      status,
      site_url: siteUrl,
      next_milestone: nextMilestone,
      next_milestone_due: due,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);
  if (error) return failed(`Could not update project: ${error.message}`);
  return done('Project updated.');
}

export async function postPortalUpdate(form: FormData): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const projectId = text(form, 'projectId');
  const kind = (text(form, 'kind') || 'update') as PortalUpdateKind;
  const title = text(form, 'title', 200);
  const body = text(form, 'body', 5000);

  if (!UUID.test(projectId)) return failed('Pick a project.');
  if (!KINDS.includes(kind)) return failed('Pick an update type.');
  if (!title || !body) return failed('Add a title and a message.');

  const { error } = await db
    .from('portal_updates')
    .insert({ project_id: projectId, kind, title, body });
  if (error) return failed(`Could not post update: ${error.message}`);
  return done('Update posted to the client dashboard.');
}

export async function updateChangeRequest(
  form: FormData,
): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const requestId = text(form, 'requestId');
  const status = text(form, 'status') as PortalRequestStatus;
  const studioNote = text(form, 'studioNote', 2000) || null;

  if (!UUID.test(requestId)) return failed('Unknown request.');
  if (!REQUEST_STATUSES.includes(status)) return failed('Pick a status.');

  const { error } = await db
    .from('portal_change_requests')
    .update({
      status,
      studio_note: studioNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);
  if (error) return failed(`Could not update request: ${error.message}`);
  return done('Request updated.');
}

export async function uploadStudioFiles(form: FormData): Promise<ActionResult> {
  const db = await requireAdmin();
  if (!db) return denied;

  const projectId = text(form, 'projectId');
  if (!UUID.test(projectId)) return failed('Pick a project.');

  const { data: project } = await db
    .from('portal_projects')
    .select('id, client_id')
    .eq('id', projectId)
    .maybeSingle();
  if (!project) return failed('Unknown project.');

  const files = readUploads(form, 'files');
  if (files.length === 0) return failed('Choose at least one file.');
  const fileError = checkUploads(files);
  if (fileError) return failed(fileError);

  try {
    const count = await storeUploads(files, {
      clientId: project.client_id,
      projectId: project.id,
      note: text(form, 'note', 500) || null,
      uploadedBy: 'studio',
    });
    return done(
      `${count} file${count === 1 ? '' : 's'} shared with the client.`,
    );
  } catch {
    return failed('The upload did not finish. Try again.');
  }
}
