/**
 * 8-second buy cuts: one storyboard per featured product.
 *
 * Each cut is one Google Flow clip (Frames mode, start still -> end still,
 * 9:16, 8 s) layered with a 3D product render, and it always ends on a buy
 * call to action. Prices, names, URLs and button words are never generated
 * into the footage: overlays come from `lib/pricing-catalog.json` through
 * `ctaLabel()`, so a price change never forces a re-render.
 *
 * Flow slot names follow the FTD pack rule `FTD-<slot> <name>`:
 *   K = start frame (still, 9:16, free)   E = end frame (still, 9:16, free)
 *   L = 3D layer (still, 1:1, free)       Q = 8 s clip (credits)
 *
 * Media lands in `public/media/products/<slug>/` as `start.webp`, `end.webp`
 * (the poster), `layer.webp` and `cut.mp4`. Set `media` once those files are
 * committed; until then the page shows the 3D layer only, never an empty
 * player.
 *
 * Generated footage shows no people, so no likeness, consent or casting
 * question applies. Every published clip carries the AI-generated label.
 */
import { ctaLabel, getCatalogItem } from '@/lib/catalog';

export type StoryBeat = {
  /** Seconds, inclusive start and exclusive end, inside the 8 s clip. */
  at: [number, number];
  /** What the viewer sees. */
  visual: string;
  /** Burned-in caption added in post (never generated). */
  overlay: string | null;
};

export type ProductStory = {
  slug: string;
  /** Flow slot number shared by K, E, L and Q, e.g. "01". */
  slot: string;
  /** Hook line; must match the catalog campaign hook when one exists. */
  hook: string;
  /** Short proof line for the middle beat. */
  proof: string;
  /** Flow prompts, pasted after the style lock rules in `flowRules`. */
  prompts: {
    start: string;
    end: string;
    /** null = reuse the named library asset as the 3D layer. */
    layer: string | null;
    clip: string;
  };
  /** Library asset (public/library) used as the 3D layer until L lands. */
  layerFallback: { src: string; alt: string };
  beats: StoryBeat[];
  /** Set to true once the four media files are committed. */
  media: boolean;
};

/** Pasted at the end of every still prompt (FTD style lock, short form). */
export const flowStyleLock =
  'Dark systems-console lighting with selective electric-blue (#2578FF) and green (#14E8B4) glow and thin red, green and blue rim lights, near-black (#05070B) and tonal navy, black glass and brushed chrome, crisp premium commercial look, shallow depth of field, calm and precise, never excessive neon. No people. No text, letters, numbers, logos, signage, watermarks; no readable words on screens.';

/** End frames leave room for the end card. */
export const flowEndFrameRule =
  'Vertical 9:16. The object sits in the lower 60% of the frame; the top 35% is clean, empty near-black space for an end card.';

export const flowClipRules =
  'Frames mode, start = K still, end = E still, 9:16, 8 seconds, 720p, one take. Audio: soft room tone and one clean tactile click on the final settle, no music, no dialogue. No text, no subtitles, no logos.';

const stories: ProductStory[] = [
  {
    slug: 'own-your-bookings',
    slot: '01',
    hook: 'Your clients should book you, not an app.',
    proof: 'Your .com · Your booking page · Stripe checkout',
    prompts: {
      start:
        'Vertical photo of an empty barber chair in a dark barbershop at night under one pool of light. In the foreground a smartphone lies face-up on a polished black counter, its screen a soft blank white glow reflecting in the chrome. Thin electric-blue light rails run along the mirrors.',
      end: 'Vertical 3D product render: a glossy black smartphone floating upright in black space, its screen a soft blank glow, with a small glass calendar tile and a black payment card with a green check mark orbiting close to it.',
      layer:
        'Glossy 3D render of a smartphone with a glowing blank booking screen and a small glass calendar tile popping out of it, floating in black space, square frame, subject centered with even margins.',
      clip: 'Slow push-in on the phone on the counter. The phone lifts off the counter and rises toward camera while the barbershop dissolves into black space. A glass calendar tile and a black payment card with a green check mark slide out from behind the screen and settle into a slow orbit around it, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/payment-card-with-check-mark-31acfea4.webp',
      alt: 'A payment card with a green check mark',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Empty chair, phone glowing on the counter',
        overlay: 'Your clients should book you, not an app.',
      },
      {
        at: [2, 6],
        visual: 'Phone rises, shop dissolves, calendar and card slide out',
        overlay: 'Your .com · Your booking page · Stripe checkout',
      },
      {
        at: [6, 8],
        visual: 'Phone settles with calendar and card in orbit',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'own-your-bookings-plus',
    slot: '02',
    hook: 'An empty chair is money you already counted.',
    proof: 'Deposits paid at checkout, before they sit down',
    prompts: {
      start:
        'Vertical photo of an empty salon styling chair at night under a single pool of light, a round wall clock soft in the background, a smartphone face-up on the black stone station glowing softly.',
      end: 'Vertical 3D product render: a floating glass calendar grid with several cells glowing green, and in front of it a black payment card with a green check mark, turned slightly toward camera, in black space.',
      layer:
        'Glossy 3D render of a floating glass calendar grid with a few cells glowing green, in black space, square frame, subject centered with even margins.',
      clip: 'Slow orbit around the phone on the station. Its glow rises off the screen into a floating glass calendar grid; the squares fill green one by one. A black payment card turns into frame in front and its green check pulses once as the salon fades to black space, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/payment-card-with-check-mark-31acfea4.webp',
      alt: 'A payment card with a green check mark',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Empty styling chair, clock, phone glowing',
        overlay: 'An empty chair is money you already counted.',
      },
      {
        at: [2, 6],
        visual: 'Calendar grid blooms and fills green',
        overlay: 'Deposits paid at checkout, before they sit down',
      },
      {
        at: [6, 8],
        visual: 'Payment card check pulses, settles',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'shop-bundle',
    slot: '03',
    hook: 'One site for the shop. A page for every chair.',
    proof: 'A booking page for every barber',
    prompts: {
      start:
        'Vertical photo looking down a long row of empty barber chairs in a barbershop at night, reflected in the mirrors, thin electric-blue light rails running along the mirror edges.',
      end: 'Vertical 3D product render: a chrome map pin hovering above a glowing miniature barbershop storefront, with four small glass cards fanned in an arc around it, each holding a thin green button of light.',
      layer: null,
      clip: 'Slow dolly down the row of chairs. The room pulls away and shrinks into a glowing miniature storefront in black space; a chrome map pin drops above it and four glass cards fan out in an arc around it, one per chair, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/chrome-map-pin-above-storefront-ef4ca26c.webp',
      alt: 'A chrome map pin above a storefront',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Row of empty chairs in the mirrors',
        overlay: 'One site for the shop. A page for every chair.',
      },
      {
        at: [2, 6],
        visual: 'Shop shrinks to a miniature, pin drops',
        overlay: 'A booking page for every barber',
      },
      {
        at: [6, 8],
        visual: 'Four glass cards fanned around the shop',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'website-launch',
    slot: '04',
    hook: 'First impressions happen before the first visit.',
    proof: 'Mobile first · Payments built in · Tested before launch',
    prompts: {
      start:
        'Vertical photo of a restaurant storefront at night seen from the wet street, warm light inside, the glass door closed, a blank dark sign panel above the door, reflections on the pavement.',
      end: 'Vertical 3D product render: a tall black-glass web page assembled from floating glass panels holding soft, unreadable blocks of light, with a smartphone beside it showing the same glowing page.',
      layer: null,
      clip: 'Slow push toward the glass door. The reflections in the door break into glass panels that fly out of the dark and lock together, one by one, into a tall glowing page with a soft click of light, as a smartphone slides in beside it, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/floating-browser-window-glowing-960a9dfc.webp',
      alt: 'A glowing browser window',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Storefront at night, door closed',
        overlay: 'First impressions happen before the first visit.',
      },
      {
        at: [2, 6],
        visual: 'Glass panels fly in and lock into a page',
        overlay: 'Mobile first · Payments built in · Tested before launch',
      },
      {
        at: [6, 8],
        visual: 'Page and phone glowing side by side',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'digital-presence-bundle',
    slot: '05',
    hook: 'You do great work. The problem is being found.',
    proof: 'Your website, plus the profiles customers search first',
    prompts: {
      start:
        'Vertical photo of an empty auto repair garage bay at night, roll-up door open to a quiet dark street, a wrench resting on a clean workbench under one work light.',
      end: 'Vertical 3D product render: a chrome map pin above a glowing miniature storefront, with three glass tiles floating in a row above it, glowing red, green and blue, each joined to the storefront by a thin line of light.',
      layer: null,
      clip: 'The camera pulls back out of the garage door and rises into the night until the street becomes a dark miniature. A chrome map pin drops onto the garage and three rings of light ripple outward; three glass tiles light up red, green and blue and connect to it with thin lines of light, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/chrome-map-pin-above-storefront-ef4ca26c.webp',
      alt: 'A chrome map pin above a storefront',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Empty garage bay, quiet street',
        overlay: 'You do great work. The problem is being found.',
      },
      {
        at: [2, 6],
        visual: 'Camera rises, pin drops, rings ripple',
        overlay: 'Your website, plus the profiles customers search first',
      },
      {
        at: [6, 8],
        visual: 'Three profile tiles connected to the shop',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'full-business-system',
    slot: '06',
    hook: 'At some point the business needs a system, not more tools.',
    proof: 'Website, presence, automation and integrations, connected',
    prompts: {
      start:
        'Vertical photo of a cluttered dark desk at night: loose paper stacks, sticky notes, three phones and an open laptop all glowing, tangled cables, a cold cup of coffee. Nothing on any page or screen is readable.',
      end: 'Vertical 3D product render: a glowing neural core ringed by small chrome gears, connected by thin red, green and blue light rails to four floating glass panels in an orderly orbit: a web page, a calendar grid, a dashboard and a payment card.',
      layer: null,
      clip: 'The clutter lifts off the desk in slow motion. Papers, phones and the laptop turn into glass panels that drift into an orderly orbit and snap onto thin light rails around a glowing core ringed by chrome gears, as the desk falls away into black space, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/gears-surrounding-glowing-neural-55c25d43.webp',
      alt: 'Gears around a glowing network core',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Cluttered desk, too many tools',
        overlay: 'At some point the business needs a system, not more tools.',
      },
      {
        at: [2, 6],
        visual: 'Clutter lifts and becomes glass panels',
        overlay: 'Website, presence, automation and integrations, connected',
      },
      {
        at: [6, 8],
        visual: 'Panels in orbit around one core',
        overlay: null,
      },
    ],
    media: false,
  },
  {
    slug: 'ai-plugin-all-platforms',
    slot: '07',
    hook: 'The AI you already pay for should know your business.',
    proof: 'Claude · ChatGPT · Gemini · Microsoft 365 · GitHub',
    prompts: {
      start:
        'Vertical photo of an open laptop on a dark desk at night, its screen a blank soft glow, beside a tall stack of business binders and an open notebook, thin electric-blue light rail along the desk edge.',
      end: 'Vertical 3D product render: a glowing glass plug seated in a socket of light, with five small chrome orbs orbiting it, each lit from inside, no symbols on them.',
      layer:
        'Glossy 3D render of a glowing glass plug connecting into a socket of light, in black space, square frame, subject centered with even margins.',
      clip: 'Slow push-in on the desk. Pages lift out of the binders as thin streams of light and pour into a glass plug that rises from the laptop; the plug slides into a socket of light with a soft click, and five small chrome orbs light up one by one and orbit it, ending exactly on the end frame.',
    },
    layerFallback: {
      src: '/library/graphics/glowing-code-brackets-on-cube-6b7f15f4.webp',
      alt: 'Glowing code brackets around a cube',
    },
    beats: [
      {
        at: [0, 2],
        visual: 'Laptop beside a stack of binders',
        overlay: 'The AI you already pay for should know your business.',
      },
      {
        at: [2, 6],
        visual: 'Pages stream as light into a glass plug',
        overlay: 'Claude · ChatGPT · Gemini · Microsoft 365 · GitHub',
      },
      {
        at: [6, 8],
        visual: 'Plug seated, five orbs lit',
        overlay: null,
      },
    ],
    media: false,
  },
];

export type BuyCut = ProductStory & {
  /** End card button words, from the catalog: "Own my bookings · $199". */
  cta: string;
  /** The only URL shown on the end card. */
  url: string;
  mediaPath: string;
};

/** Stories joined to the live catalog; a retired item drops out. */
export const buyCuts: BuyCut[] = stories.flatMap((story) => {
  const item = getCatalogItem(story.slug);
  if (!item) return [];
  return [
    {
      ...story,
      cta: ctaLabel(item),
      url: `feethedeveloper.com/services/${story.slug}`,
      mediaPath: `/media/products/${story.slug}`,
    },
  ];
});

export function getBuyCut(slug: string): BuyCut | undefined {
  return buyCuts.find((cut) => cut.slug === slug);
}
