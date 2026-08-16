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
