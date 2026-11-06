const defaultSiteUrl = 'https://feethedeveloper.com';
const defaultBookingUrl = 'https://calendar.app.google/rEzR9K3wUQYivMjn8';
const approvedBookingHosts = new Set([
  'calendar.app.google',
  'calendar.google.com',
]);
const approvedDepositHosts = new Set(['buy.stripe.com']);

function getSiteUrl(value: string | undefined): string {
  if (!value?.trim()) return defaultSiteUrl;

  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.origin;
    }
  } catch {
    // Fall back to the canonical URL when the environment value is malformed.
  }

  return defaultSiteUrl;
}

function getBookingUrl(value: string | undefined): string {
  if (!value?.trim()) return defaultBookingUrl;

  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' && approvedBookingHosts.has(url.hostname)) {
      return url.toString();
    }
  } catch {
    // Fall back to the approved Google Calendar booking page.
  }

  return defaultBookingUrl;
}

function getDepositUrl(value: string | undefined): string {
  if (!value?.trim()) return '/start#next-step';

  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' && approvedDepositHosts.has(url.hostname)) {
      return url.toString();
    }
  } catch {
    // Fall back to the internal next step when the payment URL is malformed.
  }

  return '/start#next-step';
}

function getCommunityUrl(
  value: string | undefined,
  approvedHosts: ReadonlySet<string>,
): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' && approvedHosts.has(url.hostname)) {
      return url.toString();
    }
  } catch {
    // Keep invalid or unapproved destinations unavailable.
  }

  return null;
}

export const siteConfig = {
  name: 'Fee The Developer',
  legalName: 'Fee The Developer LLC',
  description:
    'Veteran-owned web design, software, automation, and digital business presence company helping businesses launch strong across the web, Google, Apple, Yelp, and connected business systems.',
  siteUrl: getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  email: 'contact@feethedeveloper.com',
  phone: '+12144400022',
  phoneDisplay: '(214) 440-0022',
  bookingUrl: getBookingUrl(process.env.NEXT_PUBLIC_BOOKING_URL),
  depositUrl: getDepositUrl(process.env.NEXT_PUBLIC_DEPOSIT_URL),
  location: 'Texas, United States',
  services: [
    'Website design and development',
    'Google Business Profile setup and verification support',
    'Apple Business Connect setup',
    'Yelp business profile setup',
    'AI workflow automation',
    'Custom software development',
    'Business presence systems',
    'API integrations',
    'Payments and back-end integration',
  ],
  stack: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'AI integrations'],
  googleProducts: [
    {
      name: 'Workspace',
      detail: 'Calendar, Docs, Sheets, Drive, Meet, and shared team workflows.',
      url: '#',
    },
    {
      name: 'Gemini + AI',
      detail: 'Practical assistance for research, creation, and automation.',
      url: '#',
    },
    {
      name: 'Search + Maps',
      detail: 'Discovery and local presence connected to your business.',
      url: '#',
    },
  ],
  communities: [
    {
      name: 'YouTube',
      description:
        'Build breakdowns, product walkthroughs, and practical lessons.',
      action: 'Subscribe on YouTube',
      url: getCommunityUrl(
        process.env.NEXT_PUBLIC_YOUTUBE_URL,
        new Set(['youtube.com', 'www.youtube.com', 'youtu.be']),
      ),
    },
    {
      name: 'Instagram',
      description: 'Studio updates, works in progress, and launch moments.',
      action: 'Follow on Instagram',
      url: getCommunityUrl(
        process.env.NEXT_PUBLIC_INSTAGRAM_URL,
        new Set(['instagram.com', 'www.instagram.com']),
      ),
    },
    {
      name: 'LinkedIn',
      description:
        'Company updates, business systems, and professional insights.',
      action: 'Follow on LinkedIn',
      url: getCommunityUrl(
        process.env.NEXT_PUBLIC_LINKEDIN_URL,
        new Set(['linkedin.com', 'www.linkedin.com']),
      ),
    },
    {
      name: 'Community',
      description:
        'A direct space for announcements, collaboration, and support.',
      action: 'Join the community',
      url: getCommunityUrl(
        process.env.NEXT_PUBLIC_COMMUNITY_URL,
        new Set([
          'discord.com',
          'www.discord.com',
          'discord.gg',
          'circle.so',
          'www.circle.so',
        ]),
      ),
    },
  ],
} as const;
