'use server';

import { revalidatePath } from 'next/cache';
import {
  REQUEST_STATUSES,
  parseShareFolderUrl,
  type RequestStatus,
} from '@/lib/portal';
import { getPortalClient } from '@/lib/portal-server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const client = await getPortalClient();
  if (!client?.isAdmin) throw new Error('forbidden');
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('portal_unavailable');
  return supabase;
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export async function updateRequest(form: FormData) {
  const supabase = await requireAdmin();
  const id = field(form, 'id');
  const status = field(form, 'status') as RequestStatus;
  const note = field(form, 'adminNote').slice(0, 2000);
  if (!UUID_PATTERN.test(id) || !REQUEST_STATUSES.includes(status)) return;

  await supabase
    .from('client_requests')
    .update({
      status,
      admin_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  revalidatePath('/portal/admin');
}

export async function setShareFolder(form: FormData) {
  const supabase = await requireAdmin();
  const userId = field(form, 'clerkUserId');
  if (!userId || userId.length > 100) return;

  const raw = field(form, 'shareUrl');
  const parsed = raw ? parseShareFolderUrl(raw) : null;
  if (raw && !parsed) return;

  await supabase.from('client_spaces').upsert({
    clerk_user_id: userId,
    client_email: field(form, 'clientEmail').slice(0, 320) || null,
    share_folder_url: parsed?.url ?? null,
    share_provider: parsed?.provider ?? null,
    share_label: field(form, 'shareLabel').slice(0, 120) || null,
    updated_at: new Date().toISOString(),
  });
  revalidatePath('/portal/admin');
}
