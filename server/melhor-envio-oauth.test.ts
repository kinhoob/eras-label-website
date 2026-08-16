import { describe, expect, it } from "vitest";
import { getMelhorEnvioAuthUrl } from "./melhor-envio-oauth";

describe("Melhor Envio OAuth2 Module", () => {
  it("generates a valid authorization URL with client_id and scopes", () => {
    const url = getMelhorEnvioAuthUrl("https://eraslabel.com/api/melhor-envio/callback");
    expect(url).toContain("https://melhorenvio.com.br/oauth/authorize");
    expect(url).toContain("response_type=code");
    expect(url).toContain("scope=");
    expect(url).toContain("redirect_uri=");
  });
});
