const CONFIRMED_PAYMENT_STATUSES = new Set(["approved", "authorized"]);
const FAILED_PAYMENT_STATUSES = new Set(["failed", "rejected", "cancelled", "cancelled_by_collector"]);

export function normalizePaymentStatus(status: unknown) {
  return String(status ?? "").trim().toLowerCase();
}

export function isPaymentConfirmed(status: unknown) {
  return CONFIRMED_PAYMENT_STATUSES.has(normalizePaymentStatus(status));
}

export function isPaymentFailed(status: unknown) {
  return FAILED_PAYMENT_STATUSES.has(normalizePaymentStatus(status));
}

export function getPaymentLabel(status: unknown) {
  const normalizedStatus = normalizePaymentStatus(status);
  if (isPaymentConfirmed(normalizedStatus)) return "Pagamento aprovado";
  if (isPaymentFailed(normalizedStatus)) return "Pagamento recusado";
  if (normalizedStatus === "in_process" || normalizedStatus === "in_mediation") return "Pagamento em análise";
  return "Aguardando pagamento";
}

export function getPaymentTone(status: unknown) {
  if (isPaymentConfirmed(status)) return "approved" as const;
  if (isPaymentFailed(status)) return "failed" as const;
  return "pending" as const;
}

export function getOrderStatusLabel(status: unknown) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  if (normalizedStatus === "processando") return "Em preparação";
  if (normalizedStatus === "em análise") return "Pagamento em análise";
  return String(status ?? "Aguardando processamento");
}
