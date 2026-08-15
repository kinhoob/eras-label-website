# QA — Ordenação da pesquisa

## Escopo

Foi adicionada ordenação aos resultados da pesquisa da Eras Label por **Mais recentes**, **Menor preço** e **Maior preço**. A ordenação é aplicada depois da pesquisa e dos filtros de categoria, preço, tamanho e cor, sem mutar o array original do catálogo.

## Implementação validada

A função `sortStorefrontProducts` usa `createdAt` para ordenar novidades em ordem decrescente e `price` para os dois modos de preço. Empates preservam a ordem original dos resultados. Produtos sem data válida ficam atrás dos produtos datados no modo de novidades.

O tipo `Product` recebe `createdAt` a partir do catálogo real. O estado inicial é `Mais recentes`; a escolha fica disponível no painel de resultados e o reset da pesquisa também repõe essa opção.

## Testes automatizados

- TypeScript: `pnpm check` concluído sem erros.
- Vitest: 17 ficheiros e 48 testes concluídos com sucesso.
- Cobertura adicional: ordenação crescente, decrescente, novidades e preservação da lista original.
- Build de produção: `pnpm build` concluído com sucesso. O bundler manteve apenas o aviso já existente sobre chunks superiores a 500 kB.

## QA visual

A Home foi capturada em viewport desktop de 1280×720 e em viewport mobile de 375×812. O cabeçalho manteve a composição editorial, o ícone da pesquisa continua acessível e não foi observado overflow horizontal no mobile. A validação visual do painel aberto deve ser complementada por teste interativo no preview, selecionando as três opções de ordenação depois de introduzir uma pesquisa.

## Estado final

A ordenação está integrada no pipeline `filtros → pesquisa → ordenação`, com estado vazio, loading, navegação por teclado e filtros inline preservados. O checkpoint será criado após a confirmação final do `todo.md`.
