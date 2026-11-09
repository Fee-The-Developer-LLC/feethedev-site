'use client';

import { useState, type FormEvent } from 'react';

const field =
  'mt-2 w-full rounded-xl border border-white/15 bg-background px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-greenglow focus:outline-none';
const label = 'block text-sm font-semibold text-slate-200';

/** After-checkout intake: saves to project_intakes, falls back to email. */
export function WelcomeIntakeForm({
  serviceName,
  serviceSlug,
  checkoutSession,
  email,
  name,
  amount,
  contactEmail,
}: {
  serviceName: string;
  serviceSlug: string;
  checkoutSession: string;
  email: string | null;
  name: string | null;
  amount: string;
  contactEmail: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    const goals = [
      `Paid ${amount} for ${serviceName} (${checkoutSession}).`,
      `Domain choices: ${value('domains') || 'not given'}`,
      `Services and prices: ${value('services')}`,
      `Hours: ${value('hours') || 'not given'}`,
      `Current link: ${value('link') || 'none'}`,
      `Has a Stripe account: ${data.get('stripe') ? 'yes' : 'no'}`,
    ].join('\n');
    const payload = {
      submissionId: crypto.randomUUID(),
      name: value('business'),
      email: value('email'),
      company: value('business'),
      service: serviceName,
      budget: `Paid ${amount}`,
      timeline: null,
      goals,
      website: value('website'),
      checkoutSession,
      paidService: serviceSlug,
    };

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(String(response.status));
      setState('sent');
    } catch {
      setState('error');
      const subject = encodeURIComponent(`${serviceName} details`);
      const body = encodeURIComponent(
        `${payload.name}\n${payload.email}\n\n${goals}`,
      );
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-3xl border border-greenglow/30 bg-greenglow/[0.07] p-8">
        <p className="text-2xl font-extrabold text-white">Got it.</p>
        <p className="mt-2 text-slate-300">
          Your preview link comes next, by email.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-white/10 bg-panel p-6 sm:p-8"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <label className={label}>
        Business or artist name
        <input
          name="business"
          required
          defaultValue={name ?? ''}
          className={field}
        />
      </label>
      <label className={label}>
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue={email ?? ''}
          className={field}
        />
      </label>
      <label className={label}>
        .com you want (up to three choices)
        <input
          name="domains"
          placeholder="yourname.com, yournamestudio.com"
          className={field}
        />
      </label>
      <label className={label}>
        Services and prices
        <textarea
          name="services"
          required
          minLength={10}
          rows={4}
          className={field}
        />
      </label>
      <label className={label}>
        Hours you take bookings
        <input name="hours" className={field} />
      </label>
      <label className={label}>
        Current booking or link-in-bio link (optional)
        <input name="link" type="url" className={field} />
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-200">
        <input
          name="stripe"
          type="checkbox"
          className="h-5 w-5 accent-[#14E8B4]"
        />
        I already have a Stripe account
      </label>
      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-silver px-6 text-sm font-extrabold uppercase tracking-[0.14em] text-background shadow-electric transition hover:bg-white disabled:opacity-60"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-[#0FAF86]"
        />
        {state === 'sending' ? 'Sending…' : 'Send my details'}
      </button>
      {state === 'error' && (
        <p role="alert" className="text-sm text-orange-200">
          We opened an email with your details. Send it to finish.
        </p>
      )}
    </form>
  );
}
