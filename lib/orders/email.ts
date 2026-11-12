import type { CatalogItem } from '@/lib/catalog';
import { escapeHtml, formatUsd } from '@/lib/orders/core';
import { promiseFor } from '@/lib/orders/promises';
import { TERMS_APPROVED_ON } from '@/lib/orders/terms';
import { siteConfig } from '@/lib/site-config';

export type ConfirmationInput = {
  orderNumber: string;
  item: Pick<CatalogItem, 'name' | 'slug' | 'line'>;
  plan: 'full' | 'deposit';
  amountCents: number;
  recurring: boolean;
  customerName: string | null;
  orderUrl: string;
};

/**
 * The order confirmation sent the moment Stripe confirms payment. Stripe sends
 * its own receipt separately; this email is the "what happens now" message,
 * with the welcome video once it exists.
 */
export function orderConfirmationEmail(input: ConfirmationInput) {
  const { approved, promise, steps } = promiseFor(input.item);
  const firstName = input.customerName?.trim().split(/\s+/)[0] || 'there';
  const paid = formatUsd(input.amountCents);
  const paidLine =
    input.plan === 'deposit'
      ? `${paid} deposit received for ${input.item.name}. The balance is invoiced at the milestones below.`
      : input.recurring
        ? `${paid} received. Your ${input.item.name} plan is active and renews monthly.`
        : `${paid} received for ${input.item.name}.`;

  const subject = `Order ${input.orderNumber} confirmed: ${input.item.name}`;
  const video = promise?.videoUrl ?? null;
  const youDo = promise?.youDo ?? [];

  const text = [
    `Hi ${firstName},`,
    '',
    `Thank you. Your payment went through and your order is confirmed.`,
    '',
    `Order number: ${input.orderNumber}`,
    paidLine,
    'Stripe emails your official receipt separately.',
    '',
    approved && promise ? promise.headline : '',
    'What happens next:',
    ...steps.map((s, i) => `${i + 1}. ${s.title} (${s.when}): ${s.detail}`),
    ...(youDo.length
      ? ['', 'What we need from you:', ...youDo.map((d) => `- ${d}`)]
      : []),
    ...(video ? ['', `Watch your welcome video: ${video}`] : []),
    '',
    `Your order page: ${input.orderUrl}`,
    '',
    'Questions? Reply to this email, call ' +
      `${siteConfig.phoneDisplay}, or email ${siteConfig.email}.`,
    'Always mention your order number.',
    '',
    TERMS_APPROVED_ON
      ? `Terms, refunds and delivery: ${siteConfig.siteUrl}/terms`
      : '',
    '',
    `— King Fee, ${siteConfig.legalName}`,
  ]
    .filter((line, i, all) => !(line === '' && all[i - 1] === ''))
    .join('\n');

  const e = escapeHtml;
  const stepRows = steps
    .map(
      (s, i) =>
        `<tr><td style="padding:10px 0;border-top:1px solid #e5e7eb;vertical-align:top;width:28px;font-weight:700;color:#0f766e">${i + 1}</td><td style="padding:10px 0;border-top:1px solid #e5e7eb"><strong>${e(s.title)}</strong> <span style="color:#6b7280">· ${e(s.when)}</span><br>${e(s.detail)}</td></tr>`,
    )
    .join('');
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:28px" cellpadding="0" cellspacing="0"><tr><td>
<p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#0f766e;font-weight:700">Order confirmed · ${e(input.orderNumber)}</p>
<h1 style="margin:12px 0 8px;font-size:24px">Thank you, ${e(firstName)}. You're in.</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.5">${e(paidLine)} Stripe emails your official receipt separately.</p>
${video ? `<p style="margin:0 0 20px"><a href="${e(video)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">▶ Watch your welcome video</a></p>` : ''}
${approved && promise ? `<p style="margin:0 0 8px;font-weight:700">${e(promise.headline)}</p>` : ''}
<p style="margin:16px 0 4px;font-weight:700">What happens next</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">${stepRows}</table>
${youDo.length ? `<p style="margin:20px 0 4px;font-weight:700">What we need from you</p><ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.5">${youDo.map((d) => `<li>${e(d)}</li>`).join('')}</ul>` : ''}
<p style="margin:24px 0 0"><a href="${e(input.orderUrl)}" style="color:#0f766e;font-weight:700">View your order page</a></p>
<p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#374151">Questions? Reply to this email, call <a href="tel:${e(siteConfig.phone)}" style="color:#0f766e">${e(siteConfig.phoneDisplay)}</a>, or email <a href="mailto:${e(siteConfig.email)}" style="color:#0f766e">${e(siteConfig.email)}</a>. Mention order ${e(input.orderNumber)}.</p>
<p style="margin:16px 0 0;font-size:12px;color:#6b7280">${TERMS_APPROVED_ON ? `<a href="${e(siteConfig.siteUrl)}/terms" style="color:#6b7280">Terms, refunds and delivery</a> · ` : ''}${e(siteConfig.legalName)} · Veteran-owned · Texas</p>
</td></tr></table></td></tr></table></body></html>`;

  return { subject, text, html, template: 'order_confirmation_v1' as const };
}
