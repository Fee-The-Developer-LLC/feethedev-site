import {
  PORTAL_BUCKET,
  PORTAL_LIMITS,
  safeFileName,
  validatePortalRequest,
} from '@/lib/portal';
import { getPortalClient } from '@/lib/portal-server';
import { isSameOrigin, noStoreJson as json } from '@/lib/request-guards';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Creates a client portal request and returns one signed upload URL per
// declared file. The browser PUTs file bytes straight to Supabase Storage, so
// large videos never pass through the Worker. Files stay `pending` until
// POST /api/portal/requests/[id]/complete confirms they landed.

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: 'forbidden' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  const client = await getPortalClient();
  if (!client) return json({ error: 'unauthorized' }, 401);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > PORTAL_LIMITS.bodyBytes) {
    return json({ error: 'payload_too_large' }, 413);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const result = validatePortalRequest(parsed);
  if (!result.ok) return json({ error: 'invalid', fields: result.errors }, 400);

  const supabase = getSupabaseAdmin();
  if (!supabase) return json({ error: 'portal_unavailable' }, 503);

  const input = result.request;
  const { data: created, error: insertError } = await supabase
    .from('client_requests')
    .insert({
      clerk_user_id: client.userId,
      client_email: client.email,
      client_name: client.name,
      site_slug: input.siteSlug,
      kind: input.kind,
      priority: input.priority,
      title: input.title,
      details: input.details,
      website_url: input.websiteUrl,
    })
    .select('id')
    .single();

  if (insertError || !created) {
    console.error('portal_request_insert_failed', insertError?.code);
    return json({ error: 'portal_unavailable' }, 502);
  }

  const uploads: {
    fileId: string;
    name: string;
    signedUrl: string;
  }[] = [];

  for (const file of input.files) {
    const fileId = crypto.randomUUID();
    const path = `${client.userId}/${created.id}/${fileId}-${safeFileName(file.name)}`;

    const { error: fileError } = await supabase.from('client_files').insert({
      id: fileId,
      request_id: created.id,
      clerk_user_id: client.userId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    const { data: signed, error: signError } = fileError
      ? { data: null, error: fileError }
      : await supabase.storage.from(PORTAL_BUCKET).createSignedUploadUrl(path);

    if (signError || !signed) {
      console.error('portal_upload_sign_failed', signError?.message);
      return json(
        { error: 'upload_unavailable', requestId: created.id, uploads },
        502,
      );
    }
    uploads.push({ fileId, name: file.name, signedUrl: signed.signedUrl });
  }

  return json({ status: 'created', requestId: created.id, uploads }, 201);
}
