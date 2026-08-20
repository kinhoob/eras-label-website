import { searchMercadoPagoPayments } from "../server/mercadopago";

const orderNumber = process.argv[2];
if (!orderNumber) {
  throw new Error("Informe o número do pedido.");
}

const payments = await searchMercadoPagoPayments(orderNumber);
console.log(JSON.stringify(payments.map((payment: any) => ({
  id: payment?.id ?? null,
  status: payment?.status ?? null,
  status_detail: payment?.status_detail ?? null,
  external_reference: payment?.external_reference ?? null,
  payment_method_id: payment?.payment_method_id ?? null,
  date_created: payment?.date_created ?? null,
  date_last_updated: payment?.date_last_updated ?? null,
})), null, 2));
