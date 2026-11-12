/**
 * Product concierge: the answers on every /services/[slug] page.
 *
 * Every answer is assembled from `lib/pricing-catalog.json` (through
 * `lib/catalog.ts`), so the concierge can never quote a price, inclusion or
 * rule the catalog does not hold. There is no model and no network call.
 * A question it cannot match is routed to King Fee through /start.
 */
import {
  depositFor,
  formatPrice,
  getCatalogItem,
  packageRules,
  veteranDiscount,
} from '@/lib/catalog';

export type ConciergeTopic = {
  id: string;
  /** The chip the visitor taps. */
  question: string;
  /** Words that route a typed question to this topic. */
  keywords: string[];
  /** One or more short paragraphs. */
  answer: string[];
  /** Optional bullet list shown under the answer. */
  list?: string[];
};

export type ConciergeScript = {
  slug: string;
  productName: string;
  greeting: string;
  topics: ConciergeTopic[];
  /** Where an unmatched question goes. */
  fallbackHref: string;
};

const ruleBody = (id: string) =>
  packageRules.find((rule) => rule.id === id)?.body;

export function conciergeFor(slug: string): ConciergeScript | null {
  const item = getCatalogItem(slug);
  if (!item) return null;

  const price = formatPrice(item);
  const deposit = depositFor(item);
  const required = item.requires ? getCatalogItem(item.requires) : undefined;
  const starter = item.line === 'starter';
  const sellable = item.publicCheckout !== false;

  const topics: ConciergeTopic[] = [];

  topics.push({
    id: 'what',
    question: 'What is it?',
    keywords: ['what is', 'what does', 'explain', 'about', 'how does it work'],
    answer: [item.description],
  });

  if (item.includes.length > 0) {
    topics.push({
      id: 'includes',
      question: 'What do I get?',
      keywords: ['get', 'include', 'included', 'come with', 'features'],
      answer: [`${item.name} includes:`],
      list: item.includes,
    });
  }

  const priceLines = [
    item.priceMode === 'starting_at'
      ? `${price}. A written scope confirms the final price before work begins.`
      : `${price}, one price.`,
  ];
  if (required) {
    priceLines.push(
      `${required.name} (${formatPrice(required)}) is required from ${starter ? 'launch' : 'delivery'}.`,
    );
  }
  topics.push({
    id: 'price',
    question: 'How much is it?',
    keywords: ['price', 'cost', 'how much', 'fee', 'expensive', 'cheap'],
    answer: priceLines,
  });

  const payLines = ['Pay in full at checkout.'];
  if (deposit) {
    payLines.push(
      `Or start with a ${deposit.percent}% deposit (${deposit.amount}); the balance is invoiced at design approval and at launch.`,
    );
  }
  if (sellable && item.interval === 'one_time') {
    payLines.push(
      'Where checkout offers it, you can pay over time with Affirm, Afterpay or Klarna, subject to their approval.',
    );
  }
  topics.push({
    id: 'pay',
    question: 'How do I pay?',
    keywords: [
      'pay',
      'deposit',
      'payment plan',
      'klarna',
      'afterpay',
      'affirm',
      'installment',
      'finance',
    ],
    answer: payLines,
  });

  topics.push({
    id: 'veteran',
    question: 'Is there a veteran discount?',
    keywords: [
      'veteran',
      'military',
      'vet',
      'army',
      'navy',
      'discount',
      'vosb',
      'sdvosb',
    ],
    answer: [
      `Yes. Veterans and veteran-owned businesses save ${veteranDiscount.percentOff}% on top of these prices.`,
      'Email your proof first (a DD-214, a VA ID card, or a VOSB or SDVOSB certificate). Once it is verified, you get a single-use code. Proof is never uploaded to this website. One discount per order.',
    ],
  });

  topics.push({
    id: 'scope',
    question: 'What is not included?',
    keywords: [
      'not included',
      'exclude',
      'extra',
      'scope',
      'limit',
      'separate',
    ],
    answer: [item.scopeNote],
  });

  if (starter) {
    const owned = ruleBody('own-domain');
    const payments = ruleBody('payments');
    const leaving = ruleBody('leaving');
    if (owned || payments) {
      topics.push({
        id: 'own',
        question: 'Do I own it?',
        keywords: ['own', 'domain', 'my name', 'stripe', 'my money', 'payout'],
        answer: [owned, payments].filter((line): line is string =>
          Boolean(line),
        ),
      });
    }
    const replies = ruleBody('replies');
    if (replies) {
      topics.push({
        id: 'speed',
        question: 'How fast do you reply?',
        keywords: [
          'fast',
          'how long',
          'reply',
          'response',
          'turnaround',
          'support',
        ],
        answer: [
          replies,
          'Your site goes live after you approve a preview link.',
        ],
      });
    }
    if (leaving) {
      topics.push({
        id: 'leave',
        question: 'Can I leave?',
        keywords: ['leave', 'cancel', 'move', 'transfer', 'another host'],
        answer: [leaving],
      });
    }
  } else {
    topics.push({
      id: 'start',
      question: 'How does it start?',
      keywords: [
        'start',
        'begin',
        'how long',
        'timeline',
        'process',
        'next step',
      ],
      answer: [
        deposit
          ? 'Check out with the deposit or pay in full, then we confirm the written scope with you before any build work begins.'
          : 'Check out, then we confirm the written scope with you before any build work begins.',
        'Have a question first? Tell us what you are building and King Fee replies personally.',
      ],
    });
  }

  return {
    slug,
    productName: item.name,
    greeting: `Ask me anything about ${item.name}. Every answer comes straight from our published price list.`,
    topics,
    fallbackHref: `/start?service=${slug}`,
  };
}
