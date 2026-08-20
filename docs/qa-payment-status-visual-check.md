# Verificação visual do estado de pagamentos

Data: 2026-08-20

A rota `/orders` foi aberta no preview com a sessão persistida. A navegação pública carregou sem erro e a página exibiu o título “O seu histórico.”, o texto explicativo sobre pagamentos, preparação e entrega, a contagem de pedidos e o botão de atualização. O cartão de pedido fica abaixo da área capturada no primeiro viewport; a renderização inicial não apresentou erro de layout.

A rota `/admin` foi aberta com a sessão administrativa persistida. O painel carregou com a sidebar agrupada, cabeçalho do administrador, período de análise, cartões de operação e gráficos, sem erro visual no primeiro viewport. O mapeamento “Pagamento aprovado”/“Em preparação” é aplicado no código partilhado e foi validado pelos testes de reconciliação.

Validação complementar: suíte Vitest completa aprovada após tornar a chamada externa ao Resend opt-in; build de produção aprovado. O teste real da API Resend pode ser executado com `ERAS_EXTERNAL_TESTS=1` quando a rede externa estiver disponível.
