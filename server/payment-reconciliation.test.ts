import { describe, expect, it } from "vitest";
import { shouldAutoReconcilePayment } from "./payment-reconciliation";
import { getOrderStatusLabel, getPaymentLabel, getPaymentTone, isPaymentConfirmed } from "../shared/payment-status";

describe("payment reconciliation and labels", () => {
  it("reconciles pending and in-process payments automatically", () => {
    expect(shouldAutoReconcilePayment("pending")).toBe(true);
    expect(shouldAutoReconcilePayment("in_process")).toBe(true);
    expect(shouldAutoReconcilePayment("")).toBe(true);
  });

  it("does not re-query confirmed or terminally failed payments", () => {
    expect(shouldAutoReconcilePayment("approved")).toBe(false);
    expect(shouldAutoReconcilePayment("authorized")).toBe(false);
    expect(shouldAutoReconcilePayment("rejected")).toBe(false);
    expect(shouldAutoReconcilePayment("cancelled")).toBe(false);
  });

  it("uses explicit approved payment wording while keeping fulfilment separate", () => {
    expect(isPaymentConfirmed("approved")).toBe(true);
    expect(getPaymentLabel("approved")).toBe("Pagamento aprovado");
    expect(getPaymentTone("approved")).toBe("approved");
    expect(getOrderStatusLabel("Processando")).toBe("Em preparação");
  });

  it("keeps pending and analysis labels clear for the customer", () => {
    expect(getPaymentLabel("pending")).toBe("Aguardando pagamento");
    expect(getPaymentLabel("in_process")).toBe("Pagamento em análise");
    expect(getPaymentTone("pending")).toBe("pending");
  });
});
