# Referência técnica — validade do PIX

A documentação oficial do Mercado Pago informa que pagamentos PIX podem receber uma data limite por meio do campo `date_of_expiration` em integrações baseadas em preferência. A data deve usar ISO 8601. A mesma documentação também informa que a criação de PIX via `/v1/payments` retorna `point_of_interaction.transaction_data`, incluindo `qr_code`, `qr_code_base64` e `ticket_url`, além do ID do pagamento e do status inicial.

Fonte 1: [Mercado Pago — Change expiration date](https://www.mercadopago.com.br/developers/en/docs/checkout-pro/additional-settings/expiration-date). A página descreve `date_of_expiration` e o formato ISO 8601.

Fonte 2: [Mercado Pago — Pix via Checkout Bricks](https://www.mercadopago.com.br/developers/en/docs/checkout-bricks/payment-brick/payment-submission/pix). A página descreve a criação do pagamento PIX no endpoint `/v1/payments`, o cabeçalho `X-Idempotency-Key` e os dados de QR Code retornados em `transaction_data`.

Decisão para o Eras Label: usar uma cobrança PIX individual por tentativa, persistir o ID do pagamento e a hora de expiração no pedido, exibir o contador/estado expirado no checkout e permitir regeneração apenas quando a cobrança anterior estiver vencida e não aprovada. A validade local será reforçada no backend para que um QR Code vencido não seja reutilizado mesmo que permaneça aberto no navegador.
