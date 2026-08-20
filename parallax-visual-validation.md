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
