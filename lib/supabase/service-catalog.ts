import 'server-only';

import { getSupabaseAdmin } from './server';
import type { ServiceCatalogRow } from './types';

/**
 * Reads the published service catalog.
 *
 * `service_catalog` has row level security enabled with no policies and is
 * revoked from `anon`/`authenticated`, so the secret-key client is required.
 */

export type ServiceCatalogEntry = {
  slug: string;
  name: string;
  category: ServiceCatalogRow['category'];
  billingInterval: ServiceCatalogRow['billing_interval'];
  /** Formatted for display, e.g. `$200`, `$60/year` or `Starting at $5,500`. */
  priceLabel: string;
  amountCents: number;
  scopeNote: string;
  sortOrder: number;
};

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function toEntry(row: ServiceCatalogRow): ServiceCatalogEntry {
  const amount = usd.format(row.amount_cents / 100);
  const suffix =
    row.billing_interval === 'month'
      ? '/month'
      : row.billing_interval === 'year'
        ? '/year'
        : '';
  const prefix =
    row.price_qualifier === 'Flat' ? '' : `${row.price_qualifier} `;

  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    billingInterval: row.billing_interval,
    priceLabel: `${prefix}${amount}${suffix}`,
    amountCents: row.amount_cents,
    scopeNote: row.scope_note,
    sortOrder: row.sort_order,
  };
}

/**
 * Returns the active catalog in display order, or an empty array when Supabase
 * is unconfigured or the query fails. Callers keep their static fallback so a
 * database outage never takes a page down.
 */
export async function getServiceCatalog(): Promise<ServiceCatalogEntry[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('service_catalog')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[supabase] service_catalog read failed:', error.message);
    return [];
  }

  return (data ?? []).map(toEntry);
}
