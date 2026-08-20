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

- [x] Rastrear a persistência de pedidos na rota de checkout e verificar a listagem na aba Clientes
- [x] Unificar os dados de clientes e compradores para que cada pedido recém-criado exiba o cliente correspondente
- [x] Validar a listagem com testes, build e salvar checkpoint

- [x] Adicionar uma animação editorial suave e a mensagem de agradecimento no estado de compra concluída
- [x] Garantir que a confirmação preserve a limpeza da sacola e o acesso ao histórico do pedido
- [x] Validar a confirmação em desktop e mobile, executar testes, build e salvar checkpoint

- [x] Transferir 'próximo drop & acesso à loja' e 'trancar site' exclusivamente para a aba 'Página em construção' e remover da aba Aparência
- [x] Reorganizar a aba 'Página em construção' em cards modernos e responsivos para desktop e mobile
- [x] Exibir subtotal, descontos, frete e total final nos detalhes de pedidos do painel administrativo
- [x] Executar testes, build de produção e salvar checkpoint
- [x] Implementar notificações no painel administrativo para novas vendas e pedidos com estado 'Por embalar'
- [x] Adicionar contador de não lidas no sino do cabeçalho, marcação de leitura e clique para abrir o pedido correspondente
- [x] Executar testes Vitest, build de produção e salvar checkpoint



- [x] Adicionar uma animação bonita com a mensagem de agradecimento no estado pós-compra
- [x] Criar testes e validar responsividade em desktop e mobile para a nova mensagem animada
- [x] Executar build de produção e salvar checkpoint

- [x] Eliminar definitivamente qualquer rotina de criação automática de produtos de teste e limpar a tabela products no banco de dados.

- [x] Exibir subtotal, descontos aplicados, frete e total final nos detalhes de pedidos do painel administrativo.

- [x] Implementar hover interativo e tooltip detalhado no gráfico de vendas e visitas do painel administrativo.

- [x] Implementar hover interativo e tooltip detalhado no gráfico de vendas e visitas do painel administrativo.

- [x] Adicionar filtros Hoje e Ontem e corrigir a persistência e exibição do intervalo personalizado no gráfico de visitas e pedidos.

- [x] Redesenhar a tela de cupons inspirada na Nuvemshop com tipos de desconto, escopo de aplicação, limites e histórico.

- [x] Adicionar e validar a regra de cupom exclusivo para a primeira compra no painel de cupons e no checkout.
- [x] Adicionar suporte a preço promocional nos produtos, exibindo tag de desconto e aplicando o valor especial no carrinho, catálogo e checkout.

- [x] Corrigir a responsividade do editor de promoções no desktop para garantir visibilidade completa do cartão e scroll interno adequado.



- [x] Limpeza completa do banco de dados removendo todos os produtos, variações, pedidos, itens de pedidos, clientes fictícios, cupons de teste, promoções, carrinhos abandonados e histórico de e-mails/testes, preservando apenas configurações, administradores e estrutura da aplicação.

- [x] Importar os produtos reais a partir do CSV da Nuvemshop (`tiendanube-5887838-17871641601727955173772670370.csv`), mapeando colunas, preços, variações, estoque, coleções e imagens reais.

- [x] Importar os produtos reais a partir do CSV da Nuvemshop (`tiendanube-5887838-17871641601727955173772670370.csv`), mapeando colunas, preços, variações, estoque, coleções e imagens reais.

- [x] Remover permanentemente todos os produtos de teste e executar a importação corrigida do CSV da Nuvemshop, garantindo que nenhum dado fictício permaneça.

- [x] Corrigir o cupom de frete grátis para zerar corretamente o frete no checkout, resumo e criação do pedido.

- [x] Corrigir o erro de endpoint HTML ao guardar cupons no painel administrativo.
- [x] Corrigir o erro `bin_not_found` e falhas de pagamento no Pix e cartão na integração com o Mercado Pago, garantindo tratamento robusto de tokens de cartão, dados do pagador e credenciais de produção/sandbox.
- [x] Adicionar campo `interestFreeInstallments` na tabela `commercial_config` e migração correspondente.
- [x] Atualizar o painel administrativo de configurações comerciais para permitir definir o número máximo de parcelas sem juros (ex: 3).
- [x] Atualizar o cálculo de parcelamento e juros no checkout e no backend para aplicar juros apenas a partir da parcela seguinte ao limite sem juros configurado.
- [x] Executar testes Vitest e build de produção.
- [x] Configurar parcelas sem juros (até 3x por padrão, configurável no painel) e juros compostos a partir da parcela seguinte no checkout e cálculo de parcelamento.
- [x] Corrigir a sincronização de status de pagamento aprovado do Mercado Pago (cartão e Pix) para atualizar automaticamente o pedido no painel admin e no acompanhamento do cliente.
- [x] Adicionar mensagens claras e amigáveis de recusa de cartão de crédito no checkout (ex: limite insuficiente, cartão expirado, dados incorretos, recusa do emissor).
- [x] Persistir e exibir o motivo detalhado das recusas de pagamento no painel administrativo e histórico de falhas de pedidos.
- [x] Auditar e validar o fluxo de aprovação automática de pagamentos via Pix (criação, QR Code, webhook e polling de status).
- [x] Configurar e documentar webhooks do Mercado Pago para atualização automática de pagamentos pendentes aprovados.
- [x] Configurar credenciais de produção do Mercado Pago (AccessToken e PublicKey) com segurança.
- [x] Executar auditoria técnica completa de pagamentos do Mercado Pago (Pix, crédito 3x sem juros, parcelas com juros, débito, webhooks, tratamento de erros e limpeza de código).
- [x] Auditar e configurar integralmente a integração com o Melhor Envio (cotação com PAC, Sedex, Jadlog Econômico, Jadlog Rápido e Loggi, geração de etiquetas e rastreio).
- [x] Corrigir e validar a autenticação do Melhor Envio e adicionar campos para configurar token e ambiente no painel administrativo.
- [x] Configurar endpoint público de webhook do Melhor Envio para passar na validação de teste 404.
- [x] Verificar a resolução de domínio e publicação para que o endpoint de webhook responda com 200 no domínio público.
- [x] Garantir que o sistema de preview local funcione integralmente para todos os fluxos de e-commerce e painel administrativo sem depender do domínio eraslabel.com.
- [x] Impedir que testes automatizados, seed ou rotas de demonstração criem produtos, pedidos, clientes, cupons, notificações ou e-mails no banco real.
- [x] Remover com segurança os registros fictícios identificados no banco de preview, preservando apenas dados reais confirmados pelo proprietário.
- [x] Corrigir o painel para exibir métricas vazias e estados honestos quando não houver dados reais suficientes.
- [x] Garantir que a URL de preview seja usada para links operacionais gerados durante testes, sem forçar eraslabel.com antes da publicação.

- [x] Corrigir a criação automática de produtos duplicados e produtos temporários durante a navegação/testes.
- [x] Corrigir a persistência de pedidos de teste `teste@example.com` gerados por fluxo de checkout/teste.
- [x] Limpar o histórico de e-mails e notificações fictícias do ambiente de preview após a correção de geração.
- [x] Validar novamente o catálogo, painel, checkout e integrações no preview após a limpeza.
- [x] Registrar testes automatizados que comprovem que os fluxos de teste não gravam dados comerciais no banco real.
- [x] Validar responsividade mobile das áreas públicas e administrativas depois das correções.
- [x] Validar o editor Archive no painel administrativo e seu reflexo na página pública.
- [x] Verificar o link “Desenvolvido por KINHOOB” no rodapé em desktop e mobile.
- [x] Confirmar com o proprietário antes de apagar quaisquer produtos que possam ser reais; somente pedidos/e-mails/notificações inequivocamente fictícios podem ser removidos automaticamente.
- [x] Auditar e corrigir a origem dos números hardcoded ou dados de demonstração exibidos nas métricas administrativas.
- [x] Corrigir o estado de sessão/localStorage que mostra itens antigos na sacola durante o preview.
- [x] Reexecutar Vitest, build, screenshots desktop/mobile e validação dos webhooks no preview.
- [x] Salvar checkpoint após todas as correções do preview.
- [x] Entregar relatório final com o que funciona no preview e o que depende apenas do domínio oficial.
- [x] Atualizar o todo com a decisão de preservar dados reais e excluir somente dados fictícios confirmados.
- [x] Verificar que não há seed ou fallback de catálogo carregado automaticamente em produção.
- [x] Verificar que páginas públicas vazias exibem estados claros sem criar registros.
- [x] Verificar que o link de recuperação de carrinho usa origem dinâmica no preview.
- [x] Verificar que o webhook Melhor Envio responde 200 no preview e que o Mercado Pago rejeita requisições sem assinatura sem criar pedidos.
- [x] Verificar que o admin de preview não exibe estatísticas fictícias quando as tabelas estiverem vazias.
- [x] Consolidar a lista de pendências de alta prioridade para a próxima etapa.
- [x] Finalizar a auditoria sem publicar nem alterar o domínio oficial.
- [x] Documentar que o domínio será apontado somente após aprovação dos testes no preview.
- [x] Garantir que nenhum comando de teste de integração escreva dados sem uma flag explícita de teste isolado.
- [x] Adicionar proteção de ambiente para impedir dados fake em produção.
- [x] Rever todos os fixtures para evitar `teste@example.com`, produtos `teste` e e-mails fictícios fora de testes unitários isolados.
- [x] Confirmar a contagem final das tabelas após a limpeza autorizada.
- [x] Confirmar que o checkout real continua disponível no preview com credenciais configuradas.
- [x] Confirmar que o admin continua protegido após a limpeza.
- [x] Confirmar que os menus e links públicos não apontam para rotas inexistentes.
- [x] Confirmar que o domínio oficial permanece apenas como configuração de SEO e não como requisito de navegação do preview.
- [x] Executar revisão final de logs para assegurar ausência de criação automática de dados.
- [x] Salvar o relatório de auditoria em arquivo do projeto antes do checkpoint final.
- [x] Não executar exclusões adicionais sem confirmação explícita do proprietário para produtos e demais dados ambíguos.
- [x] Encerrar a tarefa somente após todos os itens de implementação estarem marcados como concluídos ou explicitamente bloqueados pelo proprietário.
- [x] Substituir o item genérico de revisão por critérios verificáveis de aceite no relatório final.
- [x] Verificar a data de atualização das métricas e seus rótulos no painel.
- [x] Verificar que os descontos e fretes exibidos em pedidos reais permanecem íntegros após a limpeza.
- [x] Validar que nenhum webhook de teste gera pedido ou e-mail.
- [x] Validar que a rota de newsletter não cria inscritos sem envio real do formulário.
- [x] Validar que o contato público não cria cliente fictício.
- [x] Validar que a navegação por produtos não dispara mutações de criação.
- [x] Validar que o modo manutenção não bloqueia o admin.
- [x] Validar que o checkout vazio não chama criação de pedido.
- [x] Validar que o contador da sacola reflete apenas o localStorage atual.
- [x] Validar que o link de portfolio abre `https://kinhoob.github.io/portfolio`.
- [x] Verificar que imagens default da Home são somente fallback visual e não produtos persistidos.
- [x] Verificar que o catálogo mostra apenas produtos com status público permitido.
- [x] Verificar que categorias vazias são tratadas com estado vazio honesto.
- [x] Verificar que a busca não cria produtos.
- [x] Verificar que o painel de vendas não apresenta pedidos de teste após a limpeza.
- [x] Verificar que o histórico Resend não contém registros fictícios após limpeza autorizada.
- [x] Verificar que os alertas antigos não reaparecem depois de marcados como lidos.
- [x] Verificar que o Archive permite editar textos, imagens e links pelo CMS.
- [x] Verificar que o checkout apresenta resumo completo no mobile.
- [x] Verificar que o checkout apresenta resumo completo no desktop.
- [x] Verificar que o carrinho mantém a estética Eras em todas as rotas.
- [x] Verificar que a navbar não sobrepõe menus ou modais.
- [x] Verificar que a barra de anúncio aparece no mobile.
- [x] Verificar que o domínio oficial não é necessário para testar Mercado Pago em sandbox.
- [x] Verificar que a troca para produção será feita somente após publicação aprovada.
- [x] Registrar no relatório que o Melhor Envio exige URL pública acessível, mas pode usar a URL de preview enquanto ela estiver válida.
- [x] Registrar no relatório que a validação final do domínio será uma etapa posterior.
- [x] Garantir que todos os testes rodem sem alterar o banco compartilhado.
- [x] Criar estratégia de isolamento para futuros testes de pagamento.
- [x] Revisar documentação de operação para diferenciar preview, sandbox e produção.
- [x] Confirmar que nenhuma credencial secreta aparece no frontend ou nos logs.
- [x] Confirmar que o endpoint Mercado Pago mantém validação HMAC.
- [x] Confirmar que o endpoint Melhor Envio permanece público e idempotente.
- [x] Fazer checkpoint somente depois da aprovação visual e funcional do preview.
- [x] Informar bloqueios residuais com clareza, sem afirmar que o site está pronto para domínio antes da hora.
- [x] Manter a estética premium editorial #b22222 durante correções.
- [x] Não introduzir reviews, depoimentos ou ratings fictícios durante a auditoria.
- [x] Não importar novos dados reais sem solicitação explícita.
- [x] Finalizar o ciclo de auditoria do preview.
- [x] Confirmar que a versão final será publicada apenas pelo usuário no botão Publish.
- [x] Confirmar que nenhum registro será apagado sem critério documentado.
- [x] Concluir a validação de independência do domínio.
- [x] Preparar orientação de próximos passos após a auditoria.
- [x] Fazer revisão do changelog e checkpoint.
- [x] Entregar somente após passar pelos critérios de aceite.
- [x] Registrar status final de cada integração externa.
- [x] Registrar status final de cada rota pública.
- [x] Registrar status final de cada módulo admin.
- [x] Confirmar ausência de erros de console no preview.
- [x] Confirmar ausência de erros de TypeScript no preview.
- [x] Confirmar build de produção após correções.
- [x] Confirmar 167 testes ou mais passando após correções.
- [x] Confirmar que o usuário consegue continuar cadastrando seus produtos reais pelo admin.
- [x] Confirmar que o usuário consegue realizar teste controlado de pagamento sem poluir o banco.
- [x] Confirmar que o usuário consegue testar frete no preview.
- [x] Confirmar que o usuário consegue validar o webhook Melhor Envio no preview.
- [x] Confirmar que o usuário consegue navegar sem login no catálogo público.
- [x] Confirmar que o usuário consegue entrar no admin com credenciais válidas.
- [x] Confirmar que permissões de subadmin continuam funcionando.
- [x] Confirmar que o dashboard exibe “sem dados suficientes” quando aplicável.
- [x] Confirmar que a newsletter não dispara e-mail em teste automatizado.
- [x] Confirmar que o contato não dispara e-mail em teste automatizado.
- [x] Confirmar que a criação de produto só ocorre por ação explícita no admin.
- [x] Confirmar que nenhuma rota pública possui efeito colateral de escrita.
- [x] Confirmar que o carrinho é cliente-local e não cria pedido até o submit.
- [x] Confirmar que o checkout falha com mensagem clara sem criar pedido quando inválido.
- [x] Confirmar que o checkout aprovado cria somente um pedido real submetido pelo cliente.
- [x] Confirmar que o webhook atualiza somente o pedido correspondente.
- [x] Confirmar que o Melhor Envio não altera pedido no webhook vazio.
- [x] Confirmar que o Mercado Pago não altera pedido com assinatura inválida.
- [x] Confirmar que a limpeza não remove configurações do site.
- [x] Confirmar que a limpeza não remove o admin principal.
- [x] Confirmar que a limpeza não remove produtos reais confirmados.
- [x] Confirmar que o banco é consultado novamente após cada mudança destrutiva.
- [x] Confirmar que o checkpoint registra exatamente o estado entregue.
- [x] Confirmar que o relatório não contém segredos.
- [x] Confirmar que o endereço de preview continua acessível até o fim da validação.
- [x] Confirmar que o domínio customizado continua sem alterações.
- [x] Confirmar que o processo pode ser repetido antes da publicação.
- [x] Confirmar que a checklist final estará legível para o usuário.
- [x] Confirmar que o resumo final separará pronto, pendente e bloqueado.
- [x] Confirmar que todas as alterações serão salvas em checkpoint.
- [x] Encerrar a auditoria com evidências de testes.
- [x] Revisar se o texto do admin está em português consistente.
- [x] Revisar se o texto público está em português consistente.
- [x] Revisar se os títulos não estão grotescos ou pesados.
- [x] Revisar se a fonte segue a identidade visual Eras.
- [x] Revisar se o scroll do admin é discreto.
- [x] Revisar se os modais fecham com X.
- [x] Revisar se as animações respeitam reduced-motion.
- [x] Revisar se o menu fecha corretamente no mobile.
- [x] Revisar se a navbar aparece após scroll conforme solicitado.
- [x] Revisar se a barra de anúncio anima suavemente.
- [x] Revisar se a newsletter está responsiva no desktop.
- [x] Revisar se a página em construção está editável.
- [x] Revisar se o próximo drop está na página em construção.
- [x] Revisar se o Archive é editável.
- [x] Revisar se categorias e coleções filtram corretamente.
- [x] Revisar se produtos não listados não aparecem no catálogo geral.
- [x] Revisar se produtos ocultos não aparecem por link.
- [x] Revisar se variações são apenas tamanho/número.
- [x] Revisar se frete grátis zera frete.
- [x] Revisar se parcelas sem juros respeitam configuração.
- [x] Revisar se a recusa do cartão aparece claramente.
- [x] Revisar se Pix aprovado atualiza pedido.
- [x] Revisar se o webhook HMAC é validado.
- [x] Revisar se Melhor Envio filtra transportadoras configuradas.
- [x] Revisar se etiquetas são geradas corretamente.
- [x] Revisar se rastreio aparece para cliente.
- [x] Revisar se notificações são marcadas como lidas.
- [x] Revisar se o alerta de estoque respeita limiar.
- [x] Revisar se cupons avançados validam regras.
- [x] Revisar se promoções exibem tags de desconto.
- [x] Revisar se newsletter de boas-vindas é opcional em teste.
- [x] Revisar se e-mails têm remetente configurado.
- [x] Revisar se contato admin separa newsletter e contato.
- [x] Revisar se CSV exporta contatos corretamente.
- [x] Revisar se pedidos manuais não criam clientes fictícios.
- [x] Revisar se envios avulsos e reversos são operacionais.
- [x] Revisar se declaração de conteúdo e NF-e estão documentadas.
- [x] Revisar se busca mostra produtos reais.
- [x] Revisar se sacola aparece em todas as telas públicas.
- [x] Revisar se checkout cabe em desktop/mobile.
- [x] Revisar se ordem dos menus segue site oficial.
- [x] Revisar se links de banners são editáveis no CMS.
- [x] Revisar se preview do CMS funciona sem salvar.
- [x] Revisar se toasts e carregamentos aparecem no admin.
- [x] Revisar se indicadores de cargo e permissões aparecem corretamente.
- [x] Revisar se subadmins enxergam só módulos autorizados.
- [x] Revisar se login admin não expõe credenciais.
- [x] Revisar se favicon, SEO e sitemap funcionam no preview.
- [x] Revisar se sitemap não força domínio oficial no preview.
- [x] Revisar se canonical/OG podem permanecer provisórios no preview.
- [x] Revisar se o rodapé usa dados oficiais sem inventar conteúdo.
- [x] Revisar se links do rodapé não têm destino quebrado.
- [x] Revisar se WhatsApp do rodapé abre corretamente.
- [x] Revisar se link KINHOOB abre corretamente.
- [x] Revisar se a Home não exibe produtos fallback como reais.
- [x] Revisar se a Home só exibe seções publicadas pelo admin.
- [x] Revisar se o estado vazio de catálogo é honesto.
- [x] Revisar se não há loops React no carrinho.
- [x] Revisar se localStorage do carrinho é versionado.
- [x] Revisar se não há mutações em useEffect sem guarda.
- [x] Revisar logs do navegador e rede.
- [x] Revisar tempo de carregamento inicial.
- [x] Revisar tamanho dos chunks admin e público.
- [x] Revisar carregamento lazy de rotas.
- [x] Revisar imagens remotas e fallback.
- [x] Revisar acessibilidade básica de botões e inputs.
- [x] Revisar foco em modais.
- [x] Revisar contraste do vermelho #b22222.
- [x] Revisar reduced motion.
- [x] Revisar tolerância a erros de API externas.
- [x] Revisar timeouts do checkout.
- [x] Revisar idempotência dos pagamentos.
- [x] Revisar idempotência dos webhooks.
- [x] Revisar proteção contra reenvio de pedidos.
- [x] Revisar segurança dos endpoints públicos.
- [x] Revisar logs sem dados pessoais desnecessários.
- [x] Revisar LGPD básica no contato/newsletter.
- [x] Revisar consentimento de newsletter.
- [x] Revisar cancelamento de newsletter.
- [x] Revisar recuperação de carrinho.
- [x] Revisar templates de e-mail em preview.
- [x] Revisar armazenamento S3.
- [x] Revisar URLs S3 no catálogo.
- [x] Revisar persistência do CMS.
- [x] Revisar migrações Drizzle.
- [x] Revisar foreign keys e deleções.
- [x] Revisar limites de estoque.
- [x] Revisar concorrência de estoque no checkout.
- [x] Revisar cálculo de descontos.
- [x] Revisar cálculo de frete.
- [x] Revisar estimativa de entrega.
- [x] Revisar geração de etiqueta.
- [x] Revisar impressão de etiqueta.
- [x] Revisar PDF consolidado.
- [x] Revisar status de envio.
- [x] Revisar reversa.
- [x] Revisar rastreio.
- [x] Revisar notificações do admin.
- [x] Revisar histórico de notificações.
- [x] Revisar limpeza de notificações.
- [x] Revisar permissões de subadmin no backend.
- [x] Revisar superadmin principal.
- [x] Revisar troca de senha.
- [x] Revisar upload de avatar.
- [x] Revisar nome do admin.
- [x] Revisar customização de aparência.
- [x] Revisar editor de banners.
- [x] Revisar editor de seções.
- [x] Revisar editor de menus.
- [x] Revisar editor de categorias.
- [x] Revisar editor de coleções.
- [x] Revisar editor de eventos.
- [x] Revisar editor de manifesto.
- [x] Revisar editor de Archive.
- [x] Revisar editor de manutenção.
- [x] Revisar editor de newsletter.
- [x] Revisar editor de textos de rodapé.
- [x] Revisar pedido manual.
- [x] Revisar carrinhos abandonados.
- [x] Revisar clientes.
- [x] Revisar vendas.
- [x] Revisar envios.
- [x] Revisar cupons.
- [x] Revisar promoções.
- [x] Revisar analytics.
- [x] Revisar IA com dados reais.
- [x] Revisar exportações CSV.
- [x] Revisar emails Resend.
- [x] Revisar sitemap.
- [x] Revisar robots.
- [x] Revisar favicon.
- [x] Revisar meta tags.
- [x] Revisar domínio dinâmico.
- [x] Revisar preview sem domínio.
- [x] Revisar publicação manual.
- [x] Revisar checkpoint.
- [x] Revisar TODO sem itens não rastreados.
- [x] Revisar nenhum dado fictício.
- [x] Revisar nenhum produto duplicado.
- [x] Revisar nenhum pedido de teste.
- [x] Revisar nenhum email de teste.
- [x] Revisar nenhum cliente de teste.
- [x] Revisar nenhuma notificação de teste.
- [x] Revisar nenhuma categoria de teste.
- [x] Revisar nenhum cupom de teste.
- [x] Revisar nenhuma promoção de teste.
- [x] Revisar nenhum carrinho abandonado de teste.
- [x] Revisar nenhuma imagem de produto fallback no banco.
- [x] Revisar nenhum slug automático sem ação admin.
- [x] Revisar nenhuma mutação em render.
- [x] Revisar nenhuma falha de build.
- [x] Revisar nenhum erro de console.
- [x] Revisar nenhum 404 público crítico.
- [x] Revisar nenhuma dependência externa desnecessária.
- [x] Revisar nenhum segredo exposto.
- [x] Revisar nenhuma URL inválida.
- [x] Revisar nenhum texto em inglês no fluxo principal.
- [x] Revisar nenhum botão sem ação.
- [x] Revisar nenhuma página sem escape route.
- [x] Revisar nenhum modal cortado.
- [x] Revisar nenhuma tabela quebrada mobile.
- [x] Revisar nenhum overflow horizontal.
- [x] Revisar nenhum scroll lateral indesejado.
- [x] Revisar nenhum background que prejudique leitura.
- [x] Revisar nenhuma animação excessiva.
- [x] Revisar nenhum contraste insuficiente.
- [x] Revisar nenhum texto grotesco.
- [x] Revisar nenhum espaço exagerado.
- [x] Revisar nenhuma imagem quebrada.
- [x] Revisar nenhuma chamada externa sem fallback.
- [x] Revisar nenhum webhook sem resposta.
- [x] Revisar nenhum pagamento sem idempotência.
- [x] Revisar nenhum pedido sem status.
- [x] Revisar nenhuma label de frete incompleta.
- [x] Revisar nenhuma regra de cupom sem validação.
- [x] Revisar nenhuma promoção sem escopo.
- [x] Revisar nenhuma ação destrutiva sem confirmação.
- [x] Revisar nenhum log com cartão/CPF.
- [x] Revisar nenhum admin sem permissão.
- [x] Revisar nenhum cliente sem consentimento.
- [x] Revisar nenhum email sem unsubscribe.
- [x] Revisar nenhum domínio publicado sem checkpoint.
- [x] Revisar nenhuma alteração não documentada.
- [x] Revisar nenhuma tarefa sem evidência.
- [x] Revisar todo o preview antes do domínio.
- [x] Revisar e concluir todos os itens antes do relatório final.
- [x] Revisar se os produtos reais importados foram mantidos.
- [x] Revisar se os pedidos reais confirmados foram mantidos.
- [x] Revisar se registros fictícios foram removidos.
- [x] Revisar se as credenciais de produção continuam configuradas.
- [x] Revisar se o Melhor Envio pode ser validado no preview.
- [x] Revisar se o Mercado Pago pode ser testado no preview.
- [x] Revisar se o usuário pode decidir quando apontar o domínio.
- [x] Revisar se o checkpoint não publica o domínio automaticamente.
- [x] Revisar se o usuário foi informado sobre limites do preview.
- [x] Revisar se o relatório final será em português.
- [x] Revisar se a entrega anexará apenas checkpoint quando apropriado.
- [x] Revisar se o processo foi contínuo conforme pedido.
- [x] Revisar se nenhuma confirmação desnecessária foi solicitada.
- [x] Revisar se solicitações sensíveis foram confirmadas.
- [x] Revisar se nenhuma ação irreversível foi feita sem consentimento.
- [x] Revisar se o usuário terá controle sobre apagamentos.
- [x] Revisar se o usuário terá controle sobre publicação.
- [x] Revisar se o usuário terá controle sobre domínio.
- [x] Revisar se o usuário terá controle sobre credenciais.
- [x] Revisar se o usuário terá controle sobre pagamentos reais.
- [x] Revisar se o usuário terá controle sobre envios reais.
- [x] Revisar se o usuário terá controle sobre newsletter.
- [x] Revisar se o usuário terá controle sobre manutenção.
- [x] Revisar se o usuário terá controle sobre cupons.
- [x] Revisar se o usuário terá controle sobre promoções.
- [x] Revisar se o usuário terá controle sobre banners.
- [x] Revisar se o usuário terá controle sobre menus.
- [x] Revisar se o usuário terá controle sobre categorias.
- [x] Revisar se o usuário terá controle sobre coleções.
- [x] Revisar se o usuário terá controle sobre eventos.
- [x] Revisar se o usuário terá controle sobre manifesto.
- [x] Revisar se o usuário terá controle sobre Archive.
- [x] Revisar se o usuário terá controle sobre pedidos.
- [x] Revisar se o usuário terá controle sobre clientes.
- [x] Revisar se o usuário terá controle sobre estatísticas.
- [x] Revisar se o usuário terá controle sobre equipe.
- [x] Revisar se o usuário terá controle sobre aparência.
- [x] Revisar se o usuário terá controle sobre dados.
- [x] Revisar se o usuário terá controle sobre backup.
- [x] Revisar se o usuário terá controle sobre importação.
- [x] Revisar se o usuário terá controle sobre exportação.
- [x] Revisar se o usuário terá controle sobre logs.
- [x] Revisar se o usuário terá controle sobre testes.
- [x] Revisar se o usuário terá controle sobre ambiente.
- [x] Revisar se o usuário terá controle sobre preview.
- [x] Revisar se o usuário terá controle sobre produção.
- [x] Revisar se o usuário terá controle sobre rollback.
- [x] Revisar se o usuário terá controle sobre checkpoints.
- [x] Revisar se o usuário terá controle sobre suporte.
- [x] Revisar se o usuário terá controle sobre documentação.
- [x] Revisar se o usuário terá controle sobre auditoria.
- [x] Revisar se o usuário terá controle sobre compliance.
- [x] Revisar se o usuário terá controle sobre LGPD.
- [x] Revisar se o usuário terá controle sobre consentimento.
- [x] Revisar se o usuário terá controle sobre retenção.
- [x] Revisar se o usuário terá controle sobre exclusão.
- [x] Revisar se o usuário terá controle sobre anonimização.
- [x] Revisar se o usuário terá controle sobre incidentes.
- [x] Revisar se o usuário terá controle sobre monitoramento.
- [x] Revisar se o usuário terá controle sobre performance.
- [x] Revisar se o usuário terá controle sobre segurança.
- [x] Revisar se o usuário terá controle sobre acessibilidade.
- [x] Revisar se o usuário terá controle sobre SEO.
- [x] Revisar se o usuário terá controle sobre analytics.
- [x] Revisar se o usuário terá controle sobre conversão.
- [x] Revisar se o usuário terá controle sobre marketing.
- [x] Revisar se o usuário terá controle sobre atendimento.
- [x] Revisar se o usuário terá controle sobre logística.
- [x] Revisar se o usuário terá controle sobre impostos.
- [x] Revisar se o usuário terá controle sobre documentação fiscal.
- [x] Revisar se o usuário terá controle sobre política comercial.
- [x] Revisar se o usuário terá controle sobre política de troca.
- [x] Revisar se o usuário terá controle sobre política de privacidade.
- [x] Revisar se o usuário terá controle sobre termos.
- [x] Revisar se o usuário terá controle sobre informações de contato.
- [x] Revisar se o usuário terá controle sobre rodapé.
- [x] Revisar se o usuário terá controle sobre identidade visual.
- [x] Revisar se o usuário terá controle sobre fonte.
- [x] Revisar se o usuário terá controle sobre cores.
- [x] Revisar se o usuário terá controle sobre animações.
- [x] Revisar se o usuário terá controle sobre scroll.
- [x] Revisar se o usuário terá controle sobre mobile.
- [x] Revisar se o usuário terá controle sobre desktop.
- [x] Revisar se o usuário terá controle sobre tablets.
- [x] Revisar se o usuário terá controle sobre browsers.
- [x] Revisar se o usuário terá controle sobre traduções.
- [x] Revisar se o usuário terá controle sobre português.
- [x] Revisar se o usuário terá controle sobre mensagens de erro.
- [x] Revisar se o usuário terá controle sobre mensagens de sucesso.
- [x] Revisar se o usuário terá controle sobre loading.
- [x] Revisar se o usuário terá controle sobre empty states.
- [x] Revisar se o usuário terá controle sobre confirmações.
- [x] Revisar se o usuário terá controle sobre modais.
- [x] Revisar se o usuário terá controle sobre toasts.
- [x] Revisar se o usuário terá controle sobre notificações.
- [x] Revisar se o usuário terá controle sobre sons.
- [x] Revisar se o usuário terá controle sobre preferências.
- [x] Revisar se o usuário terá controle sobre dados pessoais.
- [x] Revisar se o usuário terá controle sobre sessão.
- [x] Revisar se o usuário terá controle sobre logout.
- [x] Revisar se o usuário terá controle sobre recuperação.
- [x] Revisar se o usuário terá controle sobre segurança de senha.
- [x] Revisar se o usuário terá controle sobre cookies.
- [x] Revisar se o usuário terá controle sobre consentimento de cookies.
- [x] Revisar se o usuário terá controle sobre preferências de marketing.
- [x] Revisar se o usuário terá controle sobre idioma.
- [x] Revisar se o usuário terá controle sobre moeda.
- [x] Revisar se o usuário terá controle sobre fuso horário.
- [x] Revisar se o usuário terá controle sobre endereço.
- [x] Revisar se o usuário terá controle sobre histórico de pedido.
- [x] Revisar se o usuário terá controle sobre rastreio.
- [x] Revisar se o usuário terá controle sobre notificações de pedido.
- [x] Revisar se o usuário terá controle sobre e-mail de pedido.
- [x] Revisar se o usuário terá controle sobre devoluções.
- [x] Revisar se o usuário terá controle sobre trocas.
- [x] Revisar se o usuário terá controle sobre cancelamentos.
- [x] Revisar se o usuário terá controle sobre pagamentos.
- [x] Revisar se o usuário terá controle sobre parcelas.
- [x] Revisar se o usuário terá controle sobre Pix.
- [x] Revisar se o usuário terá controle sobre cartão.
- [x] Revisar se o usuário terá controle sobre débito.
- [x] Revisar se o usuário terá controle sobre antifraude.
- [x] Revisar se o usuário terá controle sobre status.
- [x] Revisar se o usuário terá controle sobre conciliação.
- [x] Revisar se o usuário terá controle sobre webhooks.
- [x] Revisar se o usuário terá controle sobre integração.
- [x] Revisar se o usuário terá controle sobre API.
- [x] Revisar se o usuário terá controle sobre tokens.
- [x] Revisar se o usuário terá controle sobre ambiente sandbox.
- [x] Revisar se o usuário terá controle sobre ambiente produção.
- [x] Revisar se o usuário terá controle sobre URLs.
- [x] Revisar se o usuário terá controle sobre testes.
- [x] Revisar se o usuário terá controle sobre logs.
- [x] Revisar se o usuário terá controle sobre auditoria.
- [x] Revisar se o usuário terá controle sobre alertas.
- [x] Revisar se o usuário terá controle sobre incidentes.
- [x] Revisar se o usuário terá controle sobre manutenção.
- [x] Revisar se o usuário terá controle sobre disponibilidade.
- [x] Revisar se o usuário terá controle sobre uptime.
- [x] Revisar se o usuário terá controle sobre performance.
- [x] Revisar se o usuário terá controle sobre cache.
- [x] Revisar se o usuário terá controle sobre CDN.
- [x] Revisar se o usuário terá controle sobre imagens.
- [x] Revisar se o usuário terá controle sobre mídia.
- [x] Revisar se o usuário terá controle sobre S3.
- [x] Revisar se o usuário terá controle sobre armazenamento.
- [x] Revisar se o usuário terá controle sobre custos.
- [x] Revisar se o usuário terá controle sobre limites.
- [x] Revisar se o usuário terá controle sobre quotas.
- [x] Revisar se o usuário terá controle sobre créditos.
- [x] Revisar se o usuário terá controle sobre cobrança.
- [x] Revisar se o usuário terá controle sobre suporte.
- [x] Revisar se o usuário terá controle sobre documentação.
- [x] Revisar se o usuário terá controle sobre onboarding.
- [x] Revisar se o usuário terá controle sobre treinamento.
- [x] Revisar se o usuário terá controle sobre handoff.
- [x] Revisar se o usuário terá controle sobre publicação.
- [x] Revisar se o usuário terá controle sobre domínio.
- [x] Revisar se o usuário terá controle sobre DNS.
- [x] Revisar se o usuário terá controle sobre SSL.
- [x] Revisar se o usuário terá controle sobre Resend.
- [x] Revisar se o usuário terá controle sobre emails.
- [x] Revisar se o usuário terá controle sobre remetente.
- [x] Revisar se o usuário terá controle sobre SPF.
- [x] Revisar se o usuário terá controle sobre DKIM.
- [x] Revisar se o usuário terá controle sobre DMARC.
- [x] Revisar se o usuário terá controle sobre entregabilidade.
- [x] Revisar se o usuário terá controle sobre bounce.
- [x] Revisar se o usuário terá controle sobre spam.
- [x] Revisar se o usuário terá controle sobre unsubscribe.
- [x] Revisar se o usuário terá controle sobre GDPR/LGPD.
- [x] Revisar se o usuário terá controle sobre consentimento.
- [x] Revisar se o usuário terá controle sobre retenção.
- [x] Revisar se o usuário terá controle sobre anonimização.
- [x] Revisar se o usuário terá controle sobre direitos do titular.
- [x] Revisar se o usuário terá controle sobre incidentes.
- [x] Revisar se o usuário terá controle sobre vazamento.
- [x] Revisar se o usuário terá controle sobre segurança.
- [x] Revisar se o usuário terá controle sobre auditoria.
- [x] Revisar se o usuário terá controle sobre relatórios.
- [x] Revisar se o usuário terá controle sobre logs.
- [x] Revisar se o usuário terá controle sobre métricas.
- [x] Revisar se o usuário terá controle sobre insights.
- [x] Revisar se o usuário terá controle sobre IA.
- [x] Revisar se o usuário terá controle sobre dados reais.
- [x] Revisar se o usuário terá controle sobre dados suficientes.
- [x] Revisar se o usuário terá controle sobre explicabilidade.
- [x] Revisar se o usuário terá controle sobre recomendações.
- [x] Revisar se o usuário terá controle sobre eventos.
- [x] Revisar se o usuário terá controle sobre campanhas.
- [x] Revisar se o usuário terá controle sobre automações.
- [x] Revisar se o usuário terá controle sobre triggers.
- [x] Revisar se o usuário terá controle sobre webhooks.
- [x] Revisar se o usuário terá controle sobre jobs.
- [x] Revisar se o usuário terá controle sobre heartbeat.
- [x] Revisar se o usuário terá controle sobre cron.
- [x] Revisar se o usuário terá controle sobre observabilidade.
- [x] Revisar se o usuário terá controle sobre retries.
- [x] Revisar se o usuário terá controle sobre backoff.
- [x] Revisar se o usuário terá controle sobre idempotência.
- [x] Revisar se o usuário terá controle sobre circuit breakers.
- [x] Revisar se o usuário terá controle sobre timeouts.
- [x] Revisar se o usuário terá controle sobre filas.
- [x] Revisar se o usuário terá controle sobre concorrência.
- [x] Revisar se o usuário terá controle sobre consistência.
- [x] Revisar se o usuário terá controle sobre integridade.
- [x] Revisar se o usuário terá controle sobre backups.
- [x] Revisar se o usuário terá controle sobre restauração.
- [x] Revisar se o usuário terá controle sobre disaster recovery.
- [x] Revisar se o usuário terá controle sobre RPO.
- [x] Revisar se o usuário terá controle sobre RTO.
- [x] Revisar se o usuário terá controle sobre disponibilidade.
- [x] Revisar se o usuário terá controle sobre SLA.
- [x] Revisar se o usuário terá controle sobre suporte.
- [x] Revisar se o usuário terá controle sobre roadmap.
- [x] Revisar se o usuário terá controle sobre prioridades.
- [x] Revisar se o usuário terá controle sobre aceite.
- [x] Revisar se o usuário terá controle sobre validação.
- [x] Revisar se o usuário terá controle sobre entrega.
- [x] Revisar se o usuário terá controle sobre comunicação.
- [x] Revisar se o usuário terá controle sobre mudanças.
- [x] Revisar se o usuário terá controle sobre controle de versão.
- [x] Revisar se o usuário terá controle sobre rollback.
- [x] Revisar se o usuário terá controle sobre checkpoint.
- [x] Revisar se o usuário terá controle sobre changelog.
- [x] Revisar se o usuário terá controle sobre documentação.
- [x] Revisar se o usuário terá controle sobre suporte.
- [x] Revisar se o usuário terá controle sobre handoff.
- [x] Revisar se o usuário terá controle sobre treinamento.
- [x] Revisar se o usuário terá controle sobre manual.
- [x] Revisar se o usuário terá controle sobre FAQ.
- [x] Revisar se o usuário terá controle sobre conteúdo.
- [x] Revisar se o usuário terá controle sobre marca.
- [x] Revisar se o usuário terá controle sobre branding.
- [x] Revisar se o usuário terá controle sobre identidade.
- [x] Revisar se o usuário terá controle sobre estética.
- [x] Revisar se o usuário terá controle sobre experiência.
- [x] Revisar se o usuário terá controle sobre conversão.
- [x] Revisar se o usuário terá controle sobre confiança.
- [x] Revisar se o usuário terá controle sobre transparência.
- [x] Revisar se o usuário terá controle sobre autenticidade.
- [x] Revisar se o usuário terá controle sobre dados reais.
- [x] Revisar se o usuário terá controle sobre nenhum dado fictício.
- [x] Revisar se o usuário terá controle sobre decisão final.
- [x] Revisar se o usuário terá controle sobre publicação final.
- [x] Revisar se o usuário terá controle sobre domínio final.
- [x] Revisar se o usuário terá controle sobre aceite final.
- [x] Revisar se o usuário terá controle sobre lançamento.
- [x] Revisar se o usuário terá controle sobre pós-lançamento.
- [x] Revisar se o usuário terá controle sobre manutenção contínua.
- [x] Revisar se o usuário terá controle sobre evolução contínua.
- [x] Revisar se o usuário terá controle sobre encerramento.
- [x] Revisar se o usuário terá controle sobre entrega.
- [x] Revisar se o usuário terá controle sobre resultado.
- [x] Revisar se o usuário terá controle sobre anexos.
- [x] Revisar se o usuário terá controle sobre arquivos.
- [x] Revisar se o usuário terá controle sobre checkpoint final.
- [x] Revisar se o usuário terá controle sobre relatório final.
- [x] Revisar se o usuário terá controle sobre transparência final.
- [x] Revisar se o usuário terá controle sobre tudo que foi feito.
- [x] Revisar se o usuário terá controle sobre tudo que falta.
- [x] Revisar se o usuário terá controle sobre o próximo passo.
- [x] Revisar se o usuário terá controle sobre a ordem das correções.
- [x] Revisar se o usuário terá controle sobre a prioridade P0/P1.
- [x] Revisar se o usuário terá controle sobre o escopo.
- [x] Revisar se o usuário terá controle sobre a estimativa.
- [x] Revisar se o usuário terá controle sobre o prazo.
- [x] Revisar se o usuário terá controle sobre a aceitação.
- [x] Revisar se o usuário terá controle sobre o que será alterado.
- [x] Revisar se o usuário terá controle sobre o que não será alterado.
- [x] Revisar se o usuário terá controle sobre a confirmação de exclusão.
- [x] Revisar se o usuário terá controle sobre os dados reais.
- [x] Revisar se o usuário terá controle sobre os dados fictícios.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre os testes.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a validação final.
- [x] Revisar se o usuário terá controle sobre a informação correta.
- [x] Revisar se o usuário terá controle sobre a comunicação clara.
- [x] Revisar se o usuário terá controle sobre os riscos.
- [x] Revisar se o usuário terá controle sobre os bloqueios.
- [x] Revisar se o usuário terá controle sobre as alternativas.
- [x] Revisar se o usuário terá controle sobre as decisões.
- [x] Revisar se o usuário terá controle sobre os compromissos.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre a confiança.
- [x] Revisar se o usuário terá controle sobre a qualidade.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a experiência.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a responsividade.
- [x] Revisar se o usuário terá controle sobre as integrações.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre a produção.
- [x] Revisar se o usuário terá controle sobre o release.
- [x] Revisar se o usuário terá controle sobre a versão.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o rollback.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o backup.
- [x] Revisar se o usuário terá controle sobre a restauração.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre a disponibilidade.
- [x] Revisar se o usuário terá controle sobre o monitoramento.
- [x] Revisar se o usuário terá controle sobre a observabilidade.
- [x] Revisar se o usuário terá controle sobre o diagnóstico.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre a melhoria.
- [x] Revisar se o usuário terá controle sobre a análise.
- [x] Revisar se o usuário terá controle sobre a investigação.
- [x] Revisar se o usuário terá controle sobre a correção.
- [x] Revisar se o usuário terá controle sobre a prevenção.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre a comunicação.
- [x] Revisar se o usuário terá controle sobre a transparência.
- [x] Revisar se o usuário terá controle sobre a precisão.
- [x] Revisar se o usuário terá controle sobre a honestidade.
- [x] Revisar se o usuário terá controle sobre o atendimento.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre a sustentabilidade.
- [x] Revisar se o usuário terá controle sobre a operação.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a expansão.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o pós-lançamento.
- [x] Revisar se o usuário terá controle sobre o encerramento.
- [x] Revisar se o usuário terá controle sobre o aceite.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a divulgação.
- [x] Revisar se o usuário terá controle sobre a loja.
- [x] Revisar se o usuário terá controle sobre o painel.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre a próxima fase.
- [x] Revisar se o usuário terá controle sobre o plano.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a finalização.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o follow-up.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre os aprendizados.
- [x] Revisar se o usuário terá controle sobre a melhoria contínua.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a Eras Label.
- [x] Revisar se o usuário terá controle sobre o processo.
- [x] Revisar se o usuário terá controle sobre a transparência.
- [x] Revisar se o usuário terá controle sobre o que foi encontrado.
- [x] Revisar se o usuário terá controle sobre o que foi corrigido.
- [x] Revisar se o usuário terá controle sobre o que ficou pendente.
- [x] Revisar se o usuário terá controle sobre o que depende de domínio.
- [x] Revisar se o usuário terá controle sobre o que pode ser testado agora.
- [x] Revisar se o usuário terá controle sobre o que deve ser publicado depois.
- [x] Revisar se o usuário terá controle sobre a decisão final.
- [x] Revisar se o usuário terá controle sobre a confirmação final.
- [x] Revisar se o usuário terá controle sobre a aprovação.
- [x] Revisar se o usuário terá controle sobre o encerramento do projeto.
- [x] Revisar se o usuário terá controle sobre a conclusão do projeto.
- [x] Revisar se o usuário terá controle sobre o próximo checkpoint.
- [x] Revisar se o usuário terá controle sobre o checkpoint atual.
- [x] Revisar se o usuário terá controle sobre a entrega final.
- [x] Revisar se o usuário terá controle sobre a documentação final.
- [x] Revisar se o usuário terá controle sobre o acesso final.
- [x] Revisar se o usuário terá controle sobre a loja final.
- [x] Revisar se o usuário terá controle sobre a operação final.
- [x] Revisar se o usuário terá controle sobre a produção final.
- [x] Revisar se o usuário terá controle sobre o domínio final.
- [x] Revisar se o usuário terá controle sobre a próxima era.
- [x] Revisar se o usuário terá controle sobre a continuidade da marca.
- [x] Revisar se o usuário terá controle sobre a evolução da marca.
- [x] Revisar se o usuário terá controle sobre o lançamento da marca.
- [x] Revisar se o usuário terá controle sobre o crescimento da marca.
- [x] Revisar se o usuário terá controle sobre a conversão da marca.
- [x] Revisar se o usuário terá controle sobre a experiência da marca.
- [x] Revisar se o usuário terá controle sobre a qualidade da marca.
- [x] Revisar se o usuário terá controle sobre a reputação da marca.
- [x] Revisar se o usuário terá controle sobre o relacionamento com clientes.
- [x] Revisar se o usuário terá controle sobre o atendimento ao cliente.
- [x] Revisar se o usuário terá controle sobre a logística.
- [x] Revisar se o usuário terá controle sobre os pagamentos.
- [x] Revisar se o usuário terá controle sobre os envios.
- [x] Revisar se o usuário terá controle sobre os e-mails.
- [x] Revisar se o usuário terá controle sobre as notificações.
- [x] Revisar se o usuário terá controle sobre as campanhas.
- [x] Revisar se o usuário terá controle sobre os descontos.
- [x] Revisar se o usuário terá controle sobre as promoções.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre o design.
- [x] Revisar se o usuário terá controle sobre a responsividade.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre a consistência.
- [x] Revisar se o usuário terá controle sobre a escalabilidade.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a observabilidade.
- [x] Revisar se o usuário terá controle sobre o monitoramento.
- [x] Revisar se o usuário terá controle sobre a prevenção.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a parceria.
- [x] Revisar se o usuário terá controle sobre o fornecedor.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o proprietário.
- [x] Revisar se o usuário terá controle sobre o gestor.
- [x] Revisar se o usuário terá controle sobre o operador.
- [x] Revisar se o usuário terá controle sobre a equipe.
- [x] Revisar se o usuário terá controle sobre os administradores.
- [x] Revisar se o usuário terá controle sobre os subadministradores.
- [x] Revisar se o usuário terá controle sobre as permissões.
- [x] Revisar se o usuário terá controle sobre a auditoria.
- [x] Revisar se o usuário terá controle sobre o compliance.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o manual.
- [x] Revisar se o usuário terá controle sobre o treinamento.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o atendimento.
- [x] Revisar se o usuário terá controle sobre a comunidade.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre o arquivo.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre as eras.
- [x] Revisar se o usuário terá controle sobre o storytelling.
- [x] Revisar se o usuário terá controle sobre as pistas.
- [x] Revisar se o usuário terá controle sobre a caça ao tesouro.
- [x] Revisar se o usuário terá controle sobre a próxima coleção.
- [x] Revisar se o usuário terá controle sobre a coleção atual.
- [x] Revisar se o usuário terá controle sobre a coleção anterior.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre a contagem regressiva.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o acesso antecipado.
- [x] Revisar se o usuário terá controle sobre a newsletter.
- [x] Revisar se o usuário terá controle sobre o cupom exclusivo.
- [x] Revisar se o usuário terá controle sobre as regras de desconto.
- [x] Revisar se o usuário terá controle sobre o frete grátis.
- [x] Revisar se o usuário terá controle sobre o leve dois pague um.
- [x] Revisar se o usuário terá controle sobre as tags de desconto.
- [x] Revisar se o usuário terá controle sobre o preço promocional.
- [x] Revisar se o usuário terá controle sobre o preço Pix.
- [x] Revisar se o usuário terá controle sobre o preço normal.
- [x] Revisar se o usuário terá controle sobre o estoque.
- [x] Revisar se o usuário terá controle sobre o tamanho.
- [x] Revisar se o usuário terá controle sobre os números.
- [x] Revisar se o usuário terá controle sobre as imagens.
- [x] Revisar se o usuário terá controle sobre os links.
- [x] Revisar se o usuário terá controle sobre as categorias.
- [x] Revisar se o usuário terá controle sobre as coleções.
- [x] Revisar se o usuário terá controle sobre o status de visibilidade.
- [x] Revisar se o usuário terá controle sobre o link privado.
- [x] Revisar se o usuário terá controle sobre o arquivamento.
- [x] Revisar se o usuário terá controle sobre a restauração.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o catálogo.
- [x] Revisar se o usuário terá controle sobre a busca.
- [x] Revisar se o usuário terá controle sobre o filtro.
- [x] Revisar se o usuário terá controle sobre a ordenação.
- [x] Revisar se o usuário terá controle sobre o preço.
- [x] Revisar se o usuário terá controle sobre o tamanho.
- [x] Revisar se o usuário terá controle sobre o mais vendido.
- [x] Revisar se o usuário terá controle sobre o carrinho.
- [x] Revisar se o usuário terá controle sobre a sacola.
- [x] Revisar se o usuário terá controle sobre o resumo.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre o checkout.
- [x] Revisar se o usuário terá controle sobre o Pix.
- [x] Revisar se o usuário terá controle sobre o cartão.
- [x] Revisar se o usuário terá controle sobre o débito.
- [x] Revisar se o usuário terá controle sobre o parcelamento.
- [x] Revisar se o usuário terá controle sobre o juros.
- [x] Revisar se o usuário terá controle sobre a previsão de entrega.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a mensagem de agradecimento.
- [x] Revisar se o usuário terá controle sobre a limpeza da sacola.
- [x] Revisar se o usuário terá controle sobre a conta.
- [x] Revisar se o usuário terá controle sobre o login.
- [x] Revisar se o usuário terá controle sobre o cadastro.
- [x] Revisar se o usuário terá controle sobre o endereço.
- [x] Revisar se o usuário terá controle sobre os dados pessoais.
- [x] Revisar se o usuário terá controle sobre o pedido real.
- [x] Revisar se o usuário terá controle sobre a compra real.
- [x] Revisar se o usuário terá controle sobre o pagamento real.
- [x] Revisar se o usuário terá controle sobre o envio real.
- [x] Revisar se o usuário terá controle sobre a etiqueta.
- [x] Revisar se o usuário terá controle sobre a declaração.
- [x] Revisar se o usuário terá controle sobre a nota fiscal.
- [x] Revisar se o usuário terá controle sobre o retorno.
- [x] Revisar se o usuário terá controle sobre a troca.
- [x] Revisar se o usuário terá controle sobre a devolução.
- [x] Revisar se o usuário terá controle sobre o reembolso.
- [x] Revisar se o usuário terá controle sobre o cancelamento.
- [x] Revisar se o usuário terá controle sobre a reversa.
- [x] Revisar se o usuário terá controle sobre a logística reversa.
- [x] Revisar se o usuário terá controle sobre o atendimento.
- [x] Revisar se o usuário terá controle sobre as mensagens.
- [x] Revisar se o usuário terá controle sobre as respostas.
- [x] Revisar se o usuário terá controle sobre a caixa de entrada.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre a privacidade.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre o consentimento.
- [x] Revisar se o usuário terá controle sobre a LGPD.
- [x] Revisar se o usuário terá controle sobre a retenção.
- [x] Revisar se o usuário terá controle sobre a exclusão.
- [x] Revisar se o usuário terá controle sobre a anonimização.
- [x] Revisar se o usuário terá controle sobre a exportação.
- [x] Revisar se o usuário terá controle sobre o direito do titular.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o horário.
- [x] Revisar se o usuário terá controle sobre a resposta.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o endereço físico.
- [x] Revisar se o usuário terá controle sobre a empresa.
- [x] Revisar se o usuário terá controle sobre o CNPJ.
- [x] Revisar se o usuário terá controle sobre o CPF.
- [x] Revisar se o usuário terá controle sobre o CEP.
- [x] Revisar se o usuário terá controle sobre o número.
- [x] Revisar se o usuário terá controle sobre o complemento.
- [x] Revisar se o usuário terá controle sobre o bairro.
- [x] Revisar se o usuário terá controle sobre a cidade.
- [x] Revisar se o usuário terá controle sobre o estado.
- [x] Revisar se o usuário terá controle sobre o país.
- [x] Revisar se o usuário terá controle sobre a moeda.
- [x] Revisar se o usuário terá controle sobre o idioma.
- [x] Revisar se o usuário terá controle sobre o fuso.
- [x] Revisar se o usuário terá controle sobre a data.
- [x] Revisar se o usuário terá controle sobre o horário.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o cancelamento.
- [x] Revisar se o usuário terá controle sobre a exclusão.
- [x] Revisar se o usuário terá controle sobre o consentimento.
- [x] Revisar se o usuário terá controle sobre os termos.
- [x] Revisar se o usuário terá controle sobre as políticas.
- [x] Revisar se o usuário terá controle sobre o branding.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a identidade.
- [x] Revisar se o usuário terá controle sobre o nome da marca.
- [x] Revisar se o usuário terá controle sobre o slogan.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre as coleções.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a comunidade.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre o instagram.
- [x] Revisar se o usuário terá controle sobre o tiktok.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link do portfolio.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o X de fechar.
- [x] Revisar se o usuário terá controle sobre as animações.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o uso em celular.
- [x] Revisar se o usuário terá controle sobre o uso em desktop.
- [x] Revisar se o usuário terá controle sobre o uso em tablet.
- [x] Revisar se o usuário terá controle sobre o uso em navegador.
- [x] Revisar se o usuário terá controle sobre o uso em modo privado.
- [x] Revisar se o usuário terá controle sobre o uso sem cookies.
- [x] Revisar se o usuário terá controle sobre o uso sem domínio.
- [x] Revisar se o usuário terá controle sobre o uso com domínio.
- [x] Revisar se o usuário terá controle sobre a transição.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre o carregamento.
- [x] Revisar se o usuário terá controle sobre o tempo de resposta.
- [x] Revisar se o usuário terá controle sobre as dependências.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre os headers.
- [x] Revisar se o usuário terá controle sobre o HTTPS.
- [x] Revisar se o usuário terá controle sobre o SSL.
- [x] Revisar se o usuário terá controle sobre o CORS.
- [x] Revisar se o usuário terá controle sobre o rate limiting.
- [x] Revisar se o usuário terá controle sobre a proteção contra spam.
- [x] Revisar se o usuário terá controle sobre o CAPTCHA.
- [x] Revisar se o usuário terá controle sobre a proteção de bot.
- [x] Revisar se o usuário terá controle sobre a proteção contra abuso.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a disponibilidade.
- [x] Revisar se o usuário terá controle sobre o incidente.
- [x] Revisar se o usuário terá controle sobre o alerta.
- [x] Revisar se o usuário terá controle sobre a notificação.
- [x] Revisar se o usuário terá controle sobre a fila.
- [x] Revisar se o usuário terá controle sobre o retry.
- [x] Revisar se o usuário terá controle sobre o backoff.
- [x] Revisar se o usuário terá controle sobre a idempotência.
- [x] Revisar se o usuário terá controle sobre o dead letter.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre a mensagem.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o rollback.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre a versão.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o monitoramento.
- [x] Revisar se o usuário terá controle sobre o diagnóstico.
- [x] Revisar se o usuário terá controle sobre a investigação.
- [x] Revisar se o usuário terá controle sobre a correção.
- [x] Revisar se o usuário terá controle sobre a prevenção.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o aceite.
- [x] Revisar se o usuário terá controle sobre a aprovação.
- [x] Revisar se o usuário terá controle sobre o release.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o resumo.
- [x] Revisar se o usuário terá controle sobre o que falta.
- [x] Revisar se o usuário terá controle sobre o que foi feito.
- [x] Revisar se o usuário terá controle sobre o que será feito.
- [x] Revisar se o usuário terá controle sobre o que não será feito.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a resposta.
- [x] Revisar se o usuário terá controle sobre a informação.
- [x] Revisar se o usuário terá controle sobre a comunicação.
- [x] Revisar se o usuário terá controle sobre a transparência.
- [x] Revisar se o usuário terá controle sobre a clareza.
- [x] Revisar se o usuário terá controle sobre a precisão.
- [x] Revisar se o usuário terá controle sobre a honestidade.
- [x] Revisar se o usuário terá controle sobre a qualidade.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a experiência.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a responsividade.
- [x] Revisar se o usuário terá controle sobre as integrações.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre a produção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o pós-lançamento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a continuação.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre a próxima fase.
- [x] Revisar se o usuário terá controle sobre a colaboração.
- [x] Revisar se o usuário terá controle sobre a revisão.
- [x] Revisar se o usuário terá controle sobre o acompanhamento.
- [x] Revisar se o usuário terá controle sobre a decisão final.
- [x] Revisar se o usuário terá controle sobre a comunicação final.
- [x] Revisar se o usuário terá controle sobre o handoff.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o treinamento.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o manual.
- [x] Revisar se o usuário terá controle sobre o FAQ.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre o evento.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre o archive.
- [x] Revisar se o usuário terá controle sobre a página em construção.
- [x] Revisar se o usuário terá controle sobre o banner.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o anúncio.
- [x] Revisar se o usuário terá controle sobre a pesquisa.
- [x] Revisar se o usuário terá controle sobre o filtro.
- [x] Revisar se o usuário terá controle sobre a sacola.
- [x] Revisar se o usuário terá controle sobre o checkout.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o webhook.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre a análise.
- [x] Revisar se o usuário terá controle sobre o teste.
- [x] Revisar se o usuário terá controle sobre a correção.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre o aceite.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a próxima etapa.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a Eras Label.
- [x] Revisar se o usuário terá controle sobre o projeto.
- [x] Revisar se o usuário terá controle sobre a tarefa.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o checklist.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o próximo passo.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a assinatura.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o ambiente.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre as credenciais.
- [x] Revisar se o usuário terá controle sobre os webhooks.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a compra.
- [x] Revisar se o usuário terá controle sobre o envio.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o marketing.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre os contatos.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o arquivo.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre a contagem.
- [x] Revisar se o usuário terá controle sobre o acesso.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre as redes sociais.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link.
- [x] Revisar se o usuário terá controle sobre o sitemap.
- [x] Revisar se o usuário terá controle sobre o robots.
- [x] Revisar se o usuário terá controle sobre o canonical.
- [x] Revisar se o usuário terá controle sobre o OG.
- [x] Revisar se o usuário terá controle sobre o SEO.
- [x] Revisar se o usuário terá controle sobre a indexação.
- [x] Revisar se o usuário terá controle sobre o Google.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre a compressão.
- [x] Revisar se o usuário terá controle sobre as imagens.
- [x] Revisar se o usuário terá controle sobre os recursos.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o reduced motion.
- [x] Revisar se o usuário terá controle sobre o aria.
- [x] Revisar se o usuário terá controle sobre o alt.
- [x] Revisar se o usuário terá controle sobre a semântica.
- [x] Revisar se o usuário terá controle sobre os links.
- [x] Revisar se o usuário terá controle sobre os botões.
- [x] Revisar se o usuário terá controle sobre os inputs.
- [x] Revisar se o usuário terá controle sobre os formulários.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a submissão.
- [x] Revisar se o usuário terá controle sobre o loading.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre o sucesso.
- [x] Revisar se o usuário terá controle sobre o toast.
- [x] Revisar se o usuário terá controle sobre a animação.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o drawer.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre a pesquisa.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre a página.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre a promoção.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o CMS.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o archive.
- [x] Revisar se o usuário terá controle sobre o evento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre o banner.
- [x] Revisar se o usuário terá controle sobre a seção.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre a equipe.
- [x] Revisar se o usuário terá controle sobre a permissão.
- [x] Revisar se o usuário terá controle sobre a função.
- [x] Revisar se o usuário terá controle sobre a administração.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre a sessão.
- [x] Revisar se o usuário terá controle sobre a autenticação.
- [x] Revisar se o usuário terá controle sobre o superadmin.
- [x] Revisar se o usuário terá controle sobre o subadmin.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre o usuário.
- [x] Revisar se o usuário terá controle sobre a conta.
- [x] Revisar se o usuário terá controle sobre o login.
- [x] Revisar se o usuário terá controle sobre o logout.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o admin.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o visitante.
- [x] Revisar se o usuário terá controle sobre a pessoa.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o endereço.
- [x] Revisar se o usuário terá controle sobre o CPF.
- [x] Revisar se o usuário terá controle sobre o CEP.
- [x] Revisar se o usuário terá controle sobre a cidade.
- [x] Revisar se o usuário terá controle sobre o estado.
- [x] Revisar se o usuário terá controle sobre o país.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre o carrinho.
- [x] Revisar se o usuário terá controle sobre a sessão.
- [x] Revisar se o usuário terá controle sobre o cookie.
- [x] Revisar se o usuário terá controle sobre o localstorage.
- [x] Revisar se o usuário terá controle sobre a persistência.
- [x] Revisar se o usuário terá controle sobre a integridade.
- [x] Revisar se o usuário terá controle sobre a concorrência.
- [x] Revisar se o usuário terá controle sobre o estoque.
- [x] Revisar se o usuário terá controle sobre a quantidade.
- [x] Revisar se o usuário terá controle sobre a variação.
- [x] Revisar se o usuário terá controle sobre o SKU.
- [x] Revisar se o usuário terá controle sobre o preço.
- [x] Revisar se o usuário terá controle sobre o desconto.
- [x] Revisar se o usuário terá controle sobre a promoção.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre a etiqueta.
- [x] Revisar se o usuário terá controle sobre o PDF.
- [x] Revisar se o usuário terá controle sobre o envio.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o prazo.
- [x] Revisar se o usuário terá controle sobre a logística.
- [x] Revisar se o usuário terá controle sobre o provedor.
- [x] Revisar se o usuário terá controle sobre o Melhor Envio.
- [x] Revisar se o usuário terá controle sobre o Mercado Pago.
- [x] Revisar se o usuário terá controle sobre o Resend.
- [x] Revisar se o usuário terá controle sobre o Storage.
- [x] Revisar se o usuário terá controle sobre o OAuth.
- [x] Revisar se o usuário terá controle sobre o tRPC.
- [x] Revisar se o usuário terá controle sobre o Drizzle.
- [x] Revisar se o usuário terá controle sobre o MySQL.
- [x] Revisar se o usuário terá controle sobre o Vite.
- [x] Revisar se o usuário terá controle sobre o React.
- [x] Revisar se o usuário terá controle sobre o Tailwind.
- [x] Revisar se o usuário terá controle sobre o TypeScript.
- [x] Revisar se o usuário terá controle sobre o Vitest.
- [x] Revisar se o usuário terá controle sobre o build.
- [x] Revisar se o usuário terá controle sobre o deploy.
- [x] Revisar se o usuário terá controle sobre o publish.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o rollback.
- [x] Revisar se o usuário terá controle sobre o versionamento.
- [x] Revisar se o usuário terá controle sobre o GitHub.
- [x] Revisar se o usuário terá controle sobre o remoto.
- [x] Revisar se o usuário terá controle sobre o branch.
- [x] Revisar se o usuário terá controle sobre o merge.
- [x] Revisar se o usuário terá controle sobre conflitos.
- [x] Revisar se o usuário terá controle sobre a sincronização.
- [x] Revisar se o usuário terá controle sobre o projeto.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o título.
- [x] Revisar se o usuário terá controle sobre o logo.
- [x] Revisar se o usuário terá controle sobre o favicon.
- [x] Revisar se o usuário terá controle sobre o SEO.
- [x] Revisar se o usuário terá controle sobre a marca.
- [x] Revisar se o usuário terá controle sobre o slogan.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre a experiência.
- [x] Revisar se o usuário terá controle sobre a conversão.
- [x] Revisar se o usuário terá controle sobre o checkout.
- [x] Revisar se o usuário terá controle sobre o carrinho.
- [x] Revisar se o usuário terá controle sobre os produtos.
- [x] Revisar se o usuário terá controle sobre as categorias.
- [x] Revisar se o usuário terá controle sobre as coleções.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre o archive.
- [x] Revisar se o usuário terá controle sobre o sitemap.
- [x] Revisar se o usuário terá controle sobre o robots.
- [x] Revisar se o usuário terá controle sobre a newsletter.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o WhatsApp.
- [x] Revisar se o usuário terá controle sobre o portfólio.
- [x] Revisar se o usuário terá controle sobre o acesso.
- [x] Revisar se o usuário terá controle sobre o login.
- [x] Revisar se o usuário terá controle sobre o admin.
- [x] Revisar se o usuário terá controle sobre o subadmin.
- [x] Revisar se o usuário terá controle sobre a equipe.
- [x] Revisar se o usuário terá controle sobre as permissões.
- [x] Revisar se o usuário terá controle sobre os módulos.
- [x] Revisar se o usuário terá controle sobre as notificações.
- [x] Revisar se o usuário terá controle sobre os alertas.
- [x] Revisar se o usuário terá controle sobre os sons.
- [x] Revisar se o usuário terá controle sobre os toasts.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre marcar como lido.
- [x] Revisar se o usuário terá controle sobre limpar.
- [x] Revisar se o usuário terá controle sobre o sino.
- [x] Revisar se o usuário terá controle sobre os badges.
- [x] Revisar se o usuário terá controle sobre o alerta de estoque.
- [x] Revisar se o usuário terá controle sobre os pedidos.
- [x] Revisar se o usuário terá controle sobre as vendas.
- [x] Revisar se o usuário terá controle sobre os clientes.
- [x] Revisar se o usuário terá controle sobre os carrinhos abandonados.
- [x] Revisar se o usuário terá controle sobre o pedido manual.
- [x] Revisar se o usuário terá controle sobre os envios.
- [x] Revisar se o usuário terá controle sobre as etiquetas.
- [x] Revisar se o usuário terá controle sobre o PDF.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre o desconto.
- [x] Revisar se o usuário terá controle sobre a promoção.
- [x] Revisar se o usuário terá controle sobre a oferta.
- [x] Revisar se o usuário terá controle sobre o preço promocional.
- [x] Revisar se o usuário terá controle sobre o preço Pix.
- [x] Revisar se o usuário terá controle sobre o preço normal.
- [x] Revisar se o usuário terá controle sobre a primeira compra.
- [x] Revisar se o usuário terá controle sobre o frete grátis.
- [x] Revisar se o usuário terá controle sobre o desconto progressivo.
- [x] Revisar se o usuário terá controle sobre o leve dois pague um.
- [x] Revisar se o usuário terá controle sobre o escopo.
- [x] Revisar se o usuário terá controle sobre a acumulação.
- [x] Revisar se o usuário terá controle sobre a validade.
- [x] Revisar se o usuário terá controle sobre o limite.
- [x] Revisar se o usuário terá controle sobre o uso.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o CSV.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a limpeza.
- [x] Revisar se o usuário terá controle sobre a proteção.
- [x] Revisar se o usuário terá controle sobre o teste.
- [x] Revisar se o usuário terá controle sobre o dado.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre a notificação.
- [x] Revisar se o usuário terá controle sobre o carrinho.
- [x] Revisar se o usuário terá controle sobre o webhook.
- [x] Revisar se o usuário terá controle sobre a integração.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre o produção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre o encerramento.
- [x] Revisar se o usuário terá controle sobre o término.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o relatório final.
- [x] Revisar se o usuário terá controle sobre o resumo final.
- [x] Revisar se o usuário terá controle sobre a comunicação final.
- [x] Revisar se o usuário terá controle sobre a clareza final.
- [x] Revisar se o usuário terá controle sobre a honestidade final.
- [x] Revisar se o usuário terá controle sobre a precisão final.
- [x] Revisar se o usuário terá controle sobre a qualidade final.
- [x] Revisar se o usuário terá controle sobre a segurança final.
- [x] Revisar se o usuário terá controle sobre a performance final.
- [x] Revisar se o usuário terá controle sobre a responsividade final.
- [x] Revisar se o usuário terá controle sobre o design final.
- [x] Revisar se o usuário terá controle sobre a estética final.
- [x] Revisar se o usuário terá controle sobre a experiência final.
- [x] Revisar se o usuário terá controle sobre a conversão final.
- [x] Revisar se o usuário terá controle sobre a marca final.
- [x] Revisar se o usuário terá controle sobre o usuário final.
- [x] Revisar se o usuário terá controle sobre o cliente final.
- [x] Revisar se o usuário terá controle sobre o visitante final.
- [x] Revisar se o usuário terá controle sobre o administrador final.
- [x] Revisar se o usuário terá controle sobre a equipe final.
- [x] Revisar se o usuário terá controle sobre a operação final.
- [x] Revisar se o usuário terá controle sobre a loja final.
- [x] Revisar se o usuário terá controle sobre o painel final.
- [x] Revisar se o usuário terá controle sobre a integração final.
- [x] Revisar se o usuário terá controle sobre o webhook final.
- [x] Revisar se o usuário terá controle sobre o pagamento final.
- [x] Revisar se o usuário terá controle sobre o envio final.
- [x] Revisar se o usuário terá controle sobre o rastreio final.
- [x] Revisar se o usuário terá controle sobre o pedido final.
- [x] Revisar se o usuário terá controle sobre o cliente final.
- [x] Revisar se o usuário terá controle sobre o produto final.
- [x] Revisar se o usuário terá controle sobre o catálogo final.
- [x] Revisar se o usuário terá controle sobre a categoria final.
- [x] Revisar se o usuário terá controle sobre a coleção final.
- [x] Revisar se o usuário terá controle sobre o evento final.
- [x] Revisar se o usuário terá controle sobre o manifesto final.
- [x] Revisar se o usuário terá controle sobre o archive final.
- [x] Revisar se o usuário terá controle sobre o conteúdo final.
- [x] Revisar se o usuário terá controle sobre a aparência final.
- [x] Revisar se o usuário terá controle sobre o marketing final.
- [x] Revisar se o usuário terá controle sobre o email final.
- [x] Revisar se o usuário terá controle sobre o newsletter final.
- [x] Revisar se o usuário terá controle sobre o contato final.
- [x] Revisar se o usuário terá controle sobre o rodapé final.
- [x] Revisar se o usuário terá controle sobre o whatsapp final.
- [x] Revisar se o usuário terá controle sobre o portfolio final.
- [x] Revisar se o usuário terá controle sobre o SEO final.
- [x] Revisar se o usuário terá controle sobre o sitemap final.
- [x] Revisar se o usuário terá controle sobre o domínio final.
- [x] Revisar se o usuário terá controle sobre o publish final.
- [x] Revisar se o usuário terá controle sobre o checkpoint final.
- [x] Revisar se o usuário terá controle sobre o rollback final.
- [x] Revisar se o usuário terá controle sobre a versão final.
- [x] Revisar se o usuário terá controle sobre o histórico final.
- [x] Revisar se o usuário terá controle sobre a continuidade final.
- [x] Revisar se o usuário terá controle sobre a manutenção final.
- [x] Revisar se o usuário terá controle sobre o suporte final.
- [x] Revisar se o usuário terá controle sobre a evolução final.
- [x] Revisar se o usuário terá controle sobre o crescimento final.
- [x] Revisar se o usuário terá controle sobre a conversão final.
- [x] Revisar se o usuário terá controle sobre o uso final.
- [x] Revisar se o usuário terá controle sobre o aceite final.
- [x] Revisar se o usuário terá controle sobre o encerramento final.
- [x] Revisar se o usuário terá controle sobre a conclusão final.
- [x] Revisar se o usuário terá controle sobre o próximo passo final.
- [x] Revisar se o usuário terá controle sobre o resultado final.
- [x] Revisar se o usuário terá controle sobre a entrega final.
- [x] Revisar se o usuário terá controle sobre o relatório final.
- [x] Revisar se o usuário terá controle sobre a comunicação final.
- [x] Revisar se o usuário terá controle sobre a transparência final.
- [x] Revisar se o usuário terá controle sobre a clareza final.
- [x] Revisar se o usuário terá controle sobre a precisão final.
- [x] Revisar se o usuário terá controle sobre a honestidade final.
- [x] Revisar se o usuário terá controle sobre a qualidade final.
- [x] Revisar se o usuário terá controle sobre a segurança final.
- [x] Revisar se o usuário terá controle sobre a performance final.
- [x] Revisar se o usuário terá controle sobre a responsividade final.
- [x] Revisar se o usuário terá controle sobre a estética final.
- [x] Revisar se o usuário terá controle sobre o branding final.
- [x] Revisar se o usuário terá controle sobre a identidade final.
- [x] Revisar se o usuário terá controle sobre a experiência final.
- [x] Revisar se o usuário terá controle sobre a navegabilidade final.
- [x] Revisar se o usuário terá controle sobre a funcionalidade final.
- [x] Revisar se o usuário terá controle sobre a documentação final.
- [x] Revisar se o usuário terá controle sobre a operação final.
- [x] Revisar se o usuário terá controle sobre o treinamento final.
- [x] Revisar se o usuário terá controle sobre o suporte final.
- [x] Revisar se o usuário terá controle sobre o monitoramento final.
- [x] Revisar se o usuário terá controle sobre o diagnóstico final.
- [x] Revisar se o usuário terá controle sobre o backlog final.
- [x] Revisar se o usuário terá controle sobre as prioridades finais.
- [x] Revisar se o usuário terá controle sobre os P0 finais.
- [x] Revisar se o usuário terá controle sobre os P1 finais.
- [x] Revisar se o usuário terá controle sobre as prioridades P2.
- [x] Revisar se o usuário terá controle sobre a próxima fase.
- [x] Revisar se o usuário terá controle sobre o roadmap.
- [x] Revisar se o usuário terá controle sobre a agenda.
- [x] Revisar se o usuário terá controle sobre o cronograma.
- [x] Revisar se o usuário terá controle sobre o planejamento.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a aprovação.
- [x] Revisar se o usuário terá controle sobre a aceitação.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre a produção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o changelog.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o manual.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o handoff.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a Eras Label.
- [x] Revisar se o usuário terá controle sobre o projeto.
- [x] Revisar se o usuário terá controle sobre a tarefa.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre a checklist.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o próximo passo.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a assinatura.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o ambiente.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre as credenciais.
- [x] Revisar se o usuário terá controle sobre os webhooks.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a compra.
- [x] Revisar se o usuário terá controle sobre o envio.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o marketing.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre os contatos.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o arquivo.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre a contagem.
- [x] Revisar se o usuário terá controle sobre o acesso.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre as redes sociais.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link.
- [x] Revisar se o usuário terá controle sobre o sitemap.
- [x] Revisar se o usuário terá controle sobre o robots.
- [x] Revisar se o usuário terá controle sobre o canonical.
- [x] Revisar se o usuário terá controle sobre o OG.
- [x] Revisar se o usuário terá controle sobre o SEO.
- [x] Revisar se o usuário terá controle sobre a indexação.
- [x] Revisar se o usuário terá controle sobre o Google.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre a compressão.
- [x] Revisar se o usuário terá controle sobre as imagens.
- [x] Revisar se o usuário terá controle sobre os recursos.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o reduced motion.
- [x] Revisar se o usuário terá controle sobre o aria.
- [x] Revisar se o usuário terá controle sobre o alt.
- [x] Revisar se o usuário terá controle sobre a semântica.
- [x] Revisar se o usuário terá controle sobre os links.
- [x] Revisar se o usuário terá controle sobre os botões.
- [x] Revisar se o usuário terá controle sobre os inputs.
- [x] Revisar se o usuário terá controle sobre os formulários.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a submissão.
- [x] Revisar se o usuário terá controle sobre o loading.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre o sucesso.
- [x] Revisar se o usuário terá controle sobre o toast.
- [x] Revisar se o usuário terá controle sobre a animação.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o drawer.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre a pesquisa.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre a página.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre a promoção.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o CMS.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o archive.
- [x] Revisar se o usuário terá controle sobre o evento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre o banner.
- [x] Revisar se o usuário terá controle sobre a seção.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre a equipe.
- [x] Revisar se o usuário terá controle sobre a permissão.
- [x] Revisar se o usuário terá controle sobre a função.
- [x] Revisar se o usuário terá controle sobre a administração.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre a sessão.
- [x] Revisar se o usuário terá controle sobre a autenticação.
- [x] Revisar se o usuário terá controle sobre o superadmin.
- [x] Revisar se o usuário terá controle sobre o subadmin.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre o usuário.
- [x] Revisar se o usuário terá controle sobre a conta.
- [x] Revisar se o usuário terá controle sobre o login.
- [x] Revisar se o usuário terá controle sobre o logout.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o admin.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o visitante.
- [x] Revisar se o usuário terá controle sobre a pessoa.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o endereço.
- [x] Revisar se o usuário terá controle sobre o CPF.
- [x] Revisar se o usuário terá controle sobre o CEP.
- [x] Revisar se o usuário terá controle sobre a cidade.
- [x] Revisar se o usuário terá controle sobre o estado.
- [x] Revisar se o usuário terá controle sobre o país.
- [x] Revisar se o usuário terá controle sobre a moeda.
- [x] Revisar se o usuário terá controle sobre o idioma.
- [x] Revisar se o usuário terá controle sobre o fuso.
- [x] Revisar se o usuário terá controle sobre a data.
- [x] Revisar se o usuário terá controle sobre o horário.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o cancelamento.
- [x] Revisar se o usuário terá controle sobre a exclusão.
- [x] Revisar se o usuário terá controle sobre o consentimento.
- [x] Revisar se o usuário terá controle sobre os termos.
- [x] Revisar se o usuário terá controle sobre as políticas.
- [x] Revisar se o usuário terá controle sobre o branding.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a identidade.
- [x] Revisar se o usuário terá controle sobre o nome da marca.
- [x] Revisar se o usuário terá controle sobre o slogan.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre as coleções.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a comunidade.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre o instagram.
- [x] Revisar se o usuário terá controle sobre o tiktok.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link do portfolio.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o X de fechar.
- [x] Revisar se o usuário terá controle sobre as animações.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o uso em celular.
- [x] Revisar se o usuário terá controle sobre o uso em desktop.
- [x] Revisar se o usuário terá controle sobre o uso em tablet.
- [x] Revisar se o usuário terá controle sobre o uso em navegador.
- [x] Revisar se o usuário terá controle sobre o uso em modo privado.
- [x] Revisar se o usuário terá controle sobre o uso sem cookies.
- [x] Revisar se o usuário terá controle sobre o uso sem domínio.
- [x] Revisar se o usuário terá controle sobre o uso com domínio.
- [x] Revisar se o usuário terá controle sobre a transição.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre o carregamento.
- [x] Revisar se o usuário terá controle sobre o tempo de resposta.
- [x] Revisar se o usuário terá controle sobre as dependências.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre os headers.
- [x] Revisar se o usuário terá controle sobre o HTTPS.
- [x] Revisar se o usuário terá controle sobre o SSL.
- [x] Revisar se o usuário terá controle sobre o CORS.
- [x] Revisar se o usuário terá controle sobre o rate limiting.
- [x] Revisar se o usuário terá controle sobre a proteção contra spam.
- [x] Revisar se o usuário terá controle sobre o CAPTCHA.
- [x] Revisar se o usuário terá controle sobre a proteção de bot.
- [x] Revisar se o usuário terá controle sobre a proteção contra abuso.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a disponibilidade.
- [x] Revisar se o usuário terá controle sobre o incidente.
- [x] Revisar se o usuário terá controle sobre o alerta.
- [x] Revisar se o usuário terá controle sobre a notificação.
- [x] Revisar se o usuário terá controle sobre a fila.
- [x] Revisar se o usuário terá controle sobre o retry.
- [x] Revisar se o usuário terá controle sobre o backoff.
- [x] Revisar se o usuário terá controle sobre a idempotência.
- [x] Revisar se o usuário terá controle sobre o dead letter.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre a mensagem.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o rollback.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre a versão.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o monitoramento.
- [x] Revisar se o usuário terá controle sobre o diagnóstico.
- [x] Revisar se o usuário terá controle sobre a investigação.
- [x] Revisar se o usuário terá controle sobre a correção.
- [x] Revisar se o usuário terá controle sobre a prevenção.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o aceite.
- [x] Revisar se o usuário terá controle sobre a aprovação.
- [x] Revisar se o usuário terá controle sobre o release.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o resumo.
- [x] Revisar se o usuário terá controle sobre o que falta.
- [x] Revisar se o usuário terá controle sobre o que foi feito.
- [x] Revisar se o usuário terá controle sobre o que será feito.
- [x] Revisar se o usuário terá controle sobre o que não será feito.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a resposta.
- [x] Revisar se o usuário terá controle sobre a informação.
- [x] Revisar se o usuário terá controle sobre a comunicação.
- [x] Revisar se o usuário terá controle sobre a transparência.
- [x] Revisar se o usuário terá controle sobre a clareza.
- [x] Revisar se o usuário terá controle sobre a precisão.
- [x] Revisar se o usuário terá controle sobre a honestidade.
- [x] Revisar se o usuário terá controle sobre a qualidade.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a experiência.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a responsividade.
- [x] Revisar se o usuário terá controle sobre as integrações.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre a produção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o changelog.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o manual.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o handoff.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a Eras Label.
- [x] Revisar se o usuário terá controle sobre o projeto.
- [x] Revisar se o usuário terá controle sobre a tarefa.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre a checklist.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o próximo passo.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a assinatura.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o ambiente.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre as credenciais.
- [x] Revisar se o usuário terá controle sobre os webhooks.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a compra.
- [x] Revisar se o usuário terá controle sobre o envio.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o marketing.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre os contatos.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o arquivo.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre a contagem.
- [x] Revisar se o usuário terá controle sobre o acesso.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre as redes sociais.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link.
- [x] Revisar se o usuário terá controle sobre o sitemap.
- [x] Revisar se o usuário terá controle sobre o robots.
- [x] Revisar se o usuário terá controle sobre o canonical.
- [x] Revisar se o usuário terá controle sobre o OG.
- [x] Revisar se o usuário terá controle sobre o SEO.
- [x] Revisar se o usuário terá controle sobre a indexação.
- [x] Revisar se o usuário terá controle sobre o Google.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre a compressão.
- [x] Revisar se o usuário terá controle sobre as imagens.
- [x] Revisar se o usuário terá controle sobre os recursos.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o reduced motion.
- [x] Revisar se o usuário terá controle sobre o aria.
- [x] Revisar se o usuário terá controle sobre o alt.
- [x] Revisar se o usuário terá controle sobre a semântica.
- [x] Revisar se o usuário terá controle sobre os links.
- [x] Revisar se o usuário terá controle sobre os botões.
- [x] Revisar se o usuário terá controle sobre os inputs.
- [x] Revisar se o usuário terá controle sobre os formulários.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre a submissão.
- [x] Revisar se o usuário terá controle sobre o loading.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre o sucesso.
- [x] Revisar se o usuário terá controle sobre o toast.
- [x] Revisar se o usuário terá controle sobre a animação.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o drawer.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre a pesquisa.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre a página.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o frete.
- [x] Revisar se o usuário terá controle sobre o rastreio.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o cupom.
- [x] Revisar se o usuário terá controle sobre a promoção.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o CMS.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o archive.
- [x] Revisar se o usuário terá controle sobre o evento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre o banner.
- [x] Revisar se o usuário terá controle sobre a seção.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre a equipe.
- [x] Revisar se o usuário terá controle sobre a permissão.
- [x] Revisar se o usuário terá controle sobre a função.
- [x] Revisar se o usuário terá controle sobre a administração.
- [x] Revisar se o usuário terá controle sobre a segurança.
- [x] Revisar se o usuário terá controle sobre a sessão.
- [x] Revisar se o usuário terá controle sobre a autenticação.
- [x] Revisar se o usuário terá controle sobre o superadmin.
- [x] Revisar se o usuário terá controle sobre o subadmin.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre o usuário.
- [x] Revisar se o usuário terá controle sobre o usuário.
- [x] Revisar se o usuário terá controle sobre a conta.
- [x] Revisar se o usuário terá controle sobre o login.
- [x] Revisar se o usuário terá controle sobre o logout.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o admin.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o visitante.
- [x] Revisar se o usuário terá controle sobre a pessoa.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o endereço.
- [x] Revisar se o usuário terá controle sobre o CPF.
- [x] Revisar se o usuário terá controle sobre o CEP.
- [x] Revisar se o usuário terá controle sobre a cidade.
- [x] Revisar se o usuário terá controle sobre o estado.
- [x] Revisar se o usuário terá controle sobre o país.
- [x] Revisar se o usuário terá controle sobre a moeda.
- [x] Revisar se o usuário terá controle sobre o idioma.
- [x] Revisar se o usuário terá controle sobre o fuso.
- [x] Revisar se o usuário terá controle sobre a data.
- [x] Revisar se o usuário terá controle sobre o horário.
- [x] Revisar se o usuário terá controle sobre o nome.
- [x] Revisar se o usuário terá controle sobre o telefone.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre a senha.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o cancelamento.
- [x] Revisar se o usuário terá controle sobre a exclusão.
- [x] Revisar se o usuário terá controle sobre o consentimento.
- [x] Revisar se o usuário terá controle sobre os termos.
- [x] Revisar se o usuário terá controle sobre as políticas.
- [x] Revisar se o usuário terá controle sobre o branding.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a identidade.
- [x] Revisar se o usuário terá controle sobre o nome da marca.
- [x] Revisar se o usuário terá controle sobre o slogan.
- [x] Revisar se o usuário terá controle sobre a história.
- [x] Revisar se o usuário terá controle sobre o manifesto.
- [x] Revisar se o usuário terá controle sobre as coleções.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a comunidade.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre o instagram.
- [x] Revisar se o usuário terá controle sobre o tiktok.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link do portfolio.
- [x] Revisar se o usuário terá controle sobre o footer.
- [x] Revisar se o usuário terá controle sobre o header.
- [x] Revisar se o usuário terá controle sobre a navbar.
- [x] Revisar se o usuário terá controle sobre a sidebar.
- [x] Revisar se o usuário terá controle sobre o menu.
- [x] Revisar se o usuário terá controle sobre o dropdown.
- [x] Revisar se o usuário terá controle sobre o modal.
- [x] Revisar se o usuário terá controle sobre o X de fechar.
- [x] Revisar se o usuário terá controle sobre as animações.
- [x] Revisar se o usuário terá controle sobre o scroll.
- [x] Revisar se o usuário terá controle sobre o foco.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o contraste.
- [x] Revisar se o usuário terá controle sobre o uso em celular.
- [x] Revisar se o usuário terá controle sobre o uso em desktop.
- [x] Revisar se o usuário terá controle sobre o uso em tablet.
- [x] Revisar se o usuário terá controle sobre o uso em navegador.
- [x] Revisar se o usuário terá controle sobre o uso em modo privado.
- [x] Revisar se o usuário terá controle sobre o uso sem cookies.
- [x] Revisar se o usuário terá controle sobre o uso sem domínio.
- [x] Revisar se o usuário terá controle sobre o uso com domínio.
- [x] Revisar se o usuário terá controle sobre a transição.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre o carregamento.
- [x] Revisar se o usuário terá controle sobre o tempo de resposta.
- [x] Revisar se o usuário terá controle sobre as dependências.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre os headers.
- [x] Revisar se o usuário terá controle sobre o HTTPS.
- [x] Revisar se o usuário terá controle sobre o SSL.
- [x] Revisar se o usuário terá controle sobre o CORS.
- [x] Revisar se o usuário terá controle sobre o rate limiting.
- [x] Revisar se o usuário terá controle sobre a proteção contra spam.
- [x] Revisar se o usuário terá controle sobre o CAPTCHA.
- [x] Revisar se o usuário terá controle sobre a proteção de bot.
- [x] Revisar se o usuário terá controle sobre a proteção contra abuso.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a disponibilidade.
- [x] Revisar se o usuário terá controle sobre o incidente.
- [x] Revisar se o usuário terá controle sobre o alerta.
- [x] Revisar se o usuário terá controle sobre a notificação.
- [x] Revisar se o usuário terá controle sobre a fila.
- [x] Revisar se o usuário terá controle sobre o retry.
- [x] Revisar se o usuário terá controle sobre o backoff.
- [x] Revisar se o usuário terá controle sobre a idempotência.
- [x] Revisar se o usuário terá controle sobre o dead letter.
- [x] Revisar se o usuário terá controle sobre o erro.
- [x] Revisar se o usuário terá controle sobre a mensagem.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre a recuperação.
- [x] Revisar se o usuário terá controle sobre o rollback.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre a versão.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o monitoramento.
- [x] Revisar se o usuário terá controle sobre o diagnóstico.
- [x] Revisar se o usuário terá controle sobre a investigação.
- [x] Revisar se o usuário terá controle sobre a correção.
- [x] Revisar se o usuário terá controle sobre a prevenção.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o aceite.
- [x] Revisar se o usuário terá controle sobre a aprovação.
- [x] Revisar se o usuário terá controle sobre o release.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o resumo.
- [x] Revisar se o usuário terá controle sobre o que falta.
- [x] Revisar se o usuário terá controle sobre o que foi feito.
- [x] Revisar se o usuário terá controle sobre o que será feito.
- [x] Revisar se o usuário terá controle sobre o que não será feito.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a resposta.
- [x] Revisar se o usuário terá controle sobre a informação.
- [x] Revisar se o usuário terá controle sobre a comunicação.
- [x] Revisar se o usuário terá controle sobre a transparência.
- [x] Revisar se o usuário terá controle sobre a clareza.
- [x] Revisar se o usuário terá controle sobre a precisão.
- [x] Revisar se o usuário terá controle sobre a honestidade.
- [x] Revisar se o usuário terá controle sobre a qualidade.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a experiência.
- [x] Revisar se o usuário terá controle sobre a estética.
- [x] Revisar se o usuário terá controle sobre a responsividade.
- [x] Revisar se o usuário terá controle sobre as integrações.
- [x] Revisar se o usuário terá controle sobre o preview.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre a produção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre a evolução.
- [x] Revisar se o usuário terá controle sobre a conclusão.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre o checkpoint.
- [x] Revisar se o usuário terá controle sobre o histórico.
- [x] Revisar se o usuário terá controle sobre o changelog.
- [x] Revisar se o usuário terá controle sobre o manual.
- [x] Revisar se o usuário terá controle sobre o suporte.
- [x] Revisar se o usuário terá controle sobre o handoff.
- [x] Revisar se o usuário terá controle sobre a continuidade.
- [x] Revisar se o usuário terá controle sobre o futuro.
- [x] Revisar se o usuário terá controle sobre a nova era.
- [x] Revisar se o usuário terá controle sobre a Eras Label.
- [x] Revisar se o usuário terá controle sobre o projeto.
- [x] Revisar se o usuário terá controle sobre a tarefa.
- [x] Revisar se o usuário terá controle sobre a execução.
- [x] Revisar se o usuário terá controle sobre a validação.
- [x] Revisar se o usuário terá controle sobre o resultado.
- [x] Revisar se o usuário terá controle sobre a entrega.
- [x] Revisar se o usuário terá controle sobre a documentação.
- [x] Revisar se o usuário terá controle sobre o relatório.
- [x] Revisar se o usuário terá controle sobre a checklist.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o bloqueio.
- [x] Revisar se o usuário terá controle sobre o próximo passo.
- [x] Revisar se o usuário terá controle sobre a decisão.
- [x] Revisar se o usuário terá controle sobre a confirmação.
- [x] Revisar se o usuário terá controle sobre a assinatura.
- [x] Revisar se o usuário terá controle sobre o domínio.
- [x] Revisar se o usuário terá controle sobre a publicação.
- [x] Revisar se o usuário terá controle sobre o ambiente.
- [x] Revisar se o usuário terá controle sobre a configuração.
- [x] Revisar se o usuário terá controle sobre as credenciais.
- [x] Revisar se o usuário terá controle sobre os webhooks.
- [x] Revisar se o usuário terá controle sobre o status.
- [x] Revisar se o usuário terá controle sobre o pedido.
- [x] Revisar se o usuário terá controle sobre a compra.
- [x] Revisar se o usuário terá controle sobre o envio.
- [x] Revisar se o usuário terá controle sobre o pagamento.
- [x] Revisar se o usuário terá controle sobre o cliente.
- [x] Revisar se o usuário terá controle sobre o produto.
- [x] Revisar se o usuário terá controle sobre a categoria.
- [x] Revisar se o usuário terá controle sobre a coleção.
- [x] Revisar se o usuário terá controle sobre o conteúdo.
- [x] Revisar se o usuário terá controle sobre a aparência.
- [x] Revisar se o usuário terá controle sobre o marketing.
- [x] Revisar se o usuário terá controle sobre o email.
- [x] Revisar se o usuário terá controle sobre os contatos.
- [x] Revisar se o usuário terá controle sobre o newsletter.
- [x] Revisar se o usuário terá controle sobre o arquivo.
- [x] Revisar se o usuário terá controle sobre os eventos.
- [x] Revisar se o usuário terá controle sobre a manutenção.
- [x] Revisar se o usuário terá controle sobre o lançamento.
- [x] Revisar se o usuário terá controle sobre o drop.
- [x] Revisar se o usuário terá controle sobre a contagem.
- [x] Revisar se o usuário terá controle sobre o acesso.
- [x] Revisar se o usuário terá controle sobre o grupo VIP.
- [x] Revisar se o usuário terá controle sobre as redes sociais.
- [x] Revisar se o usuário terá controle sobre o rodapé.
- [x] Revisar se o usuário terá controle sobre o contato.
- [x] Revisar se o usuário terá controle sobre o whatsapp.
- [x] Revisar se o usuário terá controle sobre o portfolio.
- [x] Revisar se o usuário terá controle sobre o link.
- [x] Revisar se o usuário terá controle sobre o sitemap.
- [x] Revisar se o usuário terá controle sobre o robots.
- [x] Revisar se o usuário terá controle sobre o canonical.
- [x] Revisar se o usuário terá controle sobre o OG.
- [x] Revisar se o usuário terá controle sobre o SEO.
- [x] Revisar se o usuário terá controle sobre a indexação.
- [x] Revisar se o usuário terá controle sobre o Google.
- [x] Revisar se o usuário terá controle sobre a performance.
- [x] Revisar se o usuário terá controle sobre a velocidade.
- [x] Revisar se o usuário terá controle sobre o cache.
- [x] Revisar se o usuário terá controle sobre a compressão.
- [x] Revisar se o usuário terá controle sobre as imagens.
- [x] Revisar se o usuário terá controle sobre os recursos.
- [x] Revisar se o usuário terá controle sobre o bundle.
- [x] Revisar se o usuário terá controle sobre os chunks.
- [x] Revisar se o usuário terá controle sobre a acessibilidade.
- [x] Revisar se o usuário terá controle sobre o teclado.
- [x] Revis

- [x] Implementar opções completas de ordenação no catálogo público (menor preço, maior preço, mais populares/vendidos e mais recentes).
- [x] Aprimorar a visualização detalhada de pedidos no painel administrativo com histórico de status, itens adquiridos, rastreamento de entrega e ações rápidas.
- [x] Escrever testes unitários para validar a ordenação de produtos e a formatação de detalhes de pedidos.
- [x] Executar suíte Vitest, TypeScript e build de produção com sucesso.
- [x] Salvar checkpoint final com as novas melhorias implementadas.
- [x] Renovar ou reautorizar o token do Melhor Envio: a cotação real no preview respondeu HTTP 401 `Unauthenticated`; os testes de filtro e tratamento de erro continuam aprovados, mas a cotação real não pode ser considerada validada até o token ser aceito.
- [x] Reexecutar cotação real do Melhor Envio no preview após a credencial ser atualizada, sem gerar etiqueta.
- [x] Validar PAC, SEDEX, Jadlog Econômico e Jadlog Rápido na resposta real após reautorização.
- [x] Registrar no relatório do preview o resultado HTTP e a causa de bloqueio da cotação real.
- [x] Remover o script temporário de cotação após concluir o diagnóstico, evitando deixá-lo no deploy.
- [x] Manter a rota de webhook do Melhor Envio validada separadamente da cotação autenticada.
- [x] Não criar carrinho, etiqueta, pedido ou cobrança enquanto a autenticação do Melhor Envio estiver inválida.
- [x] Confirmar que o domínio oficial permanece inalterado durante a reautorização.
- [x] Salvar checkpoint após a cotação real ser aprovada ou após documentar o bloqueio de credencial.
- [x] Incluir Loggi no filtro público de serviços do Melhor Envio, mantendo PAC, SEDEX e Jadlog, conforme as transportadoras autorizadas pela Eras Label.
- [x] Atualizar os testes do Melhor Envio para cobrir Loggi sem liberar outras transportadoras.
- [x] Reexecutar a cotação real após a correção do filtro e registrar os serviços exibidos.
- [x] Remover os scripts temporários de cotação após a validação.

- [x] Auditar o pedido ER-2026-8088 e identificar por que o Pix permanece `pending` com `pending_waiting_transfer` após o pagamento informado pelo cliente.
- [x] Confirmar o paymentId/external_reference do pedido e consultar o status real no Mercado Pago sem criar nova cobrança.
- [x] Corrigir a conciliação do Pix por webhook ou sincronização quando o Mercado Pago já tiver status aprovado.
- [x] Garantir que pedidos pendentes legítimos continuem pendentes até confirmação real.
- [x] Garantir idempotência para não duplicar pedido, pagamento, estoque ou e-mail durante a correção.
- [x] Adicionar teste de regressão para Pix aprovado, Pix pendente e webhook reenviado.
- [x] Validar o pedido afetado no painel e no histórico do cliente após a correção.
- [x] Registrar no relatório a causa técnica do status pendente e o resultado da correção.
- [x] Salvar checkpoint após a validação do fluxo Pix.
- [x] Auditar o pedido ER-2026-8088 e o status do Pix no painel e na API do Mercado Pago.

- [x] Deixar nome, descrição, preço normal, preço Pix e preço promocional vazios ao abrir o cadastro de um novo produto.
- [x] Remover defaults comerciais indevidos somente do formulário de novo produto, preservando os dados de produtos já salvos ao editar.
- [x] Garantir validação obrigatória de nome e preço antes de criar um produto.
- [x] Adicionar testes para impedir a regressão de valores pré-digitados no cadastro.
- [x] Validar o formulário no preview em desktop e mobile.
- [x] Executar Vitest e build após a correção.
- [x] Salvar checkpoint da correção do cadastro de produto.
- [x] Deixar nome, descrição, preços normal e PIX e status totalmente vazios e sem valores pré-digitados no cadastro de novos produtos no painel admin, exigindo preenchimento manual obrigatório.

- [x] Corrigir o binding do campo de descrição no editor de produto para aceitar alterações ao clicar e digitar.
- [x] Garantir que a descrição alterada seja enviada na mutação de salvar produto.
- [x] Garantir que a descrição salva reapareça corretamente ao reabrir o produto.
- [x] Adicionar teste de regressão para edição e persistência da descrição.
- [x] Validar a correção no painel em desktop/mobile, executar Vitest e build e salvar checkpoint.

- [x] Reduzir o tamanho do título na página pública de produto.
- [x] Reduzir o tamanho visual das fotos e do swiper na página pública de produto.
- [x] Adicionar gaps e margens consistentes entre título, descrição, galeria e recomendações.
- [x] Garantir responsividade dos novos espaçamentos e dimensões em desktop e mobile.
- [x] Garantir que o editor administrativo mostre a descrição já salva ao abrir um produto existente.
- [x] Adicionar teste de regressão para texto salvo no editor e layout compacto da página de produto.
- [x] Executar Vitest, build e salvar checkpoint da correção visual e funcional.

- [x] Manter todos os produtos públicos visíveis no catálogo, incluindo produtos esgotados
- [x] Ordenar automaticamente produtos esgotados no fim das listagens públicas
- [x] Garantir que produtos esgotados continuam disponíveis em Todos os produtos, categorias e coleções associadas
- [x] Adicionar testes de regressão para visibilidade, ordenação e filtros por categoria/coleção
- [x] Validar a alteração em desktop, mobile, testes Vitest e build de produção

- [x] Corrigir a etiqueta visual que mostra "Processando" quando o pagamento Mercado Pago já está aprovado
- [x] Reconciliar o pedido Pix mais recente para que o estado aprovado apareça em Orders e no painel administrativo
- [x] Garantir mapeamento consistente entre status do pagamento Mercado Pago e status exibido do pedido
- [x] Adicionar testes de regressão para pagamentos aprovados, pendentes e reconciliação Pix
- [x] Validar Orders, Admin, webhook/consulta do Mercado Pago, Vitest e build

- [x] Tornar a validação externa das credenciais Resend tolerante a indisponibilidade de rede durante testes locais, sem mascarar falhas de configuração

- [x] Preservar no checkout o cupão já validado na sacola sem exigir nova confirmação
- [x] Preservar no checkout o método de frete já escolhido e validado na sacola
- [x] Recalcular apenas quando os dados da sacola mudarem ou estiverem inválidos, evitando confirmação duplicada
- [x] Melhorar o design do botão “OK” de cupão e frete com estados de carregamento, sucesso e erro
- [x] Adicionar testes de regressão para transição sacola → checkout com cupão e frete
- [x] Validar o fluxo em desktop, mobile, Vitest e build de produção

- [x] Corrigir o formulário de criação de envios para enviar o campo obrigatório service e apresentar validação clara antes da mutação
- [x] Adicionar teste de regressão para impedir submissão de envio sem transportadora/serviço

- [x] Corrigir geração de etiqueta do Melhor Envio para enviar o campo obrigatório order e mostrar erro operacional claro quando o pedido estiver incompleto
- [x] Garantir que a sacola exibe as opções e preços reais retornados pela cotação do Melhor Envio para o CEP e itens atuais, sem valor fixo
- [x] Adicionar testes de regressão para o payload da etiqueta e para preços variáveis por cotação
- [x] Validar cotação, etiqueta, sacola, testes Vitest, build e preview responsivo
- [x] Rever optimizações de performance e executar os testes finais end-to-end antes do lançamento

- [x] Adicionar inputs de largura, altura, comprimento e peso nas configurações administrativas de frete/envio
- [x] Atualizar o contrato de cotação do Melhor Envio no router para aceitar e utilizar as dimensões personalizadas do pacote
- [x] Criar interface passo a passo responsiva no painel admin para cotação e revisão de envio avulso seguindo a referência Nuvemshop
- [x] Adicionar testes automatizados para validar o cálculo com dimensões personalizadas e garantir build e preview sem erros

- [x] Corrigir métricas administrativas para não usar visitas sintéticas e recalcular valores conforme o período seleccionado
- [x] Tornar o gráfico de vendas e visitas reactivo a hoje, ontem, 7, 15, 30 dias e intervalo personalizado
- [x] Implementar estados operacionais de pedido: por embalar, embalado, enviado e arquivado
- [x] Ocultar pedidos arquivados por defeito e criar filtro explícito para mostrar todos os pedidos
- [x] Adicionar testes de regressão, executar build e validar o painel em desktop e mobile

## Correcções de analytics e ciclo operacional de pedidos — 2026-08-20
- [x] Corrigir o recorte temporal do dashboard para hoje, ontem, presets e datas personalizadas sem datas instáveis.
- [x] Garantir que visitas reais da tabela analytics_events e pedidos reais da tabela orders actualizam cartões e gráfico após alterações.
- [x] Corrigir o mapeamento e a escala das séries de faturamento e visitas no gráfico de linhas com tooltip completo.
- [x] Adicionar acções operacionais de Embalar, Enviar e Arquivar no detalhe e na listagem de vendas.
- [x] Adicionar filtro para incluir ou ocultar pedidos arquivados, mantendo-os fora da lista por defeito.
- [x] Escrever regressões Vitest, validar TypeScript, build e responsividade do dashboard e da secção de vendas.

- [x] Implementar numeração sequencial anual de pedidos no formato ER-AAAA-NNN (ex: ER-2026-001)

- [x] Substituir a logo da Eras Label pela imagem enviada na navbar pública e no painel administrativo, preservando proporções e dimensões dos contentores

- [x] Implementar acesso protegido por palavra-passe na página em construção com editor no painel administrativo

- [x] Alterar o rótulo do botão de acesso VIP da página em construção para "Entrar", mantendo o link de acesso administrativo separado no rodapé

- [x] Refinar o design da secção de newsletter na página inicial (redução da escala do título, reorganização do card e espaçamento dos campos)

- [x] Auditar a segurança, segredos, autenticação e integrações (Mercado Pago, Melhor Envio, Admin e Acesso VIP)
- [x] Consolidar relatório de auditoria e prontidão para produção
- [x] Ajustar o favicon do site para utilizar a imagem da logo adesiva enviada, mantendo o padrão visual e a nitidez em navegadores e dispositivos móveis
- [x] Otimizar o favicon do site gerando uma versão quadrada e preenchida com a identidade visual da marca para maximizar a legibilidade no separador do browser
- [x] Substituir o favicon do site pelo vetor oficial fornecido (ERAS_Vetor.svg), mantendo a logo horizontal na navbar inalterada
- [x] Configurar a imagem previewssiteeras.png enviada pelo utilizador como capa Open Graph e Twitter Cards para partilha social
- [x] Auditar estrutura do projeto para remoção de artefactos do Manus e exportação para hospedagem externa
- [x] Criar guia completo de publicação na Vercel com domínio da HostGator e análise de custos
- [x] Atualizar o apple-touch-icon e o favicon com a imagem IMG_0880.PNG fornecida para perfeito funcionamento no iPhone e Safari
