/**
 * One page per purchasable service at /services/[slug].
 *
 * Names and prices come from `lib/catalog.ts` (the single pricing source) and
 * checkout URLs from `lib/service-checkout-links.json`. Scope copy follows
 * docs/handoffs/FTD_SITE_SERVICES_PRICING_UPDATE_HANDOFF.md. A written scope
 * confirms final deliverables before work begins.
 *
 * Images: drop a file in /public/services and set `image` on the service.
 * Without one, the page uses its category image.
 */
import {
  addOnPricing,
  pricingOptions,
  serviceCheckoutLinks,
  type CheckoutSlug,
} from '@/lib/catalog';

export type ServiceImage = { src: string; alt: string };

export const serviceCategories = [
  {
    id: 'packages',
    name: 'Packages',
    summary:
      'Coordinated launches that bundle the pieces most businesses need.',
    image: {
      src: '/brand/generated/ftd-business-systems-hero.webp',
      alt: 'Fee The Developer business systems',
    },
  },
  {
    id: 'websites',
    name: 'Websites',
    summary: 'A credible, conversion-ready home for your business.',
    image: {
      src: '/images/design/ecommerce-preview.png',
      alt: 'Website storefront preview',
    },
  },
  {
    id: 'presence',
    name: 'Business presence',
    summary: 'Consistent business information where customers search.',
    image: {
      src: '/brand/generated/ftd-business-systems-hero.webp',
      alt: 'Connected business listings, maps, and messaging',
    },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    summary: 'Measurement you can trust and dashboards you will use.',
    image: {
      src: '/brand/ftd-cta-system.webp',
      alt: 'Analytics and cloud dashboards',
    },
  },
  {
    id: 'automation',
    name: 'Software + automation',
    summary: 'Purpose-built systems that remove operational friction.',
    image: {
      src: '/images/design/custom-app-preview.png',
      alt: 'Custom application preview',
    },
  },
  {
    id: 'support',
    name: 'Ongoing support',
    summary: 'Monthly care, changes, and cloud oversight after launch.',
    image: {
      src: '/brand/ftd-cta-system.webp',
      alt: 'Cloud, database, and settings systems',
    },
  },
] as const satisfies readonly {
  id: string;
  name: string;
  summary: string;
  image: ServiceImage;
}[];

export type ServiceCategoryId = (typeof serviceCategories)[number]['id'];

type ServiceDefinition = {
  checkoutSlug: CheckoutSlug;
  category: ServiceCategoryId;
  summary: string;
  includes: readonly string[];
  notes?: string;
  /** Route segment, when it differs from the checkout slug. */
  slug?: string;
  image?: ServiceImage;
};

const definitions: readonly ServiceDefinition[] = [
  // Packages
  {
    checkoutSlug: 'website-launch',
    category: 'packages',
    summary:
      'A professional, mobile-ready website for a business that needs a polished, conversion-focused web presence.',
    includes: [
      'Custom mobile-first marketing site with agreed pages',
      'Clear service and inquiry path',
      'Accessibility, performance, and launch QA',
      'Payments & Back-End Integration included',
    ],
    notes:
      'Built from content you supply. Content writing is scoped separately.',
  },
  {
    checkoutSlug: 'digital-presence-bundle',
    category: 'packages',
    summary:
      'A website plus coordinated setup across the business profiles customers search first.',
    includes: [
      'Everything in Website Launch',
      'Google, Apple, and Yelp presence setup',
      'Consistent public business information',
      'Payments & Back-End Integration included',
    ],
    notes: 'Included profiles and locations are listed in your written scope.',
  },
  {
    checkoutSlug: 'custom-software-and-automation',
    category: 'packages',
    summary:
      'Custom applications, dashboards, integrations, and AI workflows built around a defined business requirement.',
    includes: [
      'Product discovery and workflow mapping',
      'One defined application or automation scope',
      'Implementation and launch configuration',
      '20 engineering hours at the $175/hour planning rate',
    ],
    notes:
      'Work beyond the starting allowance begins only after your approval.',
  },
  {
    checkoutSlug: 'full-business-system',
    category: 'packages',
    summary:
      'A coordinated digital launch combining website development, business presence, automation, and integrations.',
    includes: [
      'Website and business-presence delivery',
      'One defined workflow automation or integration',
      'Coordinated implementation plan',
      'Payments & Back-End Integration included',
    ],
    notes:
      'Portals, multi-tenant access, and multiple integrations are quoted separately.',
  },
  // Websites
  {
    checkoutSlug: 'own-your-dotcom-starter',
    category: 'websites',
    summary:
      'A two-page site on your own .com that sends clients to the booking link you already use.',
    includes: [
      'Your own .com, first year of the domain included',
      'Home page and Services page with prices, photos, hours, and Instagram',
      'Book Now button to your existing booking link',
      'Mobile-first build hosted on Cloudflare',
    ],
    notes:
      'One-time payment. Stripe payments on your site, Google Business Profile, a full mailbox, and ongoing edits are separate.',
  },
  {
    checkoutSlug: 'business-website-design-and-development',
    category: 'websites',
    summary:
      'A custom business website designed and built around how your customers find and choose you.',
    includes: [
      'Custom design and development',
      'Mobile-first, accessible pages',
      'Contact and lead paths',
      'Launch QA and handoff',
    ],
    notes: 'Final scope depends on pages, features, and supplied content.',
  },
  {
    checkoutSlug: 'strategic-website-redesign',
    category: 'websites',
    summary:
      'Rework an existing site so it looks current, loads fast, and moves visitors to act.',
    includes: [
      'Review of the current site and goals',
      'Redesigned layout and visual system',
      'Mobile, accessibility, and performance pass',
      'Launch QA',
    ],
    notes:
      'Migration, content writing, complex integrations, and e-commerce are priced separately.',
  },
  {
    checkoutSlug: 'e-commerce-or-custom-website-features',
    category: 'websites',
    summary:
      'Online stores and custom website functionality built for how you actually sell.',
    includes: [
      'Storefront or custom feature build',
      'Checkout and customer journey',
      'Testing before launch',
      'Handoff and launch support',
    ],
    notes:
      'Payment-provider fees, inventory, tax and shipping setup, and vendor plans are separate.',
  },
  {
    checkoutSlug: 'payments-and-back-end-integration',
    slug: 'payments-integration',
    category: 'websites',
    summary:
      'Replace a borrowed checkout with payments that run on your own Stripe account.',
    includes: [
      'Processor migration to Stripe',
      'Deposits, bookings, and products',
      'Verified webhooks and fulfillment',
      'Free with any website package',
    ],
    notes: 'Stripe’s own processing fees are separate and paid to Stripe.',
  },
  // Business presence
  {
    checkoutSlug: 'google-business-profile-setup',
    category: 'presence',
    summary:
      'Get your business on Google Search and Maps with a complete, accurate profile.',
    includes: [
      'Profile setup with your business details',
      'Owner-guided verification support',
      'Categories, hours, and service areas',
      'Up to 3 hours of setup time',
    ],
    notes:
      'Google controls verification and approval. No guarantee of approval or ranking.',
  },
  {
    checkoutSlug: 'apple-business-connect-setup',
    category: 'presence',
    summary: 'Show up correctly in Apple Maps, Siri, and across Apple devices.',
    includes: [
      'One business or location setup',
      'Business details and branding',
      'Submission for Apple review',
      'Up to 2 hours of setup time',
    ],
    notes: 'Subject to Apple account ownership and review.',
  },
  {
    checkoutSlug: 'yelp-profile-setup-or-cleanup',
    category: 'presence',
    summary:
      'A clean, accurate Yelp profile that matches the rest of your business information.',
    includes: [
      'One profile setup or cleanup',
      'Business information correction',
      'Handoff of account access',
      'Up to 2 hours of setup time',
    ],
    notes: 'Reviews, ranking, ads, and platform decisions are not guaranteed.',
  },
  {
    checkoutSlug: 'contact-category-location-alignment',
    category: 'presence',
    summary:
      'Make your contact details, categories, locations, and service areas match everywhere.',
    includes: [
      'Up to three client-selected profiles',
      'Contact and category alignment',
      'Location and service-area alignment',
      'Up to 4 hours of work',
    ],
    notes: 'Additional locations or platforms are quoted separately.',
  },
  {
    checkoutSlug: 'google-workspace-and-business-email',
    category: 'presence',
    summary:
      'Professional email on your own domain with Google Workspace configured for your team.',
    includes: [
      'One domain connected',
      'Agreed mailbox and user setup',
      'Calendar, Drive, and sharing basics',
      'Up to 3 hours of setup time',
    ],
    notes:
      'Google subscriptions, email migration, and domain charges are separate.',
  },
  // Analytics
  {
    checkoutSlug: 'ga4-setup-and-validation',
    category: 'analytics',
    summary:
      'A Google Analytics 4 property that measures the actions that matter to your business.',
    includes: [
      'New or reset GA4 property',
      'Measurement plan with agreed events and conversions',
      'Consent-aware implementation requirements',
      'Validation and handoff',
    ],
    notes:
      'Does not include a historical audit. Custom checkout tracking is scoped separately.',
  },
  {
    checkoutSlug: 'ga4-property-review-audit',
    category: 'analytics',
    summary:
      'A review of your existing GA4 property with findings and prioritized fixes.',
    includes: [
      'Review of your current GA4 configuration',
      'Findings report',
      'Prioritized list of fixes',
    ],
    notes:
      'Requires an existing property you own. Implementation is not included.',
  },
  {
    checkoutSlug: 'business-analytics-dashboard',
    category: 'analytics',
    summary:
      'One dashboard that pulls your key numbers together so decisions are faster.',
    includes: [
      'One defined dashboard',
      'Agreed data sources and measures',
      'Up to 20 hours at the $175/hour planning rate',
    ],
    notes:
      'Source-system access, paid BI tools, and extra connectors are separate.',
  },
  // Software + automation
  {
    checkoutSlug: 'lead-capture-and-crm-automation',
    category: 'automation',
    summary:
      'Send every new lead straight into your CRM with the right people notified.',
    includes: [
      'One defined lead flow into one CRM',
      'Basic notifications',
      'Testing and handoff',
      'Up to 8 hours of work',
    ],
    notes:
      'CRM licenses, marketing campaigns, and multi-stage automation are excluded.',
  },
  {
    checkoutSlug: 'api-integration-setup',
    category: 'automation',
    summary: 'Connect two systems so data moves between them without retyping.',
    includes: [
      'One documented API',
      'One defined data flow',
      'Testing and handoff',
      'Up to 12 hours of work',
    ],
    notes:
      'API access approval, vendor fees, and rate limits are outside our control.',
  },
  {
    checkoutSlug: 'ai-assistant-or-chatbot-setup',
    category: 'automation',
    summary:
      'An AI assistant for one clear job, grounded in sources you approve.',
    includes: [
      'One bounded use case',
      'Approved knowledge sources',
      'Safety and fallback behavior',
      'Testing, up to 12 hours of work',
    ],
    notes: 'Model usage and hosting costs are separate.',
  },
  {
    checkoutSlug: 'clerk-supabase-completion',
    category: 'automation',
    summary:
      'Finish sign-in, sign-up, and database access rules on an existing Clerk + Supabase build.',
    includes: [
      'Environment and configuration check',
      'Defined sign-in and sign-up flow',
      'Database access rules for agreed user types',
      'Basic flow tests, up to 20 hours',
    ],
    notes:
      'Not a full customer portal, billing system, or security certification.',
  },
  {
    checkoutSlug: 'custom-public-data-collection-tool',
    category: 'automation',
    summary:
      'A tool that gathers information from permitted public sources or approved APIs.',
    includes: [
      'Source terms, privacy, and data-rights review',
      'Collection tool build',
      'Up to 20 hours at the $175/hour planning rate',
    ],
    notes:
      'No login bypass, anti-bot evasion, or collection of sensitive personal data.',
  },
  // Ongoing support
  {
    checkoutSlug: 'website-maintenance-and-support',
    category: 'support',
    summary: 'Routine care that keeps your website current after launch.',
    includes: [
      'Routine agreed updates',
      'Backup checks',
      'Basic availability and security checks',
      'Support intake',
    ],
    notes:
      'No feature-development hours included. No guarantee against compromise or outage.',
  },
  {
    checkoutSlug: 'developer-change-block',
    category: 'support',
    summary:
      'Three hours a month of requested code, content, or configuration changes.',
    includes: [
      '3 hours of changes per month',
      'Code, content, or configuration work',
      'Additional time only after approval',
    ],
    notes: 'Hours do not roll over unless your agreement says so.',
  },
  {
    checkoutSlug: 'cloud-management',
    category: 'support',
    summary: 'A monthly look at your cloud costs, deployments, and access.',
    includes: [
      'Billing and usage review',
      'Deployment and backup/recovery review',
      'Access and security checklist',
      'Concise monthly report',
    ],
    notes:
      'Vendor bills, 24/7 monitoring, and incident response labor are separate.',
  },
  {
    checkoutSlug: 'public-data-monitoring-and-alerts',
    category: 'support',
    summary:
      'Scheduled checks on public sources with alerts when things change.',
    includes: [
      'Limited source list in writing',
      'Agreed check cadence',
      'Change alerts',
      'Up to 2 hours per month',
    ],
    notes:
      'Hosting, API, and notification fees are separate. Third-party sites are not guaranteed.',
  },
  {
    checkoutSlug: 'fee-developer-protection',
    category: 'support',
    summary:
      'Website care, monthly changes, and a cloud and security review in one plan.',
    includes: [
      'Website maintenance and support',
      '3 hours of agreed changes per month',
      'Monthly cloud and security review',
    ],
    notes:
      'Protection reduces risk; it does not guarantee security or uninterrupted service.',
  },
];

const catalogBySlug = new Map<CheckoutSlug, { name: string; price: string }>(
  [...pricingOptions, ...addOnPricing].map((item) => [
    item.slug,
    {
      // The add-on label carries a pricing note; the page shows it separately.
      name: item.name.replace(/\s*\(free with any website package\)$/i, ''),
      price: item.price,
    },
  ]),
);

export type Service = ServiceDefinition & {
  slug: string;
  name: string;
  price: string;
  checkoutUrl: string;
  href: string;
  image: ServiceImage;
  monthly: boolean;
};

export const services: readonly Service[] = definitions.map((definition) => {
  const catalog = catalogBySlug.get(definition.checkoutSlug);
  if (!catalog) {
    throw new Error(`Missing catalog entry for ${definition.checkoutSlug}`);
  }
  const category = serviceCategories.find(
    (item) => item.id === definition.category,
  );
  const slug = definition.slug ?? definition.checkoutSlug;

  return {
    ...definition,
    slug,
    name: catalog.name,
    price: catalog.price,
    checkoutUrl: serviceCheckoutLinks[definition.checkoutSlug],
    href: `/services/${slug}`,
    image: definition.image ?? category!.image,
    monthly: catalog.price.endsWith('/month'),
  };
});

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function servicesInCategory(id: ServiceCategoryId): Service[] {
  return services.filter((service) => service.category === id);
}
