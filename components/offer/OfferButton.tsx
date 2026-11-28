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
    variant === 'primary' ? 'pill-primary' : 'pill-glass',
    size === 'sm' ? 'min-h-10 px-4 text-xs' : 'min-h-12 px-6 text-sm',
    className,
  );
}

export function OfferButtonDot() {
  return <span aria-hidden="true" className="pulse-dot" />;
}

/**
 * The primary glow pill: white pill, void text, emerald ready dot. The same
 * words appear in the ad, the page header, the hero, the phone bar and the
 * closing section.
 */
export function OfferButton({
  href,
  label,
  size = 'md',
  variant = 'primary',
  className,
  track,
}: OfferButtonStyle & {
  href: string;
  label: string;
  /** Picked up by an enclosing <TrackEvents> (first-party, no PII). */
  track?: { event: string; product?: string; source?: string };
}) {
  return (
    <Link
      href={href}
      className={offerButtonClass({ size, variant, className })}
      data-track={track?.event}
      data-track-product={track?.product}
      data-track-source={track?.source}
    >
      {variant === 'primary' && <OfferButtonDot />}
      {label}
    </Link>
  );
}
