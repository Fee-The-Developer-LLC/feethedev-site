'use client';

import { motion } from 'framer-motion';
import { Body, H2, Section } from '@/components/ui';
import { BookingModal } from '@/components/BookingModal';

const bookingSteps = [
  ['01', 'Choose a time', 'See live availability in Google Calendar.'],
  [
    '02',
    'Share the essentials',
    'Add the context we need for a useful conversation.',
  ],
  [
    '03',
    'Meet on Google',
    'Your confirmation includes the appointment details.',
  ],
] as const;

export function BookingSection() {
  return (
    <Section id="book" className="relative overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080c12] shadow-[0_28px_100px_rgba(0,0,0,0.45)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(66,133,244,0.18),transparent_32%),radial-gradient(circle_at_12%_90%,rgba(52,168,83,0.13),transparent_32%)]" />

        <div className="relative grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              <span className="h-2 w-2 rounded-full bg-[#4285f4] shadow-[0_0_16px_rgba(66,133,244,0.9)]" />
              Free 15-minute consultation
            </div>
            <H2 className="mt-6 max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
              Book a free 15-minute consultation.
            </H2>
            <Body className="mt-5 max-w-2xl text-lg text-slate-300">
              Pick an available time to talk through your website, software,
              automation, or online presence. There is no cost and no deposit.
            </Body>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <BookingModal
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-electric to-greenglow px-6 py-3 text-sm font-bold uppercase tracking-[0.13em] text-[#05070b] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                label="Book free consultation"
              />
            </div>
          </div>

          <div className="relative border-t border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  What to expect
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Three quick steps
                </div>
              </div>
              <div
                aria-hidden="true"
                className="grid h-12 w-12 grid-cols-2 gap-1 rounded-xl bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                <span className="rounded-sm bg-[#4285f4]" />
                <span className="rounded-sm bg-[#ea4335]" />
                <span className="rounded-sm bg-[#fbbc04]" />
                <span className="rounded-sm bg-[#34a853]" />
              </div>
            </div>

            <ol className="space-y-6">
              {bookingSteps.map(([number, title, detail]) => (
                <li key={number} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="font-mono text-xs tracking-[0.18em] text-greenglow">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
