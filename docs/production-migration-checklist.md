# Guia de Migração para Produção - Eras Label

Este documento consolida o checklist operacional e as orientações técnicas para migrar a plataforma de e-commerce da **Eras Label** (`eraslabel.com`) do ambiente de testes (sandbox) para o ambiente de produção em alta performance.

---

## 1. Visão Geral da Arquitetura em Produção

A plataforma opera sobre uma pilha robusta de alta conversão:
- **Frontend & Backend**: React 19, TypeScript, tRPC 11 e Express em infraestrutura autoscale resiliente.
- **Base de Dados**: MySQL / TiDB com transações atômicas para estoque e pedidos.
- **Armazenamento de Mídia**: S3 dedicado com otimização automática de imagens (WebP, remoção de metadados e limite estrito de tamanho).
- **Pagamentos**: Mercado Pago Checkout Transparente (Pix e Cartão de Crédito) com chaves de produção.
- **Logística**: Melhor Envio com cotação real, etiquetas de envio consolidadas e rastreamento oficial.
- **Comunicação**: Resend integrado com domínio próprio verificado (DKIM / SPF) e templates personalizados com a identidade visual da marca (`#b22222`).

---

## 2. Checklist de Configuração de Variáveis (Secrets)

Antes de publicar em produção no painel de gestão, certifique-se de configurar as seguintes variáveis de ambiente através da ferramenta de segredos:

| Integração | Chave / Variável | Descrição / Origem |
| :--- | :--- | :--- |
| **Mercado Pago** | `MP_ACCESS_TOKEN` | Token de produção (`APP_USR-...`) obtido no painel de aplicações do Mercado Pago. |
| **Mercado Pago** | `MP_PUBLIC_KEY` | Chave pública de produção para tokenização de cartões no frontend. |
| **Melhor Envio** | `MELHOR_ENVIO_TOKEN` | Token de API de produção gerado no painel do Melhor Envio (ambiente produtivo). |
| **Melhor Envio** | `MELHOR_ENVIO_CLIENT_ID` | Client ID da aplicação OAuth2 cadastrada no painel do Melhor Envio. |
| **Melhor Envio** | `MELHOR_ENVIO_CLIENT_SECRET` | Client Secret correspondente para troca de códigos de autorização. |
| **Remessa de Origem** | `MELHOR_ENVIO_CEP` | CEP de origem exato do ateliê ou centro de distribuição da Eras Label em São Paulo. |
| **Resend (E-mails)** | `RESEND_API_KEY` | Chave de API de produção da Resend com permissão de envio para o domínio `eraslabel.com`. |
| **Resend (Remetente)** | `RESEND_FROM_EMAIL` | Endereço oficial verificado (ex: `atendimento@eraslabel.com` ou `atelie@eraslabel.com`). |
| **Resend (Administrador)**| `RESEND_ADMIN_EMAIL` | E-mail do superadmin (`theeraslabel@gmail.com`) para receber alertas de novos pedidos. |

---

## 3. Validação de Domínio e DNS (Hostgator / Resend)

Para garantir que os e-mails transacionais (boas-vindas, aprovação de pagamento e código de rastreio) cheguem diretamente à caixa de entrada dos clientes com a chancela oficial da marca:

1. **Registos SPF e DKIM**: Confirme no painel do seu fornecedor de DNS (Hostgator) que os registos CNAME e TXT fornecidos pelo Resend foram validados com sucesso.
2. **Status de Verificação**: Verifique no painel do Resend se o domínio `eraslabel.com` exibe o selo verde de verificação.
3. **Remetente Consistente**: Certifique-se de que o campo `RESEND_FROM_EMAIL` utilize estritamente o domínio validado (`@eraslabel.com`).

---

## 4. Testes Finais de Homologação em Produção

Após preencher as credenciais de produção, execute os seguintes testes controlados:
1. **Teste Pix Real**: Realize uma compra de teste de valor mínimo via Pix, escaneie o QR code com um aplicativo bancário e valide se o webhook atualiza o status do pedido para "Pago" instantaneamente.
2. **Geração de Etiqueta**: Acesse o painel administrativo (`/admin` com login `theeraslabel@gmail.com`), abra a aba de **Vendas**, selecione o pedido aprovado e clique em **Gerar Etiqueta de Envio** para confirmar que o PDF retornado pelo Melhor Envio está íntegro e pronto para impressão.
3. **Notificação Transacional**: Confirme que o e-mail de confirmação de pedido foi registado na aba **E-mails (Resend)** do painel e entregue com sucesso ao cliente.

---
*Documento preparado para o lançamento oficial da Eras Label.*
