import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import {
  PortalForm,
  fieldClass,
  labelClass,
} from '@/components/portal/PortalForm';
import { getPortalViewer, loadAdminOverview } from '@/lib/portal/server';
import {
  PRIORITY_LABELS,
  PROJECT_STAGES,
  REQUEST_STATUS_LABELS,
  UPDATE_KIND_LABELS,
  UPLOAD_ACCEPT,
  formatBytes,
} from '@/lib/portal/shared';

import {
  createPortalClient,
  createPortalProject,
  postPortalUpdate,
  updateChangeRequest,
  updatePortalProject,
  uploadStudioFiles,
} from './actions';

export const metadata: Metadata = {
  title: 'Studio Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const panel = 'rounded-3xl border border-white/10 bg-white/[0.04] p-6';
const eyebrow = 'text-xs uppercase tracking-[0.22em] text-slate-400';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default async function PortalAdminPage() {
  if (!hasClerkKeys) notFound();
  const viewer = await getPortalViewer();
  if (!viewer) redirect('/sign-in?redirect_url=/dashboard/admin');
  if (!viewer.isAdmin) notFound();

  const overview = await loadAdminOverview();
  if (!overview) {
    return (
      <main id="main-content" className="shell min-h-screen py-16">
        <h1 className="text-3xl font-semibold text-white">Studio admin</h1>
        <p className="mt-4 text-slate-300">
          The client portal database is not reachable. Check SUPABASE_SECRET_KEY
          and that the client portal migration has been applied.
        </p>
      </main>
    );
  }

  const { clients, projects, requests, files } = overview;
  const clientName = new Map(clients.map((c) => [c.id, c.display_name]));
  const projectLabel = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project
      ? `${clientName.get(project.client_id) ?? 'Client'} · ${project.name}`
      : 'Unknown project';
  };
  const openRequests = requests.filter(
    (r) => r.status !== 'done' && r.status !== 'declined',
  );

  const projectSelect = (
    <label className={labelClass}>
      Project
      <select name="projectId" required className={fieldClass}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {projectLabel(project.id)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#05070b]">
      <section className="border-b border-white/10">
        <div className="shell flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-redglow">
              Studio admin
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              Client portal
            </h1>
            <p className="mt-3 text-slate-300">
              {clients.length} clients · {projects.length} projects ·{' '}
              {openRequests.length} open requests
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-cyan hover:text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </section>

      <div className="shell grid gap-6 py-8 lg:grid-cols-2">
        <section
          aria-labelledby="queue-heading"
          className={`${panel} lg:col-span-2`}
        >
          <p className={eyebrow}>Queue</p>
          <h2
            id="queue-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Change requests
          </h2>
          {requests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No requests yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {requests.map((request) => {
                const attachments = files.filter(
                  (f) => f.change_request_id === request.id,
                );
                return (
                  <li
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-black/25 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">
                          {projectLabel(request.project_id)} ·{' '}
                          {new Date(request.created_at).toLocaleString(
                            'en-US',
                            {
                              timeZone: 'America/Chicago',
                            },
                          )}
                        </p>
                        <h3 className="mt-1 font-semibold text-white">
                          {request.title}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          request.priority === 'urgent' ||
                          request.priority === 'high'
                            ? 'border-redglow/40 text-redglow'
                            : 'border-white/15 text-slate-300'
                        }`}
                      >
                        {PRIORITY_LABELS[request.priority]}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">
                      {request.details}
                    </p>
                    {request.page_url && (
                      <p className="mt-2 break-all text-xs text-slate-400">
                        Page: {request.page_url}
                      </p>
                    )}
                    {attachments.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {attachments.map((file) => (
                          <li key={file.id}>
                            {file.downloadUrl ? (
                              <a
                                href={file.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-white/10 px-3 py-1 text-xs text-cyan hover:text-white"
                              >
                                {file.file_name}
                              </a>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {file.file_name}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <PortalForm
                      action={updateChangeRequest}
                      submitLabel="Save"
                      busyLabel="Saving…"
                      resetOnSuccess={false}
                      compact
                      className="mt-4"
                    >
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                        <label className={labelClass}>
                          Status
                          <select
                            name="status"
                            defaultValue={request.status}
                            className={fieldClass}
                          >
                            {Object.entries(REQUEST_STATUS_LABELS).map(
                              ([id, label]) => (
                                <option key={id} value={id}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className={labelClass}>
                          Note to client
                          <input
                            name="studioNote"
                            defaultValue={request.studio_note ?? ''}
                            maxLength={2000}
                            className={fieldClass}
                          />
                        </label>
                      </div>
                    </PortalForm>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="update-heading" className={panel}>
          <p className={eyebrow}>Keep them posted</p>
          <h2
            id="update-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Post an update
          </h2>
          {projects.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Create a project first.
            </p>
          ) : (
            <PortalForm
              action={postPortalUpdate}
              submitLabel="Post update"
              className="mt-5"
            >
              {projectSelect}
              <label className={labelClass}>
                Type
                <select
                  name="kind"
                  defaultValue="update"
                  className={fieldClass}
                >
                  {Object.entries(UPDATE_KIND_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Title
                <input
                  name="title"
                  required
                  maxLength={200}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Message
                <textarea
                  name="body"
                  required
                  rows={5}
                  maxLength={5000}
                  className={fieldClass}
                />
              </label>
            </PortalForm>
          )}
        </section>

        <section aria-labelledby="share-heading" className={panel}>
          <p className={eyebrow}>Deliverables</p>
          <h2
            id="share-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Share files with a client
          </h2>
          {projects.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Create a project first.
            </p>
          ) : (
            <PortalForm
              action={uploadStudioFiles}
              submitLabel="Upload"
              busyLabel="Uploading…"
              className="mt-5"
            >
              {projectSelect}
              <label className={labelClass}>
                Files
                <input
                  name="files"
                  type="file"
                  multiple
                  required
                  accept={UPLOAD_ACCEPT}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Note
                <input name="note" maxLength={500} className={fieldClass} />
              </label>
            </PortalForm>
          )}
        </section>

        <section
          aria-labelledby="projects-heading"
          className={`${panel} lg:col-span-2`}
        >
          <p className={eyebrow}>Projects</p>
          <h2
            id="projects-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Stage, site link, and next milestone
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-2xl border border-white/10 bg-black/25 p-5"
              >
                <h3 className="font-semibold text-white">
                  {projectLabel(project.id)}
                </h3>
                <PortalForm
                  action={updatePortalProject}
                  submitLabel="Save project"
                  busyLabel="Saving…"
                  resetOnSuccess={false}
                  compact
                  className="mt-3"
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <label className={labelClass}>
                    Stage
                    <select
                      name="status"
                      defaultValue={project.status}
                      className={fieldClass}
                    >
                      {PROJECT_STAGES.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Website link
                    <input
                      name="siteUrl"
                      type="url"
                      defaultValue={project.site_url ?? ''}
                      placeholder="https://"
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                    <label className={labelClass}>
                      Next milestone
                      <input
                        name="nextMilestone"
                        defaultValue={project.next_milestone ?? ''}
                        maxLength={200}
                        className={fieldClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Target date
                      <input
                        name="nextMilestoneDue"
                        type="date"
                        defaultValue={project.next_milestone_due ?? ''}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </PortalForm>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="client-heading" className={panel}>
          <p className={eyebrow}>Access</p>
          <h2
            id="client-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Attach a client
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The client signs up at /sign-up with this exact email. Once Clerk
            verifies it, their dashboard connects automatically.
          </p>
          <PortalForm
            action={createPortalClient}
            submitLabel="Save client"
            className="mt-5"
          >
            <label className={labelClass}>
              Email
              <input
                name="email"
                type="email"
                required
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Name
              <input
                name="displayName"
                required
                maxLength={200}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Business
              <input name="company" maxLength={200} className={fieldClass} />
            </label>
            <label className={labelClass}>
              Plan
              <select name="tier" defaultValue="premium" className={fieldClass}>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
              </select>
            </label>
          </PortalForm>
          <ul className="mt-6 divide-y divide-white/10 text-sm">
            {clients.map((client) => (
              <li
                key={client.id}
                className="flex flex-wrap justify-between gap-2 py-2.5"
              >
                <span className="text-white">
                  {client.display_name}
                  <span className="block text-xs text-slate-400">
                    {client.email}
                  </span>
                </span>
                <span className="text-xs text-slate-400">
                  {client.tier} ·{' '}
                  {client.clerk_user_id ? 'signed in' : 'not signed in yet'}
                  {client.active ? '' : ' · inactive'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="new-project-heading" className={panel}>
          <p className={eyebrow}>Setup</p>
          <h2
            id="new-project-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Open a project
          </h2>
          {clients.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              Attach a client first.
            </p>
          ) : (
            <PortalForm
              action={createPortalProject}
              submitLabel="Create project"
              className="mt-5"
            >
              <label className={labelClass}>
                Client
                <select name="clientId" required className={fieldClass}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.display_name} ({client.email})
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Project name
                <input
                  name="name"
                  required
                  maxLength={200}
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Website link
                <input
                  name="siteUrl"
                  type="url"
                  placeholder="https://"
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Stage
                <select
                  name="status"
                  defaultValue="discovery"
                  className={fieldClass}
                >
                  {PROJECT_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Summary for the client
                <textarea
                  name="summary"
                  rows={3}
                  maxLength={2000}
                  className={fieldClass}
                />
              </label>
            </PortalForm>
          )}
          {files.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-semibold text-white">
                Recent files
              </h3>
              <ul className="mt-2 divide-y divide-white/10 text-sm">
                {files.slice(0, 10).map((file) => (
                  <li key={file.id} className="flex justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-slate-300">
                      {file.file_name}
                      <span className="block text-xs text-slate-500">
                        {projectLabel(file.project_id)} · {file.uploaded_by} ·{' '}
                        {formatBytes(file.size_bytes)}
                      </span>
                    </span>
                    {file.downloadUrl && (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-cyan hover:text-white"
                      >
                        Download
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
