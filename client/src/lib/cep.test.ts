import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupCep, normalizeCep } from "./cep";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CEP lookup", () => {
  it("normaliza o CEP para oito dígitos", () => {
    expect(normalizeCep("01310-100abc")).toBe("01310100");
  });

  it("rejeita um CEP incompleto sem chamar a rede", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await expect(lookupCep("1234")).rejects.toThrow("CEP inválido");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("transforma uma resposta ViaCEP válida em campos de morada", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      logradouro: "Avenida Paulista",
      bairro: "Bela Vista",
      localidade: "São Paulo",
      uf: "sp",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    await expect(lookupCep("01310-100")).resolves.toEqual({
      street: "Avenida Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("rejeita respostas que indicam CEP inexistente", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ erro: true }), { status: 200 }));
    await expect(lookupCep("99999999")).rejects.toThrow("CEP não encontrado");
  });
});
