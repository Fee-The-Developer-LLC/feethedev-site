import type { PromiseStep } from '@/lib/orders/promises';

/** The order receipt summary, timeline, welcome video and contact block. */
export function OrderNextSteps({
  orderNumber,
  email,
  headline,
  steps,
  youDo,
  videoUrl,
  contact,
}: {
  orderNumber: string;
  email: string | null;
  headline: string | null;
  steps: PromiseStep[];
  youDo: string[];
  videoUrl: string | null;
  contact: {
    email: string;
    phone: string;
    phoneDisplay: string;
    bookingUrl: string;
  };
}) {
  return (
    <div className="mt-8 space-y-8">
      <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm">
        <div>
          <dt className="text-slate-400">Order number</dt>
          <dd className="mt-1 font-mono text-base font-semibold text-white">
            {orderNumber}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Receipt</dt>
          <dd className="mt-1 text-slate-200">
            {email ? `Emailed by Stripe to ${email}` : 'Emailed by Stripe'}
          </dd>
        </div>
      </dl>

      {videoUrl && (
        <figure>
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-2xl border border-white/10 bg-black"
          >
            <track kind="captions" />
          </video>
          <figcaption className="mt-2 text-sm text-slate-400">
            A welcome from King Fee: what you bought, what happens next and how
            to reach us. AI-generated from King Fee&apos;s own likeness and
            voice.
          </figcaption>
        </figure>
      )}

      <section aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-lg font-bold text-white">
          What happens next
        </h2>
        {headline && <p className="mt-2 text-slate-300">{headline}</p>}
        <ol className="mt-4 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-greenglow/15 text-sm font-bold text-greenglow"
              >
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-white">
                  {step.title}{' '}
                  <span className="font-normal text-slate-400">
                    · {step.when}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {youDo.length > 0 && (
        <section aria-labelledby="you-do">
          <h2 id="you-do" className="text-lg font-bold text-white">
            What we need from you
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {youDo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="contact"
        className="rounded-2xl border border-white/10 p-5 text-sm text-slate-300"
      >
        <h2 id="contact" className="font-bold text-white">
          Questions? A real person answers.
        </h2>
        <p className="mt-2">
          Email{' '}
          <a
            href={`mailto:${contact.email}`}
            className="font-semibold text-cyan underline"
          >
            {contact.email}
          </a>
          , call{' '}
          <a
            href={`tel:${contact.phone}`}
            className="font-semibold text-cyan underline"
          >
            {contact.phoneDisplay}
          </a>
          , or{' '}
          <a
            href={contact.bookingUrl}
            className="font-semibold text-cyan underline"
          >
            book a call
          </a>
          . Mention order {orderNumber}.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Payments are processed securely by Stripe. Fee The Developer never
          sees or stores your card number.
        </p>
      </section>
    </div>
  );
}
