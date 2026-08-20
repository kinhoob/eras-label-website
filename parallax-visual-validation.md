# Validação visual do parallax

## Desktop — 1280 × 720

A Home permaneceu com a composição editorial intacta: a navbar, a faixa de anúncio e o hero continuam alinhados, sem deslocamento do texto ou dos controles. O parallax atua apenas na camada fotográfica do hero, mantendo o título, CTA e paginação em uma camada estável e legível.

## Mobile — 390 × 844

O hero permanece dentro do viewport, sem overflow horizontal, sem corte indevido do CTA e sem alteração da hierarquia da navbar. O fallback mobile mantém a imagem estável e desliga o transform parallax abaixo de 768 px para priorizar desempenho, bateria e previsibilidade do toque.

## Critérios funcionais

O movimento desktop é calculado fora do ciclo de render do React, usa `requestAnimationFrame`, listener de scroll passivo, deslocamento limitado a 42 px e é desligado por `prefers-reduced-motion`. O banner VIP utiliza a mesma composição sem conflito com o zoom de hover.

## Temas claro e escuro — validação explícita

A Home foi capturada com `?theme=dark` em 1280 × 720 e 390 × 844. No desktop escuro, o hero manteve profundidade fotográfica, controles e CTA nítidos sobre o fundo carvão. No mobile escuro, a navbar, o hero e o título permaneceram íntegros, sem overflow ou vazamentos de fundo claro; como previsto, o deslocamento fica desativado abaixo de 768 px.

O mesmo comportamento foi verificado no tema claro em 1280 × 720 e 390 × 844. O efeito é aplicado exclusivamente à camada de imagem, portanto a alternância de tema altera apenas a superfície cromática e o contraste, não a geometria nem a estabilidade do movimento.

## Correção de percepção do movimento — 20/08/2026

A revisão identificou dois motivos para o efeito parecer inexistente: a animação inicial do hero também controlava o `transform`, anulando o valor dinâmico do parallax durante a entrada, e o cálculo dependia apenas da posição relativa do elemento. A animação de entrada agora altera somente a opacidade, enquanto o hero responde diretamente a `window.scrollY`, com limite de 88 px no desktop e 26 px no mobile. O banner VIP continua usando a posição contextual do próprio contêiner.

A rolagem é atualizada por um único ciclo `requestAnimationFrame` com listener passivo. O desktop recebeu intensidade mais evidente; o mobile mantém movimento reduzido, mas não é mais zerado por CSS. `prefers-reduced-motion: reduce` continua desativando todos os transforms. Testes Vitest e build de produção passaram após a correção.

## Medição reproduzível durante scroll real — 20/08/2026

Foi executado um Chromium headless com CDP em quatro cenários, carregando a Home com `?theme=light` ou `?theme=dark`, definindo `scrollTop = 0` e depois `scrollTop = 420`, e lendo `--parallax-y` e `transform` do elemento `[data-parallax="hero"]`.

| Viewport | Tema | Scroll inicial | Scroll final observado | Parallax inicial | Parallax final | Resultado |
|---|---|---:|---:|---:|---:|---|
| 1280 × 1100 | Claro | 0 | 412 | 0,00 px | 74,16 px | Movimento confirmado |
| 1280 × 1100 | Escuro | 0 | 402 | 0,00 px | 72,36 px | Movimento confirmado |
| 390 × 844 | Claro | 0 | 418 | 0,00 px | 18,81 px | Movimento reduzido confirmado |
| 390 × 844 | Escuro | 0 | 415 | 0,00 px | 18,68 px | Movimento reduzido confirmado |

Em todos os casos, `transform` mudou de `translateY(0)` para um valor diferente, o tema reportado pelo DOM correspondeu ao cenário solicitado e `prefers-reduced-motion` permaneceu falso. A validação automatizada terminou com `allChanged: true`.
