export type MelhorEnvioWebhookUpdate = {
  trackingCode: string | null;
  shippingOrderId: string | null;
  newStatus: string | null;
  newFulfillment: string | null;
};

export function resolveMelhorEnvioWebhookUpdate(event: unknown): MelhorEnvioWebhookUpdate {
  const payload = event && typeof event === "object" ? event as Record<string, any> : {};
  const data = payload.data && typeof payload.data === "object" ? payload.data as Record<string, any> : {};

  const trackingCode = payload.tracking || payload.tracking_code || data.tracking || data.tracking_code || payload.protocol || null;
  const shippingOrderId = payload.id || payload.order_id || data.id || data.order_id || null;
  const statusEvent = String(payload.status || payload.event || data.status || "").toLowerCase();

  let newStatus: string | null = null;
  let newFulfillment: string | null = null;

  // "undelivered" contém a palavra "delivered"; a falha precisa ser avaliada primeiro.
  if (statusEvent.includes("undelivered") || statusEvent.includes("falha")) {
    newStatus = "Falha na entrega";
  } else if (statusEvent.includes("posted") || statusEvent.includes("shipped") || statusEvent.includes("enviado") || statusEvent.includes("transit")) {
    newStatus = "Em trânsito";
    newFulfillment = "shipped";
  } else if (statusEvent.includes("delivered") || statusEvent.includes("entregue")) {
    newStatus = "Entregue";
    newFulfillment = "shipped";
  } else if (statusEvent.includes("returned") || statusEvent.includes("devolvido")) {
    newStatus = "Devolvido";
  }

  return {
    trackingCode: trackingCode ? String(trackingCode) : null,
    shippingOrderId: shippingOrderId ? String(shippingOrderId) : null,
    newStatus,
    newFulfillment,
  };
}
