import { Resend } from "resend";
import { ENV } from "./_core/env";
import { logResendEmail } from "./db";

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

export async function sendResendEmail(message: ResendMessage, templateType = "transactional"): Promise<ResendSendResult> {
  const resend = getClient();
  const recipientStr = Array.isArray(message.to) ? message.to.join(", ") : message.to;

  if (!resend) {
    await logResendEmail({
      recipient: recipientStr,
      subject: message.subject,
      templateType,
      status: "skipped_not_configured",
      providerResponse: "Resend API key or sender email not configured.",
    });
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await resend.emails.send({
      from: ENV.resendFromEmail,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });

    if (response.error) {
      const errorMsg = response.error.message;
      await logResendEmail({
        recipient: recipientStr,
        subject: message.subject,
        templateType,
        status: "failed",
        providerResponse: errorMsg,
      });
      throw new Error(`Resend rejected the email: ${errorMsg}`);
    }

    const emailId = response.data?.id ?? null;
    await logResendEmail({
      recipient: recipientStr,
      subject: message.subject,
      templateType,
      status: "sent",
      providerResponse: emailId ? `ID: ${emailId}` : "Sent successfully",
    });

    return { sent: true, id: emailId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await logResendEmail({
      recipient: recipientStr,
      subject: message.subject,
      templateType,
      status: "error",
      providerResponse: errorMessage,
    });
    throw err;
  }
}

export function resetResendClientForTests() {
  client = null;
}
