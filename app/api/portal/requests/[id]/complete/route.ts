import { PORTAL_BUCKET } from '@/lib/portal';
import { getPortalClient } from '@/lib/portal-server';
import { isSameOrigin, noStoreJson as json } from '@/lib/request-guards';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Marks a request's files `uploaded` once their objects exist in Storage.
// Only objects that are really present are marked, so a client cannot mark
// a file uploaded by calling this route without uploading it.

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return json({ error: 'forbidden' }, 403);

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return json({ error: 'not_found' }, 404);

  const client = await getPortalClient();
  if (!client) return json({ error: 'unauthorized' }, 401);

  const supabase = getSupabaseAdmin();
  if (!supabase) return json({ error: 'portal_unavailable' }, 503);

  const { data: files, error } = await supabase
    .from('client_files')
    .select('id, storage_path, status')
    .eq('request_id', id)
    .eq('clerk_user_id', client.userId);

  if (error) return json({ error: 'portal_unavailable' }, 502);
  if (!files?.length)
    return json({ status: 'ok', uploaded: 0, missing: 0 }, 200);

  const folder = `${client.userId}/${id}`;
  const { data: objects, error: listError } = await supabase.storage
    .from(PORTAL_BUCKET)
    .list(folder, { limit: 100 });
  if (listError) return json({ error: 'portal_unavailable' }, 502);

  const present = new Set(
    (objects ?? []).map((object) => `${folder}/${object.name}`),
  );
  const landed = files
    .filter(
      (file) => file.status === 'pending' && present.has(file.storage_path),
    )
    .map((file) => file.id);

  if (landed.length) {
    const { error: updateError } = await supabase
      .from('client_files')
      .update({ status: 'uploaded', uploaded_at: new Date().toISOString() })
      .in('id', landed);
    if (updateError) return json({ error: 'portal_unavailable' }, 502);
  }

  const missing = files.filter(
    (file) => !present.has(file.storage_path),
  ).length;
  return json({ status: 'ok', uploaded: landed.length, missing }, 200);
}
