# Notas do teste sandbox do checkout

## Estado inicial

A rota `/checkout` abriu corretamente, mas o carrinho estava vazio e mostrou “SACOLA VAZIA”. A home carregou com produtos visíveis e a ação “VISUALIZAÇÃO RÁPIDA” foi encontrada nos cards de produto.

## Observação visual

Ao clicar na visualização rápida do primeiro destaque, a página permaneceu na home e o modal de produto não ficou visível no estado capturado. É necessário inspecionar a interação ou usar um caminho alternativo para adicionar o produto ao carrinho antes de submeter pagamentos sandbox.

## Diagnóstico da visualização rápida

A inspeção DOM confirmou que o clique no primeiro botão `Ver Camiseta Paradox Oversized` é disparado, porém o texto `ADICIONAR À SACOLA` não aparece e nenhum modal de compra é renderizado. O fluxo de teste está bloqueado na adição de produto pelo frontend, antes da etapa de pagamento.

## Adição do produto

Após aguardar a atualização do React, o modal apareceu corretamente. O produto `Camiseta Paradox Oversized` estava disponível em tamanhos P/M/G/GG. O botão `.add-to-cart-button` foi acionado com sucesso para o tamanho preselecionado.

## Entrada no checkout

A sacola mostrou 1 item, subtotal de R$ 154,90, frete calculado e o botão `FINALIZAR COMPRA (Pix)`. O botão foi acionado e o teste prossegue na rota de checkout.

## Referência oficial dos cartões sandbox

Fonte: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/cards

Para teste de cartão no Brasil, a documentação oficial indica:

- E-mail do comprador: `test@testuser.com`.
- Mastercard crédito: `5480 8328 0103 3311`, CVV `123`, validade `11/30`.
- Visa crédito: `4235 6477 2802 5682`, CVV `123`, validade `11/30`.
- Para simular aprovação, o nome do titular deve ser `APRO` e o CPF `12345678909`.
- Para simular pendência, usar o nome `CONT`.

A documentação também informa que os cartões não movimentam dinheiro real e que a credencial de teste deve começar com `APP_USR`.

## Dados do comprador

Foram preenchidos os dados sandbox: e-mail `test@testuser.com`, CPF de teste `12345678909`, nome ajustado para `APRO APRO` para satisfazer a validação local de nome e sobrenome, morada fictícia em São Paulo e CEP `01310100`. O checkout calculou frete de R$ 20,00 e total de R$ 167,16 no cartão; o botão de cartão foi acionado e aguarda-se a atualização do formulário.

## Submissão do cartão

Com confirmação explícita do utilizador, o botão `CONFIRMAR PAGAMENTO` foi acionado usando o cartão Visa sandbox oficial. O checkout exibiu `A confirmar o seu pagamento...` e informou que estava a comunicar com o Mercado Pago, mantendo o botão desativado durante o processamento.

## Contrato do SDK Mercado Pago

Fonte: https://github.com/mercadopago/sdk-js/blob/main/docs/core-methods.md

A documentação oficial do SDK informa que `mp.getPaymentMethods({ bin })` retorna uma Promise cujo resultado é um objeto com `paging` e `results`, e que `results[0].id` deve ser enviado como `payment_method_id`. O exemplo de documentação recomenda usar os primeiros 8 dígitos do BIN. A tokenização retorna uma Promise com um objeto que contém `id`.


## 2026-08-16 — segundo teste de cartão após atualização de credenciais

A tokenização do Mastercard APRO foi concluída no navegador com HTTP 201 e o token foi enviado ao tRPC `checkout.create`. O backend chamou `POST /v1/payments`, mas o Mercado Pago respondeu HTTP 400 com causa `2034 Invalid users involved`. O frontend passou a exibir uma mensagem diagnóstica explícita.

A documentação oficial do Checkout Transparente via Payments API descreve o código 2034 como incompatibilidade entre utilizadores teste e produtivos. A página de testes de cartões da Orders API também indica que os utilizadores envolvidos devem pertencer ao mesmo ambiente. Portanto, o problema já não é a identificação da bandeira nem a tokenização: é a combinação de credencial de teste, vendedor associado ao Access Token e dados do pagador sandbox. O teste precisa usar a configuração de testes suportada pelo Mercado Pago para esta API, mantendo vendedor e comprador no mesmo ambiente conforme a documentação oficial.

Referências: https://www.mercadopago.com.br/developers/en/docs/checkout-api-payments/overview ; https://www.mercadopago.com.co/developers/en/docs/checkout-api-payments/error-messages/card-token-creation-errors ; https://www.mercadopago.com.mx/developers/en/docs/checkout-api-orders/integration-test/cards


## 2026-08-16 — pagamento Mastercard APRO aprovado

Após sincronizar as credenciais sandbox e usar o e-mail de comprador `sandbox-buyer-eras@example.com`, diferente do vendedor, o checkout foi concluído no navegador. A tokenização do Mastercard sandbox foi seguida pela mutation `checkout.create`; o Mercado Pago respondeu com pagamento aprovado e a página de sucesso exibiu o pedido `ER-2026-2969`, total de R$ 174,90, pagamento Cartão e entrega estimada de 4 a 8 dias úteis. O erro 2034 não ocorreu neste cenário. A confirmação de cliente deve ser enviada para o e-mail informado no checkout; a notificação administrativa depende de `RESEND_ADMIN_EMAIL`.


## Webhook e histórico após o pagamento aprovado

A API de pesquisa do Mercado Pago encontrou o pagamento `1327888372` associado ao `external_reference` `ER-2026-2969`, com estado `approved`, detalhe `accredited` e método `master`. Foi enviada uma notificação `payment.updated` ao endpoint público `/api/mercadopago/webhook`; a aplicação respondeu HTTP 200 com `{"received":true}` e o log confirmou `Pedido ER-2026-2969 sincronizado: approved`. A consulta posterior à base de dados confirmou `paymentStatus=approved` e `status=Processando`.

A rota `/orders` está protegida como área de cliente e apresenta o botão `ENTRAR COM MANUS OAUTH` quando não existe sessão. Assim, o pedido anónimo do teste não é mostrado nessa sessão de navegador; a página está corretamente a exigir autenticação para expor o histórico pessoal.
