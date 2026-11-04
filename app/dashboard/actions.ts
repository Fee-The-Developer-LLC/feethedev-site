'use server';

import { revalidatePath } from 'next/cache';

import {
  checkUploads,
  getPortalViewer,
  readUploads,
  storeUploads,
} from '@/lib/portal/server';
import { PORTAL_LIMITS, type ActionResult } from '@/lib/portal/shared';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type { PortalPriority } from '@/lib/supabase/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIORITIES: PortalPriority[] = ['low', 'normal', 'high', 'urgent'];

function text(form: FormData, field: string): string {
  const value = form.get(field);
  return typeof value === 'string' ? value.trim() : '';
}

/** Confirms the signed-in client owns the project. */
async function authorizeProject(projectId: string) {
  const viewer = await getPortalViewer();
  if (!viewer?.client) return null;
  if (!UUID.test(projectId)) return null;

  const db = getSupabaseAdmin();
  if (!db) return null;

  const { data } = await db
    .from('portal_projects')
    .select('id, client_id')
    .eq('id', projectId)
    .eq('client_id', viewer.client.id)
    .maybeSingle();

  return data ? { viewer, client: viewer.client, db, projectId } : null;
}

export async function submitChangeRequest(
  form: FormData,
): Promise<ActionResult> {
  const access = await authorizeProject(text(form, 'projectId'));
  if (!access) {
    return { ok: false, message: 'Your session expired. Sign in again.' };
  }

  const submissionId = text(form, 'submissionId');
  const title = text(form, 'title');
  const details = text(form, 'details');
  const pageUrl = text(form, 'pageUrl');
  const priorityInput = text(form, 'priority') as PortalPriority;

  const fields: string[] = [];
  if (!UUID.test(submissionId)) fields.push('submissionId');
  if (title.length < 3 || title.length > PORTAL_LIMITS.titleChars) {
    fields.push('title');
  }
  if (details.length < 10 || details.length > PORTAL_LIMITS.detailsChars) {
    fields.push('details');
  }
  if (pageUrl && (pageUrl.length > 500 || !/^https?:\/\//i.test(pageUrl))) {
    fields.push('pageUrl');
  }
  if (!PRIORITIES.includes(priorityInput)) fields.push('priority');
  if (fields.length > 0) {
    return {
      ok: false,
      message: 'Check the highlighted fields and try again.',
      fields,
    };
  }

  // Urgent is part of the premium plan; other plans fall back to high.
  const priority: PortalPriority =
    priorityInput === 'urgent' && access.client.tier !== 'premium'
      ? 'high'
      : priorityInput;

  const files = readUploads(form, 'attachments');
  const fileError = checkUploads(files);
  if (fileError)
    return { ok: false, message: fileError, fields: ['attachments'] };

  const { data: inserted, error } = await access.db
    .from('portal_change_requests')
    .upsert(
      {
        submission_id: submissionId,
        project_id: access.projectId,
        client_id: access.client.id,
        title,
        details,
        page_url: pageUrl || null,
        priority,
        created_by_clerk_user_id: access.viewer.userId,
      },
      { onConflict: 'submission_id', ignoreDuplicates: true },
    )
    .select('id');

  if (error) {
    console.error('[portal] change request failed', error.message);
    return {
      ok: false,
      message: 'We could not save that request. Try again in a minute.',
    };
  }

  // An empty result means this submission was already saved (double submit).
  const requestId = inserted?.[0]?.id;
  if (requestId && files.length > 0) {
    try {
      await storeUploads(files, {
        clientId: access.client.id,
        projectId: access.projectId,
        changeRequestId: requestId,
        uploadedBy: 'client',
      });
    } catch {
      revalidatePath('/dashboard');
      return {
        ok: false,
        message:
          'Your request was saved, but the attachments did not upload. Add them under Files.',
      };
    }
  }

  revalidatePath('/dashboard');
  return {
    ok: true,
    message: 'Request received. You will see its status change here.',
  };
}

export async function uploadClientFiles(form: FormData): Promise<ActionResult> {
  const access = await authorizeProject(text(form, 'projectId'));
  if (!access) {
    return { ok: false, message: 'Your session expired. Sign in again.' };
  }

  const files = readUploads(form, 'files');
  if (files.length === 0) {
    return {
      ok: false,
      message: 'Choose at least one file.',
      fields: ['files'],
    };
  }
  const fileError = checkUploads(files);
  if (fileError) return { ok: false, message: fileError, fields: ['files'] };

  const note = text(form, 'note').slice(0, PORTAL_LIMITS.noteChars) || null;

  try {
    const count = await storeUploads(files, {
      clientId: access.client.id,
      projectId: access.projectId,
      note,
      uploadedBy: 'client',
    });
    revalidatePath('/dashboard');
    return {
      ok: true,
      message: `${count} file${count === 1 ? '' : 's'} uploaded.`,
    };
  } catch {
    revalidatePath('/dashboard');
    return { ok: false, message: 'The upload did not finish. Try again.' };
  }
}
