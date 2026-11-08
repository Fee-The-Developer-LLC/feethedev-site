'use client';

import { FormEvent, useState } from 'react';
import { BookingModal } from '@/components/BookingModal';
import {
  normalizePromotionCode,
  SIXERS_SEASON_PROMOTION,
} from '@/lib/promotions';
import { siteConfig } from '@/lib/site-config';

const fieldClass =
  'w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-greenglow/60 focus:ring-2 focus:ring-greenglow/20';

type IntakeState =
  | 'idle'
  | 'sending'
  | 'received'
  | 'email-opened'
  | 'invalid-promotion';

function openEmailFallback(data: FormData) {
  const subject = encodeURIComponent(
    `Project intake: ${data.get('service')} — ${data.get('name')}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${data.get('company') || 'Not provided'}`,
      `Service: ${data.get('service')}`,
      `Investment range: ${data.get('budget')}`,
      `Timeline: ${data.get('timeline') || 'Not provided'}`,
      ...(normalizePromotionCode(data.get('promotionCode'))
        ? [`Promotion code: ${SIXERS_SEASON_PROMOTION.code}`]
        : []),
      ...(data.get('veteranDiscount') === 'yes'
        ? ['Veteran discount: requested (send verification steps)']
        : []),
      ...(data.get('paymentPlan') === 'deposit'
        ? ['Payment: start with a deposit']
        : []),
      '',
      'Project goals:',
      String(data.get('goals') ?? ''),
    ].join('\n'),
  );
  window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
}

export function ProjectIntakeForm({
  initialPromotionCode = '',
  services,
  initialService = '',
  initialVeteran = false,
  initialDeposit = false,
  veteranPercent,
}: {
  initialPromotionCode?: string;
  services: string[];
  initialService?: string;
  initialVeteran?: boolean;
  initialDeposit?: boolean;
  veteranPercent: number;
}) {
  const [state, setState] = useState<IntakeState>('idle');
  // One id per form visit, so a retried or double-clicked submit is stored once.
  const [submissionId] = useState(() => crypto.randomUUID());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const data = new FormData(event.currentTarget);
    const promotionCode = String(data.get('promotionCode') ?? '').trim();
    if (promotionCode && !normalizePromotionCode(promotionCode)) {
      setState('invalid-promotion');
      document.getElementById('promotion-code')?.focus();
      return;
    }
    setState('sending');
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(data.entries()),
          submissionId,
        }),
      });
      if (response.ok) {
        setState('received');
        return;
      }
    } catch {
      // Network failure: fall through to the email fallback.
    }
    openEmailFallback(data);
    setState('email-opened');
  }

  if (state === 'received') {
    return (
      <div
        id="next-step"
        className="space-y-6 rounded-[2rem] border border-greenglow/30 bg-greenglow/10 p-7"
        role="status"
      >
        <h2 className="text-3xl font-semibold text-white">
          Your project request is in.
        </h2>
        <p className="text-slate-200">
          We received your details and will reply from {siteConfig.email}.
          Reference: <span className="font-mono text-sm">{submissionId}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <BookingModal
            className="rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:bg-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
            label="Book a free consultation"
          />
          <a
            className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white"
            href={`tel:${siteConfig.phone}`}
          >
            Call {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  if (state === 'email-opened') {
    return (
      <div
        id="next-step"
        className="space-y-6 rounded-[2rem] border border-greenglow/30 bg-greenglow/10 p-7"
        role="status"
      >
        <h2 className="text-3xl font-semibold text-white">
          Finish sending your email.
        </h2>
        <p className="text-slate-200">
          Your email app should open with your project details. Press Send there
          to deliver your inquiry. If it did not open, contact us directly.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            className="rounded-full bg-white px-5 py-3 font-semibold text-black"
            href={`mailto:${siteConfig.email}`}
          >
            Email us directly
          </a>
          <a
            className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white"
            href={`tel:${siteConfig.phone}`}
          >
            Call {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8"
      aria-describedby="form-status"
    >
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-200">
          Name *
          <input
            className={fieldClass}
            name="name"
            required
            autoComplete="name"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Email *
          <input
            className={fieldClass}
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Company
          <input
            className={fieldClass}
            name="company"
            autoComplete="organization"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Service *
          <select
            className={fieldClass}
            name="service"
            required
            defaultValue={initialService}
          >
            <option value="" disabled>
              Select one
            </option>
            {services.map((service) => (
              <option key={service}>{service}</option>
            ))}
            <option>Something else / not sure yet</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Investment range *
          <select className={fieldClass} name="budget" required defaultValue="">
            <option value="" disabled>
              Select range
            </option>
            <option>Under $1,000</option>
            <option>$1,000–$2,500</option>
            <option>$2,500–$5,000</option>
            <option>$5,000–$10,000</option>
            <option>$10,000+</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-200">
          Target timeline
          <input
            className={fieldClass}
            name="timeline"
            placeholder="Example: 30–45 days"
          />
        </label>
      </div>
      <label className="space-y-2 text-sm text-slate-200">
        What must this system accomplish? *
        <textarea
          className={fieldClass}
          name="goals"
          minLength={20}
          rows={6}
          required
          placeholder="Describe the business problem, users, desired outcome, and required integrations."
        />
      </label>
      <fieldset className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:grid-cols-2">
        <legend className="px-2 text-sm text-slate-200">
          Discounts and payment
        </legend>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-200">
          <input
            type="checkbox"
            name="veteranDiscount"
            value="yes"
            defaultChecked={initialVeteran}
            className="mt-1 h-4 w-4 accent-greenglow"
          />
          <span>
            I&apos;m a veteran or my business is veteran-owned ({veteranPercent}
            % off).
            <span className="block text-xs text-slate-400">
              We&apos;ll email you how to verify. Please don&apos;t attach
              documents here.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-200">
          <input
            type="checkbox"
            name="paymentPlan"
            value="deposit"
            defaultChecked={initialDeposit}
            className="mt-1 h-4 w-4 accent-greenglow"
          />
          <span>
            I&apos;d like to start with a 30% deposit.
            <span className="block text-xs text-slate-400">
              Builds from $1,000. Pay-over-time is also offered at checkout.
            </span>
          </span>
        </label>
      </fieldset>
      <label
        className="space-y-2 text-sm text-slate-200"
        htmlFor="promotion-code"
      >
        76ers fan offer code (optional)
        <input
          className={fieldClass}
          id="promotion-code"
          name="promotionCode"
          defaultValue={initialPromotionCode}
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={state === 'invalid-promotion'}
          aria-describedby="promotion-code-help promotion-code-error"
        />
        <span
          id="promotion-code-help"
          className="block text-xs leading-5 text-slate-400"
        >
          Enter YOBUL if you are a Philadelphia 76ers fan. The code is attached
          to your quote request.
        </span>
        <span
          id="promotion-code-error"
          className="block min-h-5 text-xs text-red-300"
          role={state === 'invalid-promotion' ? 'alert' : undefined}
        >
          {state === 'invalid-promotion'
            ? 'That code is not recognized. Check it and try again.'
            : ''}
        </span>
      </label>
      <button
        className="rounded-full bg-gradient-to-r from-redglow via-white to-greenglow p-[1px] disabled:opacity-60"
        type="submit"
        disabled={state === 'sending'}
      >
        <span className="block rounded-full bg-black px-6 py-4 font-semibold uppercase tracking-[0.16em] text-white">
          {state === 'sending' ? 'Sending…' : 'Submit Build Request'}
        </span>
      </button>
      <p id="form-status" className="sr-only" aria-live="polite">
        {state === 'sending'
          ? 'Sending your project request.'
          : 'Complete the project intake form.'}
      </p>
    </form>
  );
}
