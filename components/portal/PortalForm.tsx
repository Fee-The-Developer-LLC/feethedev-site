'use client';

import { useRef, useState, useTransition, type ReactNode } from 'react';

import type { ActionResult } from '@/lib/portal/shared';
import { cn } from '@/lib/utils';

function newSubmissionId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : '00000000-0000-4000-8000-000000000000'.replace(/0/g, () =>
        Math.floor(Math.random() * 16).toString(16),
      );
}

/**
 * Submits a server action without a page reload, shows the result, and
 * resets on success. Adds a fresh `submissionId` per attempt so a double
 * click stores one record.
 */
export function PortalForm({
  action,
  submitLabel,
  busyLabel = 'Sending…',
  className,
  children,
  resetOnSuccess = true,
  compact = false,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  submitLabel: string;
  busyLabel?: string;
  className?: string;
  children: ReactNode;
  resetOnSuccess?: boolean;
  compact?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submissionId, setSubmissionId] = useState(newSubmissionId);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      noValidate
      className={cn('space-y-4', className)}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(async () => {
          let next: ActionResult;
          try {
            next = await action(data);
          } catch {
            next = {
              ok: false,
              message: 'Something went wrong. Check your connection and retry.',
            };
          }
          setResult(next);
          if (next.ok) {
            if (resetOnSuccess) formRef.current?.reset();
            setSubmissionId(newSubmissionId());
          }
        });
      }}
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <fieldset disabled={pending} className="space-y-4">
        {children}
      </fieldset>
      <div
        className={cn('flex flex-wrap items-center gap-3', compact && 'gap-2')}
      >
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-white font-semibold text-black transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/60 disabled:cursor-wait disabled:opacity-60',
            compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm',
          )}
        >
          {pending ? busyLabel : submitLabel}
        </button>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            'text-sm',
            result?.ok ? 'text-greenglow' : 'text-redglow',
            !result && 'sr-only',
          )}
        >
          {result?.message ?? ''}
        </p>
      </div>
    </form>
  );
}

export const fieldClass =
  'mt-1.5 block w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-electric/60 focus:outline-none focus:ring-2 focus:ring-electric/30';

export const labelClass = 'block text-sm font-medium text-slate-200';
