# Notas de validação visual — rodada final

- A Home renderizou após o reinício com navbar global única: MENU à esquerda, ERAS. centralizado e SACOLA à direita.
- O conteúdo público exibiu banner hero, destaques, produtos, filtros de categoria/tamanho/preço, grupo VIP e newsletter.
- Não foram encontradas referências visíveis a filtro por cor na Home; os controles públicos exibidos são categoria, tamanho, preço mínimo e preço máximo.
- O rodapé não apareceu no primeiro viewport, pois a página é longa; deve ser validado na parte inferior ou por rota institucional.
- O preview exibiu um aviso fixo de ambiente de preview na parte inferior, que não pertence ao layout de produção.
- A primeira navegação mostrou brevemente “A carregar a sua era”, indicando que o estado de carregamento continua funcionando.

## Manifesto e menu aberto

A página /manifesto usa a mesma base visual clara da Home, com tipografia editorial, barra superior global e rodapé com Instagram, TikTok, políticas e contactos. Ao abrir MENU, o drawer lateral aparece sobre um overlay escuro e exibe um botão X persistente no canto superior. Os links principais apontam para /catalog, /category/camisetas e /collection/paradox-collection, e o contador/sacola permanece na navbar.

## Home após retorno

A Home voltou a renderizar com outra mensagem rotativa na barra de anúncio (“5% OFF PARA PAGAMENTOS NO PIX · UMA NOVA ERA COMEÇA AQUI”), confirmando que múltiplas mensagens e navegação anterior/próxima estão ativas. O hero, os destaques e a seção de produtos mantêm a composição editorial; os filtros exibidos seguem restritos a categoria, tamanho e preço.

## Sacola vazia

A sacola abriu globalmente sobre a Home com overlay e drawer. O estado vazio não exibiu recomendações; mostrou o contador 0, a mensagem “Sua sacola está vazia”, a barra de progresso em 0% e o texto de valor restante para frete grátis. O botão “EXPLORAR PRODUTOS” navegou corretamente para /catalog, que renderizou a página “Todos os produtos”.

## Regressão encontrada no produto

O checkout vazio renderiza corretamente a experiência editorial e a ação de retorno. Porém, ao seguir o primeiro link público `/produto/30001` exibido na Home/catalog, a aplicação mostra a página 404 “Esta era ainda não foi escrita”. Isso indica que os links numéricos de produto não estão alinhados aos identificadores/rotas aceitos pela página de produto e deve ser corrigido antes do checkpoint final.

## Validação visual desktop

A Home, o manifesto e o checkout vazio compartilham a navbar global e a estética editorial clara com acento #b22222. O estado vazio da sacola está centralizado, sem recomendações indevidas, e usa o CTA de retorno esperado. O catálogo abre a rota correta, mas a captura exibiu cards com áreas de imagem vazias/placeholder em vez de imagens carregadas; é necessário verificar se isso é apenas o comportamento de lazy loading na captura ou uma falha real de URLs/estado de produtos antes da entrega.

Após aplicar fallback de imagem, o catálogo e a página de produto exibem uma imagem editorial estável quando a URL legada do storage não pode ser carregada. Uploads válidos continuam sendo priorizados; o fallback evita um bloco vazio enquanto os registros antigos são substituídos por produtos reais.

## Refinamento do dropdown e anúncio — 2026-08-18

A captura desktop em 1280×720 confirmou a faixa de anúncio em linha superior completa, com texto centrado e setas equilibradas. A navbar aparece abaixo com menu, pesquisa, marca central, conta e sacola; a segunda linha contém Início, Produtos, Coleções, Camisetas e Bonés. O hero inicia abaixo da navbar sem sobreposição visual indevida.

A captura mobile em 390×844 confirmou que a faixa de anúncio permanece visível no topo, com texto centrado e controlos compactos. A navbar móvel mantém menu, marca e sacola numa cápsula clara, e o hero começa abaixo dela. A secção SHOP aparece com tipografia editorial e sem textura escura residual.

O dropdown de Coleções passou a ter regras explícitas de estado fechado (`opacity: 0`, `pointer-events: none`, transformação reduzida) e estado aberto controlado por `.is-open`/`:focus-within`; a interação hover/click deverá ser confirmada no browser interativo, enquanto o build e os testes validam a integridade do código.

## Verificação interativa do dropdown

A pré-visualização inicial mostrou a navbar com o conteúdo do menu de Coleções no DOM, mas sem presença visual no screenshot, confirmando o estado fechado por CSS. Após clicar no botão Coleções, o menu tornou-se visível com ERAS, Todas as coleções, Paradox Collection, Lost Between Eras e Raízes — Recife & La Ursa; a captura mostrou o popover posicionado abaixo da segunda linha da navbar, sem empurrar o hero. A barra de anúncio continuou visível e alternou de mensagem durante a navegação.
