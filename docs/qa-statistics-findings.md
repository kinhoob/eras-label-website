# QA — Estatísticas

## Evidência visual de 20/08/2026

Foram capturadas duas prévias de `/admin?section=stats` em viewport desktop de 1440×900. Nas duas, a navegação administrativa abriu a seção **Estatísticas**, mas o conteúdo permaneceu em `Carregando métricas reais...` e os cartões, gráficos e filtros não chegaram a renderizar.

A tarefa não está concluída. Antes do checkpoint, é necessário identificar por que `trpc.admin.getAnalytics.useQuery` não sai do estado de carregamento no preview, corrigir a causa e repetir a captura até que os dados reais ou estados vazios honestos sejam exibidos.
