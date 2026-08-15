

## QA final — Feedback de adição e persistência da Sacola

A validação interativa foi executada em Chromium com viewport desktop de 1280×720 e mobile de 375×812.

| Cenário | Resultado observado |
|---|---|
| Botão de adição desktop | Após selecionar uma peça, o botão entrou em `is-added`, exibiu o ícone de confirmação e mudou o texto para `ADICIONADO À SACOLA`. |
| Toast desktop | O toast `Adicionado à sacola` apareceu brevemente e identificou `Camiseta Paradox Oversized` e o tamanho escolhido. |
| Persistência desktop | Após recarregar, o contador mostrou `1` e o carrinho lateral exibiu `Seu Carrinho (1)`. |
| Feedback mobile | O mesmo estado de confirmação e toast foram verificados em viewport 375×812. |
| Persistência mobile | Após recarregar, o badge da Sacola manteve o valor `1`. |
| Movimento reduzido | O estado animado tem variante explícita para `prefers-reduced-motion`. |
| Capturas visuais | Home verificada em desktop e mobile sem deslocamento ou overflow no cabeçalho e no hero. |
| Testes técnicos | TypeScript, 9 testes focados e build de produção concluídos com sucesso; a suíte completa será executada antes do checkpoint. |
