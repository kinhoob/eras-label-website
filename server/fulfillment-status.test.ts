import { describe, expect, it } from "vitest";
import { getFulfillmentTransitionError } from "./db";

describe("transições de fulfillment no painel", () => {
  it("permite marcar como enviado diretamente, mesmo com pagamento pendente", () => {
    expect(getFulfillmentTransitionError("pending_packaging", "shipped", "pending")).toBeNull();
  });

  it("permite marcar como enviado a partir de embalado", () => {
    expect(getFulfillmentTransitionError("packed", "shipped", "approved")).toBeNull();
  });

  it("continua bloqueando a saída de um pedido arquivado", () => {
    expect(getFulfillmentTransitionError("archived", "shipped", "approved")).toBe(
      "Um pedido arquivado não pode voltar ao fluxo operacional."
    );
  });

  it("continua exigindo pagamento aprovado para embalar", () => {
    expect(getFulfillmentTransitionError("pending_packaging", "packed", "pending")).toBe(
      "Só é possível preparar ou arquivar pedidos com pagamento aprovado."
    );
  });
});
