/**
 * Pushes the Worker secrets this site needs from `.env.local` into Cloudflare.
 *
 * Only values that are genuinely secret live here. Publishable keys and public
 * URLs are committed in `wrangler.jsonc` under `vars`.
 *
 *   node scripts/set-cloudflare-secrets.mjs            # show what would be set
 *   node scripts/set-cloudflare-secrets.mjs --apply    # set them
 *
 * Requires `wrangler login` with `workers_scripts:write`, or a
 * `CLOUDFLARE_API_TOKEN` with Workers Scripts:Edit.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const SECRETS = [
  'CLERK_SECRET_KEY',
  'SUPABASE_SECRET_KEY',
  'STRIPE_SECRET_KEY',
];

const apply = process.argv.includes('--apply');

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/**
 * Minimal `.env` reader. Strips one matching pair of surrounding quotes and
 * keeps everything inside, so JSON values survive.
 */
function parseEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    fail(`cannot read ${path}`);
  }

  const values = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      value.length >= 2 &&
      value[0] === value[value.length - 1] &&
      (value[0] === '"' || value[0] === "'")
    ) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

const env = parseEnvFile('.env.local');
const missing = SECRETS.filter((name) => !env.get(name)?.trim());
if (missing.length) fail(`missing in .env.local: ${missing.join(', ')}`);

if (!apply) {
  console.log('Would set these Worker secrets (re-run with --apply):');
  for (const name of SECRETS) {
    console.log(`  ${name} (${env.get(name).length} chars)`);
  }
  process.exit(0);
}

let failed = false;
for (const name of SECRETS) {
  process.stdout.write(`  ${name.padEnd(26)} `);
  try {
    execFileSync('npx', ['wrangler', 'secret', 'put', name], {
      input: env.get(name),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
    console.log('set');
  } catch (error) {
    failed = true;
    const detail = `${error.stderr ?? ''}${error.stdout ?? ''}`.trim();
    console.log(`FAILED${detail ? `: ${detail.split('\n').pop()}` : ''}`);
  }
}

if (failed) {
  fail('one or more Worker secrets were not set');
}
