/**
 * Teste de regressão da chave secreta do webhook do Mercado Pago.
 *
 * A chave do webhook não é um Access Token: ela valida localmente o HMAC
 * enviado pelo Mercado Pago. Por isso o teste simula uma notificação mínima,
 * calcula a assinatura exatamente como o provedor calcula e confirma que o
 * verificador aceita a assinatura correta e rejeita uma assinatura alterada.
 */
import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { buildSignatureManifest, verifyMercadoPagoSignature } from "./mercadopago.signature";

describe("Mercado Pago webhook secret", () => {
  it("validates the configured secret with a signed lightweight webhook payload", () => {
    expect(ENV.mpWebhookSecret.trim()).not.toBe("");

    const dataId = "webhook-secret-validation";
    const requestId = "eras-label-vitest-request";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const manifest = buildSignatureManifest(dataId, requestId, timestamp);
    const signature = crypto
      .createHmac("sha256", ENV.mpWebhookSecret)
      .update(manifest)
      .digest("hex");

    const result = verifyMercadoPagoSignature({
      signatureHeader: `ts=${timestamp},v1=${signature}`,
      requestId,
      dataId,
      secret: ENV.mpWebhookSecret,
    });

    expect(result).toEqual({ valid: true });
  });

  it("rejects a webhook signed with a different secret", () => {
    const dataId = "webhook-secret-validation";
    const requestId = "eras-label-vitest-request";
    const timestamp = String(Math.floor(Date.now() / 1000));
    const manifest = buildSignatureManifest(dataId, requestId, timestamp);
    const wrongSignature = crypto
      .createHmac("sha256", "wrong-secret-for-regression")
      .update(manifest)
      .digest("hex");

    const result = verifyMercadoPagoSignature({
      signatureHeader: `ts=${timestamp},v1=${wrongSignature}`,
      requestId,
      dataId,
      secret: ENV.mpWebhookSecret,
    });

    expect(result).toEqual({ valid: false, reason: "signature_mismatch" });
  });
});
