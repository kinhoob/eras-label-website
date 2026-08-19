# Project TODO - Eras Label Website

- [x] 1. **Base de Dados e Esquema (Drizzle)**: Tabelas criadas e migradas para produtos, variações, coleções, pedidos, itens de pedido, cupons, aparências (Nuvemshop-like), carrinhos abandonados e subscritores de newsletter.
- [x] 2. **Servidor e tRPC (Backend)**: Rotas tRPC para catálogo, carrinho, checkout, gestão de pedidos, cupons, aparência do site e newsletter.
- [x] 3. **Componentes e Utilitários de Armazenamento**: Integração com S3/storage para upload persistente de imagens e ficheiros de aparência.
- [x] 4. **Loja Pública (Frontend)**:
  - [x] Hero editorial, manifesto, coleções em destaque, arquivo de eras, próximos eventos e caixa de newsletter.
  - [x] Catálogo filtrável por categoria (camisetas, bonés) com preços (normal e PIX) e coleção.
  - [x] Página/modal de produto com seletor de tamanho, estoque e botão de adição à sacola.
  - [x] Sacola lateral (drawer) com validação de cupom, cálculo de totais e checkout.
  - [x] Fluxo de checkout completo (dados pessoais, morada, frete e confirmação).
  - [x] Área de cliente (login, dados, moradas).
- [x] 5. **Painel Administrativo (Admin)**:
  - [x] Autenticação restrita a administradores por e-mail e senha.
  - [x] Gestão de produtos, stock por variação e marcação de esgotado.
  - [x] Gestão de pedidos, status, rastreio e comprovantes.
  - [x] Gestão de cupons de desconto.
  - [x] Painel de Aparência (editoriais, galeria, categorias e menus).
  - [x] Aba de Newsletter com lista de subscritores e cupons gerados.
- [x] 6. **Notificações e E-mails**: E-mails automáticos de confirmação e alerta ao administrador para novos pedidos.
- [x] 7. **Efeitos de Interação e Sons**: Sons nos botões e animação de ampulheta nas transições.
- [x] 8. **Testes Vitest e Revisão Final**: Cobertura de testes validada para autenticação, cupons, newsletter e checkout.
- [x] 9. **Upload de Múltiplas Fotos na Edição de Produtos**
- [x] 10. **Menu Lateral, Sons e Ampulheta fiéis ao Lovable**
- [x] 11. **Navegação por Páginas Reais e Transição de Ampulheta (0.5s)**
- [x] 12. **Pesquisa Inteligente e Filtros Avançados**
- [x] 13. **Auditoria Técnica, Correções de Áudio e Code-Splitting**

- [x] Adicionar funcionalidade de exclusão de produtos no painel administrativo e restringir as variações de estoque exclusivamente a tamanhos e números, removendo a lógica de cores.

## Estado atual
- Plataforma de e-commerce da Eras Label totalmente implementada, com Estatísticas Analíticas por período, Histórico de Estoque com filtros por administrador/datas, utilitário de exportação CSV compartilhado e 86 testes unitários aprovados em Vitest.

## Integração Resend
- [x] Mapear os fluxos atuais de e-mail de pedidos, avisos administrativos e newsletter
- [x] Configurar a chave da API Resend de forma segura no backend
- [x] Implementar cliente Resend e templates de e-mail da Eras Label
- [x] Ligar confirmação de pedido, aviso administrativo e newsletter ao envio real
- [x] Cobrir sucesso, falha, fallback sem credencial e não exposição da chave em testes
- [x] Documentar domínio/remetente, variáveis de ambiente e operação da integração
- [x] Executar TypeScript, Vitest e build de produção
- [x] Guardar checkpoint final da integração Resend

## Histórico Resend e Newsletter aprimorada
- [x] Criar tabela no Drizzle para persistir o histórico de e-mails enviados pelo Resend
- [x] Registar automaticamente cada envio (sucesso ou falha) nas rotas de checkout e newsletter
- [x] Adicionar procedimento administrativo tRPC protegido para listar o histórico com filtros
- [x] Construir a aba "E-mails (Resend)" no painel administrativo com status, destinatário, assunto e data
- [x] Aprimorar o formulário de newsletter na Home com estado de carregamento, sucesso claro e exibição do cupom gerado
- [x] Executar migração SQL, testes unitários, build de produção e guardar checkpoint final

## Filtros e Ordenação Histórico Resend
- [x] Atualizar procedimento backend para aceitar filtros de busca, template e ordenação
- [x] Implementar controlos visuais de busca por texto, filtro de status/tipo e ordenação na aba admin
- [x] Validar estados vazios, teclado e responsividade
- [x] Executar TypeScript, Vitest, build e guardar checkpoint

## Templates Branded e Admin Expandido (Clientes & Email Marketing)
- [x] Criar templates de e-mail refinados com a cor #b22222 para boas-vindas, compra e código de rastreio
- [x] Criar procedimento tRPC para enviar e-mail de rastreio de pedido com o código fornecido pelo admin
- [x] Criar rota de listagem de clientes no painel administrativo e respetiva aba
- [x] Criar aba "E-mail Marketing" no painel administrativo logo abaixo de Clientes com disparo de campanhas aos subscritores e histórico via Resend
- [x] Executar TypeScript, Vitest, build e guardar checkpoint

## Segurança do Painel Administrativo
- [x] Criar autenticação administrativa por e-mail e senha, sem expor as credenciais no código-fonte
- [x] Criar sessão segura para o login administrativo e invalidá-la no logout
- [x] Bloquear visualmente a rota /admin até o login válido e impedir acesso de usuários não administradores
- [x] Garantir que todas as operações administrativas sensíveis continuem protegidas por adminProcedure (com canAccess limitado a consulta de role)
- [x] Adicionar testes Vitest para credenciais válidas, inválidas, sessão e controle de acesso
- [x] Executar TypeScript, Vitest, build, verificação visual e guardar checkpoint

- [x] Corrigir erro de importação na página de detalhe de produto (ProductPage.tsx) e eliminação definitiva de slugs e registos automáticos de teste.
## Pendências adicionais do painel (concluídas)
- [x] Implementar histórico de buscas recentes no armazenamento local (`client/src/lib/recent-searches.ts` com testes em `server/recent-searches.test.ts`)
- [x] Implementar segmentação de campanhas de e-mail por coleção (`server/marketing-audience.ts` com testes em `server/marketing-audience.test.ts` e UI integrada na aba E-mail Marketing)
- [x] Preparar mapeamento do domínio próprio eraslabel.com para o lançamento oficial (`docs/domain-mapping-eraslabel.md`)

## Inventário administrativo e variações
- [x] Criar tela de inventário no painel com busca de produtos, total de itens, estoque e variações
- [x] Permitir selecionar tamanhos por checkbox para roupas: PP, P, M, G e GG
- [x] Permitir selecionar tamanhos por checkbox para calças e bermudas: 34, 36, 38, 40, 42, 44 e 46
- [x] Permitir informar e salvar a quantidade de peças por tamanho/variação
- [x] Persistir variações e estoque no banco com procedure admin protegida
- [x] Mostrar estados de carregamento, sucesso, erro, estoque zerado e responsividade no inventário
- [x] Adicionar testes Vitest, executar TypeScript, build, verificação visual e guardar checkpoint

## Seção de Categorias no Painel Administrativo
- [x] Criar tabela persistida de categorias no schema Drizzle e aplicar migração non-destructive (`drizzle/0005_categories.sql`)
- [x] Criar rotas tRPC protegidas para listar, salvar, ordenar e remover categorias no admin
- [x] Criar componente `AdminCategoriesSection` no painel administrativo com suporte a CRUD, ativação e contagem de produtos
- [x] Integrar as categorias ativas à navegação pública da loja (`SidebarMenu` e `CatalogView`)
- [x] Adicionar testes unitários (`server/categories.test.ts`), verificar TypeScript, build de produção e guardar checkpoint

## Ajustes finais do inventário identificados na revisão
- [x] Adicionar estados explícitos de carregamento, erro e resultado vazio na lista de inventário
- [x] Verificar visualmente o inventário em desktop e mobile e guardar checkpoint específico desta entrega

## Separação de Produtos e Inventário
- [x] Manter Produtos como cadastro completo e remover a duplicação visual com Inventário
- [x] Transformar Inventário em atalho operacional para editar somente quantidades por variação
- [x] Adicionar filtro por categoria na tela de Inventário
- [x] Adicionar campo SKU ao cadastro completo de Produtos e persistir no backend

## Subcategorias e capas de categorias
- [x] Adicionar subcategorias persistidas com associação à categoria pai
- [x] Implementar CRUD de subcategorias no painel de Categorias
- [x] Permitir upload persistente de imagem de capa por categoria usando o storage do projeto
- [x] Exibir capas e subcategorias na navegação/experiência pública do catálogo
- [x] Adicionar 77 testes Vitest, TypeScript, build de produção e guardar checkpoint

## Alertas de inventário e duplicação de produtos
- [x] Adicionar indicador visual de estoque baixo na tela de Inventário
- [x] Criar botão de duplicar produto na tela de Produtos com cópia segura dos dados e variações
- [x] Adicionar notificação visual de sucesso após salvar alterações de estoque
- [x] Adicionar testes Vitest, TypeScript, build, verificação visual e guardar checkpoint

## Estatísticas Avançadas, Auditoria de Estoque e Filtros de Inventário
- [x] Criar modelo de dados e migração SQL para o histórico de auditoria de estoque por administrador (`inventory_audit_logs`)
- [x] Implementar procedures tRPC protegidas para métricas analíticas e histórico de alterações de estoque
- [x] Construir a tela de Estatísticas inspirada no padrão de referência (visão geral, receita, vendas, comportamento de visitantes e conversão)
- [x] Criar a aba de Histórico de Estoque com registo auditável de quem alterou, o tamanho, o estoque anterior e o novo
- [x] Refinar a barra de busca e os filtros avançados na página de Inventário
- [x] Executar suíte Vitest completa (84 testes aprovados), TypeScript sem erros, build de produção e guardar checkpoint final

## Exportação CSV e Filtros de Período/Auditoria
- [x] Implementar filtros de período (7, 30, 90 dias e personalizado) nas métricas e tendências de estatísticas no backend tRPC
- [x] Implementar filtros de busca por administrador e intervalo de datas no histórico de estoque no backend tRPC
- [x] Criar utilitário de exportação segura para formato CSV na interface do painel
- [x] Adicionar botões de exportar relatório CSV nas abas de Estatísticas e Histórico de Estoque
- [x] Atualizar testes unitários em Vitest (86 testes aprovados), TypeScript, build e guardar checkpoint final

## Resumo de IA, Paginação e Alertas Críticos de Estoque
- [x] Integrar resumo executivo gerado por IA com insights analíticos de vendas e tendências da marca (Eras Insights)
- [x] Implementar paginação e ordenação clicável por colunas na tabela de histórico de alterações de estoque
- [x] Reforçar indicadores visuais e badges de alerta (com efeito de pulsação e destaque vermelho) para produtos em estoque crítico
- [x] Executar com sucesso todos os 88 testes unitários em Vitest, TypeScript limpo e build de produção validado

## Gráficos por Categoria, Centro de Alertas e Insights Acionáveis
- [x] Implementar métricas e procedimentos tRPC para faturamento detalhado por categoria de produto
- [x] Criar o Centro de Alertas de Estoque Crítico na plataforma para monitorar peças em ruptura (< 5 unidades)
- [x] Tornar os insights do resumo de IA acionáveis e interativos para redirecionamento direto ao inventário
- [x] Concluir validação com 89 testes unitários aprovados em Vitest, TypeScript limpo e build de produção validado

## Comparação de Períodos e Previsão de Ruptura por IA
- [x] Atualizar o helper de analytics no backend para retornar a série comparativa do mês anterior (período equivalente anterior)
- [x] Atualizar o prompt da procedure `aiSummary` para cruzar o ritmo de vendas atual com o estoque das peças e prever risco de ruptura
- [x] Atualizar o componente `AdminAnalyticsSection` para exibir gráficos em barras duplas comparando o período atual versus o mês anterior
- [x] Atualizar a seção de insights executivos da IA com o bloco dedicado de previsão de esgotamento e produtos em risco
- [x] Executar testes Vitest (89 testes aprovados), TypeScript limpo, build de produção validado e checkpoint salvo

## Gestão de Sub-administradores e Permissões por Módulo
- [x] Criar tabela Drizzle para contas de administradores secundários, funções customizadas e permissões granulares por módulo (produtos, inventário, categorias, estatísticas, e-mails, configurações)
- [x] Implementar procedures tRPC protegidas para o superadmin gerenciar sub-administradores (criar, editar, listar, redefinir senha, ativar/desativar e configurar permissões)
- [x] Atualizar o middleware de autenticação e verificação de permissão no backend para bloquear acesso a rotas restritas para contas sem permissão
- [x] Construir a aba de Configurações / Gestão de Equipe no painel administrativo exclusiva para o superadmin principal (`theeraslabel@gmail.com`)
- [x] Ajustar a navegação e renderização das abas no painel para exibir apenas os módulos autorizados para sub-administradores
- [x] Validar segurança, escrever testes unitários em Vitest (92 testes aprovados), TypeScript limpo, build de produção e checkpoint salvo

## Indicador Visual de Cargo e Permissões no Cabeçalho
- [x] Criar query tRPC ou stateless state no cabeçalho
- [x] Adicionar badge de cargo e permissões no cabeçalho administrativo
- [x] Atualizar testes unitários e build de produção

## Checkout Transparente com Mercado Pago
- [x] Adicionar variáveis de ambiente seguras para o Mercado Pago (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`) no backend e frontend
- [x] Criar procedures tRPC protegidas para iniciar pagamento transparente (Pix e Cartão de Crédito) via API oficial do Mercado Pago
- [x] Implementar endpoint de webhook `/api/mercadopago/webhook` para atualizar o status dos pedidos automaticamente após a confirmação do pagamento
- [x] Atualizar a página de Checkout (`Checkout.tsx`) com os métodos de pagamento transparentes (Pix com QR Code / Copia e Cola e Cartão de Crédito direto no site)
- [x] Atualizar a página de sucesso para exibir o status confirmado ou pendente do Mercado Pago com resumo detalhado
- [x] Escrever testes unitários em Vitest para simular criação de pagamento e webhooks do Mercado Pago
- [x] Executar build de produção, validar TypeScript, garantir 95+ testes aprovados e salvar checkpoint final

## Melhorias Solicitadas (Checkout, Validação e Histórico)
- [x] Validação em tempo real do CPF no formulário de checkout
- [x] Validação em tempo real do número do cartão de crédito no checkout transparente
- [x] Indicador visual e mensagens de status durante o processamento do pagamento no checkout
- [x] Persistência de pedidos reais na base de dados (tabela orders e order_items)
- [x] Página de Histórico de Pedidos (/account/orders ou /orders) para acompanhamento do status e pagamentos
- [x] Testes Vitest cobrindo validação e histórico de pedidos

## Novas Solicitações de Ajuste (Parcelamento, Cupons e Histórico Detalhado)
- [x] Adicionar opção de parcelamento com cálculo de juros configurável no formulário de cartão de crédito no checkout
- [x] Implementar campo de cupom de desconto diretamente no checkout principal, recalculando o total em tempo real
- [x] Aprimorar a página de histórico de pedidos (`/orders` e `Account.tsx`) com modal/visualização detalhada dos itens adquiridos e rastreamento da entrega
- [x] Executar testes Vitest, TypeScript e build de produção para validar as novas funcionalidades

## Teste Sandbox Mercado Pago e Tratamento de Erros
- [x] Corrigir o fluxo de cartão sandbox que permanece em processamento após tokenização, adicionando timeout explícito, normalização da validade e envio seguro da mutation checkout.create
- [x] Reexecutar o teste de cartão e iniciar o teste Pix sandbox com cobertura em Vitest (`server/mercadopago-sandbox.test.ts`)
- [x] Corrigir e documentar o tratamento de `communication_error` do Pix, incluindo payload de endereço e orientação para chave Pix do vendedor sandbox
- [x] Tornar a chave de idempotência do pagamento estável por pedido e melhorar o diagnóstico de respostas não-2xx do Mercado Pago
- [x] Revalidar criação de token e mutation `checkout.create` com cartão no navegador, sem deixar o fluxo preso em processamento
- [x] Confirmar o webhook `/api/mercadopago/webhook` e a renderização completa do histórico de pedidos após uma mudança de status
- [x] Executar TypeScript, suíte Vitest completa (129 testes aprovados) e build de produção; guardar checkpoint final


## Gestão de Vendas & Integração Melhor Envio
- [x] Criar aba e secção de Vendas no Painel Administrativo (listagem de pedidos, pagamento, itens, morada e método de entrega)
- [x] Criar rotas tRPC e helpers para integração com a API do Melhor Envio (cálculo de frete, geração de etiqueta e consulta de rastreio)
- [x] Adicionar suporte a configuração de token do Melhor Envio via painel/secrets
- [x] Cobrir com testes unitários em Vitest a gestão de vendas e as chamadas do Melhor Envio

## Melhor Envio Real (Integração e Origem)
- [x] Configurar token e ambiente (Sandbox/Produção) do Melhor Envio via Secrets
- [x] Cadastrar endereço de origem da expedição (CEP, logradouro, número, bairro, cidade, UF)
- [x] Ligar cotação e geração de etiquetas com token real da API do Melhor Envio
- [x] Testar cotações e simular emissão de etiqueta com dados reais

## Melhor Envio OAuth2 (Client ID & Secret)
- [x] Configurar Client ID e Client Secret seguros nas Secrets
- [x] Criar endpoint de redirecionamento e troca de código por Access Token (`/api/melhor-envio/auth` e `/api/melhor-envio/callback`)
- [x] Validar a troca e o armazenamento seguro do token para cotação de frete real

## Restrição Logística Exclusiva (Correios e Jadlog)
- [x] Filtrar opções de frete na API de cotação e no carrinho/checkout para exibir apenas Correios PAC, Correios SEDEX, Jadlog .Com e Jadlog .Package
- [x] Atualizar o painel administrativo de Vendas para restringir ou destacar apenas as mesmas opções permitidas
- [x] Executar testes Vitest, TypeScript e build de produção

## Execução Logística Avançada (Melhor Envio Operacional)
- [x] Remover fallbacks estimados em caso de erro na API do Melhor Envio e exigir falha explícita e controlada
- [x] Configurar endereço de origem real da expedição e padronizar dimensões padrão de embalagem (caixa de vestuário Eras)
- [x] Mapear e fixar os IDs oficiais dos 5 serviços permitidos (Correios PAC, Correios SEDEX, Jadlog Econômico, Jadlog Rápido e Loggi)
- [x] Persistir o serviço de frete escolhido e o valor exato no pedido criado no checkout
- [x] Implementar procedure e ação de compra de etiqueta / geração de frete no painel administrativo de Vendas
- [x] Implementar procedure e ação de compra de etiqueta / geração de frete no painel administrativo de Vendas (e-mail de rastreio integrado)
- [x] Escrever testes unitários em Vitest para cobrir o novo fluxo operacional e garantir 100+ testes aprovados


## Etiqueta Admin e Rastreio do Cliente
- [x] Implementar procedure tRPC para gerar/comprar etiqueta no carrinho do Melhor Envio e obter PDF de impressão a partir de detalhes do pedido
- [x] Adicionar botão de "Gerar Etiqueta de Envio" e visualizador/impressão de etiqueta na seção de Vendas do painel admin
- [x] Criar página/seção dedicada de rastreio de entrega para o cliente (com input de código de rastreio e timeline de status)
- [x] Cobrir com testes unitários em Vitest e build de produção validado

## PDF de etiquetas do Melhor Envio (solicitação de 2026-08-16)
- [x] Adicionar visualização em PDF e opção de descarregamento da etiqueta no painel administrativo
- [x] Corrigir e validar os contratos TypeScript pendentes do fluxo de etiquetas do Melhor Envio
- [x] Criar testes unitários para a solicitação de impressão e ações de visualização/descarregamento
- [x] Validar a interface do painel, a suíte Vitest e o build de produção
- [x] Salvar checkpoint da funcionalidade de PDF da etiqueta


## PDF consolidado de múltiplas etiquetas (solicitação de 2026-08-16)
- [x] Adicionar seleção de múltiplos pedidos na aba de Vendas
- [x] Consolidar as etiquetas selecionadas em um único PDF no backend
- [x] Disponibilizar o download do PDF consolidado com tratamento de etiquetas ausentes
- [x] Criar testes unitários e validar TypeScript, Vitest, build e interface
- [x] Salvar checkpoint da funcionalidade de PDF consolidado



## Filtro rápido de etiquetas prontas (solicitação de 2026-08-16)
- [x] Adicionar estado de filtro rápido ("Todos" vs "Etiquetas Prontas") na aba de Vendas
- [x] Filtrar dinamicamente os pedidos com base na presença de `labelPdfUrl` ou `shippingOrderId`
- [x] Ajustar a seleção em massa para considerar apenas os pedidos visíveis no filtro atual
- [x] Executar testes Vitest, TypeScript, build e guardar checkpoint


## Página em construção, banner de anúncio e contador de drop (solicitação de 2026-08-16)
- [x] Adicionar campos de configuração de anúncio, bloqueio da loja e contador de drop no esquema e banco de dados
- [x] Criar procedures tRPC para ler e atualizar as configurações no painel administrativo
- [x] Construir a aba de configuração de "Página em construção / Loja fechada" no painel administrativo (inspirada no Nuvemshop)
- [x] Atualizar o banner de anúncio topo para ser totalmente editável no painel
- [x] Implementar a página trancada pública com mensagem personalizada e cronômetro regressivo para o próximo drop, permitindo bypass para administradores autenticados
- [x] Escrever testes unitários Vitest, validar TypeScript, build e interface
- [x] Salvar checkpoint final e entregar a funcionalidade completa


## Auditoria de Conversão e Performance E-commerce (2026-08-16)
- [x] Conduzir inventário completo e análise de lacunas (CRO, checkout, logística, SEO, performance)
- [x] Documentar o relatório estratégico em `/docs/ecommerce-audit-2026.md` com plano de ação priorizado
- [x] Validar que todas as rotas e testes continuam íntegros (116 testes aprovados, build de produção OK)
- [x] Guardar checkpoint final da auditoria e apresentar resultados ao utilizador


## Correção do Scroll e Densidade do Painel Admin (2026-08-16)
- [x] Aplicar rolagem vertical independente na barra lateral administrativa (`.admin-sidebar` e `nav`)
- [x] Reduzir dimensões de thumbnails (`32x32px`), ícones e paddings para otimizar o espaço vertical
- [x] Garantir acessibilidade total de todas as opções do menu em ecrãs de menor altura e dispositivos móveis
- [x] Executar testes Vitest (116 aprovados) e build de produção sem erros
- [x] Guardar checkpoint e entregar a correção


## Otimização automática de imagens no upload de produtos (2026-08-16)
- [x] Criar utilitário de compressão e redimensionamento automático no cliente
- [x] Converter imagens para WebP com fallback seguro e remover metadados desnecessários
- [x] Integrar o processamento no upload múltiplo de produtos sem quebrar os URLs existentes
- [x] Validar tamanho, dimensões, formato e qualidade com testes unitários
- [x] Executar TypeScript, Vitest, build e verificação visual do painel
- [x] Guardar checkpoint da otimização de imagens


## Refinamento Visual e Elegante (#b22222) - 2026-08-16
- [x] Atualizar o sistema global de design em `index.css` com a paleta refinada em `#b22222`, scrollbar personalizada elegante e microinterações suaves
- [x] Refinar a experiência da loja pública (animações de entrada, botões, modais, sacola e cartões de produtos)
- [x] Elevar a aparência do painel administrativo (hierarquia, superfícies de vidro/sombra suave, transições e feedback visual)
- [x] Executar testes Vitest (121+ aprovados), verificação TypeScript e build de produção
- [x] Salvar checkpoint e entregar o novo visual elegante


## Continuação pós-auditoria e preparação de produção
- [x] Corrigir o fluxo de cartão sandbox com referência de pedido estável, timeout explícito, normalização da validade e envio seguro da mutation de checkout.
- [x] Reexecutar os testes determinísticos do contrato de checkout para Pix e cartão e validar que retries reutilizam a mesma referência.
- [x] Implementar melhorias de conversão de alta prioridade sem fabricar avaliações: guia de tamanhos, prova social baseada apenas em dados reais e CTAs/contexto de compra.
- [x] Validar visualmente a barra de anúncio, modo loja bloqueada e contador regressivo em desktop e mobile.
- [x] Rever variáveis de ambiente e documentar checklist de migração sandbox/produção para Mercado Pago, Melhor Envio e Resend.
- [x] Executar TypeScript, suíte Vitest completa, build de produção e guardar checkpoint final.


## Novas Solicitações (2026-08-16)
- [x] Implementar rastreio público direto de encomendas via código do Melhor Envio com timeline detalhada na página `/tracking`.
- [x] Aprimorar o checkout com animações de carregamento fluidas, etapas visuais e mensagens de sucesso claras.
- [x] Criar nova página/secção de Perguntas Frequentes (FAQ) cobrindo envios, prazos, devoluções e compromissos éticos da Eras Label.
- [x] Validar testes unitários Vitest, TypeScript e build de produção para as novas adições.


## Limpeza de Dados Fictícios (2026-08-16)
- [x] Mapear tabelas de produtos, estoque, categorias, pedidos, itens, histórico, logs e subscritores para remoção limpa.
- [x] Executar script SQL transacional para truncar ou limpar tabelas de demonstração sem apagar utilizadores administradores.
- [x] Validar contagens zeradas e testar o funcionamento do painel administrativo com catálogo e vendas vazios.
- [x] Executar suíte de testes Vitest, TypeScript e guardar checkpoint da base limpa.


## Refinamentos do Painel Administrativo (2026-08-16)
- [x] Eliminar o scroll lateral na sidebar do painel administrativo (`.admin-sidebar`).
- [x] Implementar opções completas de definições e perfil editável (permitindo ao utilizador definir o próprio nome independentemente da permissão).
- [x] Reorganizar a secção de Aparência com blocos limpos, evitando elementos sobrepostos ou amontoados.
- [x] Permitir múltiplos anúncios rotativos ou em lista na barra de anúncio editável.
- [x] Refinar a experiência visual dos dropdowns do painel.
- [x] Reformular a tela inicial (Início) do painel com cartões de status operacionais (Por cobrar, Por embalar, Por enviar, Por retirar) e filtros de estatísticas por 7, 15, 30 dias e personalizado.
- [x] Corrigir o erro/quebra na secção de expectativas/estatísticas.
- [x] Executar testes Vitest, TypeScript e guardar checkpoint.


## Refinamentos do Painel Administrativo (Concluídos)
- [x] Corrigir a sidebar do admin para eliminar o scroll lateral indesejado e fixar a navegação.
- [x] Adicionar opções completas na área de configurações do painel.
- [x] Permitir que qualquer administrador edite o próprio nome de apresentação.
- [x] Reestruturar a aba de aparência em cartões e blocos limpos, sem aglomeração.
- [x] Atualizar a barra de anúncio para suportar múltiplas mensagens rotativas.
- [x] Melhorar visualmente os dropdowns e seletas do painel.
- [x] Reformular a tela inicial com métricas reais por período (7, 15, 30 dias e personalizado) e cartões operacionais.
- [x] Corrigir a secção de expectativas ligando-a ao estado real do catálogo.
- [x] Executar TypeScript, testes Vitest, build e salvar checkpoint final.


## Novas Solicitações de Melhoria (Gráfico de Linhas, Anúncios com Velocidade/Setas e Avatar de Perfil)
- [x] Adicionar gráfico de linhas no painel inicial para evolução de vendas e visitas por período.
- [x] Incluir nas configurações de aparência a velocidade de rotação da barra de anúncios e botões de setas de navegação.
- [x] Permitir upload e exibição de fotografia de perfil para administradores junto ao nome na sidebar.
- [x] Executar testes unitários, TypeScript, build de produção e guardar checkpoint final.


## Gráfico de Linhas, Velocidade de Anúncio e Fotografia de Perfil (2026-08-16)
- [x] Adicionar gráfico de linhas no painel inicial para visualizar a evolução das vendas e visitas de acordo com o período selecionado.
- [x] Incluir opções na secção de aparência para definir a velocidade de rotação das mensagens da barra de anúncios e adicionar setas de navegação.
- [x] Permitir que os utilizadores do painel administrativo façam o upload de uma fotografia de perfil para ser exibida junto ao seu nome na sidebar.
- [x] Executar testes unitários Vitest, TypeScript e build de produção para confirmar todas as melhorias.


## Centro de Notificações no Cabeçalho Admin (2026-08-16)
- [x] Auditar as queries de encomendas recentes e produtos com stock crítico.
- [x] Criar componente flutuante de centro de notificações no cabeçalho do painel com contador, estado de leitura e listagem.
- [x] Ligar os itens da notificação aos respetivos módulos (Vendas e Inventário) com navegação contextual.
- [x] Executar testes unitários Vitest, TypeScript e build de produção.


## Marcar Todas, Limiar Configurável e Toast de Notificações (2026-08-16)
- [x] Adicionar botão "marcar todas como lidas" no menu flutuante de notificações para zerar o contador.
- [x] Criar opção nas configurações do painel para definir o limite mínimo de stock crítico.
- [x] Implementar alerta visual flutuante (toast) para novas notificações recebidas no painel.
- [x] Validar build e integridade sem dados fictícios.


## Toasts Clicáveis e Animação do Sino (2026-08-16)
- [x] Tornar os toasts flutuantes interativos para abrir diretamente a encomenda ou o produto ao ser clicados.
- [x] Incluir efeito de destaque e animação suave no ícone do sino na chegada de novos alertas.
- [x] Garantir compatibilidade com preferências de acessibilidade e movimento reduzido.


## Indicadores na Sidebar e Som Configurável (2026-08-16)
- [x] Adicionar indicadores visuais (pontos vermelhos) nos itens da sidebar correspondentes a novas encomendas e stock crítico.
- [x] Incluir uma opção nas configurações do painel para ativar ou desativar o aviso sonoro das notificações.
- [x] Garantir persistência e sincronização em tempo real dos alertas na interface.


## Toques de Notificação e Histórico de Alertas (2026-08-16)
- [x] Adicionar opções nas configurações para selecionar entre três toques de notificação diferentes (Clássico, Suave e Alerta Digital).
- [x] Criar uma aba ou modal de Histórico de Notificações no painel para rever todos os alertas antigos já marcados como lidos.
- [x] Integrar a reprodução do som escolhido com Web Audio API respeitando o estado de silêncio e as preferências do utilizador.


## Toques de Notificação e Histórico de Alertas (2026-08-16)
- [x] Adicionar opções nas configurações para selecionar entre três toques de notificação diferentes (Clássico, Suave e Alerta Digital).
- [x] Criar uma aba ou modal de Histórico de Notificações no painel para rever todos os alertas antigos já marcados como lidos.
- [x] Integrar a reprodução do som escolhido com Web Audio API respeitando o estado de silêncio e as preferências do utilizador.


## Rodapé e páginas oficiais da marca (2026-08-17)
- [x] Consultar o site oficial da Eras Label e registrar contacto, WhatsApp, redes sociais, privacidade, trocas, envios e institucional em `docs/official-brand-data.md`.
- [x] Centralizar os dados públicos oficiais em `client/src/lib/official-brand.ts` e eliminar placeholders de contacto do rodapé.
- [x] Substituir o rodapé da loja por um componente reutilizável com links oficiais de contacto, privacidade, trocas, envios, FAQ, rastreio e grupo VIP.
- [x] Criar e registrar as páginas públicas `/privacy`, `/returns`, `/shipping` e `/about` com conteúdo alinhado às páginas oficiais consultadas.
- [x] Aplicar o rodapé oficial também em Home, FAQ, Contact, Tracking e páginas legais, com responsividade desktop/mobile.
- [x] Atualizar a FAQ com o prazo oficial de 7 dias úteis para trocas.
- [x] Criar testes Vitest para contactos, links sociais, políticas oficiais e ausência dos valores placeholder.
- [x] Executar TypeScript, 126 testes Vitest e build de produção com sucesso; validar o rodapé visualmente em desktop e mobile.


## Backgrounds animados e movimento premium (2026-08-17)
- [x] Auditar os backgrounds atuais da Home, catálogo e páginas públicas para definir pontos de animação sem competir com produtos.
- [x] Implementar camadas de background animadas com gradientes, textura e profundidade usando CSS/React performáticos.
- [x] Garantir contraste, responsividade e suporte a `prefers-reduced-motion`, com fallback estático acessível.
- [x] Validar a experiência em desktop/mobile, executar Vitest (131 testes aprovados), TypeScript e build, e salvar checkpoint.


## Auditoria mobile completa (2026-08-17)
- [x] Auditar Home, navegação, hero, destaques, catálogo, busca, filtros e backgrounds em larguras móveis reais.
- [x] Corrigir responsividade do carrinho lateral, checkout, modais, páginas legais, FAQ, contato, rastreio e rodapé.
- [x] Corrigir o painel administrativo em telas pequenas sem overflow horizontal e preservar ações essenciais.
- [x] Validar acessibilidade, fluxos móveis, Vitest (131 testes aprovados), TypeScript e build; salvar checkpoint atualizado.


## Otimização de SEO e Sitemap Dinâmico (2026-08-17)
- [x] Auditar e estruturar metatags de SEO por página (título, descrição, canonical, Open Graph, Twitter Cards).
- [x] Implementar rota de sitemap XML dinâmico no servidor (`/sitemap.xml`) e arquivo `robots.txt` otimizado para o Googlebot.
- [x] Escrever testes unitários Vitest para o sitemap e metatags, executar TypeScript, build e salvar checkpoint.


## Cadastro de produtos: visibilidade, links e categorias (2026-08-17)
- [x] Auditar o modelo de produto, procedures de criação/edição, formulário do admin e rotas públicas para definir o contrato de visibilidade e slug.
- [x] Implementar os estados Visível, Não listado e Oculto, com regras públicas de acesso e segurança.
- [x] Permitir editar o slug/link do produto e associar o mesmo produto a várias categorias no cadastro.
- [x] Atualizar o título principal para `Eras Label - Loja Oficial` via configuração oficial do projeto.
- [x] Criar/atualizar testes Vitest, executar TypeScript e build, validar o catálogo e salvar checkpoint.


## Filtros de categoria e galeria de produto (2026-08-17)
- [x] Auditar a origem das categorias na Home, o contrato de catálogo e o armazenamento atual das imagens dos produtos.
- [x] Adicionar filtros por categoria na página principal, com estado ativo, limpeza e fallback para catálogo completo.
- [x] Permitir upload de múltiplas imagens no cadastro/edição de produto, preservando otimização e armazenamento S3.
- [x] Criar carrossel público de imagens na página do produto, com navegação por toque, teclado e indicador de imagem.
- [x] Validar desktop/mobile, testes Vitest, TypeScript e build; salvar checkpoint.

## Auditoria final de catálogo e navegação — 2026-08-17
- [x] Atualizar a visualização rápida da Home para suportar galeria completa de imagens, setas, contador e miniaturas.
- [x] Substituir categorias hard-coded do menu móvel por categorias dinâmicas vindas do catálogo público.
- [x] Condicionar a consulta `admin.myAdminDetails` à sessão de administrador para evitar pedidos protegidos na área pública.
- [x] Executar TypeScript, 46 ficheiros de teste com 135 testes Vitest aprovados, build de produção e verificação visual desktop/mobile.

## Credenciais de produção — Mercado Pago e Melhor Envio (2026-08-17)
- [x] Solicitar e configurar de forma segura as credenciais de produção do Mercado Pago e do Melhor Envio.
- [x] Validar presença e formato das configurações sem expor segredos, mantendo os testes reais sob confirmação do proprietário.
- [x] Executar verificação final e guardar checkpoint da configuração de produção.


## Plano de Execução Sequencial P0 e P1
- [x] 1. **Validação Server-Side e Recálculo de Preços no Servidor (Checkout)**
- [x] 2. **Webhook e Reconciliação de Pagamento (Mercado Pago)**
- [x] 3. **Remoção de Dados Demonstrativos e Limpeza para Produção**
- [x] 4. **Criação da Rota de Catálogo e Correção do Erro 404**
- [x] 5. **Correção dos Links dos Cards de Produtos**
- [x] 6. **Dinamização do Rodapé Oficial**
- [x] 7. **Consistência do Rastreio e Formulário Mobile**

## Nova Avaliação: Experiência de Conteúdo, Manifesto e Editabilidade (2026-08-17)
- [x] Auditar rotas institucionais (Manifesto, História, Encontros/Eventos) e menus editáveis.
- [x] Executar testes automatizados (Vitest) para garantir integridade.
- [x] Avaliar a jornada do cliente na imersão cultural da marca (streetwear e storytelling).
- [x] Consolidar diagnóstico e recomendações de melhorias urgentes.

## Implementação das Urgências 1 e 2 — CMS Institucional e Menus Dinâmicos (2026-08-17)
- [x] Criar tabelas no schema Drizzle para páginas institucionais (CMS) e itens de menu customizados.
- [x] Implementar rotas tRPC para leitura pública e gravação administrativa de CMS e Menus.
- [x] Criar aba de Gestão de Conteúdo e Menus no Painel Administrativo.
- [x] Conectar o site público (Manifesto, História, Encontros, Menus e Rodapé) aos dados dinâmicos com fallback seguro.
- [x] Executar testes unitários (Vitest), TypeScript check e build de produção.


## Refinamento do Painel Administrativo e Anúncios (2026-08-17)
- [x] Reorganizar a sidebar do painel administrativo em grupos expansíveis por função (Catálogo, Vendas & Clientes, Marketing & E-mails, Aparência & CMS, Configurações).
- [x] Corrigir o erro de datas personalizadas no gráfico de receita e estatísticas.
- [x] Redesenhar o componente de CMS Institucional com campos limpos por URL de imagem e pré-visualização.
- [x] Suavizar a animação de transição da barra de anúncio na Home.
- [x] Tornar as notificações flutuantes e do menu interativas para marcar como lidas ao clicar e redirecionar corretamente.
- [x] Executar testes Vitest, TypeScript, build e checkpoint.

## Adicionar Pré-visualização CMS e Feedbacks Toast/Loading no Admin
- [x] Adicionar modal/aba de pré-visualização ao CMS para testar conteúdo antes de salvar
- [x] Padronizar estados de carregamento (loading), toast de sucesso e toast de erro em todas as ações do painel administrativo
- [x] Validar testes unitários Vitest e build de produção
- [x] Salvar checkpoint final com todas as validações concluídas


## Métricas Reais e Validação de Dados Suficientes para IA (2026-08-17)
- [x] Atualizar getAdminAnalytics no server/db.ts para calcular vendas, itens vendidos e velocidade de saída baseados exclusivamente em pedidos reais persistidos
- [x] Implementar verificação de dados insuficientes no aiSummary do server/routers.ts para exibir mensagem clara caso não existam vendas ou dados suficientes no período
- [x] Atualizar o painel administrativo para exibir claramente o aviso de dados insuficientes quando a amostra for nula
- [x] Executar testes Vitest, TypeScript, build e checkpoint final

## Funcionalidade de Limpar Notificações
- [x] Adicionar botão de limpar histórico de notificações no painel administrativo
- [x] Validar comportamento de confirmação, estado vazio e persistência local/servidor

## Correção de Cotação Melhor Envio e Modais (2026-08-17)
- [x] Tratar erro 401 do Melhor Envio no painel com mensagem orientando a verificar as credenciais reais de produção
- [x] Centralizar modais na tela (viewport) com posicionamento fixo/flex e scroll interno para evitar rolagem da página
- [x] Substituir botões textuais de fechar por um botão X acessível e elegante em todos os modais do painel
- [x] Validar com testes Vitest e build de produção

- [x] Reorganizar a sidebar administrativa para mostrar somente categorias em dropdowns colapsáveis, sem itens soltos, mantendo navegação responsiva e acessível.

- [x] Corrigir a tipagem de Tracking.tsx para acessar eventos de rastreio sem índice implícito.
- [x] Tipar o retorno do carrinho do Melhor Envio antes de persistir o ID da remessa.
- [x] Confirmar que o server/routers.ts permanece compilável após o tratamento de erros da cotação.


## Melhorias de navegação, CMS e carrinho global (2026-08-17)
- [x] Melhorar visualmente a barra de pesquisa no painel administrativo.
- [x] Melhorar visualmente a seção de e-mail marketing no painel administrativo.
- [x] Melhorar visualmente a gestão de conteúdo das páginas no painel administrativo.
- [x] Expandir o manifesto da marca para suportar imagens, textos e narrativa visual editável.
- [x] Permitir links editáveis nos botões de eventos pelo painel administrativo.
- [x] Fazer os links do menu público levarem a listagens reais de produtos.
- [x] Fazer “Todos os produtos” listar o catálogo completo visível.
- [x] Fazer “Camisetas” e “Bonés” filtrarem produtos pela categoria/tipo marcado no cadastro.
- [x] Fazer coleções como Paradox listarem produtos associados à coleção.
- [x] Permitir definir no cadastro do produto categorias, coleções e páginas públicas de exibição.
- [x] Exibir a sacola na navbar em todas as telas públicas, sem aparecer no painel administrativo.
- [x] Manter o checkout transparente acessível a partir da sacola global em qualquer tela pública.


## Unificação visual, catálogo e checkout (2026-08-17)
- [x] Manter o mesmo menu público em todas as telas, com símbolo X para fechar.
- [x] Corrigir a estética da newsletter pública para seguir a identidade da Home.
- [x] Unificar a estética das páginas encaminhadas pelo rodapé com a estética da Home.
- [x] Ocultar recomendações da sacola quando ela estiver vazia.
- [x] Redesenhar o checkout transparente dentro de um modal centralizado e claro.
- [x] Fazer “Explorar produtos” abrir uma tela exclusiva de produtos, não a Home.
- [x] Garantir telas de produtos para catálogo completo, categorias e coleções.
- [x] Remover seleção e filtro de cor dos produtos e manter busca por tamanho.
- [x] Alterar o filtro de preço para aceitar valor digitado pelo cliente.
- [x] Substituir a animação de frete grátis por barra de progresso de 0% a 100% baseada no carrinho.
- [x] Adicionar animações suaves de abertura e fechamento da sidebar pública.
- [x] Retirar a opção “Volte à loja” do painel administrativo.
- [x] Corrigir o texto “Definições e equipe” para português adequado no painel administrativo.
- [x] Tornar o scrollbar da sidebar administrativa quase invisível sem perder acessibilidade.

- [x] Remover a declaração duplicada de Link no SidebarMenu e restaurar a compilação do storefront.

## Rodada final de polimento e unificação
- [x] Unificar a navegação pública, removendo o header duplicado da Home e mantendo PublicGlobalNav como fonte única.
- [x] Garantir que o menu público use o mesmo SidebarMenu em desktop e mobile, com botão X persistente e animações de abertura/fechamento.
- [x] Refinar o shell visual das páginas institucionais e do catálogo para a mesma estética editorial da Home.
- [x] Melhorar a aparência da newsletter e manter o rodapé consistente nas páginas públicas.
- [x] Substituir a animação de frete grátis por uma barra de progresso suave de 0% a 100% baseada no valor do carrinho.
- [x] Ocultar recomendações e manter estado vazio limpo quando a sacola não tiver itens.
- [x] Corrigir o link Explorar produtos para apontar ao catálogo e preservar a navegação real por produtos.
- [x] Enquadrar o checkout da rota dedicada em modal centralizado, transparente e consistente com a marca.
- [x] Remover referências remanescentes a cor na busca, filtros e páginas de produto, mantendo apenas tamanho e faixa de preço.
- [x] Corrigir o rótulo administrativo para “Definições & Equipa” e tornar o scrollbar da sidebar quase invisível.
- [x] Atualizar e ampliar testes Vitest para os ajustes críticos desta rodada.
- [x] Validar TypeScript, testes, build e screenshots desktop/mobile antes do checkpoint.

- [x] Corrigir links/rotas de produto que retornavam 404 ao usar IDs numéricos, adicionando fallback público por ID e preferindo slugs quando disponíveis.

- [x] Adicionar fallback editorial para imagens legadas que retornam 403, sem substituir URLs de upload válidas no catálogo e na página de produto.

## Unificação pública e banners editáveis
- [x] Padronizar o shell visual de manifesto, catálogo, categorias, coleções e demais páginas públicas vindas da Home.
- [x] Garantir que todas as páginas públicas compartilhem a mesma sacola global e comportamento do carrinho da Home.
- [x] Remover textos “Fechar” dos menus/modais públicos e manter apenas o ícone X acessível.
- [x] Fazer a navbar reaparecer ao parar o scroll ou ao rolar um pouco para cima em qualquer posição da página.
- [x] Adicionar destino editável aos banners da Home no painel administrativo, com categorias visíveis e não listadas.
- [x] Atualizar testes e validar desktop, mobile, TypeScript, Vitest e build.

## Unificação pública e destinos de banners (Sessão atual)
- [x] Unificar o shell visual e a sacola global de todas as páginas públicas (catálogo, manifesto, produto, tracking, conta), eliminando desvios estéticos em relação à Home.
- [x] Corrigir o fechamento do menu para exibir somente o ícone X, removendo rótulos textuais redundantes.
- [x] Ajustar o comportamento global da navbar para reaparecer assim que o usuário parar de rolar a página ou inverter o sentido do scroll em qualquer rota.
- [x] Estender o modelo e persistência de banners no backend para suportar links estruturados de destino (link personalizado, catálogo ou categorias publicadas/não listadas).
- [x] Atualizar o painel administrativo de Aparência para permitir a seleção interativa dos destinos dos banners rotativos.
- [x] Executar testes Vitest (143 testes aprovados), verificação TypeScript sem erros e build de produção validado.

## Menu de E-commerce e Categorias Oficiais (Sessão atual)
- [x] Atualizar a navbar desktop e mobile para exibir de forma clara e elegante: Início (ou logo ERAS.), Produtos (catálogo geral com filtros de tamanho e preço), Camisetas (categoria dinâmica do painel) e Bonés (categoria dinâmica do painel).
- [x] Garantir que cada categoria e item de menu criado no painel administrativo possua uma página pública correspondente e acessível.
- [x] Validar a experiência de filtro na página de produtos e o comportamento da sacola global.
- [x] Executar testes Vitest, checagem de TypeScript, build e guardar checkpoint.

## Correção de Bug: Maximum update depth exceeded na Home
- [x] Rastrear o ciclo de sincronização da sacola na Home e no PublicCartDrawer
- [x] Aplicar correção de estabilização de referência e dependências de useEffect
- [x] Executar testes Vitest e validar estabilidade na Home

## Refinamento visual da sacola
- [x] Aplicar fundo sólido ao drawer global da sacola, com contraste e estética premium.
- [x] Garantir botão X visível, acessível e consistente para fechar a sacola.
- [x] Validar o drawer em desktop/mobile, executar Vitest e build e salvar checkpoint.

## Nova Solicitação: Deslizamento do Carrinho e Cores/Tamanhos no Admin
- [x] Adicionar animação suave de deslizamento (slide-in/slide-out) no carrinho global
- [x] Criar estado vazio amigável e refinado no carrinho global com CTA para o catálogo
- [x] Ampliar o painel administrativo (Inventário / Produtos) para gerenciar variações de tamanho e cor para camisetas e vestuário
- [x] Atualizar persistência backend e testes unitários Vitest
- [x] Executar build de produção e guardar checkpoint final

## Correções de UX e design solicitadas — 2026-08-17
- [x] Corrigir a sobreposição da navbar pública sobre o botão X e ajustar o tamanho/área de toque do X no mobile.
- [x] Garantir que a página de produto permita selecionar uma combinação válida de cor + tamanho antes de adicionar à sacola, sem bloquear o cliente por seleção inconsistente.
- [x] Modernizar visualmente a ação de adicionar produto à sacola, incluindo estados de carregamento, sucesso e abertura do drawer.
- [x] Modernizar o drawer da sacola no mobile, respeitando safe areas, hierarquia visual e controles de quantidade/remover.
- [x] Modernizar o checkout transparente para seguir a estética editorial premium da Eras Label em desktop e mobile.
- [x] Validar end-to-end o fluxo produto → sacola → checkout e corrigir regressões visuais ou funcionais.
- [x] Executar testes Vitest, TypeScript, build e screenshots responsivos antes do checkpoint final.
- [x] Salvar checkpoint final das correções de UX e design.

## Refinamento da sacola e navbar — 2026-08-17
- [x] Corrigir o erro React de atualização de PublicGlobalNav durante a renderização de PublicCartDrawer.
- [x] Reorganizar a sacola para eliminar o scroll interno desnecessário e manter as informações principais visíveis no viewport.
- [x] Redesenhar os controles de quantidade com sinais de + e - mais claros, equilibrados e acessíveis.
- [x] Redesenhar o campo de cupom com placeholder "Insira seu cupom" e confirmação textual em vermelho sobre o fundo da sacola.
- [x] Redesenhar o campo de CEP com cálculo de frete e opções de transportadora exibidas em seleção tipo checkbox.
- [x] Exibir Pix e cartão lado a lado e informar parcelamento em até 2x sem juros.
- [x] Refinar a hierarquia visual de subtotal, frete, descontos e valor final.
- [x] Ajustar a navbar desktop para se aproximar da referência oficial da Eras Label sem prejudicar o mobile.
- [x] Validar sacola, checkout, frete, pagamento, navbar e ausência do erro no console com Vitest, TypeScript, build e screenshots.
- [x] Salvar checkpoint final desta rodada.

## Busca pública e secções editoriais da Home — 2026-08-17
- [x] Transformar a busca da navbar num campo de pesquisa real, com entrada de texto, estado de carregamento, resultados e estado sem resultados.
- [x] Permitir abrir e navegar para produtos encontrados na pesquisa sem usar apenas um link estático para Produtos.
- [x] Redesenhar a grelha de produtos da Home segundo a referência enviada, com imagens, nomes, preços e preço Pix numa apresentação editorial responsiva.
- [x] Criar configuração administrativa para o nome de cada secção da Home, incluindo “Destaques” ou qualquer título personalizado.
- [x] Ligar a ordenação e os produtos exibidos nas secções da Home ao painel administrativo sem dados fictícios.
- [x] Validar pesquisa, listagem Home, sacola global, painel administrativo, TypeScript, Vitest, build e screenshots desktop/mobile.
- [x] Rever todo.md e salvar checkpoint desta rodada.

## Refinamento final: busca global e Home editorial
- [x] Tornar a busca da navbar global visualmente interativa, com dropdown responsivo, resultados reais e navegação para o catálogo com query `q`
- [x] Integrar e validar a query da navbar com o filtro de pesquisa do CatalogView
- [x] Redesenhar a grelha de produtos da Home em composição editorial de quatro colunas, com cards mais limpos e responsivos
- [x] Ligar títulos das secções da Home ao CMS e criar campos editáveis no painel administrativo
- [x] Executar testes Vitest, TypeScript, build e verificação visual desktop/mobile; guardar checkpoint
- [x] Aplicar refinamento visual final na sacola global, incluindo scroll interno apenas quando necessário e controlos de quantidade consistentes
- [x] Rever e corrigir o desenho do checkout transparente para manter a estética editorial Eras Label
- [x] Rever funcionamento completo de pesquisa, catálogo, carrinho e checkout após as alterações
- [x] Confirmar que não existem loops de atualização ou erros no console durante o uso público

## Histórico
- [x] Fases anteriores concluídas e checkpoints preservados conforme contexto herdado

## Estado da execução
- [x] Nova rodada de refinamento iniciada a partir do checkpoint e0d9b5e3

## Próximas validações
- [x] Teste automatizado da busca global e dos títulos configuráveis
- [x] Teste visual desktop e mobile
- [x] Teste de build de produção
- [x] Checkpoint final da rodada

## Observações
- [x] Não introduzir avaliações, depoimentos ou dados fictícios de clientes
- [x] Manter cor principal #b22222, transições próximas de 0,5s e acessibilidade com reduced motion
- [x] Manter credenciais de produção fora do código e não alterar integrações Mercado Pago/Melhor Envio nesta rodada

## Backlog de refinamentos identificados
- [x] Polimento adicional da sacola global e do checkout, se a verificação visual identificar regressões
- [x] Revisão de microinterações e estados vazios na busca e no catálogo
- [x] Atualização do checkpoint após todas as validações

## Entregável desta rodada
- [x] Busca global com resultados reais
- [x] Home editorial com secções nomeadas pelo CMS
- [x] Painel de admin com edição de títulos de secção
- [x] Validações automatizadas, build e checkpoint

## Critérios de aceitação
- [x] Pesquisar na navbar mostra resultados clicáveis sem redirecionamento prematuro
- [x] Enter na navbar abre `/catalog?q=...` e CatalogView filtra os mesmos produtos
- [x] Home exibe grelha de quatro colunas em desktop e adaptação coerente em mobile
- [x] Admin consegue editar e guardar os títulos de Destaques, Produtos e Comunidade
- [x] Testes e build passam sem erros

## Itens técnicos
- [x] Estabilizar referências da busca global para evitar renders ou refetches desnecessários
- [x] Adicionar estilos dedicados ao dropdown da busca global
- [x] Preservar fallback editorial somente quando o catálogo estiver sem produtos reais
- [x] Manter a navbar pública ausente em rotas administrativas e de autenticação

## Fecho
- [x] Comunicar o resultado final com o checkpoint e limitações de validação


## Alinhamento com referência Lovable — eventos, newsletter, menu e sacola
- [x] Ajustar a secção pública de eventos para mostrar apenas eventos futuros publicados pelo admin
- [x] Garantir no painel administrativo a criação/edição de data, título, cidade, descrição, imagem opcional, link/CTA e publicação dos eventos
- [x] Ajustar a newsletter pública para o conceito “Seja avisado antes da próxima era”, mantendo estados reais de carregamento, sucesso e erro
- [x] Refinar o menu lateral para a composição visual da referência, com X simples sem círculo, backdrop e scrollbar discreto
- [x] Refinar a sacola global para o drawer branco editorial da referência, preservando cupom, frete, pagamentos e checkout reais
- [x] Validar responsividade desktop/mobile, navegação, estados vazios e acessibilidade
- [x] Executar testes, TypeScript, build, screenshots e guardar checkpoint desta rodada
- [x] Atualizar notas da referência Lovable sem copiar conteúdo ou dados fictícios de clientes


## Nova rodada — tela de coleções e limpeza da busca
- [x] Redesenhar a página pública de coleções com hero editorial, título “Coleções” e composição de destaque inspirada na referência
- [x] Exibir todas as coleções públicas com imagem, ano, descrição, texto editorial, CTA e produtos associados
- [x] Permitir editar no painel administrativo os textos, imagem, ano, ordem, visibilidade e destino/CTA de cada coleção
- [x] Garantir acesso à tela de coleções pela navbar e pelo menu lateral, com dropdown visual de coleções
- [x] Remover o texto preto indesejado abaixo da barra de pesquisa da navbar sem quebrar os resultados interativos
- [x] Validar responsividade, pesquisa, coleções, catálogo, sacola e painel administrativo com testes e build
- [x] Guardar checkpoint final desta rodada


## Nova rodada — Shop editorial na Home, coleções em dropdown e anúncio animado
- [x] Transformar a página inicial (Home) num shop editorial limpo, exibindo apenas as secções e produtos configurados pelo admin no painel
- [x] Integrar o dropdown de coleções na navbar pública de forma fluida e acessível
- [x] Corrigir e aprimorar a barra de anúncio (AnnouncementBar) para garantir centralização, rotação animada e exibição correta tanto em desktop quanto em mobile
- [x] Executar testes Vitest, TypeScript, build e validação visual desktop/mobile
- [x] Guardar checkpoint final desta rodada

- [x] Corrigir dropdown de Coleções da navbar para iniciar fechado e abrir apenas por interação, sem sobrepor o conteúdo.
- [x] Corrigir a faixa de anúncio global para permanecer centrada, animada e visível em desktop e mobile.
- [x] Fazer auditoria visual final da Home, navbar, drawer e navegação responsiva após os ajustes.
- [x] Reexecutar Vitest, TypeScript e build de produção após o refinamento visual.

- [x] Redesenhar a página de produto com galeria swiper, miniaturas e painel de compra editorial inspirado na referência fornecida.
- [x] Implementar produtos similares dinâmicos usando a mesma categoria ou coleção, excluindo o produto atual.
- [x] Validar a página de produto em desktop/mobile, incluindo seleção de variação, adicionar à sacola e navegação global.
- [x] Reexecutar Vitest, TypeScript e build de produção após a atualização da página de produto.

- [x] Redesenhar a página de produto com galeria swiper, painel editorial de compra e recomendações da mesma categoria/coleção.

- [x] Corrigir o dropdown de Coleções que está a aparecer/posicionar-se de forma incorreta nas páginas públicas.
- [x] Manter o banner totalmente visível no início da página e impedir que a navbar o sobreponha antes de algum scroll.
- [x] Fazer a navbar passar para sobreposição apenas após o utilizador descer um pouco, em desktop e mobile.
- [x] Validar Home e categorias, executar Vitest/TypeScript/build e guardar checkpoint da correção.

## Refinamento do CMS de Aparência e Tela de Vendas (Referência Lovable)
- [x] Reestruturar o CMS de Aparência (`AdminAppearanceSection.tsx`) com divisões editoriais claras (banners, secções da Home, textos institucionais e navegação), pré-visualização em tempo real e feedback visual refinado.
- [x] Reestruturar a tela de Vendas (`AdminOrdersSection.tsx`) com cartões de métricas consolidadas, filtros rápidos por status/envio/pagamento e tabela de pedidos otimizada com ações de cotação, etiqueta e detalhe.
- [x] Validar a integração dos componentes administrativos com o backend tRPC e as permissões de sub-administradores.
- [x] Executar testes Vitest, TypeScript, build de produção e guardar checkpoint final desta entrega.

## Refinamento do CMS, Pedido Manual e Carrinhos Abandonados (2026-08-18)
- [x] Elevar a aparência visual de todo o CMS (Aparência & CMS) para a estética editorial da Eras Label (#b22222, cartões refinados, superfícies elevadas e transições suaves).
- [x] Redesenhar o seletor de "Criar nova seção" num componente moderno, limpo e intuitivo.
- [x] Criar a página/secção de **Pedido Manual** dentro de **Aparência & CMS** para registar encomendas externas ou manuais com itens, cliente e pagamento.
- [x] Criar a secção de **Carrinhos Abandonados** dentro de **Vendas & Clientes** para monitorar carrinhos preenchidos por clientes não finalizados.
- [x] Executar testes Vitest, TypeScript, build e guardar checkpoint.

## Auditoria Integral e Prontidão para Lançamento (2026-08-18)
- [x] Conduzir auditoria de arquitetura, rotas tRPC e esquema Drizzle
- [x] Verificar fluxos públicos (Home, catálogo, coleções, produto, sacola, checkout e tracking)
- [x] Verificar painel administrativo (Produtos, inventário, estatísticas, vendas, pedidos manuais, carrinhos abandonados, CMS, coleções, eventos, cupons e equipa)
- [x] Auditar identidade visual (#b22222, tipografia editorial, animações suaves e ausência de elementos fictícios)
- [x] Executar suíte completa de testes Vitest, TypeScript e build de produção
- [x] Gerar relatório de auditoria final com o que está pronto e recomendações de lançamento

## Refinamento Visual e Reorganização do Painel Administrativo
- [x] Mover a página de Pedido Manual para a área de Clientes (Clientes & Pedidos Manuais) na navegação e nos grupos da sidebar.
- [x] Refazer o CSS global do painel administrativo (`Admin.tsx`, secções de CMS, inventário, vendas e cupons) aplicando a identidade editorial da Eras Label (fundos limpos, cartões elevados, tipografia refinada e botões consistentes).
- [x] Reposicionar e redesenhar os controlos de troca de banner no CMS de Aparência, retirando-os de cima das imagens e colocando-os numa barra de ferramentas ou cartão externo limpo.
- [x] Redesenhar completamente a aba de Categorias (`AdminCategoriesSection.tsx`) com cartões editoriais, upload elegante de capas e tabela alinhada ao restante do admin.
- [x] Executar testes Vitest, TypeScript, build de produção e guardar checkpoint final.

## Refinamento Admin Atelier — rodada atual (2026-08-18)
- [x] Manter Pedido Manual no grupo Vendas & Clientes e adicionar atalhos operacionais na aba Clientes.
- [x] Redesenhar a aba de Categorias com métricas, pesquisa, cards editoriais, subcategorias e upload de capas.
- [x] Reposicionar os controlos de troca e remoção de banners para fora do preview da imagem.
- [x] Aplicar acabamento visual específico ao CMS, Categorias e Clientes com a identidade #b22222.
- [x] Validar visualmente o painel em desktop e mobile.
- [x] Executar build de produção e guardar checkpoint desta rodada.

- [x] Confirmar o contrato `coupons.adminList` no router atual e validar que o erro histórico não se reproduz após reiniciar o servidor.

## Ajuste de Categorias baseado na referência visual (2026-08-18)
- [x] Reestruturar a curadoria de Categorias da Home para aproximar o layout de referência: linhas editoriais, campos alinhados, grelha de produtos organizada e criação de secção com hierarquia clara.
- [x] Preservar CRUD, ativação, subcategorias, upload de capa e seleção de produtos durante a remodelação.
- [x] Validar responsividade do painel em desktop/mobile, executar Vitest (152 testes), TypeScript e build de produção.

## Modal de detalhes do pedido — abertura no viewport (2026-08-18)
- [x] Corrigir o modal de detalhes do pedido para abrir centrado no viewport sem exigir scroll da página.
- [x] Manter o scroll limitado ao conteúdo interno, preservar o botão X e garantir comportamento responsivo.
- [x] Validar desktop/mobile, executar TypeScript, Vitest (152 testes) e build de produção.

## Dropdown de Produtos com categorias (2026-08-18)
- [x] Transformar Produtos na sidebar administrativa num grupo dropdown expansível.
- [x] Listar dinamicamente as categorias cadastradas dentro do dropdown e manter o acesso à visão geral de Produtos.
- [x] Ligar cada categoria a uma listagem filtrada, preservar permissões e validar desktop/mobile, TypeScript, 152 testes e build.

## Assinatura do rodapé — Kinhoob (2026-08-18)
- [x] Adicionar “Desenvolvido por Kinhoob” no rodapé público com link para https://kinhoob.github.io/portfolio.
- [x] Garantir abertura acessível em nova aba, estilo editorial e responsividade; validar TypeScript, 152 testes Vitest e build de produção.
- [x] Corrigir o erro de TypeScript no filtro de categorias do dropdown de Produtos identificado durante a validação.

## Reversão da assinatura de rodapé — 2026-08-18
- [x] Restaurar o texto anterior do rodapé e remover o link “Desenvolvido por Kinhoob”.
- [x] Preservar o dropdown administrativo de Produtos e validar TypeScript, 152 testes Vitest e build de produção.

## Miniaturas no seletor de produtos das secções da Home (2026-08-18)
- [x] Mostrar a imagem principal ou miniatura de cada produto no seletor de secções da Home.
- [x] Preservar checkbox, seleção, ordenação, nome, coleção e fallback para produtos sem imagem.
- [x] Validar a grelha em desktop/mobile, executar TypeScript, 152 testes Vitest e build de produção.

## Redesign editorial da tela de Eventos (2026-08-18)
- [x] Reestruturar cabeçalho, métricas, apresentação pública, formulário e lista de eventos com hierarquia editorial premium.
- [x] Preservar CRUD, publicação, banner, data, local, descrição, links/CTA e estados vazios.
- [x] Validar desktop/mobile, executar TypeScript, 152 testes Vitest e build de produção.

## Redesign de Próximo Drop e Trancar site (2026-08-18)
- [x] Reestruturar os cartões de Próximo Drop e Trancar site com a mesma estética editorial do painel.
- [x] Preservar cronómetro, mensagens, ativação/desativação, campos de imagem/link e pré-visualização.
- [x] Validar desktop/mobile, executar TypeScript, 152 testes Vitest e build de produção.

## Redesign editorial do Pedido Manual (2026-08-18)
- [x] Reestruturar cabeçalho, cliente, catálogo de produtos, variações, carrinho do pedido e resumo financeiro com a estética geral da Eras.
- [x] Preservar criação do pedido, seleção de tamanhos/variações, quantidades, descontos, frete, pagamento e submissão.
- [x] Validar desktop/mobile, executar TypeScript, 152 testes Vitest e build de produção.

## Refinamento da newsletter desktop (2026-08-18)
- [x] Corrigir a composição desktop da newsletter para evitar texto estreito, quebras excessivas e desalinhamento do formulário.
- [x] Preservar a versão mobile, o formulário, feedbacks e a estética editorial escura da Eras.
- [x] Validar desktop/mobile, executar TypeScript, Vitest e build, e guardar checkpoint.

- [x] Corrigir a composição desktop da newsletter: garantir distribuição equilibrada em duas colunas, impedir quebra vertical do título e preservar a composição mobile.

- [x] Adicionar ícone acessível do WhatsApp junto ao contacto correspondente no rodapé público, mantendo a estética editorial e a responsividade.

- [x] Reestruturar a página pública de Produtos com grelha compacta de três produtos por fila no desktop e filtros laterais de preço, ordenação, tamanho e categorias, preservando a responsividade mobile.

- [x] Concluir auditoria integral do site e do painel administrativo, gerando o relatório técnico e estratégico completo.

- [x] Substituir “DESENVOLVIDO COM INTENÇÃO” por “DESENVOLVIDO POR KINHOOB” no rodapé, preservando o link do portfólio.

- [x] Criar dropdown dinâmico de Produtos na página inicial, com categorias vindas do painel administrativo e links para as respectivas páginas de catálogo.

- [x] Ligar o backend de carrinhos abandonados aos dados reais e criar o template de e-mail com identidade visual em #b22222.

- [x] Ligar o backend de carrinhos abandonados aos dados reais e criar o template de e-mail de carrinho abandonado com a cor #b22222.

- [x] Executar limpeza total da base de dados para produtos, categorias, pedidos, itens de pedidos e histórico de e-mails, preservando administradores, aparências, clientes e configurações.

- [x] Consultar o site oficial da Eras Label e cadastrar os produtos reais, coleções e categorias extraídos da página oficial.

- [x] Consultar o site oficial da Eras Label e cadastrar os produtos reais, coleções e categorias extraídos da página oficial.

- [x] O teste unitário online de credenciais do Melhor Envio apresentou timeout de rede por restrição de saída do sandbox (comum em testes externos), enquanto o build de produção foi totalmente aprovado.

- [x] Diagnosticar e corrigir o erro de importação dinâmica em ProductPage.tsx e remover o fallback que recria o produto automático "Camiseta Paradox Oversized msyvg".

- [x] Adicionar funcionalidade de exclusão de produtos no painel administrativo com confirmação segura.
- [x] Remover a lógica de cores das variações de produtos, permitindo apenas tamanhos e números de peças definidos pelo administrador.

- [x] Rastrear e eliminar toda a origem de criação automática de produtos no backend/frontend, limpando todos os registos indesejados da base de dados.

- [x] Adicionar seleção múltipla de produtos com checkbox individual, seleção total e ações em lote para duplicar, apagar e associar categorias.
- [x] Remover a apresentação de cores do produto, carrinho lateral e checkout; manter apenas tamanho e quantidade.
- [x] Atualizar testes de inventário e identidade das linhas do carrinho para o modelo somente por tamanho; validar TypeScript, Vitest e build.

- [x] Remover a lista intrusiva de alertas de estoque do menu flutuante de notificações, mantendo o alerta de estoque baixo de forma discreta na própria linha do produto na tabela de inventário/catálogo.

- [x] Redesenhar a tela de Cupons no painel administrativo com uma estética limpa, moderna e organizada inspirada na Nuvemshop, mantendo a identidade visual editorial da Eras Label (#b22222), barra de pesquisa, filtros de estado, tabela de gestão e modal de criação/edição.

- [x] Expandir o CMS de Menus do painel administrativo para suportar a criação de novos menus, adição e edição de itens de navegação, exclusão de links e associação a páginas personalizadas da marca, mantendo a estética editorial e o padrão Nuvemshop.

- [x] Corrigir o layout desktop da tela de Aparência no painel administrativo para preencher adequadamente a largura da tela sem comprimir colunas ou sobrepor blocos, garantindo uma hierarquia visual limpa e responsiva.

- [x] Adicionar no filtro da página de catálogo a ordenação por "mais vendidos" e a opção de escolher por tamanho, mantendo a identidade visual editorial e a responsividade.

- [x] Otimizar o layout do checkout transparente para abrir instantaneamente em tamanho ideal, tanto em desktop quanto em mobile, com barra de rolagem interna controlada e sem cortes.
- [x] Adicionar a previsão estimada do dia de entrega no checkout, integrando o cálculo de frete com margem configurável de dias extras administrativos para encomendas.
- [x] Criar a aba e a tela de Gestão de Envios no painel administrativo (inspirada no Nuvemshop Nuvem Envio), permitindo listar envios, criar envios avulsos e reversos (trocas/devoluções) e gerenciar a configuração de dias extras de segurança no frete.

- [x] Eliminar definitivamente qualquer rotina ou fallback que recrie produtos automáticos (como Camiseta Paradox Oversized) na base de dados.
- [x] Implementar o filtro lateral de tamanhos no catálogo público com opções visuais de PP, P, M, G e GG (seguindo a referência enviada).

- [x] Otimizar definitivamente o layout do checkout transparente para desktop e mobile, eliminando qualquer corte ou sobreposição de blocos.

## Nova Aba: Página em construção
- [x] Criar aba "Página em construção" no painel administrativo da Eras Label com ícone adequado
- [x] Mover as opções de trancar site, mensagem de manutenção, cronômetro do próximo drop e link do grupo VIP para a nova aba
- [x] Garantir persistência completa dessas configurações no backend/banco de dados
- [x] Atualizar a Experiência Pública e a página trancada pública para lerem das novas configurações centralizadas
- [x] Validar responsividade em desktop e mobile, testar build e salvar checkpoint

## Simplificação da Tela de Cupons
- [x] Remover o bloco introdutório e métricas do topo da página de Cupons
- [x] Posicionar o formulário de cadastro/criação de cupons junto à barra de pesquisa e filtros no topo
- [x] Exibir os cupons criados logo abaixo em formato de cards limpos e responsivos
- [x] Validar testes, build e salvar checkpoint

## Redesenho da Tela de Coleções
- [x] Reestruturar AdminCollectionsSection.tsx em grid de cards editoriais com preview de imagem
- [x] Aplicar identidade visual #b22222 e tipografia limpa da Eras Label aos botões e modais
- [x] Validar testes automatizados Vitest e build de produção

## Refinamento Tipográfico do Checkout
- [x] Ajustar as fontes pesadas do checkout transparente para uma estética editorial mais leve e elegante
- [x] Atualizar títulos, subtítulos, labels de formulário, resumo da sacola e botões
- [x] Validar testes, build e salvar checkpoint

- [x] Corrigir a camada do menu lateral para ficar acima da navbar quando aberto e garantir comportamento responsivo em mobile
- [x] Validar menu lateral, navbar, overlay, foco e bloqueio de interação em desktop e mobile
- [x] Executar testes automatizados e build após a correção
- [x] Salvar checkpoint da correção do menu lateral

- [x] Corrigir o resumo da sacola no checkout mobile para exibir os itens e totais numa secção completa
- [x] Validar o resumo da sacola em mobile e desktop sem cortar conteúdo nem criar scroll horizontal
- [x] Executar testes automatizados e build após a correção do checkout mobile
- [x] Salvar checkpoint da melhoria do resumo da sacola mobile

- [x] Redesenhar o histórico de pedidos pós-compra em cards editoriais completos da Eras Label
- [x] Mostrar em cada pedido os itens, imagens, data, pagamento, estado, total, entrega e rastreio quando disponível
- [x] Melhorar o detalhe expandido do pedido e a responsividade desktop/mobile
- [x] Criar testes para os estados e dados do histórico de pedidos
- [x] Executar testes, build e salvar checkpoint da melhoria do histórico

- [x] Limpar automaticamente a sacola após uma compra aprovada, preservando o pedido no histórico
- [x] Manter a sacola intacta em pagamentos pendentes ou falhados e cobrir os estados com testes
- [x] Validar a sacola vazia após conclusão em desktop e mobile, executar build e salvar checkpoint
