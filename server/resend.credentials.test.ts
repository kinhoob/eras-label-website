import { describe, expect, it } from "vitest";

describe("Resend credentials", () => {
  it.skipIf(process.env.ERAS_EXTERNAL_TESTS !== "1")("authenticates successfully against the Resend domains endpoint", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured for this validation").toMatch(/^re_[A-Za-z0-9_\-]+$/);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      expect(response.status, "Resend rejected the configured API key").toBeLessThan(400);
    } finally {
      clearTimeout(timeout);
    }
  }, 15_000);

  it("has valid sender and admin recipient configuration", () => {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const adminEmail = process.env.RESEND_ADMIN_EMAIL;

    expect(fromEmail, "RESEND_FROM_EMAIL must be configured").toMatch(/<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>|^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/);
    expect(adminEmail, "RESEND_ADMIN_EMAIL must be configured").toMatch(/^[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+$/);
  });
});
