# QA — Limpeza global e etiquetas ativas

## Escopo

O painel de resultados da pesquisa passou a apresentar uma faixa de critérios ativos com etiquetas removíveis. Cada etiqueta remove apenas o critério correspondente: pesquisa, categoria, faixa de preço, tamanho, cor ou ordenação. O botão **Limpar tudo** repõe pesquisa, filtros e ordenação para os valores iniciais e devolve o foco ao campo de pesquisa.

## Acessibilidade e UX

As etiquetas são botões nativos com texto acessível e ícone de remoção. A faixa usa `role=list` e cada etiqueta fica dentro de `role=listitem`; o botão global tem nome acessível próprio. O estado vazio reutiliza a mesma ação de limpeza para evitar um beco sem saída quando a combinação ativa não encontra peças.

## Validações automatizadas

- `pnpm check`: TypeScript sem erros.
- `pnpm test`: 17 ficheiros e 48 testes passaram.
- `pnpm build`: build de produção concluído; permanece apenas o aviso conhecido de chunks superiores a 500 kB.

## Validação visual

A Home foi capturada em desktop 1280×720 e mobile 375×812. O cabeçalho e o ícone de pesquisa mantêm o alinhamento editorial, e o mobile não apresenta overflow horizontal. O painel aberto deve ser validado no preview com uma pesquisa ativa e a combinação de etiquetas antes da publicação.

## Estado

A implementação está pronta para checkpoint após a revisão final do `todo.md`.
