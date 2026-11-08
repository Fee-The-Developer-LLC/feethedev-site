import { normalizePromotionCode } from '@/lib/promotions';

/**
 * Project intake contract shared by the /start form and POST /api/intake.
 * Intakes persist to Supabase `public.project_intakes` (source of truth for
 * leads, decided 2026-10-07). The email fallback stays available on failure.
 */

export const INTAKE_LIMITS = {
  name: 200,
  email: 320,
  company: 200,
  service: 120,
  budget: 60,
  timeline: 120,
  goalsMin: 20,
  goalsMax: 5000,
  bodyBytes: 16_384,
} as const;

export type ProjectIntake = {
  submissionId: string;
  name: string;
  email: string;
  company: string | null;
  service: string;
  budget: string;
  timeline: string | null;
  goals: string;
  promotionCode: string | null;
  /** Asked for the veteran discount; proof is requested by email, never uploaded here. */
  veteranDiscount: boolean;
  /** Asked to start with a deposit. */
  depositPlan: boolean;
};

export type IntakeValidation =
  | { ok: true; intake: ProjectIntake }
  | { ok: false; spam: true }
  | { ok: false; spam: false; errors: string[] };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateIntake(input: unknown): IntakeValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, spam: false, errors: ['body'] };
  }
  const raw = input as Record<string, unknown>;

  // Honeypot: real visitors never see or fill the `website` field.
  if (text(raw.website)) return { ok: false, spam: true };

  const intake: ProjectIntake = {
    submissionId: text(raw.submissionId).toLowerCase(),
    name: text(raw.name),
    email: text(raw.email).toLowerCase(),
    company: text(raw.company) || null,
    service: text(raw.service),
    budget: text(raw.budget),
    timeline: text(raw.timeline) || null,
    goals: text(raw.goals),
    promotionCode: normalizePromotionCode(raw.promotionCode),
    veteranDiscount:
      raw.veteranDiscount === 'yes' || raw.veteranDiscount === true,
    depositPlan: raw.paymentPlan === 'deposit',
  };

  const errors: string[] = [];
  if (!UUID_PATTERN.test(intake.submissionId)) errors.push('submissionId');
  if (!intake.name || intake.name.length > INTAKE_LIMITS.name) {
    errors.push('name');
  }
  if (
    intake.email.length > INTAKE_LIMITS.email ||
    !EMAIL_PATTERN.test(intake.email)
  ) {
    errors.push('email');
  }
  if ((intake.company?.length ?? 0) > INTAKE_LIMITS.company) {
    errors.push('company');
  }
  if (!intake.service || intake.service.length > INTAKE_LIMITS.service) {
    errors.push('service');
  }
  if (!intake.budget || intake.budget.length > INTAKE_LIMITS.budget) {
    errors.push('budget');
  }
  if ((intake.timeline?.length ?? 0) > INTAKE_LIMITS.timeline) {
    errors.push('timeline');
  }
  if (
    intake.goals.length < INTAKE_LIMITS.goalsMin ||
    intake.goals.length > INTAKE_LIMITS.goalsMax
  ) {
    errors.push('goals');
  }
  return errors.length
    ? { ok: false, spam: false, errors }
    : { ok: true, intake };
}
