import { beforeEach, describe, expect, it, vi } from "vitest";

const resendMocks = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: resendMocks.send } })),
}));

import { ENV } from "./_core/env";
import { resetResendClientForTests, sendResendEmail } from "./resend";

const originalApiKey = ENV.resendApiKey;
const originalFromEmail = ENV.resendFromEmail;

describe("Resend email service", () => {
  beforeEach(() => {
    ENV.resendApiKey = originalApiKey;
    ENV.resendFromEmail = originalFromEmail;
    resetResendClientForTests();
    resendMocks.send.mockReset();
  });

  it("sends through the configured sender without exposing the API key in the payload", async () => {
    resendMocks.send.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const result = await sendResendEmail({
      to: "cliente@example.com",
      subject: "Pedido confirmado",
      html: "<p>Pedido confirmado</p>",
      text: "Pedido confirmado",
    });

    expect(result).toEqual({ sent: true, id: "email_123" });
    expect(resendMocks.send).toHaveBeenCalledWith({
      from: originalFromEmail,
      to: "cliente@example.com",
      subject: "Pedido confirmado",
      html: "<p>Pedido confirmado</p>",
      text: "Pedido confirmado",
    });
    expect(JSON.stringify(resendMocks.send.mock.calls)).not.toContain(originalApiKey);
  });

  it("returns a safe fallback when the server has no Resend credentials", async () => {
    ENV.resendApiKey = "";
    ENV.resendFromEmail = "";

    const result = await sendResendEmail({
      to: "cliente@example.com",
      subject: "Pedido confirmado",
      html: "<p>Pedido confirmado</p>",
      text: "Pedido confirmado",
    });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(resendMocks.send).not.toHaveBeenCalled();
  });

  it("propagates a provider error without logging message contents", async () => {
    resendMocks.send.mockResolvedValue({ data: null, error: { message: "invalid sender" } });

    await expect(sendResendEmail({
      to: "cliente@example.com",
      subject: "Pedido confirmado",
      html: "<p>Pedido confirmado</p>",
      text: "Pedido confirmado",
    })).rejects.toThrow("Resend rejected the email: invalid sender");
  });
});
