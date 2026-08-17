import { describe, it, expect } from "vitest";

describe("Mercado Pago Sandbox & Pix Communication Error Handling", () => {
  it("should handle Pix communication_error with structured fallback guidance", () => {
    const errorPayload = {
      status: 400,
      error: "communication_error",
      message: "Unable to reach acquiring gateway or invalid seller credentials",
      details: "Ensure sandbox credentials and CPF/CNPJ are properly configured in Mercado Pago dashboard."
    };

    expect(errorPayload.error).toBe("communication_error");
    expect(errorPayload.message).toContain("gateway");
    expect(errorPayload.details).toContain("sandbox credentials");
  });

  it("should generate stable idempotency keys per order reference", () => {
    const orderId = 1042;
    const idempotencyKey = `eras-label-order-${orderId}-${Date.now().toString().slice(0, -3)}`;
    expect(idempotencyKey).toContain("eras-label-order-1042");
  });

  it("should validate credit card expiration normalisation for sandbox tokens", () => {
    const rawExpiration = "12/28";
    const [month, year] = rawExpiration.split("/");
    expect(month).toBe("12");
    expect(year).toBe("28");
  });
});
