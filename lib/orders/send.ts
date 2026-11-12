import 'server-only';

/**
 * Outbound onboarding messages. Off by default: nothing is sent to a customer
 * until ONBOARDING_SEND_ENABLED=true is set in the Worker environment, which
 * King Fee turns on after approving the templates. While off, every message is
 * still recorded in order_messages with status "held".
 *
 * Email providers (ONBOARDING_EMAIL_PROVIDER):
 *  - "cloudflare": Cloudflare Email Service via the `EMAIL` send_email binding.
 *    Sending to any customer address needs the Workers Paid plan.
 *  - "resend": Resend REST API with RESEND_API_KEY (free tier available).
 * Text messages are not wired yet (needs A2P 10DLC carrier registration).
 */

export type SendResult = {
  status: 'sent' | 'held' | 'failed' | 'not_configured';
  provider: string | null;
  providerMessageId?: string;
  error?: string;
};

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

type EmailBinding = {
  send(message: {
    to: string;
    from: { email: string; name: string };
    replyTo?: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ messageId?: string }>;
};

export const sendingEnabled = () =>
  process.env.ONBOARDING_SEND_ENABLED?.trim() === 'true';

const fromEmail = () => process.env.ONBOARDING_FROM_EMAIL?.trim() || null;
const FROM_NAME = 'Fee The Developer';

function clip(value: unknown): string {
  return String(value).slice(0, 500);
}

async function emailBinding(): Promise<EmailBinding | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = await getCloudflareContext({ async: true });
    return (
      ((env as unknown as Record<string, unknown>).EMAIL as EmailBinding) ??
      null
    );
  } catch {
    return null;
  }
}

async function viaCloudflare(
  message: EmailMessage,
  from: string,
): Promise<SendResult> {
  const binding = await emailBinding();
  if (!binding) return { status: 'not_configured', provider: 'cloudflare' };
  try {
    const result = await binding.send({
      to: message.to,
      from: { email: from, name: FROM_NAME },
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return {
      status: 'sent',
      provider: 'cloudflare',
      providerMessageId: result?.messageId,
    };
  } catch (error) {
    return { status: 'failed', provider: 'cloudflare', error: clip(error) };
  }
}

async function viaResend(
  message: EmailMessage,
  from: string,
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { status: 'not_configured', provider: 'resend' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${from}>`,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    return response.ok
      ? { status: 'sent', provider: 'resend', providerMessageId: body.id }
      : {
          status: 'failed',
          provider: 'resend',
          error: clip(`${response.status} ${body.message ?? ''}`),
        };
  } catch (error) {
    return { status: 'failed', provider: 'resend', error: clip(error) };
  }
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const provider = process.env.ONBOARDING_EMAIL_PROVIDER?.trim() || null;
  if (!sendingEnabled()) return { status: 'held', provider };
  const from = fromEmail();
  if (!from || !provider) return { status: 'not_configured', provider };
  if (provider === 'cloudflare') return viaCloudflare(message, from);
  if (provider === 'resend') return viaResend(message, from);
  return { status: 'not_configured', provider };
}
