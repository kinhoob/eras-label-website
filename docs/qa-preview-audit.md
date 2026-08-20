# Auditoria técnica do preview — Eras Label

**Data da revisão:** 20 de agosto de 2026  
**Ambiente:** preview do projeto `eras-label-website`  
**Objetivo:** validar os fluxos públicos, administrativos, pagamentos, logística e proteção contra dados fictícios sem executar alterações destrutivas adicionais.

## Verificações concluídas

A suíte completa Vitest foi executada com `ERAS_TEST_MODE=1` e terminou sem falhas. O build de produção com Vite e esbuild também foi concluído. O teste específico de Melhor Envio confirma que o payload enviado ao endpoint `/me/cart` usa o campo obrigatório `service` e rejeita `serviceId` inválido antes de chamar a API.

O catálogo público não possui fallback de produtos fictícios na Home. Os estados vazios continuam visuais e editoriais, mas não persistem produtos, pedidos ou clientes. Produtos públicos esgotados continuam listados e são ordenados no final conforme a regra do catálogo.

A transição sacola → checkout preserva o cupão, o desconto validado, o frete grátis quando aplicável, a transportadora escolhida e o custo de envio. O checkout não precisa de uma segunda confirmação quando esses dados continuam válidos.

O estado de pagamento Mercado Pago é separado do estado operacional do pedido: o histórico do cliente e o painel administrativo exibem pagamento aprovado independentemente de o pedido ainda estar em preparação. A reconciliação Pix e o webhook mantêm pedidos legitimamente pendentes sem os promover artificialmente.

As consultas de contagem comercial foram realizadas apenas em modo de leitura. Não foram executadas exclusões adicionais, seeds, migrações destrutivas ou criação manual de clientes/produtos durante esta auditoria.

## Limites do preview

O preview não substitui a validação de domínio público. O webhook do Melhor Envio precisa de uma URL pública estável e acessível para o registo definitivo; o domínio oficial `www.eraslabel.com` deve ser apontado apenas depois da aprovação dos testes no preview. A publicação do domínio e a confirmação final dos webhooks continuam a ser etapas de lançamento, não alterações executadas nesta revisão.

A autenticação de produção, a entrega real de e-mails e a autorização de pagamentos devem ser confirmadas com uma transação controlada pelo proprietário no ambiente publicado. Os testes automatizados usam isolamento para não gravar dados comerciais no banco partilhado.

## Critérios de aceite para o lançamento

| Área | Critério verificável | Estado |
|---|---|---|
| Catálogo | Produtos públicos, inclusive esgotados, aparecem em todos os produtos, categorias e coleções | Validado |
| Sacola | Cupão e frete validados seguem para o checkout sem confirmação duplicada | Validado |
| Pagamento | Pagamento aprovado não é apresentado como pagamento pendente; preparação permanece separada | Validado |
| Logística | Payload de etiqueta envia `service` ao Melhor Envio e bloqueia serviço inválido | Validado |
| Dados | Testes não criam dados comerciais fora do modo isolado | Validado |
| Preview | Build e suíte Vitest concluídos sem falhas | Validado |
| Domínio | URL pública estável e webhooks definitivos registados após publicação | Pendente de publicação |

## Próximo passo recomendado

Publicar apenas depois de o proprietário confirmar a revisão visual e realizar uma compra controlada com credenciais de produção. Em seguida, apontar o domínio, registar os webhooks no endereço público e repetir a confirmação de pagamento, e-mail e etiqueta sem apagar dados reais.
