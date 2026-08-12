import { describe, expect, it } from "vitest";
import { getCheckoutFeedback } from "../client/src/lib/checkout-feedback";
import { checkoutFlowReducer, initialCheckoutFlowState } from "../client/src/lib/checkout-flow";

describe("checkout feedback", () => {
  it("exibe uma mensagem orientando o cliente durante a confirmação", () => {
    const feedback = getCheckoutFeedback("processing");

    expect(feedback.tone).toBe("processing");
    expect(feedback.title).toBe("Confirmando seu pagamento");
    expect(feedback.message).toContain("Não feche esta janela");
  });

  it("inclui o número do pedido na confirmação de sucesso", () => {
    const feedback = getCheckoutFeedback("success", "ER-2026-1234");

    expect(feedback.tone).toBe("success");
    expect(feedback.title).toBe("Pagamento aprovado");
    expect(feedback.message).toContain("ER-2026-1234");
  });

  it("preserva a mensagem de erro e orienta uma nova tentativa", () => {
    const feedback = getCheckoutFeedback("error", "", "Gateway indisponível");

    expect(feedback.tone).toBe("error");
    expect(feedback.message).toBe("Gateway indisponível");
  });

  it("transita do processamento para sucesso e mantém o pedido confirmado", () => {
    const processing = checkoutFlowReducer(initialCheckoutFlowState, { type: "start" });
    const success = checkoutFlowReducer(processing, { type: "success", orderNumber: "ER-2026-1234" });

    expect(processing.status).toBe("processing");
    expect(success).toEqual({ status: "success", orderNumber: "ER-2026-1234", errorMessage: "" });
  });

  it("transita para erro e preserva a possibilidade de nova tentativa", () => {
    const processing = checkoutFlowReducer(initialCheckoutFlowState, { type: "start" });
    const failure = checkoutFlowReducer(processing, { type: "error", message: "Gateway indisponível" });
    const reset = checkoutFlowReducer(failure, { type: "reset" });

    expect(failure).toEqual({ status: "error", orderNumber: "", errorMessage: "Gateway indisponível" });
    expect(reset).toEqual(initialCheckoutFlowState);
  });
});
