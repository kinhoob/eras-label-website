export const CHECKOUT_DRAFT_STORAGE_KEY = "eras-label-checkout-draft";

export type CheckoutPaymentMethod = "pix" | "credit_card";

/**
 * Rascunho mínimo do checkout. Os campos comerciais opcionais representam
 * valores já validados na sacola e evitam que o cliente precise repetir a ação.
 */
export type CheckoutDraft = {
  coupon: string;
  couponApplied: boolean;
  couponDiscount?: number;
  couponFreeShipping?: boolean;
  selectedPaymentMethod: CheckoutPaymentMethod;
  shippingCep: string;
  shippingMethod?: string;
  shippingOptionId?: string;
  shippingCost?: number;
  shippingDeadline?: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function readNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function loadCheckoutDraft(storage?: StorageLike): Partial<CheckoutDraft> {
  const target = getStorage(storage);
  if (!target) return {};

  try {
    const raw = target.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const draft = parsed as Record<string, unknown>;
    const shippingMethod = typeof draft.shippingMethod === "string" ? draft.shippingMethod.slice(0, 120) : "";
    const shippingOptionId = typeof draft.shippingOptionId === "string" ? draft.shippingOptionId.slice(0, 120) : "";
    const shippingDeadline = typeof draft.shippingDeadline === "string" ? draft.shippingDeadline.slice(0, 120) : "";
    const couponDiscount = readNonNegativeNumber(draft.couponDiscount);
    const shippingCost = readNonNegativeNumber(draft.shippingCost);
    return {
      coupon: typeof draft.coupon === "string" ? draft.coupon : "",
      couponApplied: draft.couponApplied === true,
      ...(couponDiscount !== undefined ? { couponDiscount } : {}),
      ...(draft.couponFreeShipping === true ? { couponFreeShipping: true } : {}),
      selectedPaymentMethod: draft.selectedPaymentMethod === "credit_card" ? "credit_card" : "pix",
      shippingCep: typeof draft.shippingCep === "string" ? draft.shippingCep.replace(/\D/g, "").slice(0, 8) : "",
      ...(shippingMethod ? { shippingMethod } : {}),
      ...(shippingOptionId ? { shippingOptionId } : {}),
      ...(shippingCost !== undefined ? { shippingCost } : {}),
      ...(shippingDeadline ? { shippingDeadline } : {}),
    };
  } catch {
    return {};
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft, storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;
  try {
    target.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // O checkout continua funcional mesmo quando o armazenamento está indisponível.
  }
}

export function clearCheckoutDraft(storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;
  try {
    target.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
  } catch {
    // A limpeza é apenas uma melhoria; não impede a conclusão do pedido.
  }
}
