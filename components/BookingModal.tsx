'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { siteConfig } from '@/lib/site-config';

export function BookingModal({
  className = '',
  label = 'Book now',
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogId = useId().replace(/:/g, '');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeDialog() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'rounded-full border border-greenglow/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-greenglow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow'
        }
        aria-haspopup="dialog"
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-description`}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto w-[min(92vw,34rem)] rounded-[1.75rem] border border-white/15 bg-[#0b1018] p-0 text-white shadow-[0_28px_100px_rgba(0,0,0,0.65)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={closeDialog}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
            aria-label="Close booking options"
          >
            <span aria-hidden="true">×</span>
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-greenglow">
            Free consultation
          </p>
          <h2
            id={`${dialogId}-title`}
            className="mt-4 max-w-sm pr-8 text-3xl font-semibold text-white"
          >
            Book your free 15-minute consultation.
          </h2>
          <p
            id={`${dialogId}-description`}
            className="mt-3 max-w-md text-sm leading-6 text-slate-300"
          >
            Choose an available time to talk through your website, software,
            automation, or online presence. There is no cost and no deposit.
          </p>
          <a
            href={siteConfig.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-electric to-greenglow px-6 py-3 text-sm font-bold uppercase tracking-[0.13em] text-[#05070b] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Open available times{' '}
            <span className="ml-2" aria-hidden="true">
              ↗
            </span>
          </a>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Pick a time on our booking calendar. Your confirmation includes Add
            to Google Calendar.
          </p>
        </div>
      </dialog>
    </>
  );
}
