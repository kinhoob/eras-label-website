import { Resend } from "resend";
import { ENV } from "./_core/env";

export type ResendMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type ResendSendResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: "not_configured" };

let client: Resend | null = null;

export function isResendConfigured() {
  return Boolean(ENV.resendApiKey && ENV.resendFromEmail);
}

function getClient() {
  if (!isResendConfigured()) return null;
  client ??= new Resend(ENV.resendApiKey);
  return client;
}

export async function sendResendEmail(message: ResendMessage): Promise<ResendSendResult> {
  const resend = getClient();
  if (!resend) return { sent: false, reason: "not_configured" };

  const response = await resend.emails.send({
    from: ENV.resendFromEmail,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
  });

  if (response.error) {
    throw new Error(`Resend rejected the email: ${response.error.message}`);
  }

  return { sent: true, id: response.data?.id ?? null };
}

export function resetResendClientForTests() {
  client = null;
}
