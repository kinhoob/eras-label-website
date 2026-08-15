export type EmailOrderItem = {
  productId: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
};

export type EmailOrderData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: "pix" | "credit_card";
  items: EmailOrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  address: Record<string, string>;
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layout(title: string, preheader: string, content: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f4f1ec;color:#1b1b1b;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><main style="max-width:640px;margin:0 auto;padding:28px 16px"><section style="background:#fff;border:1px solid #dfdbd4"><header style="padding:28px 30px;background:#1b1b1b;color:#fff"><p style="margin:0;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Eras Label</p><h1 style="margin:18px 0 0;font-size:25px;font-weight:500;line-height:1.15">${escapeHtml(title)}</h1></header><div style="padding:30px">${content}</div><footer style="padding:20px 30px;border-top:1px solid #ebe7e1;color:#777;font-size:12px;line-height:1.5">Reviver ou reinventar eras.<br>Este e-mail foi enviado automaticamente pela Eras Label.</footer></section></main></body></html>`;
}

function orderItemsHtml(items: EmailOrderItem[]) {
  return items.map(item => `<tr><td style="padding:11px 0;border-bottom:1px solid #eee;font-size:14px">${escapeHtml(item.name)}<br><span style="color:#777;font-size:12px">Tamanho ${escapeHtml(item.size)} · ${item.quantity} un.</span></td><td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px">${currency.format(item.price * item.quantity)}</td></tr>`).join("");
}

function orderItemsText(items: EmailOrderItem[]) {
  return items.map(item => `- ${item.name} | tamanho ${item.size} | ${item.quantity} un. | ${currency.format(item.price * item.quantity)}`).join("\n");
}

function addressText(address: Record<string, string>) {
  return [address.street, address.number, address.neighborhood, address.city, address.state, address.cep].filter(Boolean).join(", ");
}

export function orderConfirmationEmail(order: EmailOrderData) {
  const safeName = escapeHtml(order.customerName);
  const address = addressText(order.address);
  const paymentLabel = order.paymentMethod === "pix" ? "PIX" : "cartão de crédito";
  const html = layout(
    `Pedido ${order.orderNumber} confirmado`,
    `Recebemos o seu pedido ${order.orderNumber}.`,
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${safeName}.</p><p style="margin:0 0 24px;color:#555;line-height:1.6">Recebemos o seu pedido e o pagamento foi confirmado. Acompanhe abaixo o resumo da sua compra.</p><div style="padding:16px;background:#f7f5f1;margin-bottom:24px"><p style="margin:0 0 6px;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Pedido</p><strong style="font-size:18px">${escapeHtml(order.orderNumber)}</strong></div><table style="width:100%;border-collapse:collapse"><tbody>${orderItemsHtml(order.items)}</tbody><tfoot><tr><td style="padding:18px 0 5px;color:#777">Subtotal</td><td style="padding:18px 0 5px;text-align:right">${currency.format(order.subtotal)}</td></tr><tr><td style="padding:5px 0;color:#777">Desconto</td><td style="padding:5px 0;text-align:right;color:#26734d">-${currency.format(order.discount)}</td></tr><tr><td style="padding:5px 0;color:#777">Envio</td><td style="padding:5px 0;text-align:right">${order.shippingCost ? currency.format(order.shippingCost) : "Grátis"}</td></tr><tr><td style="padding:14px 0 0;font-weight:700;border-top:1px solid #ddd">Total</td><td style="padding:14px 0 0;text-align:right;font-weight:700;border-top:1px solid #ddd">${currency.format(order.total)}</td></tr></tfoot></table><p style="margin:24px 0 0;color:#555;line-height:1.6"><strong>Pagamento:</strong> ${paymentLabel}<br><strong>Entrega:</strong> ${escapeHtml(address)}</p>`,
  );
  const text = `Olá, ${order.customerName}.\n\nRecebemos o seu pedido ${order.orderNumber} e o pagamento foi confirmado.\n\nItens:\n${orderItemsText(order.items)}\n\nSubtotal: ${currency.format(order.subtotal)}\nDesconto: -${currency.format(order.discount)}\nEnvio: ${order.shippingCost ? currency.format(order.shippingCost) : "Grátis"}\nTotal: ${currency.format(order.total)}\nPagamento: ${paymentLabel}\nEntrega: ${address}`;
  return { subject: `Pedido ${order.orderNumber} confirmado | Eras Label`, html, text };
}

export function adminOrderEmail(order: EmailOrderData) {
  const address = addressText(order.address);
  const paymentLabel = order.paymentMethod === "pix" ? "PIX" : "cartão de crédito";
  const html = layout(
    `Novo pedido ${order.orderNumber}`,
    `${order.customerName} realizou um pedido de ${currency.format(order.total)}.`,
    `<p style="margin:0 0 20px;line-height:1.6"><strong>${escapeHtml(order.customerName)}</strong> realizou um novo pedido pelo storefront.</p><table style="width:100%;border-collapse:collapse"><tbody>${orderItemsHtml(order.items)}</tbody><tfoot><tr><td style="padding:18px 0 0;font-weight:700">Total</td><td style="padding:18px 0 0;text-align:right;font-weight:700">${currency.format(order.total)}</td></tr></tfoot></table><p style="margin:24px 0 0;color:#555;line-height:1.6"><strong>Pedido:</strong> ${escapeHtml(order.orderNumber)}<br><strong>E-mail:</strong> ${escapeHtml(order.customerEmail)}<br><strong>Pagamento:</strong> ${paymentLabel}<br><strong>Entrega:</strong> ${escapeHtml(address)}</p>`,
  );
  const text = `Novo pedido ${order.orderNumber}\n\nCliente: ${order.customerName}\nE-mail: ${order.customerEmail}\n\nItens:\n${orderItemsText(order.items)}\n\nTotal: ${currency.format(order.total)}\nPagamento: ${paymentLabel}\nEntrega: ${address}`;
  return { subject: `Novo pedido ${order.orderNumber} | Eras Label`, html, text };
}

export function paymentConfirmationEmail(order: EmailOrderData) {
  const html = layout(
    `Pagamento confirmado · ${order.orderNumber}`,
    `O pagamento do pedido ${order.orderNumber} foi aprovado.`,
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${escapeHtml(order.customerName)}.</p><p style="margin:0;color:#555;line-height:1.6">O pagamento do pedido <strong>${escapeHtml(order.orderNumber)}</strong>, no valor de <strong>${currency.format(order.total)}</strong>, foi confirmado. Em breve enviaremos as próximas atualizações da entrega.</p>`,
  );
  const text = `Olá, ${order.customerName}.\n\nO pagamento do pedido ${order.orderNumber}, no valor de ${currency.format(order.total)}, foi confirmado. Em breve enviaremos as próximas atualizações da entrega.`;
  return { subject: `Pagamento confirmado ${order.orderNumber} | Eras Label`, html, text };
}

export function newsletterWelcomeEmail(name: string, couponCode: string) {
  const html = layout(
    "Bem-vindo à Eras Label",
    "A sua inscrição foi confirmada e o seu cupom está pronto.",
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${escapeHtml(name)}.</p><p style="margin:0 0 24px;color:#555;line-height:1.6">A sua inscrição foi confirmada. Use o seu cupom de boas-vindas na primeira compra:</p><div style="padding:18px;text-align:center;background:#f7f5f1;font-size:23px;letter-spacing:.12em;font-weight:700">${escapeHtml(couponCode)}</div><p style="margin:24px 0 0;color:#777;line-height:1.6">Obrigado por fazer parte da próxima era da Eras Label.</p>`,
  );
  const text = `Olá, ${name}.\n\nA sua inscrição foi confirmada. Use o cupom de boas-vindas na primeira compra: ${couponCode}\n\nObrigado por fazer parte da próxima era da Eras Label.`;
  return { subject: "Bem-vindo à Eras Label · seu cupom está aqui", html, text };
}
