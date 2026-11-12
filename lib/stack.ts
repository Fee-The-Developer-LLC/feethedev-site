/**
 * The platforms Fee The Developer builds with, shown on /stack and in the
 * homepage "Built with" strip.
 *
 * Brand rules (checked 2026-11-12):
 * - Product names appear as plain text only. Cloudflare and Google require
 *   written permission for logos, and OpenAI logos follow its brand terms,
 *   so no vendor logos ship until each owner approves them.
 * - Names describe tools we use. Never imply endorsement, partnership, or
 *   reseller status unless the company has granted it in writing.
 * - Do not add these names to metadata keywords or other SEO fields:
 *   Cloudflare's trademark guidelines reserve that for authorized partners.
 * - Only list a product here when it is actually in use.
 */

export type StackProduct = {
  name: string;
  /** What the product does inside the FTD workflow, in plain words. */
  use: string;
};

export type StackVendor = {
  id: string;
  company: string;
  /** Official product page, opened in a new tab. */
  url: string;
  lane: string;
  products: StackProduct[];
};

export const stackVendors: StackVendor[] = [
  {
    id: 'cloudflare',
    company: 'Cloudflare',
    url: 'https://www.cloudflare.com/',
    lane: 'Domains, hosting, and delivery',
    products: [
      {
        name: 'Cloudflare DNS',
        use: 'Every FTD and client domain is managed here, so a site goes live in minutes, not days.',
      },
      {
        name: 'Cloudflare Workers',
        use: 'Our sites, including this one, are built and deployed to Cloudflare’s global network.',
      },
    ],
  },
  {
    id: 'github',
    company: 'GitHub',
    url: 'https://github.com/',
    lane: 'Source code and quality checks',
    products: [
      {
        name: 'GitHub',
        use: 'Every project lives in version control from day one. Clients’ code has a full history and a clear owner.',
      },
      {
        name: 'GitHub Actions',
        use: 'Each change runs type checks, linting, and a production build before it ships.',
      },
    ],
  },
  {
    id: 'anthropic',
    company: 'Anthropic',
    url: 'https://www.claude.com/',
    lane: 'Engineering and AI builds',
    products: [
      {
        name: 'Claude Code',
        use: 'Our main build partner in the repository: features, fixes, tests, and documentation.',
      },
      {
        name: 'Claude',
        use: 'Planning, architecture, and the AI skills and plugins we build for client businesses.',
      },
    ],
  },
  {
    id: 'openai',
    company: 'OpenAI',
    url: 'https://openai.com/',
    lane: 'Strategy and second-pass engineering',
    products: [
      {
        name: 'Codex',
        use: 'A second engineering lane in the editor, so work moves in parallel and gets a second review.',
      },
      {
        name: 'ChatGPT',
        use: 'Research, requirements, and the structured handoffs that start each build.',
      },
    ],
  },
  {
    id: 'google',
    company: 'Google',
    url: 'https://labs.google/',
    lane: 'Design, video, and media',
    products: [
      {
        name: 'Google Flow',
        use: 'Website art, motion headers, product demos, and ad videos, built from each brand’s own asset library.',
      },
      {
        name: 'Gemini',
        use: 'Google Workspace work, documents, and media coordination.',
      },
    ],
  },
];

/** Supporting services verified in this repository's dependencies. */
export const supportingStack: { name: string; use: string }[] = [
  { name: 'Stripe', use: 'Checkout, deposits, and subscriptions' },
  { name: 'Clerk', use: 'Sign-in and the client portal' },
  { name: 'Supabase', use: 'Client records and project data' },
  { name: 'Next.js', use: 'The web framework behind our sites' },
];

/** How a build moves, start to finish. Each step names the tools it uses. */
export const workflowSteps: {
  title: string;
  detail: string;
  tools: string[];
}[] = [
  {
    title: 'Plan',
    detail:
      'We turn your goals into a written brief: pages, features, payments, and what done looks like.',
    tools: ['ChatGPT', 'Claude', 'Gemini'],
  },
  {
    title: 'Design',
    detail:
      'Your brand gets its own asset library: headers, motion, product shots, and ad video.',
    tools: ['Google Flow'],
  },
  {
    title: 'Build',
    detail:
      'Two AI engineering lanes work in one repository. Every change is reviewed and versioned.',
    tools: ['Claude Code', 'Codex', 'GitHub'],
  },
  {
    title: 'Check',
    detail:
      'Automated checks run on every change before it can reach your live site.',
    tools: ['GitHub Actions'],
  },
  {
    title: 'Ship',
    detail:
      'Your site deploys to a global network on your own .com, with security and speed built in.',
    tools: ['Cloudflare Workers', 'Cloudflare DNS'],
  },
];

/** Short list for the homepage strip, in workflow order. */
export const stackHighlights = [
  'Cloudflare',
  'GitHub',
  'Claude Code',
  'Codex',
  'Google Flow',
  'Claude',
  'ChatGPT',
  'Gemini',
] as const;

export const stackTrademarkNotice =
  'Cloudflare is a registered trademark of Cloudflare, Inc. GitHub is a trademark of GitHub, Inc. Claude is a trademark of Anthropic, PBC. ChatGPT is a trademark of OpenAI. Google and Gemini are trademarks of Google LLC. All other product names are trademarks of their respective owners. Listing a product describes a tool Fee The Developer uses. It does not mean the company endorses, sponsors, or partners with Fee The Developer.';
