import { showroomSites, type ShowroomSite } from '@/lib/showroom';

/**
 * "See what we've built" on the booking product pages (issue #43).
 *
 * One config feeds both Own Your Bookings and Own Your Bookings Plus. Each
 * entry points at a showroom site (name, domain, capture and status come
 * from `lib/showroom.ts`) and adds the role and one-line value statement.
 * Statements describe what each site actually does today: Aaron takes
 * booking requests, Marcus takes inquiries (no completed checkout claimed),
 * Fee The Producer takes production inquiries (not appointment checkout).
 */
export type BookingShowcaseItem = ShowroomSite & {
  role: string;
  value: string;
};

const featured: { id: string; role: string; value: string }[] = [
  {
    id: 'aaron-draper',
    role: 'Touring musician',
    value: 'Performance media, credentials and booking requests in one place.',
  },
  {
    id: 'marcus-jones',
    role: 'Drummer and educator',
    value: 'Lessons, studio sessions and live-performance inquiries.',
  },
  {
    id: 'fee-the-producer',
    role: 'Creative production',
    value: 'Catalog, merchandise and production inquiries.',
  },
];

export const bookingShowcase: BookingShowcaseItem[] = featured.flatMap(
  (entry) => {
    const site = showroomSites.find((item) => item.id === entry.id);
    return site ? [{ ...site, role: entry.role, value: entry.value }] : [];
  },
);

/** Product pages that show the showcase, with their contextual CTA words. */
export const bookingShowcaseCta: Record<string, string> = {
  'own-your-bookings': 'Build my booking site',
  'own-your-bookings-plus': 'Get Booking Plus',
};

export const bookingShowcaseScopeNote =
  'Featured projects demonstrate our wider development work. Own Your Bookings and Plus include only the features listed in each package; custom features are separately scoped.';
