'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export type ShelfProduct = {
  slug: string;
  name: string;
  blurb: string;
  price: string;
  href: string;
  buy: { label: string; href: string } | null;
};

export type ShelfLine = {
  id: string;
  name: string;
  summary: string;
  products: ShelfProduct[];
};

export function ProductTabs({ lines }: { lines: ShelfLine[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const line = lines[active];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = lines.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  if (!line) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product lines"
        onKeyDown={onKeyDown}
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {lines.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow',
                selected
                  ? 'border-transparent bg-silver text-background shadow-electric'
                  : 'border-white/15 bg-background/60 text-slate-300 backdrop-blur hover:border-white/30 hover:text-white',
              )}
            >
              {item.name}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[0.7rem] tabular-nums',
                  selected
                    ? 'bg-background/10 text-background'
                    : 'bg-white/10 text-slate-400',
                )}
              >
                {item.products.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${line.id}`}
        className="mt-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-base leading-7 text-slate-300">
            {line.summary}
          </p>
          <Link
            href={`/services#${line.id}`}
            className="shrink-0 text-sm font-semibold text-cyan underline-offset-4 hover:text-white hover:underline"
          >
            All {line.name.toLowerCase()} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {line.products.map((product) => (
            <li key={product.slug}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/85 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-electric/40 hover:shadow-[0_24px_60px_-28px_rgba(37,120,255,0.6)] motion-reduce:hover:translate-y-0">
                <span
                  aria-hidden="true"
                  className="h-px w-full bg-gradient-to-r from-electric/0 via-electric/70 to-greenglow/0 opacity-60 transition group-hover:opacity-100"
                />
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xl font-extrabold tabular-nums text-greenglow">
                    {product.price}
                  </p>
                  <h3 className="mt-3 text-lg font-extrabold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                    {product.blurb}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {product.buy && (
                      <Link
                        href={product.buy.href}
                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-silver px-4 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-background transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-[#0FAF86]"
                        />
                        {product.buy.label}
                      </Link>
                    )}
                    <Link
                      href={product.href}
                      aria-label={`${product.name} details`}
                      className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-silver transition hover:border-white/35 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
