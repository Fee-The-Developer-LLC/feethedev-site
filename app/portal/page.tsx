import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PortalRequestForm } from '@/components/portal/PortalRequestForm';
import { Card } from '@/components/ui';
import {
  KIND_LABELS,
  PORTAL_BUCKET,
  SHARE_PROVIDER_LABELS,
  STATUS_LABELS,
  formatBytes,
} from '@/lib/portal';
import { getPortalClient, hasClerkKeys } from '@/lib/portal-server';
import { findShowcaseSite } from '@/lib/showcase';
import { siteConfig } from '@/lib/site-config';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  ClientFileRow,
  ClientRequestRow,
  ClientSpaceRow,
} from '@/lib/supabase/types';

export const metadata: Metadata = {
  title: 'Client Portal',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const statusTone: Record<ClientRequestRow['status'], string> = {
  new: 'border-electric/40 bg-electric/15 text-white',
  in_review: 'border-cyan/40 bg-cyan/10 text-cyan',
  in_progress: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  done: 'border-greenglow/40 bg-greenglow/10 text-greenglow',
  declined: 'border-white/15 bg-white/5 text-slate-400',
};

async function loadPortal(userId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [spaceResult, requestResult] = await Promise.all([
    supabase
      .from('client_spaces')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle(),
    supabase
      .from('client_requests')
      .select('*')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  if (requestResult.error) return null;

  const requests = (requestResult.data ?? []) as ClientRequestRow[];
  let files: ClientFileRow[] = [];
  const links = new Map<string, string>();

  if (requests.length) {
    const fileResult = await supabase
      .from('client_files')
      .select('*')
      .eq('clerk_user_id', userId)
      .in(
        'request_id',
        requests.map((request) => request.id),
      )
      .order('created_at');
    files = (fileResult.data ?? []) as ClientFileRow[];

    const uploaded = files.filter((file) => file.status === 'uploaded');
    if (uploaded.length) {
      const { data } = await supabase.storage
        .from(PORTAL_BUCKET)
        .createSignedUrls(
          uploaded.map((file) => file.storage_path),
          60 * 60,
        );
      for (const entry of data ?? []) {
        if (entry.path && entry.signedUrl)
          links.set(entry.path, entry.signedUrl);
      }
    }
  }

  return {
    space: (spaceResult.data ?? null) as ClientSpaceRow | null,
    requests,
    files,
    links,
  };
}

export default async function PortalPage() {
  if (!hasClerkKeys) notFound();
  const client = await getPortalClient();
  if (!client) redirect('/sign-in?redirect_url=/portal');

  const data = await loadPortal(client.userId);
  const shareUrl = data?.space?.share_folder_url ?? null;

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <section className="border-b border-white/10">
        <div className="shell py-10 sm:py-14">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-greenglow">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.85)]"
            />
            Client portal
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Send us what your site needs.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Upload photos and videos, request changes, share ideas, or point
                us at a website. Everything lands with Fee The Developer and you
                can track it here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white"
              >
                Dashboard
              </Link>
              {client.isAdmin ? (
                <Link
                  href="/portal/admin"
                  className="rounded-full border border-electric/40 bg-electric/15 px-4 py-2 text-sm font-semibold text-white hover:bg-electric/25"
                >
                  Admin inbox
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <Card hover={false} className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">New request</h2>
          <div className="mt-6">
            {data ? (
              <PortalRequestForm shareFolderUrl={shareUrl} />
            ) : (
              <p className="text-sm leading-7 text-slate-300">
                The portal is temporarily unavailable. Email{' '}
                <a className="text-cyan" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>{' '}
                and we will take care of it.
              </p>
            )}
          </div>
        </Card>

        <aside className="space-y-6" aria-label="Your files and history">
          <div className="rounded-3xl border border-greenglow/25 bg-greenglow/[0.07] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-greenglow">
              Shared folder
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">
              {data?.space?.share_label ?? 'Large files + deliverables'}
            </h2>
            {shareUrl ? (
              <>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Your private{' '}
                  {
                    SHARE_PROVIDER_LABELS[
                      data?.space?.share_provider ?? 'other'
                    ]
                  }{' '}
                  folder. Drop in big videos or whole folders, and pick up the
                  files we send back.
                </p>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-slate-200"
                >
                  Open shared folder
                </a>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Your shared folder for large transfers and downloads is being
                set up. It will appear here once it is ready.
              </p>
            )}
          </div>

          <section aria-labelledby="history-heading">
            <h2
              id="history-heading"
              className="text-xl font-semibold text-white"
            >
              Your requests
            </h2>
            {!data?.requests.length ? (
              <p className="mt-3 text-sm text-slate-400">
                Nothing submitted yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.requests.map((request) => {
                  const site = findShowcaseSite(request.site_slug);
                  const files = data.files.filter(
                    (file) => file.request_id === request.id,
                  );
                  return (
                    <li
                      key={request.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            {KIND_LABELS[request.kind]}
                            {site ? ` · ${site.name}` : ''}
                            {request.priority === 'urgent' ? ' · Urgent' : ''}
                          </p>
                          <h3 className="mt-1 font-semibold text-white">
                            {request.title}
                          </h3>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[request.status]}`}
                        >
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      {request.details ? (
                        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-400">
                          {request.details}
                        </p>
                      ) : null}
                      {request.website_url ? (
                        <a
                          href={request.website_url}
                          target="_blank"
                          rel="noreferrer nofollow"
                          className="mt-2 block truncate text-sm text-cyan hover:text-white"
                        >
                          {request.website_url}
                        </a>
                      ) : null}
                      {files.length ? (
                        <ul className="mt-3 space-y-1 text-xs text-slate-400">
                          {files.map((file) => {
                            const link = data.links.get(file.storage_path);
                            return (
                              <li
                                key={file.id}
                                className="flex justify-between gap-3"
                              >
                                {link ? (
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate text-slate-300 hover:text-white"
                                  >
                                    {file.file_name}
                                  </a>
                                ) : (
                                  <span className="truncate">
                                    {file.file_name}
                                  </span>
                                )}
                                <span className="shrink-0">
                                  {file.status === 'uploaded'
                                    ? formatBytes(file.size_bytes)
                                    : 'Upload incomplete'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      {request.admin_note ? (
                        <p className="mt-3 rounded-xl border border-greenglow/20 bg-greenglow/[0.06] p-3 text-sm text-slate-200">
                          <span className="font-semibold text-greenglow">
                            Fee The Developer:{' '}
                          </span>
                          {request.admin_note}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs text-slate-500">
                        {new Date(request.created_at).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                          timeZone: 'America/Chicago',
                        })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
