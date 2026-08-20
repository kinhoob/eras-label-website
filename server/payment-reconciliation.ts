import { getMercadoPagoPayment, searchMercadoPagoPayments } from "./mercadopago";
import { updateOrderPaymentStatus } from "./db";
import { isPaymentConfirmed, isPaymentFailed, normalizePaymentStatus } from "../shared/payment-status";

const RECONCILIATION_CANDIDATE_STATUSES = new Set(["", "pending", "in_process"]);
const MAX_ORDERS_PER_REFRESH = 12;

export function shouldAutoReconcilePayment(status: unknown) {
  const normalized = normalizePaymentStatus(status);
  return !isPaymentConfirmed(normalized) && !isPaymentFailed(normalized) && RECONCILIATION_CANDIDATE_STATUSES.has(normalized);
}

export async function reconcileVisibleOrderPayments(orderList: Array<Record<string, any>>) {
  if (process.env.ERAS_TEST_MODE === "1") return false;

  const candidates = orderList
    .filter((order) => shouldAutoReconcilePayment(order.paymentStatus))
    .slice(0, MAX_ORDERS_PER_REFRESH);

  let changed = false;
  await Promise.allSettled(candidates.map(async (order) => {
    try {
      let payment: any = null;
      const paymentId = String(order.paymentId ?? "").trim();

      if (paymentId) {
        const directPayment = await getMercadoPagoPayment(paymentId);
        if (directPayment && (!directPayment.external_reference || String(directPayment.external_reference) === String(order.orderNumber))) {
          payment = directPayment;
        }
      }

      if (!payment) {
        const matches = await searchMercadoPagoPayments(String(order.orderNumber));
        payment = matches[0] ?? null;
      }

      const paymentStatus = normalizePaymentStatus(payment?.status);
      if (!payment || !paymentStatus || paymentStatus === normalizePaymentStatus(order.paymentStatus)) return;

      const paymentDetail = payment.status_detail ? `${paymentStatus}: ${String(payment.status_detail)}` : null;
      await updateOrderPaymentStatus(String(order.orderNumber), paymentStatus, paymentDetail);
      changed = true;
    } catch (error) {
      // Falhas de consulta não podem impedir a página de Orders/Admin de abrir.
      console.warn(`[MercadoPago] Reconciliação automática ignorada para ${String(order.orderNumber)}:`, error);
    }
  }));

  return changed;
}
