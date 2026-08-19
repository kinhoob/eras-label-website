import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  buildSignatureManifest,
  parseSignatureHeader,
  verifyMercadoPagoSignature,
} from "./mercadopago.signature";

const SECRET = "chave-secreta-de-teste";
const NOW = 1_700_000_000_000; // ms

function sign(dataId: string, requestId: string, tsSeconds: number) {
  const manifest = buildSignatureManifest(dataId, requestId, String(tsSeconds));
  const v1 = crypto.createHmac("sha256", SECRET).update(manifest).digest("hex");
  return `ts=${tsSeconds},v1=${v1}`;
}

describe("verifyMercadoPagoSignature", () => {
  const dataId = "123456789";
  const requestId = "req-abc";
  const ts = NOW / 1000;

  it("parses the x-signature header", () => {
    expect(parseSignatureHeader("ts=123,v1=abc")).toEqual({ ts: "123", v1: "abc" });
  });

  it("accepts a valid signature", () => {
    const result = verifyMercadoPagoSignature({
      signatureHeader: sign(dataId, requestId, ts),
      requestId,
      dataId,
      secret: SECRET,
      now: NOW,
    });
    expect(result).toEqual({ valid: true });
  });

  it("rejects a tampered payment id", () => {
    const result = verifyMercadoPagoSignature({
      signatureHeader: sign(dataId, requestId, ts),
      requestId,
      dataId: "999999999",
      secret: SECRET,
      now: NOW,
    });
    expect(result).toEqual({ valid: false, reason: "signature_mismatch" });
  });

  it("rejects a replayed (old) notification", () => {
    const oldTs = ts - 3600;
    const result = verifyMercadoPagoSignature({
      signatureHeader: sign(dataId, requestId, oldTs),
      requestId,
      dataId,
      secret: SECRET,
      now: NOW,
    });
    expect(result).toEqual({ valid: false, reason: "timestamp_out_of_tolerance" });
  });

  it("rejects when the header is missing or malformed", () => {
    expect(
      verifyMercadoPagoSignature({ signatureHeader: null, requestId, dataId, secret: SECRET, now: NOW }).valid
    ).toBe(false);
    expect(
      verifyMercadoPagoSignature({ signatureHeader: "garbage", requestId, dataId, secret: SECRET, now: NOW })
    ).toEqual({ valid: false, reason: "malformed_signature_header" });
  });

  it("rejects when no secret is configured", () => {
    expect(
      verifyMercadoPagoSignature({
        signatureHeader: sign(dataId, requestId, ts),
        requestId,
        dataId,
        secret: "",
        now: NOW,
      })
    ).toEqual({ valid: false, reason: "missing_secret" });
  });
});
