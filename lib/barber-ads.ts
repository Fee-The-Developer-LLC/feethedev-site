/**
 * Home page barber ad reel: one vertical (9:16) ad per barber product.
 *
 * Hooks, names, prices and button words come from `lib/pricing-catalog.json`
 * through `lib/services.ts`, so a price change never forces a re-render and
 * nothing price-related is burned into the footage.
 *
 * Footage: drop each finished ad at `public/media/barber-ads/<slug>.mp4`
 * (H.264, 9:16, muted-safe, under ~4 MB) with a matching `<slug>.webp`
 * poster, then set `video: true` below. Until then the slot shows a dark branded
 * screen with the hook and an honest "Ad in production" label, no stock art.
 *
 * These ads show people. Before `video` flips to true, record either the
 * talent release for a real barber or, for AI-generated people, keep
 * `aiGenerated: true` so the slot carries the AI-generated label. Never
 * present a generated person as a real client or testimonial.
 */
export type BarberAd = {
  /** Catalog slug the ad sells. */
  slug: string;
  /** Who the ad speaks to, shown as the eyebrow. */
  audience: string;
  /** True once `<slug>.mp4` and `<slug>.webp` are committed. */
  video: boolean;
  /** True when anyone on screen is AI-generated. */
  aiGenerated: boolean;
};

export const barberAdsPath = '/media/barber-ads';

export const barberAds: BarberAd[] = [
  {
    slug: 'own-your-bookings',
    audience: 'Solo barbers',
    video: false,
    aiGenerated: true,
  },
  {
    slug: 'own-your-bookings-plus',
    audience: 'Barbers tired of no-shows',
    video: false,
    aiGenerated: true,
  },
  {
    slug: 'shop-bundle',
    audience: 'Shop owners',
    video: false,
    aiGenerated: true,
  },
];
