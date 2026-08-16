export type LabelReadyOrder = {
  labelPdfUrl?: unknown;
  shippingOrderId?: unknown;
};

function hasText(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

/**
 * Considera o pedido pronto quando existe um PDF persistido ou um ID de
 * envio que permite ao backend obter a etiqueta sob demanda no Melhor Envio.
 */
export function hasReadyShippingLabel(order: LabelReadyOrder): boolean {
  return hasText(order.labelPdfUrl) || hasText(order.shippingOrderId);
}

export function filterOrdersWithReadyLabels<T extends LabelReadyOrder>(orders: T[]): T[] {
  return orders.filter(hasReadyShippingLabel);
}
