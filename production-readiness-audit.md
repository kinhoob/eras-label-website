# Auditoria de prontidão para produção — Eras Label

## Veredito

A plataforma está tecnicamente avançada, mas não deve ser considerada pronta para abrir ao público sem validação operacional real. O build e a suíte automatizada estão aprovados, porém permanecem bloqueadores de integração e operação.

## Evidências concluídas

- 21 ficheiros de teste aprovados e 76 testes Vitest aprovados.
- Build de produção concluído sem erro de TypeScript.
- Checkout com recálculo server-side, validação de produto + size antes do Mercado Pago, cupom condicionado ao limite e número de pedido controlado pelo servidor.
- Webhook do Mercado Pago com verificação HMAC de assinatura.
- Cards públicos, modo escuro, parallax, coleções, stock alerts e bloqueio de compra de esgotados cobertos por regressões.

## Bloqueadores antes do go-live

1. O endpoint HTTP GET `/health` não está exposto: a chamada local retornou o HTML da aplicação. Existe apenas o procedimento tRPC `system.health`, que não substitui um healthcheck de infraestrutura.
2. O webhook do Melhor Envio atualmente processa o corpo, mas não valida o cabeçalho `X-ME-Signature` com HMAC-SHA256. A documentação oficial exige essa validação para autenticar a origem.
3. O webhook do Melhor Envio responde HTTP 200 mesmo quando ocorre erro interno. Isso pode impedir as retentativas automáticas previstas pelo fornecedor.
4. Ainda não há evidência de um ciclo completo com credenciais produtivas: cotação, criação e pagamento de etiqueta, pagamento PIX, cartão aprovado/recusado, webhook e atualização do pedido.
5. O domínio definitivo, URLs públicas dos webhooks, configuração de email transacional e imagem social precisam ser confirmados no ambiente final.

## Recomendação

Classificação atual: **não pronto para abertura pública; pronto para uma fase controlada de homologação**. O lançamento deve ocorrer somente depois de corrigir os itens 1–3, executar a matriz real de pagamentos e envios, confirmar domínio/SSL e revisar políticas comerciais, privacidade, trocas e devoluções.

## Referências

[1] Mercado Pago — Webhooks: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks

[2] Melhor Envio — Webhooks: https://docs.melhorenvio.com.br/docs/webhooks
