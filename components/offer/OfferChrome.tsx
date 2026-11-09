import Image from 'next/image';
import Link from 'next/link';
import { OfferButton } from '@/components/offer/OfferButton';
import type { OfferAction } from '@/lib/services';

/** Offer-page header: the logo on the left, the one button on the right. */
export function OfferHeader({ action }: { action: OfferAction | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <Link href="/" aria-label="Fee The Developer home">
          <Image
            src="/brand/ftd-wordmark-header.webp"
            alt="Fee The Developer"
            width={250}
            height={112}
            priority
            className="h-10 w-auto"
          />
        </Link>
        {action && (
          <OfferButton
            href={action.href}
            label={action.label}
            size="sm"
            className="hidden sm:inline-flex"
          />
        )}
      </div>
    </header>
  );
}

/** Logo-only header for checkout and the welcome page. */
export function LogoHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-3 sm:px-8">
        <Link href="/" aria-label="Fee The Developer home">
          <Image
            src="/brand/ftd-wordmark-header.webp"
            alt="Fee The Developer"
            width={250}
            height={112}
            className="h-10 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}

/** Phone-only bar pinned to the bottom with the same button. */
export function OfferPhoneBar({ action }: { action: OfferAction }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 p-3 backdrop-blur-xl sm:hidden">
      <OfferButton href={action.href} label={action.label} className="w-full" />
    </div>
  );
}
