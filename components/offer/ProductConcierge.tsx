'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState, type FormEvent } from 'react';
import type { ConciergeScript, ConciergeTopic } from '@/lib/concierge';
import { cn } from '@/lib/utils';

type Turn =
  | { id: number; from: 'visitor'; text: string }
  | { id: number; from: 'concierge'; topic: ConciergeTopic }
  | { id: number; from: 'handoff'; text: string };

type TurnInput = Turn extends infer T
  ? T extends Turn
    ? Omit<T, 'id'>
    : never
  : never;

/** Routes a typed question to the closest topic by keyword, or null. */
function matchTopic(
  topics: ConciergeTopic[],
  text: string,
): ConciergeTopic | null {
  const query = ` ${text.toLowerCase()} `;
  let best: { topic: ConciergeTopic; score: number } | null = null;
  for (const topic of topics) {
    const score = topic.keywords.reduce(
      (sum, keyword) => (query.includes(keyword) ? sum + keyword.length : sum),
      0,
    );
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}

/**
 * Text concierge for a product page. Answers come only from the script the
 * server built out of the pricing catalog; anything else is handed to King
 * Fee through the project form, so the panel never invents an answer.
 */
export function ProductConcierge({
  script,
  checkout,
}: {
  script: ConciergeScript;
  checkout: { href: string; label: string } | null;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const nextId = useRef(0);
  const logRef = useRef<HTMLOListElement>(null);
  const inputId = useId();

  const push = (...added: TurnInput[]) => {
    setTurns((current) => [
      ...current,
      ...added.map((turn) => ({ ...turn, id: nextId.current++ }) as Turn),
    ]);
    requestAnimationFrame(() => {
      const log = logRef.current;
      if (log) log.scrollTop = log.scrollHeight;
    });
  };

  const ask = (topic: ConciergeTopic) =>
    push(
      { from: 'visitor', text: topic.question },
      { from: 'concierge', topic },
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const topic = matchTopic(script.topics, text);
    push(
      { from: 'visitor', text },
      topic
        ? { from: 'concierge', topic }
        : {
            from: 'handoff',
            text: 'That one is best answered by King Fee himself. Send it through the project form and he answers it personally.',
          },
    );
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-panel/80 shadow-[0_0_0_1px_rgba(37,120,255,0.08)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-electric/40 bg-background">
          <Image
            src="/library/brand/autonomy-has-levels-badge.webp"
            alt=""
            fill
            sizes="44px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">FTD Concierge</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-greenglow"
            />
            Answers from our published price list
          </p>
        </div>
      </div>

      <ol
        ref={logRef}
        aria-live="polite"
        className="max-h-[26rem] space-y-4 overflow-y-auto px-5 py-5"
      >
        <li className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-[0.95rem] leading-7 text-slate-100">
          {script.greeting}
        </li>
        {turns.map((turn) =>
          turn.from === 'visitor' ? (
            <li
              key={turn.id}
              className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-electric/90 px-4 py-3 text-[0.95rem] leading-7 text-white"
            >
              {turn.text}
            </li>
          ) : turn.from === 'concierge' ? (
            <li
              key={turn.id}
              className="max-w-[90%] space-y-2 rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-[0.95rem] leading-7 text-slate-100"
            >
              {turn.topic.answer.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {turn.topic.list && (
                <ul className="space-y-1.5 pt-1">
                  {turn.topic.list.map((entry) => (
                    <li key={entry} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-greenglow"
                      />
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ) : (
            <li
              key={turn.id}
              className="max-w-[90%] space-y-3 rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-[0.95rem] leading-7 text-slate-100"
            >
              <p>{turn.text}</p>
              <Link
                href={script.fallbackHref}
                className="inline-block font-semibold text-greenglow underline underline-offset-4 hover:text-white"
              >
                Ask King Fee
              </Link>
            </li>
          ),
        )}
      </ol>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {script.topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => ask(topic)}
              className="rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-electric hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
            >
              {topic.question}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label htmlFor={inputId} className="sr-only">
            Ask the concierge about {script.productName}
          </label>
          <input
            id={inputId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Ask about ${script.productName}`}
            maxLength={200}
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-background px-4 text-sm text-white placeholder:text-slate-500 focus:border-electric focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full bg-electric px-5 text-sm font-bold text-white transition hover:bg-[#3b88ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
          >
            Ask
          </button>
        </form>
        {checkout && (
          <Link
            href={checkout.href}
            className={cn(
              'mt-4 flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-silver text-sm font-extrabold uppercase tracking-[0.14em] text-background transition hover:bg-white',
            )}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#0FAF86]"
            />
            {checkout.label}
          </Link>
        )}
      </div>
    </div>
  );
}
