'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Offer and checkout pages carry their own one-button header, so the site
 * header steps aside there (storyboard: one action per offer page).
 */
export function HideOnOfferPages({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const offer = /^\/(services|checkout)\/[^/]+/.test(pathname);
  return offer ? null : children;
}
