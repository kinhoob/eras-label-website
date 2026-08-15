# Integração Resend — Eras Label

## Estado da integração

A integração com o Resend está ligada exclusivamente no backend. A chave da API nunca é enviada para o frontend nem incluída nos payloads de e-mail. O domínio remetente deve permanecer verificado no painel do Resend antes de utilizar a integração em produção.

## Variáveis de ambiente

| Variável | Utilização | Exemplo de formato |
|---|---|---|
| `RESEND_API_KEY` | Chave secreta usada pelo backend para autenticar no Resend | `re_xxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Remetente autorizado pelo domínio verificado | `Eras Label <hello@eraslabel.com>` |
| `RESEND_ADMIN_EMAIL` | Caixa que recebe avisos de novos pedidos | `admin@eraslabel.com` |

As variáveis são lidas em `server/_core/env.ts` e utilizadas por `server/resend.ts`. A chave deve ser configurada através do gestor seguro de credenciais do projeto; não deve ser colocada em código, no frontend, no Git ou em mensagens de chat.

## Verificação do domínio

O domínio utilizado em `RESEND_FROM_EMAIL` deve aparecer como **Verified** no Resend. A configuração DNS normalmente inclui os registros DKIM e SPF fornecidos pelo Resend e, quando indicado, DMARC. Os valores devem ser copiados exatamente para a zona DNS do provedor do domínio, sem apagar registros existentes de recebimento de e-mail. Depois da propagação, a verificação deve ser concluída no painel do Resend.

## Fluxos implementados

### Confirmação do pedido

Depois de o checkout criar um pedido com pagamento aprovado, o cliente recebe um e-mail com número do pedido, produtos, tamanhos, quantidades, subtotal, descontos, frete, total, método de pagamento e endereço de entrega.

### Pagamento confirmado

O cliente recebe também uma mensagem transacional separada informando que o pagamento foi confirmado e que as próximas atualizações da entrega serão comunicadas posteriormente.

### Aviso administrativo

Quando `RESEND_ADMIN_EMAIL` está configurado, a caixa administrativa recebe um e-mail com o novo pedido, cliente, endereço, itens, método de pagamento e valor total. Os avisos internos existentes no painel permanecem ativos.

### Newsletter

Na primeira subscrição de um endereço, o sistema gera o cupom de boas-vindas existente e envia um e-mail com o código. Subscrições repetidas não geram um novo e-mail de boas-vindas para o mesmo endereço.

## Tratamento de falhas

Se `RESEND_API_KEY` ou `RESEND_FROM_EMAIL` estiver ausente, `sendResendEmail` retorna um fallback seguro (`not_configured`) e o checkout continua sem bloquear a criação do pedido. Se o provedor rejeitar um envio, o erro é registado apenas como falha operacional, sem incluir o HTML, o texto da mensagem ou a chave da API nos logs. O resultado do checkout permanece independente do sucesso de entrega do e-mail.

## Testes executados

| Verificação | Resultado |
|---|---|
| `pnpm check` | Aprovado |
| `pnpm test` | 21 ficheiros e 58 testes aprovados |
| `pnpm build` | Aprovado; bundle frontend gerado e servidor compilado |
| Teste de credenciais/domínio | Aprovado |
| Teste de envio mockado | Aprovado |
| Fallback sem credenciais | Aprovado |
| Escapamento de conteúdo HTML | Aprovado |
| Checkout sem chamadas reais ao Resend na suite | Aprovado |

## Operação recomendada

Para trocar o remetente, altere `RESEND_FROM_EMAIL` apenas para outro endereço do domínio verificado. Para trocar o destinatário dos avisos, altere `RESEND_ADMIN_EMAIL`. Para revogar ou substituir a credencial, crie uma nova API key no Resend, atualize-a pelo gestor seguro de credenciais e revogue a antiga no painel do Resend. Não é necessário expor ou alterar a chave no código-fonte.
