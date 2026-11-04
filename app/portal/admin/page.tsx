import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  KIND_LABELS,
  PORTAL_BUCKET,
  REQUEST_STATUSES,
  STATUS_LABELS,
  formatBytes,
} from '@/lib/portal';
import { getPortalClient, hasClerkKeys } from '@/lib/portal-server';
import { findShowcaseSite } from '@/lib/showcase';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  ClientFileRow,
  ClientRequestRow,
  ClientSpaceRow,
} from '@/lib/supabase/types';
import { setShareFolder, updateRequest } from './actions';

export const metadata: Metadata = {
  title: 'Portal Admin',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-greenglow/50 focus:outline-none';

export default async function PortalAdminPage() {
  if (!hasClerkKeys) notFound();
  const client = await getPortalClient();
  if (!client) redirect('/sign-in?redirect_url=/portal/admin');
  if (!client.isAdmin) notFound();

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <main id="main-content" className="shell py-16 text-slate-300">
        Supabase is not configured (SUPABASE_SECRET_KEY missing).
      </main>
    );
  }

  const [requestResult, spaceResult] = await Promise.all([
    supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('client_spaces').select('*'),
  ]);
  const requests = (requestResult.data ?? []) as ClientRequestRow[];
  const spaces = new Map(
    ((spaceResult.data ?? []) as ClientSpaceRow[]).map((space) => [
      space.clerk_user_id,
      space,
    ]),
  );

  let files: ClientFileRow[] = [];
  const links = new Map<string, string>();
  if (requests.length) {
    const fileResult = await supabase
      .from('client_files')
      .select('*')
      .in(
        'request_id',
        requests.map((request) => request.id),
      );
    files = (fileResult.data ?? []) as ClientFileRow[];
    const uploaded = files.filter((file) => file.status === 'uploaded');
    if (uploaded.length) {
      const { data } = await supabase.storage
        .from(PORTAL_BUCKET)
        .createSignedUrls(
          uploaded.map((file) => file.storage_path),
          60 * 60,
          { download: true },
        );
      for (const entry of data ?? []) {
        if (entry.path && entry.signedUrl)
          links.set(entry.path, entry.signedUrl);
      }
    }
  }

  const clients = new Map<
    string,
    { email: string | null; name: string | null }
  >();
  for (const request of requests) {
    if (!clients.has(request.clerk_user_id)) {
      clients.set(request.clerk_user_id, {
        email: request.client_email,
        name: request.client_name,
      });
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <div className="shell py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-greenglow">
              Portal admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Client inbox
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {requestResult.error
                ? 'Could not load requests. Has the client portal migration been applied?'
                : `${requests.length} most recent requests. Download links last one hour.`}
            </p>
          </div>
          <Link
            href="/portal"
            className="text-sm font-semibold text-cyan hover:text-white"
          >
            Back to portal
          </Link>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <section aria-label="Requests" className="space-y-4">
            {requests.map((request) => {
              const site = findShowcaseSite(request.site_slug);
              const requestFiles = files.filter(
                (file) => file.request_id === request.id,
              );
              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {KIND_LABELS[request.kind]}
                    {site ? ` · ${site.domain}` : ''}
                    {request.priority === 'urgent' ? ' · URGENT' : ''} ·{' '}
                    {new Date(request.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'America/Chicago',
                    })}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {request.title}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {request.client_name ?? 'Unnamed'} ·{' '}
                    {request.client_email ? (
                      <a
                        className="text-cyan"
                        href={`mailto:${request.client_email}`}
                      >
                        {request.client_email}
                      </a>
                    ) : (
                      'no email'
                    )}
                  </p>
                  {request.details ? (
                    <p className="mt-3 whitespace-pre-line text-sm text-slate-300">
                      {request.details}
                    </p>
                  ) : null}
                  {request.website_url ? (
                    <a
                      href={request.website_url}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="mt-2 block truncate text-sm text-cyan"
                    >
                      {request.website_url}
                    </a>
                  ) : null}
                  {requestFiles.length ? (
                    <ul className="mt-3 space-y-1 text-sm">
                      {requestFiles.map((file) => {
                        const link = links.get(file.storage_path);
                        return (
                          <li
                            key={file.id}
                            className="flex justify-between gap-3 text-slate-400"
                          >
                            {link ? (
                              <a
                                href={link}
                                className="truncate text-slate-200 hover:text-white"
                              >
                                ⬇ {file.file_name}
                              </a>
                            ) : (
                              <span className="truncate">
                                {file.file_name} (not uploaded)
                              </span>
                            )}
                            <span className="shrink-0">
                              {formatBytes(file.size_bytes)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  <form
                    action={updateRequest}
                    className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]"
                  >
                    <input type="hidden" name="id" value={request.id} />
                    <select
                      name="status"
                      defaultValue={request.status}
                      className={inputClass}
                    >
                      {REQUEST_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <input
                      name="adminNote"
                      defaultValue={request.admin_note ?? ''}
                      maxLength={2000}
                      placeholder="Note the client will see"
                      className={inputClass}
                    />
                    <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-200">
                      Save
                    </button>
                  </form>
                </article>
              );
            })}
          </section>

          <section aria-labelledby="folders-heading">
            <h2
              id="folders-heading"
              className="text-xl font-semibold text-white"
            >
              Client shared folders
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Paste a Dropbox, Google Drive, or OneDrive folder link shared with
              that client. It appears on their portal for large uploads and
              downloads.
            </p>
            <div className="mt-4 space-y-4">
              {[...clients.entries()].map(([userId, info]) => {
                const space = spaces.get(userId);
                return (
                  <form
                    key={userId}
                    action={setShareFolder}
                    className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {info.name ?? info.email ?? userId}
                    </p>
                    <input type="hidden" name="clerkUserId" value={userId} />
                    <input
                      type="hidden"
                      name="clientEmail"
                      value={info.email ?? ''}
                    />
                    <input
                      name="shareUrl"
                      type="url"
                      defaultValue={space?.share_folder_url ?? ''}
                      placeholder="https://www.dropbox.com/scl/fo/…"
                      className={inputClass}
                    />
                    <input
                      name="shareLabel"
                      defaultValue={space?.share_label ?? ''}
                      maxLength={120}
                      placeholder="Label (optional)"
                      className={inputClass}
                    />
                    <button className="rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10">
                      Save folder
                    </button>
                  </form>
                );
              })}
              {!clients.size ? (
                <p className="text-sm text-slate-500">
                  Clients appear here after their first portal request.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
