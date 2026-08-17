import { describe, expect, it } from "vitest";

describe("título oficial da aplicação", () => {
  it("mantém o título Eras Label - Loja Oficial configurado no ambiente", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Eras Label - Loja Oficial");
  });
});
