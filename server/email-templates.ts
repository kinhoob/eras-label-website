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
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#0d0d0d;color:#1b1b1b;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><main style="max-width:640px;margin:0 auto;padding:32px 16px"><section style="background:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e5e5e5"><header style="padding:32px 36px;background:#0d0d0d;color:#ffffff;border-bottom:3px solid #b22222"><p style="margin:0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b22222;font-weight:700">Eras Label</p><h1 style="margin:16px 0 0;font-size:26px;font-weight:600;line-height:1.2;color:#ffffff">${escapeHtml(title)}</h1></header><div style="padding:36px;background:#ffffff">${content}</div><footer style="padding:24px 36px;background:#f9f9f9;border-top:1px solid #eeeeee;color:#666666;font-size:12px;line-height:1.6">Reviver ou reinventar eras.<br>Este e-mail foi enviado automaticamente pela Eras Label.</footer></section></main></body></html>`;
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
  return { subject: `Eras Label — Pedido ${order.orderNumber} Confirmado`, html, text };
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
  return { subject: `Eras Label — Pagamento Recebido (${order.orderNumber})`, html, text };
}

export function newsletterWelcomeEmail(name: string, couponCode: string) {
  const html = layout(
    "Bem-vindo à Eras Label",
    "A sua inscrição foi confirmada e o seu cupom está pronto.",
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${escapeHtml(name)}.</p><p style="margin:0 0 24px;color:#555;line-height:1.6">A sua inscrição foi confirmada. Use o seu cupom de boas-vindas na primeira compra:</p><div style="padding:18px;text-align:center;background:#f7f5f1;font-size:23px;letter-spacing:.12em;font-weight:700">${escapeHtml(couponCode)}</div><p style="margin:24px 0 0;color:#777;line-height:1.6">Obrigado por fazer parte da próxima era da Eras Label.</p>`,
  );
  const text = `Olá, ${name}.\n\nA sua inscrição foi confirmada. Use o cupom de boas-vindas na primeira compra: ${couponCode}\n\nObrigado por fazer parte da próxima era da Eras Label.`;
  return { subject: "Eras Label — Boas-vindas e Cupom Exclusivo", html, text };
}

export function orderTrackingEmail(orderNumber: string, customerName: string, trackingCode: string, carrier?: string) {
  const safeName = escapeHtml(customerName);
  const safeCode = escapeHtml(trackingCode);
  const safeCarrier = escapeHtml(carrier || "Correios / Transportadora");
  const html = layout(
    `Pedido ${escapeHtml(orderNumber)} em trânsito`,
    `O seu pedido ${escapeHtml(orderNumber)} foi enviado. Código de rastreio: ${safeCode}`,
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${safeName}.</p><p style="margin:0 0 24px;color:#555;line-height:1.6">O seu pedido <strong>${escapeHtml(orderNumber)}</strong> já foi despachado e está a caminho da morada de entrega.</p><div style="padding:20px;background:#fcfbf9;border:1px dashed #b22222;margin-bottom:24px;text-align:center"><p style="margin:0 0 6px;color:#b22222;font-size:12px;text-transform:uppercase;letter-spacing:.14em;font-weight:700">Código de Rastreio (${safeCarrier})</p><strong style="font-size:20px;font-family:monospace;letter-spacing:.1em">${safeCode}</strong></div><p style="margin:0;color:#555;line-height:1.6">Pode acompanhar a entrega diretamente no site da transportadora utilizando o código acima.</p>`,
  );
  const text = `Olá, ${customerName}.\n\nO seu pedido ${orderNumber} foi despachado.\nTransportadora: ${carrier || "Correios"}\nCódigo de rastreio: ${trackingCode}\n\nAcompanhe a entrega utilizando o código acima.`;
  return { subject: `Eras Label — Código de Rastreio do Pedido ${orderNumber}`, html, text };
}

/**
 * Template de E-mail para Carrinhos Abandonados — Eras Label
 * Utiliza a identidade editorial da marca com destaque em #b22222.
 */
export function abandonedCartEmail(customerName: string, items: EmailOrderItem[], total: number, recoveryUrl: string) {
  const safeName = escapeHtml(customerName || "Cliente");
  const html = layout(
    "A sua seleção ficou guardada",
    "Notámos que deixou itens na sua sacola na Eras Label.",
    `<p style="margin:0 0 16px;font-size:16px">Olá, ${safeName}.</p>` +
    `<p style="margin:0 0 24px;color:#555;line-height:1.6">Notámos que deixou peças selecionadas na sua sacola. O stock é limitado e reservado por tempo reduzido. Conclua o seu pedido com tranquilidade:</p>` +
    `<table style="width:100%;border-collapse:collapse;margin-bottom:24px"><tbody>${orderItemsHtml(items)}</tbody>` +
    `<tfoot><tr><td style="padding:16px 0 0;font-weight:700;border-top:1px solid #ddd">Total</td>` +
    `<td style="padding:16px 0 0;text-align:right;font-weight:700;border-top:1px solid #ddd">${currency.format(total)}</td></tr></tfoot></table>` +
    `<div style="text-align:center;margin:32px 0">` +
    `<a href="${escapeHtml(recoveryUrl)}" style="background:#b22222;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;display:inline-block;border-radius:4px">Retomar a Sacola</a>` +
    `</div>` +
    `<p style="margin:0;color:#777;font-size:13px;line-height:1.6;text-align:center">Se tiver alguma dúvida, responda a este e-mail ou fale connosco pelo WhatsApp.</p>`
  );
  const text = `Olá, ${customerName || "Cliente"}.\n\nNotámos que deixou peças selecionadas na sua sacola na Eras Label:\n${orderItemsText(items)}\n\nTotal: ${currency.format(total)}\n\nRetome o seu carrinho em: ${recoveryUrl}`;
  return { subject: "Eras Label — As suas peças ainda estão reservadas na sacola", html, text };
}
