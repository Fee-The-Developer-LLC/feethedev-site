#!/usr/bin/env node
/**
 * Public-copy gate (FTD zero-leak standard).
 *
 * Runs after `next build` (npm `postbuild`). Checks every public page for text
 * that only the developer should ever see: internal status labels, feature-flag
 * and env-var names, decision references, TODOs, placeholder copy, and broken
 * renders. Errors fail the build so the copy never reaches production; warnings
 * print but do not block.
 *
 * 1. Static pages: scans the prerendered HTML in .next/server/app.
 * 2. Dynamic pages: boots the built app with `next start` on a local port,
 *    requests every non-API, non-parameterised route from the build manifest,
 *    and scans the HTML it returns. Routes that redirect (auth-gated) are scanned
 *    at their destination. A non-200 response is a warning. Projects using Clerk
 *    need their keys in the environment (.env.local locally, platform secrets on
 *    deploy); without them this step is skipped with a notice.
 *
 * Usage:
 *   node scripts/check-public-copy.mjs            # scan this project's build
 *   node scripts/check-public-copy.mjs <htmlDir>  # scan a folder of .html files only
 * Env: PUBLIC_COPY_PORT (default 4317), PUBLIC_COPY_SKIP_SERVE=1 to skip step 2.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Fails the build. */
const ERRORS = [
  { label: 'feature-flag name', re: /\bFLAG_[A-Z0-9_]{2,}\b/ },
  {
    label: 'env-var name',
    re: /\b(?:NEXT_PUBLIC|SUPABASE|STRIPE|CLERK|CLOUDFLARE|PORTAL)_[A-Z0-9_]{2,}\b/,
  },
  { label: 'decision reference', re: /\(D\d{1,3}\)/ },
  { label: 'TODO / FIXME / TBD', re: /\b(?:TODO|FIXME|TBD|XXX)\b/ },
  { label: 'lorem ipsum', re: /lorem ipsum/i },
  {
    label: 'internal status label',
    re: /\b(?:identity locked|concept brief|staff concepts?|campaign model concept|technical guide concept|new demo system)\b/i,
  },
  {
    label: 'internal review note',
    re: /subject to (?:identity|wardrobe|trademark|legal|owner|client)\b.{0,60}\breview\b/i,
  },
  {
    label: 'internal approval note',
    re: /once (?:payments|it|this|they) (?:are|is) approved/i,
  },
  { label: 'broken render', re: /\[object Object\]|\bundefined\b|\bNaN\b/ },
];

/** Prints, does not block. Review before launch. */
const WARNINGS = [
  { label: 'coming-soon placeholder', re: /\bcoming soon\b/i },
  { label: 'placeholder wording', re: /\bplaceholder\b/i },
  {
    label: 'sample/demo wording',
    re: /\b(?:sample|dummy|test) (?:content|text|data|copy)\b/i,
  },
];

const SKIP_ROUTE =
  /^\/(?:api\/|_not-found$|_global-error$)|\[|\/(?:robots\.txt|sitemap\.xml|favicon\.ico|manifest\.webmanifest)$|\/opengraph-image|\/twitter-image|\/icon/;

let errorCount = 0;
let warnCount = 0;
let pageCount = 0;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ');
}

function scan(route, html) {
  pageCount += 1;
  const text = visibleText(html);
  for (const [rules, level] of [
    [ERRORS, 'ERROR'],
    [WARNINGS, 'WARN '],
  ]) {
    for (const { label, re } of rules) {
      const match = re.exec(text);
      if (!match) continue;
      if (level === 'ERROR') errorCount += 1;
      else warnCount += 1;
      const start = Math.max(0, match.index - 40);
      const excerpt = text
        .slice(start, match.index + match[0].length + 40)
        .trim();
      console.log(`[public-copy] ${level} ${route} — ${label}: "…${excerpt}…"`);
    }
  }
}

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) htmlFiles(path, out);
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

function toRoute(dir, file) {
  const rel = relative(dir, file).replace(/\\/g, '/');
  return (
    (
      '/' + rel.replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, '')
    ).replace(/\/$/, '') || '/'
  );
}

function scanStatic(dir) {
  const covered = new Set();
  for (const file of htmlFiles(dir)) {
    const route = toRoute(dir, file);
    if (SKIP_ROUTE.test(route)) continue;
    covered.add(route);
    scan(route, readFileSync(file, 'utf8'));
  }
  return covered;
}

function manifestRoutes(projectDir) {
  const manifest = join(projectDir, '.next', 'app-path-routes-manifest.json');
  if (!existsSync(manifest)) return [];
  const routes = Object.values(JSON.parse(readFileSync(manifest, 'utf8')));
  return [...new Set(routes)].filter((route) => !SKIP_ROUTE.test(route)).sort();
}

async function waitForServer(base, server) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null)
      throw new Error(`next start exited with code ${server.exitCode}`);
    try {
      await fetch(base, {
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error('next start did not answer within 60s');
}

async function scanServed(projectDir, routes) {
  const port = process.env.PUBLIC_COPY_PORT ?? '4317';
  const base = `http://127.0.0.1:${port}`;
  const nextBin = join(projectDir, 'node_modules', '.bin', 'next');
  const server = spawn(nextBin, ['start', '-p', port, '-H', '127.0.0.1'], {
    cwd: projectDir,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let serverErr = '';
  server.stderr.on('data', (chunk) => {
    serverErr += chunk;
  });
  try {
    await waitForServer(base, server);
    for (const route of routes) {
      let response;
      try {
        response = await fetch(base + route, {
          headers: { accept: 'text/html' },
          signal: AbortSignal.timeout(20000),
        });
      } catch (error) {
        warnCount += 1;
        console.log(
          `[public-copy] WARN  ${route} — request failed: ${error.message}`,
        );
        continue;
      }
      const finalRoute = new URL(response.url).pathname;
      const shown = finalRoute === route ? route : `${route} → ${finalRoute}`;
      if (response.status !== 200) {
        warnCount += 1;
        console.log(
          `[public-copy] WARN  ${shown} — HTTP ${response.status}, not scanned`,
        );
        continue;
      }
      if (!(response.headers.get('content-type') ?? '').includes('text/html'))
        continue;
      scan(shown, await response.text());
    }
  } finally {
    server.kill('SIGTERM');
  }
  if (serverErr.trim() && process.env.PUBLIC_COPY_VERBOSE)
    console.log(serverErr);
}

const target = process.argv[2];
if (target) {
  if (!existsSync(target)) {
    console.error(`[public-copy] ${target} not found.`);
    process.exit(1);
  }
  scanStatic(target);
} else {
  const projectDir = process.cwd();
  // Load .env / .env.local / .env.production the same way `next start` will.
  const { default: nextEnv } = await import('@next/env');
  nextEnv.loadEnvConfig(projectDir, false, {
    info: () => {},
    error: console.error,
  });
  const staticDir = join(projectDir, '.next', 'server', 'app');
  if (!existsSync(staticDir)) {
    console.error(
      '[public-copy] no build output at .next/server/app; run next build first.',
    );
    process.exit(1);
  }
  const covered = scanStatic(staticDir);
  const dynamicRoutes = manifestRoutes(projectDir).filter(
    (route) => !covered.has(route),
  );
  const pkg = JSON.parse(
    readFileSync(join(projectDir, 'package.json'), 'utf8'),
  );
  const usesClerk = Boolean(
    { ...pkg.dependencies, ...pkg.devDependencies }['@clerk/nextjs'],
  );
  const missingAuthKeys =
    usesClerk && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (
    dynamicRoutes.length > 0 &&
    missingAuthKeys &&
    !process.env.PUBLIC_COPY_SKIP_SERVE
  ) {
    // Clerk will not render without real keys, so a secret-less CI build cannot
    // serve its dynamic pages. Local builds (.env.local) and the deploy build do.
    console.log(
      `[public-copy] NOTICE ${dynamicRoutes.length} dynamic page(s) not checked: Clerk keys are not set in this environment.`,
    );
  } else if (dynamicRoutes.length > 0 && !process.env.PUBLIC_COPY_SKIP_SERVE) {
    try {
      await scanServed(projectDir, dynamicRoutes);
    } catch (error) {
      console.error(
        `[public-copy] could not serve the build to check dynamic pages: ${error.message}`,
      );
      process.exit(1);
    }
  }
}

console.log(
  `[public-copy] scanned ${pageCount} page(s): ${errorCount} error(s), ${warnCount} warning(s).`,
);
if (errorCount > 0) {
  console.error(
    '[public-copy] Internal copy is visible to the public. Remove it before deploying.',
  );
  process.exit(1);
}
