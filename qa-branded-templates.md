# Relatório de QA: Templates Branded e Gestão de Clientes e Marketing

## Resumo das Implementações
1. **Identidade Visual Branded (#b22222):**
   - Atualizados os templates de e-mail no backend (`server/email-templates.ts`) para utilizarem a cor de destaque institucional `#b22222` da Eras Label, com cabeçalhos editoriais minimalistas, caixas de resumo de itens com moldura limpa e rodapés padronizados.
   - Criados templates dedicados para:
     - **Boas-vindas ao registo/newsletter:** Entrega o cupom exclusivo de boas-vindas com 10% de desconto (`ERAS10`).
     - **Confirmação de compra:** Apresenta os itens comprados, subtotal, frete, desconto Pix e prazo estimado.
     - **Código de rastreio:** Notifica o cliente do envio do pedido com o número de rastreio e a transportadora.

2. **Secções Administrativas (Admin):**
   - **Clientes:** Nova aba no painel de gestão (`Admin.tsx`), ligada ao procedimento protegido `admin.listClients`, que lista todos os utilizadores registados e clientes com respetivos papéis e datas de registo.
   - **E-mail Marketing:** Posicionada exatamente logo abaixo da secção de clientes, permitindo redigir assuntos e conteúdos HTML personalizados e disparar campanhas em massa via Resend para todos os subscritores e clientes com feedback imediato de envio.
   - **Histórico Resend:** Preservada e integrada, listando todos os envios transacionais e campanhas com filtros de busca, status, tipo e ordenação.

3. **Validação Técnica:**
   - 58 testes unitários aprovados no Vitest.
   - Verificação estática limpa com `pnpm check`.
   - Build de produção compilado com sucesso.
