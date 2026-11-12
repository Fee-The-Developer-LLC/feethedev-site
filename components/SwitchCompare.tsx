'use client';

import { useId, useState } from 'react';
import type { OwnYourPlan } from '@/lib/switch';
import { totalOver, vagaro, vagaroMonthly } from '@/lib/switch';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: n % 1 ? 2 : 0,
  }).format(n);

/**
 * Side-by-side cost over one and two years: Vagaro's subscription vs the
 * Own Your .com plan for the same team. Plans come in from the server so
 * prices always match the pricing catalog.
 */
export function SwitchCompare({ plans }: { plans: OwnYourPlan[] }) {
  const uid = useId();
  const [calendars, setCalendars] = useState(1);
  const [website, setWebsite] = useState(true);

  const plan = plans[Math.min(calendars, plans.length) - 1];
  const vMonthly = vagaroMonthly(calendars, website);
  const rows = [12, 24].map((months) => ({
    months,
    vagaro: totalOver(months, vMonthly),
    ours: totalOver(months, plan.monthly, plan.once),
  }));

  return (
    <div className="glass-panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <label
          htmlFor={`${uid}-cal`}
          className="text-sm font-semibold text-white"
        >
          People taking appointments
        </label>
        <div className="mt-3 flex items-center gap-4">
          <input
            id={`${uid}-cal`}
            type="range"
            min={1}
            max={plans.length}
            value={calendars}
            onChange={(e) => setCalendars(Number(e.target.value))}
            className="w-full accent-greenglow"
            aria-valuetext={`${calendars} ${calendars === 1 ? 'person' : 'people'}`}
          />
          <output
            htmlFor={`${uid}-cal`}
            className="w-10 text-right text-2xl font-extrabold tabular-nums text-white"
          >
            {calendars}
          </output>
        </div>
        <label className="mt-6 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={website}
              onChange={(e) => setWebsite(e.target.checked)}
              className="h-4 w-4 accent-greenglow"
            />
            I use (or need) Vagaro&apos;s website builder
          </span>
          <span className="tabular-nums text-slate-400">
            ~{usd(vagaro.websiteEstimate)}/mo
          </span>
        </label>
        <p className="mt-6 text-sm leading-6 text-slate-300">
          Your plan:{' '}
          <span className="font-semibold text-white">{plan.name}</span>,{' '}
          {plan.startingAt ? 'from ' : ''}
          {usd(plan.once)} once, then {usd(plan.monthly)} a month for hosting.
        </p>
      </div>

      <div aria-live="polite">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Cost over one and two years, Vagaro compared with {plan.name}
          </caption>
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-400">
              <th scope="col" className="py-3 font-semibold">
                Total paid
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Vagaro, est.
              </th>
              <th
                scope="col"
                className="py-3 text-right font-semibold text-greenglow"
              >
                Own Your .com
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.months} className="border-b border-white/10">
                <th scope="row" className="py-4 font-semibold text-white">
                  {r.months === 12 ? 'First year' : 'Two years'}
                </th>
                <td className="py-4 text-right text-lg tabular-nums text-slate-200">
                  {usd(r.vagaro)}
                </td>
                <td className="py-4 text-right text-lg font-extrabold tabular-nums text-white">
                  {plan.startingAt ? 'from ' : ''}
                  {usd(r.ours)}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="py-4 font-semibold text-white">
                Each month after
              </th>
              <td className="py-4 text-right tabular-nums text-slate-200">
                {usd(vMonthly)}
              </td>
              <td className="py-4 text-right font-extrabold tabular-nums text-white">
                {usd(plan.monthly)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          Vagaro: subscription from its published US pricing, checked{' '}
          {vagaro.checked}; website builder estimated. Card processing is
          excluded on both sides.
        </p>
      </div>
    </div>
  );
}
