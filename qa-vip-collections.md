# QA — Link VIP e Coleções

O convite fornecido pelo utilizador foi aberto com sucesso em `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t` e apresenta o grupo `ERAS LABEL VIP⏳`, confirmando que é o destino correto para os links do menu e do banner.

A inspeção do catálogo persistido encontrou apenas a coleção `PARADOX COLLECTION`. Os links `lost` e `raizes` estavam a encaminhar para filtros sem correspondência no catálogo, enquanto o desktop usava `/archive` para duas dessas opções. A correção deve centralizar os slugs/aliases de coleção e apresentar uma rota de coleção consistente, sem links divergentes entre Home, páginas internas e menu lateral.

## Validação final após a correção

- O convite do Grupo VIP utilizado no menu e no banner é `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t`.
- A Home permanece renderizada em desktop e mobile.
- As rotas `/collection/paradox`, `/collection/lost-between-eras` e `/collection/raizes` foram capturadas em 1280×720 e 375×812.
- `CatalogView` agora normaliza arrays JSON, strings JSON e objetos `{ url }` no campo `images`, aplica fallback visual quando uma imagem persistida falha e exibe fallbacks de catálogo para coleções sem produtos publicados.
- No mobile, as três rotas exibem cards de produto sem imagens quebradas; o título `LOST BETWEEN ERAS` quebra corretamente em duas linhas e `RAÍZES` mantém o espaçamento responsivo.
- TypeScript, teste Vitest de navegação e build de produção concluíram sem erros bloqueantes. O build emite apenas o aviso já existente sobre tamanho de chunk.

## Validação interativa final do menu e do Grupo VIP

A validação CDP interativa foi executada após o último ajuste visual. No desktop, o hover sobre `COLEÇÕES` abriu um menu visível de 286 × 129,5 px, alinhado abaixo do trigger, com os três destinos `/collection/paradox`, `/collection/lost-between-eras` e `/collection/raizes`. O foco de teclado abriu o mesmo menu e a tecla Escape fechou-o; o clique em `PARADOX COLLECTION` navegou para `/collection/paradox`.

No mobile, o botão `Abrir menu lateral` abriu o menu, que apresentou as três coleções e o link VIP com o convite correto. O clique interativo em `LOST BETWEEN ERAS` fechou o menu e navegou para `/collection/lost-between-eras`; ao reabrir o menu, o botão `Fechar menu` encerrou-o corretamente. O banner VIP da Home e o link VIP do menu expõem o destino `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t` com abertura em nova aba.

## Clique dos acessos VIP

Foi executado um clique real no convite VIP após abrir o menu lateral e outro clique no banner VIP da Home. Em ambos os casos, o elemento clicado expôs e utilizou `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t`; a sessão de teste confirmou `opened: true` para o menu e `clicked: true` para menu e banner. A abertura em nova aba é mantida pelo atributo `target="_blank"`; o Chromium de teste não criou uma nova página externa, mas os dois elementos foram encontrados e acionados com o href correto.

## Abertura observável do WhatsApp por clique físico

Com a aba Home ativada e o banner VIP rolado para dentro do viewport, foi executado um clique físico via eventos de ponteiro no banner. O Chromium abriu uma nova página com o título `WhatsApp Group Invite` e o URL `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t`. O mesmo comportamento foi observado no clique físico do acesso VIP do menu lateral.

No mobile, o fluxo completo também foi concluído por interação: abrir o menu, clicar em `PARADOX COLLECTION`, confirmar `/collection/paradox`, clicar no logo `ERAS.` do CatalogView e confirmar o retorno a `/` com o menu fechado.
