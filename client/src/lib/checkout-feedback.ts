export type CheckoutStatus = "idle" | "processing" | "success" | "error";

export function getCheckoutFeedback(status: CheckoutStatus, orderNumber = "", errorMessage = "") {
  if (status === "processing") {
    return {
      tone: "processing" as const,
      title: "Confirmando seu pagamento",
      message: "Não feche esta janela. Estamos registrando seu pedido com segurança.",
    };
  }

  if (status === "success") {
    return {
      tone: "success" as const,
      title: "Pagamento aprovado",
      message: `O pedido ${orderNumber} já está registrado e a confirmação foi enviada para o seu e-mail.`,
    };
  }

  if (status === "error") {
    return {
      tone: "error" as const,
      title: "Não conseguimos confirmar o pagamento.",
      message: errorMessage || "Não foi possível confirmar o pagamento.",
    };
  }

  return {
    tone: "idle" as const,
    title: "Finalizar pedido",
    message: "",
  };
}
