/**
 * Live sites in the showroom.
 *
 * Source of truth: Cloudflare Workers custom domains on the Fee The Developer
 * account (62738e2bb751720449f1cd904f6d175f). Verified 2026-11-04 — every
 * entry below is a deployed Worker bound to its production domain and
 * returned HTTP 200. Screenshots in /public/work were captured the same day.
 *
 * When a Worker is added or retired, update this list and recapture its
 * screenshot so the showroom only ever shows what is actually live.
 */
export type ShowroomSite = {
  name: string;
  domain: string;
  worker: string;
  industry: string;
  summary: string;
  image: string;
  highlights: string[];
};

export const showroomVerifiedOn = '2026-11-04';

export const showroomSites: ShowroomSite[] = [
  {
    name: 'Hutchrok Solutions Group',
    domain: 'hutchrok.com',
    worker: 'hutchrok-solutions-site',
    industry: 'Veteran business services',
    summary:
      'A launch platform that takes Texas veterans from DD-214 to an open, filed LLC, with member accounts and filing tracking.',
    image: '/work/hutchrok.jpg',
    highlights: [
      'Member accounts',
      'Filing tracker',
      'Government capabilities',
    ],
  },
  {
    name: 'Runner Gang Lifestyle',
    domain: 'runnergangls.com',
    worker: 'runner-gang-lifestyle',
    industry: 'Apparel and e-commerce',
    summary:
      'A cinematic digital flagship that walks shoppers through the campaign lineup and resolves every reveal to a real product.',
    image: '/work/runner-gang.jpg',
    highlights: [
      'Cinematic walkthrough',
      'Live storefront',
      'Sound and motion controls',
    ],
  },
  {
    name: 'Fee The Producer',
    domain: 'feetheproducer.com',
    worker: 'feetheproducer-site',
    industry: 'Music production',
    summary:
      'A studio home for original records, videos, and custom production inquiries, built around the artist identity.',
    image: '/work/fee-the-producer.jpg',
    highlights: ['Music catalog', 'Merch', 'Project inquiries'],
  },
  {
    name: 'Hairline Matters',
    domain: 'hairlinematters.com',
    worker: 'hairline-matters-site',
    industry: 'Barbershop',
    summary:
      'A video-led site for a Duncanville barber with services, gallery, shop, and online booking.',
    image: '/work/hairline-matters.jpg',
    highlights: ['Online booking', 'Video hero', 'Shop and gallery'],
  },
  {
    name: 'Deploy Property Solutions Group',
    domain: 'deploypropertysg.com',
    worker: 'deploy-property-solutions-site',
    industry: 'Property and infrastructure',
    summary:
      'A Texas property and infrastructure firm presented to owners, developers, municipalities, and agencies.',
    image: '/work/deploy-property.jpg',
    highlights: ['Industry pages', 'Inquiry intake', 'Concept visuals'],
  },
  {
    name: 'Dukeel Transportation',
    domain: 'dukeeltransport.com',
    worker: 'dukeel-transport-site',
    industry: 'Freight and logistics',
    summary:
      'Commercial freight and government contract support with a clear path to request service.',
    image: '/work/dukeel-transport.jpg',
    highlights: ['Freight requests', 'Government contracting', 'Video hero'],
  },
  {
    name: '54 Bravo Auto Repair',
    domain: '54bravoauto.com',
    worker: '54bravo-auto-site',
    industry: 'Mobile auto repair',
    summary:
      'Mobile diagnostics, repair, and fleet maintenance, delivered where the vehicle is.',
    image: '/work/54-bravo-auto.jpg',
    highlights: ['Service requests', 'Fleet support', 'Industry pages'],
  },
  {
    name: 'Bean Stalk Auto Group',
    domain: 'beanstalkauto.com',
    worker: 'bean-stalk-auto-site',
    industry: 'Vehicle brokerage',
    summary:
      'Buyer-side vehicle sourcing for consumers, businesses, and fleets, with a guided brief to start.',
    image: '/work/bean-stalk-auto.jpg',
    highlights: [
      'Buyer brief',
      'Fleet and consumer paths',
      'Process walkthrough',
    ],
  },
];
