import { describe, expect, it } from "vitest";
import { ERAS_COLLECTION_PATHS, ERAS_VIP_WHATSAPP_URL } from "@shared/const";

describe("navegação pública da Eras Label", () => {
  it("mantém o convite real do Grupo VIP", () => {
    expect(ERAS_VIP_WHATSAPP_URL).toBe(
      "https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t",
    );
  });

  it("expõe caminhos distintos e canónicos para as coleções", () => {
    expect(ERAS_COLLECTION_PATHS).toEqual({
      paradox: "/collection/paradox",
      lostBetweenEras: "/collection/lost-between-eras",
      raizes: "/collection/raizes",
    });
    expect(new Set(Object.values(ERAS_COLLECTION_PATHS)).size).toBe(3);
  });
});
