import checkoutLinks from './service-checkout-links.json';

/** Stripe-hosted checkout URLs, written by `npm run services:links -- --apply`. */
export const serviceCheckoutLinks = checkoutLinks;
export type CheckoutSlug = keyof typeof checkoutLinks;

export const serviceGroups = [
  {
    name: 'Web presence',
    summary: 'A credible, conversion-ready home for your business.',
    services: [
      'Business websites and strategic redesigns',
      'E-commerce storefronts and customer journeys',
      'Mobile-first UX, accessibility, SEO, and analytics foundations',
      'Booking, lead capture, payments, and launch support',
    ],
  },
  {
    name: 'Business discovery',
    summary: 'Consistent business information where customers search.',
    services: [
      'Google Business Profile setup and verification support',
      'Apple Business Connect setup',
      'Yelp profile setup or cleanup',
      'Contact, category, location, and service-area alignment',
    ],
  },
  {
    name: 'Software + automation',
    summary: 'Purpose-built systems that remove operational friction.',
    services: [
      'Client portals, dashboards, and custom applications',
      'AI-assisted workflows and business automation',
      'API, CRM, Workspace, and back-office integrations',
      'Architecture, deployment, and ongoing improvement',
    ],
  },
] as const;

export const pricingOptions = [
  {
    name: 'Website Launch',
    slug: 'website-launch',
    price: 'Starting at $5,500',
    description:
      'A professional, mobile-ready website for a business that needs a polished, conversion-focused web presence.',
    includes: [
      'Launch-ready website implementation',
      'Mobile-first customer experience',
      'Clear service and inquiry path',
      'Payments & Back-End Integration included',
    ],
  },
  {
    name: 'Digital Presence Bundle',
    slug: 'digital-presence-bundle',
    price: 'Starting at $6,750',
    description:
      'A website plus coordinated setup across the business profiles customers search first.',
    includes: [
      'Website Launch foundation',
      'Google, Apple, and Yelp presence setup',
      'Consistent public business information',
      'Payments & Back-End Integration included',
    ],
  },
  {
    name: 'Custom Software & Automation',
    slug: 'custom-software-and-automation',
    price: 'Starting at $3,500',
    description:
      'Custom applications, dashboards, integrations, and AI workflows built around a defined business requirement.',
    includes: [
      'Product discovery and workflow mapping',
      'One defined application or automation scope',
      'Implementation and launch configuration',
    ],
  },
  {
    name: 'Full Business System',
    slug: 'full-business-system',
    price: 'Starting at $10,000',
    description:
      'A coordinated digital launch combining website development, business presence, automation, and integrations.',
    includes: [
      'Website and business-presence delivery',
      'Workflow automation and integrations',
      'Coordinated implementation plan',
      'Payments & Back-End Integration included',
    ],
  },
] as const satisfies readonly {
  name: string;
  slug: CheckoutSlug;
  price: string;
  description: string;
  includes: readonly string[];
}[];

export const addOnPricing = [
  {
    name: 'Payments & Back-End Integration (free with any website package)',
    slug: 'payments-and-back-end-integration',
    price: '$250',
  },
  {
    name: 'Yelp Profile Setup or Cleanup',
    slug: 'yelp-profile-setup-or-cleanup',
    price: 'Starting at $350',
  },
  {
    name: 'Apple Business Connect Setup',
    slug: 'apple-business-connect-setup',
    price: 'Starting at $350',
  },
  {
    name: 'GA4 Property Review / Audit',
    slug: 'ga4-property-review-audit',
    price: 'Starting at $450',
  },
  {
    name: 'Google Business Profile Setup & Verification Support',
    slug: 'google-business-profile-setup',
    price: 'Starting at $525',
  },
  {
    name: 'Google Workspace & Business Email Setup',
    slug: 'google-workspace-and-business-email',
    price: 'Starting at $525',
  },
  {
    name: 'Contact, Category, Location & Service-Area Alignment',
    slug: 'contact-category-location-alignment',
    price: 'Starting at $700',
  },
  {
    name: 'GA4 Setup & Validation',
    slug: 'ga4-setup-and-validation',
    price: 'Starting at $925',
  },
  {
    name: 'Lead Capture & CRM Automation',
    slug: 'lead-capture-and-crm-automation',
    price: 'Starting at $1,400',
  },
  {
    name: 'API Integration Setup',
    slug: 'api-integration-setup',
    price: 'Starting at $2,100',
  },
  {
    name: 'AI Assistant / Chatbot Setup',
    slug: 'ai-assistant-or-chatbot-setup',
    price: 'Starting at $2,100',
  },
  {
    name: 'Clerk + Supabase Completion',
    slug: 'clerk-supabase-completion',
    price: 'Starting at $3,500',
  },
  {
    name: 'Business Analytics Dashboard',
    slug: 'business-analytics-dashboard',
    price: 'Starting at $3,500',
  },
  {
    name: 'Custom Public-Data Collection Tool',
    slug: 'custom-public-data-collection-tool',
    price: 'Starting at $3,500',
  },
  {
    name: 'Strategic Website Redesign',
    slug: 'strategic-website-redesign',
    price: 'Starting at $4,750',
  },
  {
    name: 'Business Website Design & Development',
    slug: 'business-website-design-and-development',
    price: 'Starting at $5,500',
  },
  {
    name: 'E-commerce or Custom Website Features',
    slug: 'e-commerce-or-custom-website-features',
    price: 'Starting at $10,000',
  },
  {
    name: 'Website Maintenance & Support',
    slug: 'website-maintenance-and-support',
    price: 'Starting at $175/month',
  },
  {
    name: 'Cloud Management',
    slug: 'cloud-management',
    price: 'Starting at $350/month',
  },
  {
    name: 'Public-Data Monitoring & Change Alerts',
    slug: 'public-data-monitoring-and-alerts',
    price: 'Starting at $350/month',
  },
  {
    name: 'Developer Change Block',
    slug: 'developer-change-block',
    price: 'Starting at $525/month',
  },
  {
    name: 'Fee Developer Protection',
    slug: 'fee-developer-protection',
    price: 'Starting at $850/month',
  },
] as const satisfies readonly {
  name: string;
  slug: CheckoutSlug;
  price: string;
}[];
