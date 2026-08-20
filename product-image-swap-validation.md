
## Validação do hover da segunda foto

A validação headless executada em Chromium com mídia de desktop (`hover: hover`, `pointer: fine`) encontrou 7 cards do catálogo com segunda imagem. Em um card real, a foto principal foi `/manus-storage/admin-uploads/1787188212154-9mwpkw_c42ed8cf.webp` e a foto secundária foi `/manus-storage/admin-uploads/1787188267857-wue6qr_b5586a4a.webp`, carregada com `naturalWidth: 1336`.

Antes do cursor, a segunda camada iniciou com `opacity: 0`. Durante o hover real, o card correspondeu a `:hover`, a segunda camada chegou a `opacity: 0.934185` durante a transição e manteve o transform editorial. Após retirar o cursor e aguardar o fim da transição, a camada retornou a `opacity: 0`. O resultado foi considerado aprovado (`hoverConfirmed: true`).

Também foram capturadas as rotas `/` e `/catalog` em desktop e mobile, nos temas claro e escuro. No mobile, a interface permanece sem overflow e o comportamento não depende de hover; a foto principal continua sendo o fallback seguro para toque.

## Validações complementares de acessibilidade e fallback

A carga real do catálogo encontrou 9 cards, incluindo produtos esgotados com segunda imagem. O card esgotado manteve simultaneamente a segunda camada disponível, o selo `ESGOTADO` e a ausência de alteração no CTA de compra; o resultado foi aprovado.

No cenário de teclado, o link do card esgotado recebeu foco real via `focus-visible`; após 450 ms de transição, a segunda foto atingiu `opacity: 1` e o selo permaneceu visível. A validação de foco foi aprovada.

Também foi encontrado um card sem segunda imagem: ele não renderizou a camada `.product-image-swap-hover`. Por fim, ao disparar um erro realista na segunda imagem, o componente registrou `data-image-error="true"`, retornou a opacidade a `0` e aplicou `visibility: hidden`. Os cenários de imagem ausente e URL quebrada foram aprovados.

Resultado final do validador: `allPassed: true`.

## Validação final de Home e catálogo

A validação headless foi executada em ambas as vitrines públicas com dados reais do catálogo. Na Home, foram encontrados 11 cards, incluindo um produto esgotado com segunda foto; após a rolagem suave ser concluída, o hover produziu `matchesHover: true` e `opacity: 1`, o foco de teclado também produziu `focus-visible: true` e `opacity: 1`, e o selo `ESGOTADO` permaneceu visível nos dois estados. A abertura da visualização rápida apresentou o botão `ESGOTADO` desabilitado.

No catálogo, foram encontrados 9 cards, incluindo um produto esgotado com segunda foto; hover e foco exibiram a segunda imagem com `opacity: 1` e preservaram o selo. A navegação para a página do produto confirmou o CTA `.product-add-to-cart` desabilitado e com texto `ESGOTADO`. Portanto, a troca visual não reativa compra nem cria CTA indevido.

Resultado final da validação complementar: `allPassed: true` para Home, catálogo, hover, focus-visible e bloqueio de compra.
