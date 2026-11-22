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
 *
 * 2026-11-15: Runner Gang Lifestyle (runnergangls.com) pulled from the
 * showroom for now. Honey Bee Online Solutions and Aaron Draper added; their
 * screenshots were captured from local production builds of
 * honebeeonline_os and aaron_draper-site, and their live domains still need
 * an HTTP 200 check before showroomVerifiedOn is moved forward.
 *
 * 2026-11-22 (issue #43): Marcus Jones (itsjones.com) added as a preview.
 * The domain returns 200 but the site is still noindex and prelaunch:
 * client launch sign-off, media rights (videographer credit), Turnstile and
 * email routing, and Stripe lesson/session payments are pending. Keep it
 * `status: 'preview'` with no screenshot until those are approved.
 */
export type ShowroomSite = {
  /** Stable id used in analytics events; never personal data. */
  id: string;
  name: string;
  domain: string;
  worker: string;
  industry: string;
  summary: string;
  /**
   * Approved capture in /public/work, or null while the client's screenshot
   * and showcase approval are pending (the card shows a text panel instead).
   */
  image: string | null;
  highlights: string[];
  /**
   * live: launched and approved by the client.
   * preview: domain responds but the client launch sign-off is pending, so
   * the card says "Preview · In progress" and claims nothing not yet live.
   */
  status: 'live' | 'preview';
};

export const showroomVerifiedOn = '2026-11-04';

export const showroomSites: ShowroomSite[] = [
  {
    id: 'hutchrok',
    name: 'Hutchrok Solutions Group',
    domain: 'hutchrok.com',
    status: 'live',
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
    id: 'honey-bee-online',
    name: 'Honey Bee Online Solutions',
    domain: 'honeybeeonlinesolutions.com',
    status: 'live',
    worker: 'honeybee-online-site',
    industry: 'Marketing and lead generation',
    summary:
      'Ads, social, local search, and follow-up for small businesses, with every inquiry captured in one pipeline and routed the same day.',
    image: '/work/honey-bee-online.jpg',
    highlights: ['Lead plan intake', 'Client portal', 'Online booking'],
  },
  {
    id: 'fee-the-producer',
    name: 'Fee The Producer',
    domain: 'feetheproducer.com',
    status: 'live',
    worker: 'feetheproducer-site',
    industry: 'Music production',
    summary:
      'A studio home for original records, videos, and custom production inquiries, built around the artist identity.',
    image: '/work/fee-the-producer.jpg',
    highlights: ['Music catalog', 'Merch', 'Project inquiries'],
  },
  {
    id: 'aaron-draper',
    name: 'Aaron "Drape" Draper',
    domain: 'adrape30.com',
    status: 'live',
    worker: 'aaron-draper-site',
    industry: 'Musician and percussionist',
    summary:
      'The official home of a touring percussionist, with a credits wall, career timeline, video library, rig, press, and booking.',
    image: '/work/aaron-draper.jpg',
    highlights: ['Credits wall', 'Video library', 'Booking requests'],
  },
  {
    id: 'marcus-jones',
    name: 'Marcus Jones',
    domain: 'itsjones.com',
    status: 'preview',
    worker: 'marcus-jones-site',
    industry: 'Drummer and educator',
    summary:
      'A home for a touring drummer, producer and drum instructor, with lessons, studio sessions and live-performance inquiries.',
    image: null,
    highlights: ['Lessons', 'Studio sessions', 'Performance inquiries'],
  },
  {
    id: 'hairline-matters',
    name: 'Hairline Matters',
    domain: 'hairlinematters.com',
    status: 'live',
    worker: 'hairline-matters-site',
    industry: 'Barbershop',
    summary:
      'A video-led site for a Duncanville barber with services, gallery, shop, and online booking.',
    image: '/work/hairline-matters.jpg',
    highlights: ['Online booking', 'Video hero', 'Shop and gallery'],
  },
  {
    id: 'deploy-property',
    name: 'Deploy Property Solutions Group',
    domain: 'deploypropertysg.com',
    status: 'live',
    worker: 'deploy-property-solutions-site',
    industry: 'Property and infrastructure',
    summary:
      'A Texas property and infrastructure firm presented to owners, developers, municipalities, and agencies.',
    image: '/work/deploy-property.jpg',
    highlights: ['Industry pages', 'Inquiry intake', 'Concept visuals'],
  },
  {
    id: 'dukeel-transport',
    name: 'Dukeel Transportation',
    domain: 'dukeeltransport.com',
    status: 'live',
    worker: 'dukeel-transport-site',
    industry: 'Freight and logistics',
    summary:
      'Commercial freight and government contract support with a clear path to request service.',
    image: '/work/dukeel-transport.jpg',
    highlights: ['Freight requests', 'Government contracting', 'Video hero'],
  },
  {
    id: '54-bravo-auto',
    name: '54 Bravo Auto Repair',
    domain: '54bravoauto.com',
    status: 'live',
    worker: '54bravo-auto-site',
    industry: 'Mobile auto repair',
    summary:
      'Mobile diagnostics, repair, and fleet maintenance, delivered where the vehicle is.',
    image: '/work/54-bravo-auto.jpg',
    highlights: ['Service requests', 'Fleet support', 'Industry pages'],
  },
  {
    id: 'bean-stalk-auto',
    name: 'Bean Stalk Auto Group',
    domain: 'beanstalkauto.com',
    status: 'live',
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
