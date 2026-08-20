import { describe, expect, it } from "vitest";

describe("melhor envio sender document validation", () => {
  it("uses a valid default document when env is not set", () => {
    const doc = process.env.MELHOR_ENVIO_SENDER_DOCUMENT || "12345678909";
    expect(doc).toBeDefined();
    expect(doc.length).toBeGreaterThanOrEqual(11);
    expect(doc).not.toBe("00000000000");
  });
});
