import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadMelhorEnvioLabelFile } from "./melhor-envio";

describe("Melhor Envio label PDF", () => {
  const previousToken = process.env.MELHOR_ENVIO_TOKEN;

  beforeEach(() => {
    process.env.MELHOR_ENVIO_TOKEN = "test-token";
  });

  afterEach(() => {
    if (previousToken === undefined) delete process.env.MELHOR_ENVIO_TOKEN;
    else process.env.MELHOR_ENVIO_TOKEN = previousToken;
    vi.unstubAllGlobals();
  });

  it("downloads a binary PDF using the shipment id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { "content-type": "application/pdf" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await downloadMelhorEnvioLabelFile("shipment-123");

    expect(result.kind).toBe("binary");
    if (result.kind === "binary") {
      expect(Array.from(result.bytes)).toEqual([37, 80, 68, 70]);
      expect(result.contentType).toBe("application/pdf");
    }
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/me/imprimir/pdf/shipment-123"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer .+/) }),
      }),
    );
  });

  it("accepts a URL response when the provider returns JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ url: "https://files.example.com/label.pdf" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(downloadMelhorEnvioLabelFile("shipment-456")).resolves.toEqual({
      kind: "url",
      url: "https://files.example.com/label.pdf",
    });
  });

  it("surfaces the provider error without returning a fake PDF", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Etiqueta ainda não gerada", {
          status: 422,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(downloadMelhorEnvioLabelFile("shipment-789")).rejects.toThrow("422");
  });
});
