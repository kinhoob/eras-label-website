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
- [x] Implementar modo noturno persistente na loja pública com alternância por ícone de sol/lua na navbar
- [x] Ajustar tokens, superfícies, textos, bordas, overlays e imagens para contraste adequado no modo noturno
- [x] Validar o modo noturno em desktop, mobile e páginas públicas sem regressões
- [x] Cobrir a resolução da preferência de tema com teste unitário, incluindo valores inválidos e fallback para claro
- [x] Validar explicitamente o modo noturno ativado no navegador em desktop e mobile, com evidências para Home, catálogo, produto, checkout e conta
- [x] Revisar e corrigir contraste e legibilidade de navbar, busca, menus, sacola, cards e formulários no modo noturno ativado
- [x] Harmonizar o checkout vazio e o checkout modal com as superfícies escuras, preservando a leitura das áreas de pagamento e resumo
- [x] Afastar o botão sol/lua da sacola e dos demais controles na navbar mobile, preservando áreas de toque confortáveis
- [x] Corrigir a cascata de cores do modo noturno para manter superfícies, textos e bordas coerentes em todo o storefront
- [x] Adicionar estados de hover/focus suaves e visíveis aos controles da navbar e elementos interativos do tema
- [x] Revalidar modo noturno em Home, catálogo, produto, checkout, conta, sacola e menu mobile após os ajustes
- [x] Ajustar o cartão de boas-vindas, pedidos e rodapé da conta para respeitar o contraste do modo noturno
- [x] Adicionar evidência verificável da correção da navbar mobile (espaçamento entre theme toggle, conta e sacola)
- [x] Documentar com código verificável os overrides globais do modo noturno no storefront (Home, catálogo, produto, checkout, rodapé e menu mobile)
- [x] Adicionar evidência verificável dos estados hover/focus da navbar e controles públicos no modo noturno
- [x] Registrar validação explícita por página do modo noturno (Home, catálogo, produto, checkout, conta, sacola e menu mobile) com notas objetivas
- [x] Corrigir definitivamente o rodapé no modo noturno, incluindo superfície, textos, links, WhatsApp e créditos (a newsletter é uma seção independente da Home)
- [x] Corrigir definitivamente o menu lateral no modo noturno, incluindo overlay, largura, z-index, fechamento e responsividade
- [x] Validar rodapé e menu lateral em desktop e mobile e executar regressões antes do checkpoint
- [x] Corrigir superfícies, contraste e empilhamento do menu lateral público e do rodapé no modo noturno
- [x] Validar menu e rodapé em desktop e mobile nos temas claro e escuro
- [x] Implementar efeito parallax de scroll suave no storefront com fallback acessível e responsivo
- [x] Validar performance, movimento, temas claro/escuro e breakpoints do parallax
- [x] Validar explicitamente o parallax da Home nos temas claro e escuro com evidência verificável
- [x] Corrigir a intensidade e o cálculo do parallax para que o movimento seja perceptível durante a rolagem
- [x] Ajustar o fallback responsivo para manter uma animação leve e segura no mobile
- [x] Validar o movimento real durante a rolagem em desktop, mobile e temas claro/escuro
- [x] Adicionar verificação automatizada reproduzível do parallax em duas posições reais de scroll no desktop e no mobile
- [x] Registrar evidência verificável do parallax nos temas claro e escuro durante scroll real
- [x] Adicionar troca suave para a segunda foto dos produtos ao passar o mouse, priorizando a foto do modelo
- [x] Aplicar o comportamento nos cards da Home e do catálogo com fallback quando não houver segunda imagem
- [x] Validar teclado, mobile, imagens ausentes, modo escuro e estados de produto esgotado
- [x] Validar explicitamente cards com segunda foto em produtos esgotados, mantendo selo e CTA bloqueado
- [ ] Validar Home e catálogo com cards esgotados com segunda foto durante hover e focus
- [ ] Confirmar de forma reproduzível que hover/focus não reativa compra ou CTA em produtos esgotados
- [x] Adicionar verificação reproduzível do comportamento por teclado nos cards com segunda imagem
- [x] Registrar evidência objetiva para segunda imagem ausente e URL secundária quebrada
- [x] Corrigir checkout.create com validação rigorosa server-side (preço, cupom, frete, subtotal, taxa PIX/parcelamento e verificação de clientTotal).
- [x] Corrigir webhook do Melhor Envio para localizar pedidos por `trackingCode` ou `shippingOrderId` usando `or` do Drizzle e atualizar com `trackingCode`.

- [x] Verificar e corrigir o fail-fast de Mercado Pago em produção no servidor de pagamentos
- [x] Garantir fail-fast no boot quando MP_ACCESS_TOKEN ou MP_PUBLIC_KEY estiverem ausentes em produção
- [x] Substituir e validar o webhook unificado do Melhor Envio conforme o contrato enviado
- [x] Tornar a geração do número ER-AAAA-NNN segura e ignorar orderNumber enviado pelo cliente
- [x] Alinhar checkout.create ao contrato seguro com cupom, frete reconsultado e clientTotal
- [x] Atualizar o frontend do checkout para enviar couponCode, shippingOptionId e clientTotal
- [x] Adicionar ou atualizar testes de regressão para manipulação de total, frete, desconto e orderNumber
- [ ] Validar a Home e o catálogo com cards esgotados com segunda foto durante hover e focus
- [ ] Confirmar de forma reproduzível que hover/focus não reativa compra ou CTA em produtos esgotados

> Registo: tarefas extraídas de Pasted_content_04.txt e aplicadas somente nos locais indicados pelo usuário.

> Registo: as duas tarefas anteriores de validação dos cards com segunda foto permanecem pendentes até a validação específica desta rodada.

- [x] Adicionar teste de integração comportamental do checkout.create com preços, frete, cupom, total e orderNumber adulterados
- [x] Adicionar teste comportamental do mapeamento do webhook Melhor Envio para trackingCode, shippingOrderId e estados de entrega
