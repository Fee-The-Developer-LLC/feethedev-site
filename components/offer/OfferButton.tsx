import Link from 'next/link';
import { cn } from '@/lib/utils';

type OfferButtonStyle = {
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary';
  className?: string;
};

/** Shared classes so non-Link triggers (the sign-up popup) match exactly. */
export function offerButtonClass({
  size = 'md',
  variant = 'primary',
  className,
}: OfferButtonStyle = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-extrabold uppercase transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow',
    size === 'sm'
      ? 'min-h-10 px-4 text-[0.7rem] tracking-[0.12em]'
      : 'min-h-12 px-6 text-sm tracking-[0.14em]',
    variant === 'primary'
      ? 'bg-silver text-background shadow-electric hover:bg-white'
      : 'border border-white/20 text-silver hover:bg-white/[0.08]',
    className,
  );
}

export function OfferButtonDot() {
  return (
    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#0FAF86]" />
  );
}

/**
 * The storyboard button: silver pill, black text, green ready dot. The same
 * words appear in the ad, the page header, the hero, the phone bar and the
 * closing section.
 */
export function OfferButton({
  href,
  label,
  size = 'md',
  variant = 'primary',
  className,
}: OfferButtonStyle & {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={offerButtonClass({ size, variant, className })}
    >
      {variant === 'primary' && <OfferButtonDot />}
      {label}
    </Link>
  );
}
