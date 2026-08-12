export type OrderSummaryItem = {
  id: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  alt: string;
};

export type OrderSummary = {
  items: OrderSummaryItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: "pix" | "card" | "credit_card";
  estimatedDelivery: string;
};

type OrderSummaryInput = Omit<OrderSummary, "totalItems" | "estimatedDelivery"> & {
  estimatedDelivery?: string | null;
};

export function createOrderSummary(input: OrderSummaryInput): OrderSummary {
  return {
    ...input,
    items: input.items.map((item) => ({ ...item })),
    totalItems: input.items.reduce((total, item) => total + item.quantity, 0),
    estimatedDelivery: input.estimatedDelivery?.trim() || "4 a 8 dias \u00FAteis",
  };
}
