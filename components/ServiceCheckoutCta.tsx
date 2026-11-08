import { BookingModal } from '@/components/BookingModal';
import { Button } from '@/components/ui';
import type { Service } from '@/lib/services';

/** True when the item has a Stripe link (not the intake-form fallback). */
export const hasCheckout = (url: string) => url.startsWith('https://');

/** Checkout call to action shown on every service page. */
export function ServiceCheckoutCta({
  service,
  heading = 'Ready to start?',
}: {
  service: Pick<
    Service,
    'name' | 'price' | 'checkoutUrl' | 'monthly' | 'yearly' | 'deposit'
  >;
  heading?: string;
}) {
  const live = hasCheckout(service.checkoutUrl);
  const billing = service.monthly
    ? ', billed monthly'
    : service.yearly
      ? ', billed yearly'
      : '';

  return (
    <div className="grid gap-8 rounded-3xl border border-greenglow/25 bg-greenglow/[0.06] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-greenglow">
          {service.name}
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{heading}</h2>
        <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
          {service.price}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {live
            ? `Secure checkout through Stripe${billing}.`
            : 'Send a request and we will reply with checkout.'}{' '}
          {service.deposit &&
            `Or start with a ${service.deposit.percent}% deposit of ${service.deposit.amount}. `}
          A written scope confirms final deliverables before work begins.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          href={service.checkoutUrl}
          glow="green"
          aria-label={`${live ? 'Buy' : 'Request'} ${service.name}, ${service.price}`}
        >
          {live ? 'Buy now' : 'Request'}
        </Button>
        {service.deposit && (
          <Button
            href={service.deposit.href}
            variant="outline"
            aria-label={`Pay a ${service.deposit.percent}% deposit of ${service.deposit.amount} for ${service.name}`}
          >
            Pay {service.deposit.amount} deposit
          </Button>
        )}
        <BookingModal
          label="Free consultation"
          className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenglow/50"
        />
      </div>
    </div>
  );
}
