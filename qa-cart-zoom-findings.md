

## QA final — Zoom de produtos e contador da Sacola

A validação interativa foi executada em Chromium com viewport desktop de 1280×720 e mobile de 375×812.

| Cenário | Resultado observado |
|---|---|
| Zoom desktop | A imagem passou de `transform: none` para `matrix(1.06, 0, 0, 1.06, 0, 0)` após hover, sem alterar as dimensões do card. |
| Contador da Sacola mobile | Depois de adicionar uma unidade, o badge mostrou `1` e o carrinho lateral mostrou `Seu Carrinho (1)`. |
| Navbar desktop | Ocultou durante o scroll descendente e reapareceu após aproximadamente 260 ms sem movimento. |
| Navbar mobile | Ocultou durante o scroll descendente e reapareceu após a pausa, mantendo o fluxo responsivo. |
| Testes técnicos | TypeScript, 10 ficheiros Vitest com 24 testes e build de produção concluídos com sucesso. |
