import { NextResponse } from 'next/server';
import { INTAKE_LIMITS, validateIntake } from '@/lib/intake';
import { siteConfig } from '@/lib/site-config';

// Persists /start project intakes to Supabase `public.project_intakes`.
// The service key stays server-side; the table denies anon/authenticated access.
// Any failure returns a non-2xx status so the form falls back to email.

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    return (
      originHost === request.headers.get('host') ||
      originHost === new URL(siteConfig.siteUrl).host
    );
  } catch {
    return false;
  }
}

/** Flags ride on `source` so no table change is needed. */
function intakeSource(intake: {
  promotionCode: string | null;
  veteranDiscount: boolean;
  depositPlan: boolean;
}): string {
  const params = new URLSearchParams();
  if (intake.promotionCode) params.set('promo', intake.promotionCode);
  if (intake.veteranDiscount) params.set('veteran', '1');
  if (intake.depositPlan) params.set('plan', 'deposit');
  const query = params.toString();
  return query ? `feethedev-site:/start?${query}` : 'feethedev-site:/start';
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: 'forbidden' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > INTAKE_LIMITS.bodyBytes) {
    return json({ error: 'payload_too_large' }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const result = validateIntake(parsed);
  if (!result.ok && result.spam) {
    // Look successful to bots; nothing is stored.
    return json({ status: 'received' }, 202);
  }
  if (!result.ok) return json({ error: 'invalid', fields: result.errors }, 400);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'intake_unavailable' }, 503);
  }

  const { intake } = result;
  let response: Response;
  try {
    response = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_intakes?on_conflict=submission_id`,
      {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          'Content-Type': 'application/json',
          // Retries with the same submission_id are ignored, not duplicated.
          Prefer: 'resolution=ignore-duplicates,return=minimal',
        },
        body: JSON.stringify({
          submission_id: intake.submissionId,
          name: intake.name,
          email: intake.email,
          company: intake.company,
          service: intake.service,
          budget_range: intake.budget,
          timeline: intake.timeline,
          goals: intake.goals,
          source: intakeSource(intake),
          user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
  } catch {
    console.error('intake_store_unreachable');
    return json({ error: 'intake_unavailable' }, 502);
  }

  if (!response.ok) {
    console.error('intake_store_rejected', response.status);
    return json({ error: 'intake_unavailable' }, 502);
  }

  return json({ status: 'received', reference: intake.submissionId }, 201);
}
