# Evidências de QA — Navbar reaparece ao parar o scroll

## Desktop — 1280×720

A Home foi aberta no navegador com a navbar visível no topo, incluindo menu lateral, logo, Produtos, Coleções, Camisetas, Bonés, conta, som e Sacola. Após dois movimentos descendentes, a navbar saiu visualmente do viewport sem alterar o espaço do conteúdo. Depois de 700 ms sem novos eventos de scroll, a inspeção DOM confirmou `class="site-header is-visible"`, `position: sticky`, `top: 0px` e `transform: matrix(1, 0, 0, 1, 0, 0)`, demonstrando que a navbar reaparece automaticamente quando o utilizador para.

O segundo movimento descendente voltou a ocultar a navbar durante o deslocamento, sem overflow horizontal, sobreposição do catálogo ou perda do botão flutuante de voltar ao topo. O comportamento foi implementado na Home com debounce de 180 ms, direção de scroll para cima como revelação imediata e limpeza do temporizador no desmontar do componente.


## Mobile — 375×812

A captura de página inteira em viewport móvel confirmou que o cabeçalho permanece compacto, com o botão de menu, a marca, o controlo de som, a conta e a Sacola visíveis e sem overflow horizontal. A mesma regra de visibilidade aplica-se ao layout mobile porque a classe é partilhada pelo cabeçalho responsivo; a media query mantém o menu mobile e os controlos acessíveis enquanto o cabeçalho reaparece após a pausa do scroll.


## Acesso às ações da navbar

Com a navbar visível no topo, o botão `SACOLA` foi acionado no navegador e abriu corretamente o carrinho lateral, exibindo `Seu Carrinho (0)`, progresso de frete grátis, ação para explorar produtos e recomendações. Isto confirma que a interação não só reaparece visualmente como também preserva o acesso funcional à Sacola.


## Controlos desktop e mobile — validação complementar

No desktop, o menu lateral foi aberto pela navbar e exibiu os links Início, Arquivo de Eras, Manifesto Completo, Eventos, Contato, Grupo VIP, categorias e coleções. A conta permaneceu exposta como link `/account` e a Sacola abriu o carrinho lateral com sucesso.

Foi executado um teste interativo isolado em Chromium com viewport real de 375×812. O resultado confirmou: `initial_visible=True`, `hidden_during_scroll=True`, `revealed_after_pause=True`, `mobile_menu_accessible=True`, `cart_accessible=True`, `account_accessible=True` e `visible_at_top=True`. Assim, a navbar mobile desaparece durante a descida, volta após a pausa de 180 ms e mantém os acessos principais funcionais.
