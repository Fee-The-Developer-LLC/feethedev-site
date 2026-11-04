/**
 * Live sites built and run by Fee The Developer.
 *
 * Source of truth: the Workers in Cloudflare account
 * `Fee@feethedeveloper.com's Account` (62738e2bb751720449f1cd904f6d175f) that
 * have production custom domains. Verified 2026-11-03 against the Cloudflare
 * API (`/workers/scripts` + `/workers/domains`); every domain returned 200.
 * Copy is taken from each site's own <title> and meta description.
 * Screenshots in /public/showcase are 1440x900 captures of each homepage.
 *
 * When a Worker is added or retired, update this list. The `slug` is stored
 * on client portal requests (`client_requests.site_slug`), so never rename one.
 */

export type ShowcaseSite = {
  slug: string;
  worker: string;
  name: string;
  domain: string;
  industry: string;
  summary: string;
  image: string;
};

export const showcaseSites: readonly ShowcaseSite[] = [
  {
    slug: '54bravo-auto',
    worker: '54bravo-auto-site',
    name: '54 Bravo Auto Repair',
    domain: '54bravoauto.com',
    industry: 'Mobile auto repair',
    summary:
      'Veteran-owned mobile auto repair, diagnostics, preventive maintenance, and fleet support delivered where the mission requires.',
    image: '/showcase/54bravoauto-com.jpg',
  },
  {
    slug: 'bean-stalk-auto',
    worker: 'bean-stalk-auto-site',
    name: 'Bean Stalk Auto Group',
    domain: 'beanstalkauto.com',
    industry: 'Vehicle brokerage',
    summary:
      'Veteran-owned vehicle acquisition and brokerage for consumers, fleets, commercial vehicles, and business buyers.',
    image: '/showcase/beanstalkauto-com.jpg',
  },
  {
    slug: 'deploy-property-solutions',
    worker: 'deploy-property-solutions-site',
    name: 'Deploy Property Solutions Group',
    domain: 'deploypropertysg.com',
    industry: 'Property + infrastructure',
    summary:
      'Texas-based, veteran-owned property and infrastructure solutions for owners, developers, municipalities, agencies, and enterprise partners.',
    image: '/showcase/deploypropertysg-com.jpg',
  },
  {
    slug: 'dukeel-transport',
    worker: 'dukeel-transport-site',
    name: 'Dukeel Transportation',
    domain: 'dukeeltransport.com',
    industry: 'Freight + logistics',
    summary:
      'Veteran-owned, Texas-based freight and logistics support for commercial transportation and government contract execution.',
    image: '/showcase/dukeeltransport-com.jpg',
  },
  {
    slug: 'hairline-matters',
    worker: 'hairline-matters-site',
    name: 'Hairline Matters',
    domain: 'hairlinematters.com',
    industry: 'Barber · Duncanville, TX',
    summary:
      'Fades, shape-ups, and full grooming in Duncanville, Texas, with online booking.',
    image: '/showcase/hairlinematters-com.jpg',
  },
  {
    slug: 'hutchrok-solutions',
    worker: 'hutchrok-solutions-site',
    name: 'Hutchrok Solutions Group',
    domain: 'hutchrok.com',
    industry: 'Veteran business launch',
    summary:
      'SBA-certified SDVOSB and VOSB helping veterans launch and grow businesses, from free Texas LLC filing to compliance and contracting.',
    image: '/showcase/hutchrok-com.jpg',
  },
  {
    slug: 'runner-gang-lifestyle',
    worker: 'runner-gang-lifestyle',
    name: 'Runner Gang Lifestyle',
    domain: 'runnergangls.com',
    industry: 'Apparel flagship',
    summary:
      'A cinematic digital flagship for the Runner Gang campaign lineup of hoodies, joggers, sweatshirts, and letterman jackets.',
    image: '/showcase/runnergangls-com.jpg',
  },
  {
    slug: 'fee-the-producer',
    worker: 'feetheproducer-site',
    name: 'Fee The Producer',
    domain: 'feetheproducer.com',
    industry: 'Music production',
    summary:
      'Original records and custom production from a Philadelphia-born musician, composer, drummer, and keys player.',
    image: '/showcase/feetheproducer-com.jpg',
  },
  {
    slug: 'fee-the-developer',
    worker: 'fee-the-developer',
    name: 'Fee The Developer',
    domain: 'feethedeveloper.com',
    industry: 'Web + business presence',
    summary:
      'This site: web design, software, automation, and full digital business presence for growing companies.',
    image: '/showcase/feethedeveloper-com.jpg',
  },
];

export const showcaseSlugs = new Set(showcaseSites.map((site) => site.slug));

export function findShowcaseSite(slug: string | null | undefined) {
  return showcaseSites.find((site) => site.slug === slug) ?? null;
}
