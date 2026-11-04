import Link from 'next/link';

import {
  submitChangeRequest,
  uploadClientFiles,
} from '@/app/dashboard/actions';
import { BookingModal } from '@/components/BookingModal';
import type { ClientWorkspace } from '@/lib/portal/server';
import {
  PRIORITY_LABELS,
  PROJECT_STAGES,
  REQUEST_STATUS_LABELS,
  UPDATE_KIND_LABELS,
  UPLOAD_ACCEPT,
  formatBytes,
} from '@/lib/portal/shared';
import { siteConfig } from '@/lib/site-config';
import type {
  PortalClientRow,
  PortalProjectRow,
  PortalRequestStatus,
} from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

import { PortalForm, fieldClass, labelClass } from './PortalForm';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'America/Chicago',
});

function formatDate(value: string): string {
  // Plain dates (YYYY-MM-DD) are calendar days, not instants.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);
  return dateFormat.format(date);
}

export function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const panel = 'rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7';
const eyebrow = 'text-xs uppercase tracking-[0.22em]';

const requestTone: Record<PortalRequestStatus, string> = {
  submitted: 'border-white/15 bg-white/[0.06] text-slate-200',
  in_review: 'border-cyan/30 bg-cyan/10 text-cyan',
  scheduled: 'border-electric/40 bg-electric/15 text-white',
  in_progress: 'border-electric/40 bg-electric/20 text-white',
  done: 'border-greenglow/30 bg-greenglow/10 text-greenglow',
  declined: 'border-white/10 bg-black/30 text-slate-400',
};

function StageTrack({ project }: { project: PortalProjectRow }) {
  const current = PROJECT_STAGES.findIndex((s) => s.id === project.status);
  return (
    <ol
      className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6"
      aria-label="Project stage"
    >
      {PROJECT_STAGES.map((stage, index) => {
        const state =
          index < current ? 'done' : index === current ? 'current' : 'next';
        return (
          <li
            key={stage.id}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span
              aria-hidden="true"
              className={cn(
                'block h-1.5 rounded-full',
                state === 'done' && 'bg-greenglow/80',
                state === 'current' &&
                  'bg-electric shadow-[0_0_14px_rgba(37,120,255,.8)]',
                state === 'next' && 'bg-white/10',
              )}
            />
            <span
              className={cn(
                'mt-2 block text-xs',
                state === 'current'
                  ? 'font-semibold text-white'
                  : 'text-slate-400',
              )}
            >
              {stage.label}
              {state === 'current' && (
                <span className="sr-only"> (current stage)</span>
              )}
              {state === 'done' && <span className="sr-only"> (complete)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ProjectPicker({ projects }: { projects: PortalProjectRow[] }) {
  if (projects.length === 1) {
    return <input type="hidden" name="projectId" value={projects[0].id} />;
  }
  return (
    <label className={labelClass}>
      Project
      <select name="projectId" required className={fieldClass}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ClientWorkspaceView({
  client,
  firstName,
  workspace,
  isAdmin,
}: {
  client: PortalClientRow;
  firstName: string | null;
  workspace: ClientWorkspace;
  isAdmin: boolean;
}) {
  const { projects, updates, requests, files } = workspace;
  const premium = client.tier === 'premium';
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const primarySite = projects.find((p) => p.site_url)?.site_url ?? null;
  const openRequests = requests.filter(
    (r) => r.status !== 'done' && r.status !== 'declined',
  ).length;
  const greetingName = firstName || client.display_name.split(' ')[0];

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ftd-grid bg-[size:48px_48px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="shell relative py-10 sm:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p
                  className={cn(
                    eyebrow,
                    'flex items-center gap-2 text-greenglow',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-greenglow shadow-[0_0_14px_rgba(20,232,180,.85)]"
                  />
                  Client workspace connected
                </p>
                {premium && (
                  <span className="rounded-full border border-redglow/40 bg-redglow/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-redglow">
                    Premium client
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Welcome back, {greetingName}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                {client.company ? `${client.company}: ` : ''}
                follow your site&apos;s progress, send changes, share files, and
                read every update from Fee The Developer in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {primarySite && (
                <a
                  href={primarySite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
                >
                  View my website <ArrowIcon />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              <a
                href="#request-change"
                className="inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/15 px-5 py-3 text-sm font-semibold text-white hover:bg-electric/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
              >
                Request a change <ArrowIcon />
              </a>
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-redglow/40 px-5 py-3 text-sm font-semibold text-redglow hover:bg-redglow/10"
                >
                  Studio admin
                </Link>
              )}
            </div>
          </div>

          <dl className="mt-10 grid max-w-3xl grid-cols-3 gap-3">
            {[
              { label: 'Active projects', value: projects.length },
              { label: 'Open requests', value: openRequests },
              { label: 'Shared files', value: files.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <dt className="text-xs text-slate-400">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 sm:py-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="min-w-0 space-y-6">
          {projects.length === 0 ? (
            <section className={panel}>
              <p className={cn(eyebrow, 'text-cyan')}>Project center</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Your project is being set up
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Your account is attached. Your project timeline will appear here
                as soon as Fee The Developer opens it.
              </p>
            </section>
          ) : (
            projects.map((project) => (
              <section
                key={project.id}
                aria-labelledby={`project-${project.id}`}
                className="relative overflow-hidden rounded-3xl border border-electric/25 bg-gradient-to-br from-electric/[0.12] via-white/[0.04] to-transparent p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className={cn(eyebrow, 'text-cyan')}>Project</p>
                    <h2
                      id={`project-${project.id}`}
                      className="mt-2 text-2xl font-semibold text-white sm:text-3xl"
                    >
                      {project.name}
                    </h2>
                  </div>
                  <span className="rounded-full border border-electric/40 bg-electric/15 px-3 py-1.5 text-xs font-semibold text-white">
                    {PROJECT_STAGES.find((s) => s.id === project.status)?.label}
                  </span>
                </div>
                {project.summary && (
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-slate-300">
                    {project.summary}
                  </p>
                )}
                <StageTrack project={project} />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs text-slate-400">Next milestone</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {project.next_milestone ?? 'To be scheduled'}
                    </p>
                    {project.next_milestone_due && (
                      <p className="mt-1 text-xs text-slate-400">
                        Target {formatDate(project.next_milestone_due)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs text-slate-400">Website</p>
                    {project.site_url ? (
                      <a
                        href={project.site_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-cyan hover:text-white"
                      >
                        {project.site_url.replace(/^https:\/\//, '')}
                        <ArrowIcon />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-white">
                        Link shared at launch
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))
          )}

          <section aria-labelledby="updates-heading" className={panel}>
            <p className={cn(eyebrow, 'text-slate-400')}>From the studio</p>
            <h2
              id="updates-heading"
              className="mt-2 text-2xl font-semibold text-white"
            >
              Updates
            </h2>
            {updates.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                No updates yet. Progress notes, previews, and launch news will
                show up here.
              </p>
            ) : (
              <ol className="mt-6 space-y-6 border-l border-white/10 pl-6">
                {updates.map((update) => (
                  <li key={update.id} className="relative">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#05070b]',
                        update.kind === 'launch' || update.kind === 'milestone'
                          ? 'bg-greenglow'
                          : 'bg-electric',
                      )}
                    />
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-[0.14em] text-slate-300">
                        {UPDATE_KIND_LABELS[update.kind]}
                      </span>{' '}
                      · {formatDate(update.created_at)}
                      {projects.length > 1 &&
                        ` · ${projectNames.get(update.project_id) ?? ''}`}
                    </p>
                    <h3 className="mt-1 font-semibold text-white">
                      {update.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                      {update.body}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="requests-heading" className={panel}>
            <p className={cn(eyebrow, 'text-slate-400')}>Your requests</p>
            <h2
              id="requests-heading"
              className="mt-2 text-2xl font-semibold text-white"
            >
              Change requests
            </h2>
            {requests.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Nothing requested yet. Use “Request a change” and it will be
                tracked here from received to done.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-white/10">
                {requests.map((request) => (
                  <li key={request.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white">
                          {request.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Sent {formatDate(request.created_at)} ·{' '}
                          {PRIORITY_LABELS[request.priority]} priority
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
                          requestTone[request.status],
                        )}
                      >
                        {REQUEST_STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                      {request.details}
                    </p>
                    {request.studio_note && (
                      <p className="mt-3 rounded-xl border border-greenglow/20 bg-greenglow/[0.06] px-3.5 py-2.5 text-sm leading-6 text-slate-200">
                        <span className="font-semibold text-greenglow">
                          Studio note:{' '}
                        </span>
                        {request.studio_note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="files-heading" className={panel}>
            <p className={cn(eyebrow, 'text-slate-400')}>Shared files</p>
            <h2
              id="files-heading"
              className="mt-2 text-2xl font-semibold text-white"
            >
              Files
            </h2>
            {files.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Logos, photos, copy, and documents you share, plus anything the
                studio sends you, will be listed here.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-white/10">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {file.file_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {file.uploaded_by === 'studio'
                          ? 'From the studio'
                          : 'You uploaded'}{' '}
                        · {formatDate(file.created_at)} ·{' '}
                        {formatBytes(file.size_bytes)}
                        {file.note ? ` · ${file.note}` : ''}
                      </p>
                    </div>
                    {file.downloadUrl ? (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-cyan hover:text-white"
                      >
                        Download
                        <span className="sr-only"> {file.file_name}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Unavailable
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Client actions">
          {projects.length > 0 && (
            <section
              id="request-change"
              aria-labelledby="request-change-heading"
              className="scroll-mt-24 rounded-3xl border border-electric/30 bg-electric/[0.08] p-6"
            >
              <p className={cn(eyebrow, 'text-cyan')}>Request a change</p>
              <h2
                id="request-change-heading"
                className="mt-2 text-xl font-semibold text-white"
              >
                Tell us what to update
              </h2>
              <PortalForm
                action={submitChangeRequest}
                submitLabel="Send request"
                className="mt-5"
              >
                <ProjectPicker projects={projects} />
                <label className={labelClass}>
                  What should change?
                  <input
                    name="title"
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="e.g. Update hours on the contact page"
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Details
                  <textarea
                    name="details"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    placeholder="New wording, what to replace, anything we should know."
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Page link{' '}
                  <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    name="pageUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://"
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Priority
                  <select
                    name="priority"
                    defaultValue="normal"
                    className={fieldClass}
                  >
                    <option value="low">Low: whenever convenient</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    {premium && (
                      <option value="urgent">Urgent (premium)</option>
                    )}
                  </select>
                </label>
                <label className={labelClass}>
                  Attachments{' '}
                  <span className="font-normal text-slate-400">
                    (optional, up to 5)
                  </span>
                  <input
                    name="attachments"
                    type="file"
                    multiple
                    accept={UPLOAD_ACCEPT}
                    className={cn(
                      fieldClass,
                      'file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white',
                    )}
                  />
                </label>
              </PortalForm>
            </section>
          )}

          {projects.length > 0 && (
            <section aria-labelledby="upload-heading" className={panel}>
              <p className={cn(eyebrow, 'text-slate-400')}>Upload</p>
              <h2
                id="upload-heading"
                className="mt-2 text-xl font-semibold text-white"
              >
                Send files to the studio
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Images, PDFs, Office files, ZIP, or video. Up to 25 MB per
                upload.
              </p>
              <PortalForm
                action={uploadClientFiles}
                submitLabel="Upload"
                busyLabel="Uploading…"
                className="mt-5"
              >
                <ProjectPicker projects={projects} />
                <label className={labelClass}>
                  Files
                  <input
                    name="files"
                    type="file"
                    multiple
                    required
                    accept={UPLOAD_ACCEPT}
                    className={cn(
                      fieldClass,
                      'file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white',
                    )}
                  />
                </label>
                <label className={labelClass}>
                  Note{' '}
                  <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    name="note"
                    maxLength={500}
                    placeholder="e.g. New team photos for the About page"
                    className={fieldClass}
                  />
                </label>
              </PortalForm>
            </section>
          )}

          <section
            aria-labelledby="support-heading"
            className={cn(
              'rounded-3xl border p-6',
              premium
                ? 'border-redglow/30 bg-redglow/[0.06]'
                : 'border-greenglow/25 bg-greenglow/[0.07]',
            )}
          >
            <p
              className={cn(
                eyebrow,
                premium ? 'text-redglow' : 'text-greenglow',
              )}
            >
              {premium ? 'Premium support' : 'Support'}
            </p>
            <h2
              id="support-heading"
              className="mt-2 text-xl font-semibold text-white"
            >
              Talk to Fee The Developer
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Book a call to walk through changes, or reach out directly.
            </p>
            <BookingModal
              label="Book a call"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60"
            />
            <div className="mt-5 space-y-2 text-sm">
              <a
                className="block text-slate-300 hover:text-white"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              <a
                className="block text-slate-300 hover:text-white"
                href={`tel:${siteConfig.phone}`}
              >
                {siteConfig.phoneDisplay}
              </a>
            </div>
          </section>

          <p className="px-1 text-xs leading-5 text-slate-500">
            Signed in as {client.email}. Files are stored privately and download
            links expire after 30 minutes.
          </p>
        </aside>
      </div>
    </main>
  );
}
