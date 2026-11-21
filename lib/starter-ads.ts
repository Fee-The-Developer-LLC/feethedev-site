/**
 * Own Your .com ad reel: one vertical (9:16) ad per Starter Sites product,
 * aimed at small businesses and sole proprietors of every kind.
 *
 * Hooks, names, prices and button words come from `lib/pricing-catalog.json`
 * through `lib/services.ts`, so a price change never forces a re-render and
 * nothing price-related is burned into the footage.
 *
 * Footage: drop each finished ad at `public/media/starter-ads/<slug>.mp4`
 * (H.264, 9:16, muted-safe, under ~4 MB) with a matching `<slug>.webp`
 * poster, then set `video: true` below. Until then the slot shows a dark branded
 * screen with the hook and an honest "Ad in production" label, no stock art.
 *
 * These ads show people. Before `video` flips to true, record either the
 * talent release for a real person or, for AI-generated people, keep
 * `aiGenerated: true` so the slot carries the AI-generated label. Never
 * present a generated person as a real client or testimonial.
 */
export type StarterAd = {
  /** Catalog slug the ad sells. */
  slug: string;
  /** Who the ad speaks to, shown as the eyebrow. */
  audience: string;
  /** True once `<slug>.mp4` and `<slug>.webp` are committed. */
  video: boolean;
  /** True when anyone on screen is AI-generated. */
  aiGenerated: boolean;
};

export const starterAdsPath = '/media/starter-ads';

export const starterAds: StarterAd[] = [
  {
    slug: 'own-your-bookings',
    audience: 'Sole proprietors, musicians, realtors, barbers and solo pros',
    video: false,
    aiGenerated: true,
  },
  {
    slug: 'own-your-bookings-plus',
    audience: 'Anyone tired of no-shows',
    video: false,
    aiGenerated: true,
  },
  {
    slug: 'shop-bundle',
    audience: 'Shops, studios and LLCs with a team',
    video: false,
    aiGenerated: true,
  },
];
