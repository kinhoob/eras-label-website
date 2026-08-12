import type { CheckoutStatus } from "./checkout-feedback";

export type CheckoutFlowState = {
  status: CheckoutStatus;
  orderNumber: string;
  errorMessage: string;
};

export type CheckoutFlowAction =
  | { type: "start" }
  | { type: "success"; orderNumber: string }
  | { type: "error"; message: string }
  | { type: "reset" };

export const initialCheckoutFlowState: CheckoutFlowState = {
  status: "idle",
  orderNumber: "",
  errorMessage: "",
};

export function checkoutFlowReducer(state: CheckoutFlowState, action: CheckoutFlowAction): CheckoutFlowState {
  switch (action.type) {
    case "start":
      return { ...state, status: "processing", errorMessage: "" };
    case "success":
      return { status: "success", orderNumber: action.orderNumber, errorMessage: "" };
    case "error":
      return { ...state, status: "error", errorMessage: action.message };
    case "reset":
      return initialCheckoutFlowState;
    default:
      return state;
  }
}
