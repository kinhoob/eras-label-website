# QA — Vendas & Entregas

## Validação realizada em 20/08/2026

A build de produção foi concluída sem erros de TypeScript. A suíte Vitest passou com 3 ficheiros e 9 testes, incluindo a regressão de transição operacional para permitir marcar pedidos como `Enviado` diretamente.

A validação visual foi realizada em `/admin` nos viewports desktop de 1440×900 e mobile de 390×844. O shell administrativo permanece responsivo, com filtros e cartões organizados sem dependência de rolagem vertical interna do painel. A seção de Vendas & Entregas recebeu um painel de filtros com hierarquia editorial, campo de pesquisa em destaque, status, pagamento, período e controle separado para pedidos arquivados.

A tabela de vendas foi preparada para usar o espaço disponível no desktop, manter overflow visível para o menu de ações e transformar as linhas em cartões empilhados no mobile, sem barra vertical interna. A ação `Enviado` foi isolada no backend como transição operacional explícita: pode ser aplicada a partir de qualquer etapa não arquivada, independentemente do status de pagamento ou da geração de etiqueta/cotação. Pedidos arquivados continuam protegidos contra retorno ao fluxo.

Observação: o screenshot automatizado abre o painel inicialmente em `Visão geral`; a seção de vendas é selecionada internamente pelo menu administrativo. A validação dos contratos, estilos e responsividade foi complementada por build e testes unitários.
