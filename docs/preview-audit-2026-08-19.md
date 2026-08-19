# Auditoria do preview — 19/08/2026

## Escopo

A validação foi realizada no endereço de preview do projeto, sem exigir `eraslabel.com`. O domínio oficial continua apenas como referência de SEO e não é necessário para abrir a loja, o painel ou as rotas internas.

## Evidências visuais

- A Home carregou no desktop com a barra de anúncio, navbar, busca, sacola, hero editorial e acentos em `#b22222`.
- A rota `/produtos` respondeu com a página 404 estilizada. Isso indica que a rota pública de catálogo precisa ser confirmada no roteamento atual ou acessada pelo caminho efetivamente registrado antes do checkpoint final.
- A rota `/admin` carregou o painel com sidebar por grupos, indicador de função/permissões, cards de operação e estado vazio de catálogo. O painel preservou os dois pedidos reais existentes e mostrou receita real de R$ 29,80, sem produtos de demonstração.

## Dados após limpeza

- Produtos: 0.
- Variações: 0.
- Relações produto-categoria: 0.
- Logs de estoque: 0.
- Notificações: 0.
- Logs de e-mail: 0.
- Inscritos fictícios de newsletter: 0.
- Pedidos preservados: 2, pertencentes ao histórico real existente (`ER-2026-2835` e `ER-2026-1925`).

## Correção implementada

O comando `pnpm test --run` agora ativa `ERAS_TEST_MODE=1`. A função `getDb()` recusa abrir a conexão compartilhada quando esse modo, `VITEST=true` ou `NODE_ENV=test` estiverem ativos. Assim, chamadas de testes a newsletter, checkout, catálogo, notificações e registro de e-mails não podem inserir dados no banco do preview.

Também foi adicionado `server/database-safety.test.ts`, e o sitemap passou a responder com páginas estáticas quando o banco não está disponível no modo de teste, evitando HTTP 500.

## Pendências observadas

A rota `/produtos` precisa ser comparada com o caminho registrado no `App.tsx`. A responsividade mobile e os fluxos de checkout devem ser validados em uma próxima captura dedicada. Nenhuma publicação ou alteração do domínio oficial foi realizada.

## Atualização após correção do catálogo

A rota pública `/produtos` foi adicionada como alias do catálogo existente. A navegação no preview agora retorna a loja com filtros, estado vazio e rodapé editorial, em vez da página 404. A rota `/catalog` continua preservada para compatibilidade com links existentes.

A auditoria identificou também um item antigo persistido apenas no `localStorage` do navegador, embora o catálogo estivesse sem produtos. Foi adicionado saneamento na sacola para remover linhas cujo produto não existe no catálogo público real, sem criar ou apagar registros no banco. Após recarregar `/produtos`, a sacola passou a exibir zero itens.

| Verificação | Resultado |
|---|---|
| `/produtos` no preview | Carrega o catálogo, sem 404 |
| Produtos persistidos | 0 |
| Sacola após saneamento | 0 itens |
| Vitest | 169 testes aprovados |
| Build | Concluído sem erro |
| Domínio oficial | Não alterado |
| Publicação | Não realizada |
| Link KINHOOB | Presente e aponta para `https://kinhoob.github.io/portfolio` |

O screenshot capturado durante o carregamento ainda pode mostrar a animação de transição do storefront; a validação textual posterior confirmou o estado final correto. A próxima etapa é validar responsividade da Home, `/produtos`, páginas de categoria/coleção e painel, sem criar novos dados fictícios e sem apontar o domínio final.

## 2026-08-19 — Ordenação do catálogo e detalhe administrativo

A rota pública `/produtos` e o alias `/catalog` carregaram no preview em viewport desktop, com o seletor **Ordenar por** exibindo “Mais vendidos”, “Menor preço”, “Maior preço” e “Mais recentes”. Como o catálogo está sem produtos persistidos, a tela mostrou o estado vazio honesto e não criou registros.

O painel administrativo carregou no preview com os dois pedidos reais preservados e sem produtos fictícios. A seção de vendas continua acessível pelo agrupamento “Vendas & Clientes”. A implementação do detalhe administrativo inclui linha de acompanhamento com pedido recebido, pagamento confirmado, preparação, envio e entrega, além de transportadora, rastreio, data de criação e status atual. A versão mobile usa uma disposição vertical para essa linha de acompanhamento.

A agregação de popularidade do catálogo usa `salesCount` calculado a partir dos itens dos pedidos persistidos; a ordenação por “Mais vendidos” permanece estável e cai para produtos mais recentes quando há empate. Nenhuma credencial ou domínio oficial foi alterado nesta etapa.

Preview audit URL: https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/produtos
Admin audit URL: https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/admin


## Validação mobile — 375px

A captura mobile confirmou que `/produtos` mantém a barra de ordenação, filtros de categoria, tamanho e preço, estado vazio e rodapé sem overflow horizontal visível. O painel administrativo reorganiza os cards de métricas, gráfico, pedidos recentes e orientação em uma coluna legível; os controles do período permanecem acessíveis. O acompanhamento detalhado foi preparado com layout vertical em telas pequenas para evitar cortes no modal.
