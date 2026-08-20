# Project TODO

- [x] Ajustar cartões de produtos esgotados no catálogo para manter a imagem original intacta e exibir a etiqueta vermelha 'ESGOTADO' no canto inferior esquerdo, exatamente como na referência oficial da Eras Label
- [x] Corrigir selo de esgotado para ser um pequeno bloco na foto original e bloquear compra de esgotados no carrinho
- [x] Corrigir definitivamente o catálogo: remover o bloco vermelho grande dos produtos esgotados, manter a fotografia visível e exibir somente uma etiqueta pequena "ESGOTADO" no canto; validar também página inicial e detalhe do produto.

> Registo: o print de 20/08/2026 confirma que o bloco vermelho ainda substitui a imagem dos produtos esgotados no catálogo.
- [x] Implementar cobrança PIX do Mercado Pago com QR Code individual por pedido, validade de 30 minutos, indicação clara de expiração no checkout e regeneração segura de uma nova cobrança após o vencimento.
- [x] Corrigir Vendas & Entregas: remover rolagem interna desnecessária da lista, reorganizar e melhorar os filtros e permitir marcar o pedido como Enviado diretamente, sem bloquear por etiqueta, cotação ou condição operacional.
- [x] Reconstruir Estatísticas com dados reais: métricas de visitas, vendas, receita, ticket médio, conversão, comportamento dos visitantes, produtos e cupons; filtros de período/comparação, gráficos responsivos e estados vazios sem números fictícios.
- [x] Corrigir o carregamento persistente de Estatísticas: preservar dados válidos mesmo com estado de fetching, exibir erro acionável e desativar retries silenciosos
- [x] Corrigir métricas de estoque por produto para somar variações reais e impedir que o resumo de IA exiba valores undefined
- [x] Restringir o ERAS INSIGHTS aos dados reais do período e rejeitar benchmarks externos ou números não presentes no dataset analítico
- [x] Adicionar teste de grounding para impedir que o resumo de IA apresente métricas externas ou projeções não calculadas pelo sistema
- [x] Corrigir a grelha responsiva dos filtros de Vendas & Entregas e retirar a sobreposição do botão “Limpar filtros”
- [x] Validar de forma verificável a tela de Vendas & Entregas após a correção, confirmando os filtros alinhados no desktop
- [x] Validar a responsividade mobile da grelha de filtros de Vendas & Entregas após a mudança CSS
- [x] Executar e registrar testes/regressões após a correção dos filtros de Vendas & Entregas
- [x] Permitir abrir diretamente a seção Vendas por URL para tornar a validação e o retorno ao painel determinísticos
- [x] Reestruturar visualmente a seção SHOP para uma grade editorial mais compacta e com hierarquia coerente
- [x] Ordenar produtos esgotados automaticamente por último em todas as listagens públicas relevantes
- [x] Permitir cadastrar, ordenar, editar e remover uma quantidade ilimitada de banners no CMS da página inicial
- [x] Adicionar teste de regressão para garantir que o ordenador do storefront mantenha produtos esgotados no fim em todas as opções de ordenação
