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
    price: '$799',
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
    price: '$1,299',
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
    price: '$1,999',
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
    price: '$2,499',
    description:
      'A coordinated digital launch combining website development, business presence, automation, and integrations.',
    includes: [
      'Website and business-presence delivery',
      'Workflow automation and integrations',
      'Coordinated implementation plan',
      'Payments & Back-End Integration included',
    ],
  },
] as const;

export const addOnPricing = [
  ['Yelp Business Profile Setup', '$149'],
  ['Apple Business Connect Setup', '$199'],
  ['Payments & Back-End Integration (free with any website package)', '$250'],
  ['Google Business Profile Setup & Verification Support', '$299'],
  ['Google Workspace & Business Email Setup', '$299'],
  ['Lead Capture & CRM Automation', '$449'],
  ['API Integration Setup', '$499'],
  ['AI Assistant / Chatbot Setup', '$599'],
  ['Business Analytics Dashboard', '$699'],
  ['Custom Public Data Scraper', '$749'],
  ['Public Data Monitoring & Change Alerts', '$199/month'],
  ['Ongoing Technical Support', '$249/month'],
] as const;
