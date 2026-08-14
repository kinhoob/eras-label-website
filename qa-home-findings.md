# Evidências de QA — Home Eras Label

## Desktop — 1280×720

A Home apresenta o banner rotativo em largura editorial, o bloco Destaques com três cards, a grade de Produtos da Era, o banner VIP com tratamento de aproximação, newsletter, colunas de rodapé e assinatura final da marca. A hierarquia visual mantém fundo claro, tipografia condensada e etiquetas editoriais. Não foram observados cortes horizontais ou sobreposições no screenshot de página inteira.

## Mobile — 375×812

O banner adapta-se para uma composição vertical, os três Destaques passam a uma coluna e a grade de produtos assume duas colunas, preservando etiquetas, preço normal e preço Pix. O banner VIP e o rodapé ficam em largura adequada, com newsletter e colunas empilhadas. Não foram observados overflow horizontal ou blocos sobrepostos no screenshot de página inteira.

## Próxima validação

Ainda é necessário validar por interação a abertura do dropdown Coleções, a ação de voltar ao topo e o fluxo autenticado de edição/gravação dos Destaques no Admin. A suíte Vitest possui uma falha preexistente de integração porque o banco de ambiente não contém a coluna `products.collection`; o build de produção e o TypeScript passaram separadamente.

## Revisão final após catálogo real

A Home passou a consumir `trpc.catalog.list` e usa o catálogo persistido quando disponível. Os destaques configurados são filtrados contra os produtos existentes e completados com produtos disponíveis quando IDs antigos não são encontrados. Também foi aplicado fallback de imagem no grid de Destaques, no grid da loja e no modal de produto para evitar cards visualmente quebrados quando um upload antigo está indisponível. A revisão final em 375×812 px confirmou a composição vertical do banner, destaques em uma coluna, produtos em duas colunas, banner VIP e rodapé sem overflow horizontal.

## Validação técnica final

`pnpm check`, `pnpm test --run` e `pnpm build` passaram. A suíte Vitest terminou com 7 ficheiros e 16 testes aprovados. O build mantém apenas o aviso informativo de chunk JavaScript acima de 500 kB.

## Interações desktop

No navegador, a Home foi aberta e o botão `COLEÇÕES` foi acionado. O menu expandiu corretamente e apresentou `PARADOX COLLECTION`, `LOST BETWEEN ERAS` e `RAÍZES — RECIFE & LA URSA`, confirmando que o dropdown é interativo e não apenas visual. Durante a verificação, o carrossel também avançou do banner `DRAFTS JÁ DISPONÍVEL` para `REVIVER. REINVENTAR.`, confirmando a rotação automática.

## Interações desktop — rolagem

A página foi rolada até ao fim da Home; o botão `Voltar ao topo` apareceu como elemento acessível. O botão foi acionado e a viewport retornou ao início, com o banner hero novamente visível e o indicador de rolagem superior restaurado. Este comportamento confirma a ação de retorno suave implementada.

## Links e rotas

O link `Quem Somos` do rodapé foi acionado e abriu `/manifesto`, exibindo a página institucional separada com o conteúdo do Manifesto Completo. Isso confirma que retirar o Manifesto da Home não removeu a rota nem o acesso pelo rodapé.

## Foco de teclado desktop

Ao regressar à Home, a navegação por `Tab` iniciou no botão de menu lateral, como esperado pela ordem de leitura do cabeçalho. A sequência de foco permanece acessível e será continuada até `COLEÇÕES` para testar a abertura via teclado.

A sequência de foco foi confirmada via teclado: após `Tab`, o elemento ativo foi o link de marca `ERAS.`. O foco visível ficou destacado no cabeçalho, mantendo a navegação sem rato. A verificação seguirá até o botão `COLEÇÕES` para testar a expansão por foco.

O teste de foco continuou sem rato: depois do logo, o elemento ativo foi confirmado como o link `PRODUTOS`, com outline visível. A ordem do cabeçalho é consistente e prepara o teste do botão `COLEÇÕES` por foco.

O foco foi avançado de `PRODUTOS` para `COLEÇÕES` com `Tab`. Sem clique, o dropdown abriu; a inspeção confirmou `aria-expanded="true"`, `role="menu"` visível e foco ativo no botão `collections-trigger`. O comportamento por foco de teclado está funcional.

## Interações mobile em viewport 375×812

A emulação mobile confirmou `window.innerWidth = 375` e que a navegação desktop fica oculta. O botão de menu lateral abriu corretamente após a espera de renderização; o menu apresentou três links de Coleções e o link `MANIFESTO COMPLETO`. O clique nesse link levou à rota `/manifesto`. No fim da página, o botão `Voltar ao topo` apareceu com `scrollY = 4269`; após o clique e a conclusão da animação suave, `scrollY` regressou a `0`.

## Validação manual mobile visível

Com a sessão do navegador em viewport mobile de 375×812, o menu lateral foi aberto manualmente pelo botão `Abrir menu lateral`. O painel exibiu a secção `COLEÇÕES` com três links. O clique manual em `PARADOX COLLECTION` navegou para `/collection/paradox`; a página de destino carregou o estado de coleção, embora o catálogo de ambiente estivesse vazio.

A Home foi reaberta manualmente após a navegação para a coleção, mantendo a sessão de teste orientada a mobile. O cabeçalho e a Home voltaram a carregar corretamente, preparando o teste do botão flutuante no rodapé.

Na validação manual visível em mobile, a rolagem até ao rodapé mostrou o botão `Voltar ao topo`. O clique manual regressou ao início da Home, com o hero e a secção `DESTAQUES` novamente visíveis; a animação suave foi concluída sem erro.

## Hover desktop

Com o cursor colocado manualmente sobre o botão `COLEÇÕES` na área DOM do cabeçalho desktop, o dropdown abriu por hover. O navegador expôs um elemento `role="menu"` com os links `PARADOX COLLECTION`, `LOST BETWEEN ERAS` e `RAÍZES — RECIFE & LA URSA`; o estado visual confirmou o painel suspenso sob o cabeçalho.

## Refinamento do Rodapé (Remoção da Newsletter e Ícones Sociais)

- **Remoção da Newsletter**: A caixa de subscrição de e-mail e o bloco editorial de novidades foram removidos do rodapé da Home, conferindo um layout mais limpo e direto.
- **Ícones Sociais**: Os links textuais de `INSTAGRAM ↗` e `TIKTOK ↗` foram substituídos por botões em formato de ícone (`Instagram` do Lucide e ícone SVG proprietário do TikTok), com bordas discretas, efeito de transição ao passar o cursor e rótulos de acessibilidade (`aria-label` e `title`).
- **Validação Responsiva**: O rodapé foi reorganizado numa grelha limpa com as colunas principais, informações e contactos, mantendo a responsividade perfeita tanto em desktop quanto em mobile.

- **Validação Mobile do Rodapé**: A captura em viewport 375x812 confirma que o rodapé em dispositivos móveis apresenta os ícones de Instagram e TikTok alinhados no topo do rodapé, sem a antiga caixa de newsletter, seguido pelas colunas institucionais perfeitamente empilhadas e legíveis.
