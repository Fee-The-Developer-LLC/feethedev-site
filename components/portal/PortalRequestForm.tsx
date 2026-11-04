'use client';

import { useRouter } from 'next/navigation';
import { useId, useRef, useState, type FormEvent } from 'react';
import {
  ACCEPT_ATTRIBUTE,
  PORTAL_LIMITS,
  REQUEST_KINDS,
  formatBytes,
  isAllowedMime,
  type RequestKind,
} from '@/lib/portal';
import { showcaseSites } from '@/lib/showcase';

type Upload = { fileId: string; name: string; signedUrl: string };
type Phase = 'idle' | 'sending' | 'uploading' | 'done' | 'error';

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

function putFile(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'false');
    if (publishableKey) xhr.setRequestHeader('apikey', publishableKey);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`upload_${xhr.status}`));
    xhr.onerror = () => reject(new Error('upload_network'));
    xhr.send(file);
  });
}

const fieldClass =
  'mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-greenglow/50 focus:outline-none focus:ring-2 focus:ring-greenglow/30';

export function PortalRequestForm({
  shareFolderUrl,
}: {
  shareFolderUrl: string | null;
}) {
  const router = useRouter();
  const formId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<RequestKind>('change');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const busy = phase === 'sending' || phase === 'uploading';
  const needsDetails = kind === 'change' || kind === 'suggestion';

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const rejected: string[] = [];
    for (const file of Array.from(list)) {
      if (next.length >= PORTAL_LIMITS.files) break;
      if (!isAllowedMime(file.type) || file.size < 1) {
        rejected.push(`${file.name} (file type not supported)`);
      } else if (file.size > PORTAL_LIMITS.fileBytes) {
        rejected.push(
          `${file.name} (over ${formatBytes(PORTAL_LIMITS.fileBytes)})`,
        );
      } else {
        next.push(file);
      }
    }
    setFiles(next);
    setMessage(
      rejected.length
        ? `Not added: ${rejected.join(', ')}.${shareFolderUrl ? ' Use your shared folder for larger files.' : ''}`
        : null,
    );
    if (fileInput.current) fileInput.current.value = '';
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPhase('sending');
    setMessage(null);

    let requestId: string;
    let uploads: Upload[];
    try {
      const response = await fetch('/api/portal/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          siteSlug: form.get('siteSlug'),
          priority: form.get('priority') === 'urgent' ? 'urgent' : 'normal',
          title: form.get('title'),
          details: form.get('details'),
          websiteUrl: form.get('websiteUrl'),
          files: files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setPhase('error');
        setMessage(
          body.error === 'invalid'
            ? `Please check: ${(body.fields as string[]).join(', ')}.`
            : 'We could not save that right now. Please try again or email us.',
        );
        return;
      }
      requestId = body.requestId;
      uploads = body.uploads;
    } catch {
      setPhase('error');
      setMessage('Network problem. Please try again.');
      return;
    }

    if (uploads.length) {
      setPhase('uploading');
      const failed: string[] = [];
      for (const [index, upload] of uploads.entries()) {
        const file = files[index];
        try {
          await putFile(upload.signedUrl, file, (pct) =>
            setProgress((current) => ({ ...current, [index]: pct })),
          );
        } catch {
          failed.push(file.name);
        }
      }
      await fetch(`/api/portal/requests/${requestId}/complete`, {
        method: 'POST',
      }).catch(() => null);
      if (failed.length) {
        setPhase('error');
        setMessage(
          `Your request was saved, but these files did not upload: ${failed.join(', ')}.`,
        );
        router.refresh();
        return;
      }
    }

    setPhase('done');
    setMessage('Received. We will review it and update the status below.');
    setFiles([]);
    setProgress({});
    (event.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      aria-describedby={`${formId}-status`}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-white">
          What are you sending?
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {REQUEST_KINDS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border p-4 transition ${kind === option.value ? 'border-greenglow/50 bg-greenglow/[0.08]' : 'border-white/10 bg-black/25 hover:border-white/25'}`}
            >
              <input
                type="radio"
                name="kind"
                value={option.value}
                checked={kind === option.value}
                onChange={() => setKind(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-white">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-400">
                {option.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-slate-200">
        Which site is this for?{' '}
        <span className="text-slate-500">(optional)</span>
        <select name="siteSlug" defaultValue="" className={fieldClass}>
          <option value="">Not site-specific / new project</option>
          {showcaseSites.map((site) => (
            <option key={site.slug} value={site.slug}>
              {site.name} ({site.domain})
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-200">
        Title
        <input
          name="title"
          required
          maxLength={PORTAL_LIMITS.title}
          placeholder="e.g. Swap the homepage hero photo"
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-slate-200">
        Details{' '}
        {needsDetails ? '' : <span className="text-slate-500">(optional)</span>}
        <textarea
          name="details"
          required={needsDetails}
          maxLength={PORTAL_LIMITS.details}
          rows={5}
          placeholder="What should change, where, and why? Links to pages help."
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium text-slate-200">
        Website or page link{' '}
        {kind === 'website' ? (
          ''
        ) : (
          <span className="text-slate-500">(optional)</span>
        )}
        <input
          name="websiteUrl"
          type="text"
          inputMode="url"
          required={kind === 'website'}
          maxLength={PORTAL_LIMITS.websiteUrl}
          placeholder="https://example.com/page"
          className={fieldClass}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-slate-200">
          Photos, videos, files{' '}
          {kind === 'assets' ? (
            ''
          ) : (
            <span className="text-slate-500">(optional)</span>
          )}
        </p>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/25 px-4 py-8 text-center text-sm text-slate-300 hover:border-greenglow/40">
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={ACCEPT_ATTRIBUTE}
            onChange={(event) => addFiles(event.target.files)}
            className="sr-only"
            disabled={busy || files.length >= PORTAL_LIMITS.files}
          />
          <span className="font-semibold text-white">Choose files</span>
          <span className="mt-1 text-xs text-slate-400">
            Up to {PORTAL_LIMITS.files} files,{' '}
            {formatBytes(PORTAL_LIMITS.fileBytes)} each. Images, video, PDF,
            Word, ZIP.
          </span>
        </label>
        {shareFolderUrl ? (
          <p className="mt-2 text-xs text-slate-400">
            Bigger than that, or a whole folder?{' '}
            <a
              href={shareFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan hover:text-white"
            >
              Drop it in your shared folder
            </a>{' '}
            and mention it here.
          </p>
        ) : null}
        {files.length ? (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => {
              const pct = progress[index];
              return (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                >
                  <span className="min-w-0 truncate">
                    {file.name} · {formatBytes(file.size)}
                  </span>
                  {pct !== undefined ? (
                    <span className="tabular-nums text-greenglow">
                      {Math.round(pct * 100)}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== index))
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          name="priority"
          value="urgent"
          className="h-4 w-4 accent-[#14E8B4]"
        />
        This is urgent (something is broken or time-sensitive)
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60 disabled:opacity-60"
        >
          {phase === 'sending'
            ? 'Saving…'
            : phase === 'uploading'
              ? 'Uploading…'
              : 'Send to Fee The Developer'}
        </button>
        <p
          id={`${formId}-status`}
          role="status"
          className={`text-sm ${phase === 'error' ? 'text-red-300' : 'text-slate-300'}`}
        >
          {message}
        </p>
      </div>
    </form>
  );
}
