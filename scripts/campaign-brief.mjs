#!/usr/bin/env node
/**
 * Prints a campaign brief for one service, built from lib/pricing-catalog.json
 * so the offer, price and link in every ad match /pricing exactly.
 *
 *   npm run campaign:brief -- own-your-dotcom
 *   npm run campaign:brief -- --list
 *
 * Paste the output into Honey Bee (campaign-war-plan / creative-studio) or a
 * Claude session as the source of truth for the offer.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  CATALOG_PATH,
  depositCents,
  validateCatalog,
} from './sync-pricing.mjs';

const SITE = 'https://feethedeveloper.com';

export function formatPrice(item) {
  const amount = `$${(item.amountCents / 100).toLocaleString('en-US')}`;
  const suffix = item.interval === 'one_time' ? '' : `/${item.interval}`;
  return `${item.priceMode === 'starting_at' ? 'Starting at ' : ''}${amount}${suffix}`;
}

export function campaignBrief(catalog, slug) {
  const problems = validateCatalog(catalog);
  if (problems.length)
    throw new Error(`Catalog is invalid:\n- ${problems.join('\n- ')}`);
  const item = catalog.items.find((i) => i.slug === slug);
  if (!item) throw new Error(`No catalog item "${slug}". Run with --list.`);
  if (item.status !== 'active')
    throw new Error(`${slug} is retired and cannot be advertised.`);
  if (!item.campaign)
    throw new Error(`${slug} has no campaign block in the catalog yet.`);
  const c = item.campaign;
  const vet = catalog.discounts?.veteran;
  const dollars = (cents) => `$${(cents / 100).toLocaleString('en-US')}`;
  const addOns = catalog.items
    .filter((i) => i.status === 'active' && i.line === item.line && !i.featured)
    .filter((i) => !i.appliesTo || i.appliesTo.includes(item.slug))
    .map((i) => `- ${i.name}: ${formatPrice(i)}`);

  return [
    `# Campaign brief: ${item.name}`,
    `Source: lib/pricing-catalog.json (${catalog.version}). Company: Fee The Developer LLC only.`,
    '',
    '## Offer (use exactly)',
    `- Product: ${item.name}`,
    `- Price: ${formatPrice(item)}${item.priceMode === 'starting_at' ? ' (a written scope confirms the final price)' : ''}`,
    `- What it is: ${item.description}`,
    ...item.includes.map((line) => `- Includes: ${line}`),
    `- Scope: ${item.scopeNote}`,
    `- Payments & Back-End Integration: ${item.paymentsIncluded ? 'included' : 'not included'}`,
    `- Link: ${SITE}${c.landingPath}`,
    '',
    '## Discounts and ways to pay',
    ...(vet
      ? [
          `- Veteran: ${vet.percentOff}% off for veterans and veteran-owned businesses, on top of this price, after proof is verified (single-use code)`,
        ]
      : []),
    `- YOBUL: ${item.yobulEligible ? `${catalog.discounts?.yobul?.percentOff ?? 20}% quote discount for 76ers fans` : 'not available on this item'}`,
    '- One discount per order.',
    `- Pay in full${item.depositPercent ? `, or start with a ${item.depositPercent}% deposit (${dollars(depositCents(item))}); the balance is invoiced at design approval and launch` : ''}.`,
    "- Pay over time with Affirm, Afterpay or Klarna at checkout, subject to the provider's approval.",
    '',
    '## Audience and message',
    `- Audience: ${c.audience}`,
    `- Pain: ${c.pain}`,
    `- Lead hook: "${c.hook}"`,
    `- Channels: ${c.channels.join(', ')}`,
    `- Demo storyboard: "${c.demo}" in FTD Product Demo Videos (Claude Docs)`,
    ...(addOns.length
      ? ['', '## Add-ons to offer after purchase', ...addOns]
      : []),
    '',
    '## Rules',
    '- Only this price, wording and link. Never invent discounts, results, client counts or reviews.',
    "- Say 'veteran-owned' about Fee The Developer only where the certification is on file.",
    '- Show the price in an ad only once /pricing lists it.',
    "- Every post, DM batch and ad budget needs King Fee's approval first.",
    '- Label AI-generated people and scenes on every platform.',
    '',
  ].join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const arg = process.argv[2];
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  try {
    if (!arg || arg === '--list') {
      for (const i of catalog.items.filter(
        (x) => x.status === 'active' && x.campaign,
      )) {
        console.log(`${i.slug.padEnd(34)} ${formatPrice(i)}`);
      }
    } else {
      process.stdout.write(campaignBrief(catalog, arg));
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
