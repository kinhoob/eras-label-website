

## QA final — Sacola lateral e gestão direta

A validação interativa foi executada em Chromium com viewport desktop de 1280×720 e mobile de 375×812.

| Cenário | Resultado observado |
|---|---|
| Abertura após adicionar | A Sacola abriu como painel lateral sem abandonar a Home e mostrou `Seu Carrinho (1)`. |
| Aumento de quantidade | O controlo `+` alterou a Sacola de 1 para 2 e o total final mudou imediatamente. |
| Redução de quantidade | O controlo `−` regressou de 2 para 1 e o total voltou ao valor original. |
| Remoção | O botão de remoção esvaziou a Sacola e exibiu o estado vazio. |
| Desfazer | A ação `Desfazer` restaurou a mesma variante e o contador voltou a 1. |
| Fecho por Escape | A tecla Escape fechou o painel desktop. |
| Fecho mobile | O botão `Fechar carrinho` fechou o painel na viewport 375×812. |
| Persistência e navbar | As alterações usam o mesmo estado persistido da Sacola e mantêm o contador sincronizado. |
| Testes técnicos | TypeScript, 9 testes focados e build de produção concluídos; a suíte completa será executada antes do checkpoint. |
