# Auditoria de prontidão para lançamento — Eras Label

**Data:** 18 de agosto de 2026  
**Checkpoint avaliado:** `9053bb5e` — Refinamento Admin Atelier  
**Escopo:** arquitetura, rotas públicas, painel administrativo, identidade visual, integrações, testes e riscos de lançamento.

## Sumário executivo

A plataforma apresenta uma base sólida para operar como e-commerce de streetwear: o catálogo é orientado por dados, a Home e as páginas públicas partilham a mesma navegação e sacola global, o checkout transparente está ligado ao Mercado Pago, a logística possui integração com Melhor Envio, os e-mails usam Resend e o painel administrativo tem autenticação, permissões por módulo, CMS e operações de venda.

A rodada atual concluiu o refinamento do painel administrativo. O Pedido Manual e os Carrinhos Abandonados estão enquadrados em **Vendas & Clientes**, a aba de Categorias ganhou uma composição editorial com métricas, pesquisa, capas e subcategorias, e os controlos de banner deixaram de sobrepor a imagem. O acabamento global mantém o vermelho de marca `#b22222`, superfícies claras, tipografia editorial, estados de foco e scroll discreto.

Não foi identificado um bloqueador técnico P0 nesta auditoria. Antes de aceitar tráfego de produção, ainda é importante executar a validação operacional com produtos reais, credenciais reais e um pedido de baixo valor, além de tratar os riscos P1 relacionados a observabilidade, performance do bundle administrativo e confirmação de webhooks/logística em ambiente de produção.

## Evidências verificadas

| Área | Verificação | Resultado |
|---|---|---|
| Compilação | `pnpm exec tsc --noEmit` | Aprovado, sem erros de TypeScript |
| Testes | Vitest em 51 ficheiros | **152 testes aprovados** |
| Produção | `pnpm build` | Aprovado; frontend e servidor compilados |
| Rotas | Home, catálogo, coleções, manifesto, eventos, tracking, conta, pedidos, FAQ, contacto, privacidade, trocas, envios e admin | Todas responderam HTTP 200 no servidor local |
| Runtime | Logs recentes após reinício | Sem erros novos no navegador ou falhas de rede nos últimos registos |
| Responsividade | Painel em desktop 1280×720 e mobile 390×844 | Estrutura responsiva verificada; sem scroll horizontal no shell principal |
| Integrações | Variáveis de Mercado Pago, Melhor Envio e Resend | Variáveis presentes no runtime; os valores não foram expostos |
| Acessibilidade de movimento | Regras `prefers-reduced-motion` | Presentes no CSS global e nas secções refinadas |

## Arquitetura e segurança

A aplicação usa React 19 no cliente, Vite para o bundle, Express no servidor, tRPC 11 para contratos tipados e Drizzle ORM sobre MySQL. O router principal concentra procedimentos públicos, protegidos e administrativos, e o schema contém entidades para produtos, variações, categorias, relações produto-categoria, coleções, pedidos, carrinhos abandonados, notificações, logs do Resend, auditoria de inventário, administradores secundários, páginas CMS e menus personalizados.

As operações administrativas sensíveis usam `adminProcedure`. O painel bloqueia o acesso visual até à autenticação administrativa e o backend mantém a verificação de permissões. A gestão de equipa e as permissões por módulo estão separadas do acesso público. Não foram encontrados os valores das credenciais administrativas, tokens do Mercado Pago, Melhor Envio ou Resend no código de frontend, backend ou schema; os segredos continuam a ser fornecidos pelo ambiente.

A verificação encontrou a ocorrência histórica de uma mensagem `No procedure found on path "coupons.adminList"` em registos antigos. O router atual expõe `coupons.adminList`, o frontend usa o mesmo contrato e, após o reinício do servidor, a chamada não voltou a gerar erro. O episódio deve ser considerado resolvido no código atual, mas vale limpar ou arquivar logs históricos antes do lançamento para evitar falsos positivos na monitorização.

## Fluxos públicos

A navegação principal mantém **Início, Produtos, Coleções, Camisetas e Bonés**, com categorias e coleções provenientes do painel. O catálogo suporta pesquisa, filtros de tamanho e preço, páginas por categoria e páginas por coleção. A página de produto partilha a sacola global com a Home e as demais páginas públicas, apresenta galeria de imagens, variações e produtos similares.

A sacola lateral possui fundo opaco, animações de abertura e fechamento, controlo de quantidades, cupão, CEP, opções de frete, indicação de Pix e cartão e acesso ao checkout transparente. O checkout valida dados, suporta Pix e cartão via Mercado Pago, calcula parcelamento conforme configuração e apresenta uma página de sucesso com resumo. A área de tracking consulta o código de rastreio e os pedidos podem ser acompanhados na área da conta.

As páginas institucionais — manifesto, eventos, FAQ, contacto, política de privacidade, trocas e envios — partilham o shell público. O manifesto é editável com narrativa e imagens; eventos futuros podem ser criados pelo administrador com data, local, descrição, imagem, publicação e CTA.

## Painel administrativo

O painel está organizado em grupos recolhíveis: **Visão geral**, **Análise & Alertas**, **Vendas & Clientes**, **Catálogo**, **Marketing & E-mails**, **Aparência & CMS** e **Definições & Equipa**. A sidebar não mantém todos os itens abertos, possui scroll discreto e apresenta o cargo e as permissões do utilizador ativo.

Em **Vendas & Clientes**, a central de clientes apresenta atalhos para Pedido Manual e Carrinhos Abandonados. O pedido manual usa produtos e variações reais do catálogo, enquanto os carrinhos abandonados podem ser consultados com estado operacional. Em **Catálogo**, Produtos continua a ser o cadastro completo e Inventário funciona como atalho para quantidades por variação, incluindo alerta de stock baixo, auditoria e exportação.

Em **Aparência & CMS**, banners, mensagens de anúncio, secções da Home, manifesto, páginas institucionais, menus e destinos editáveis são administráveis. Os controlos de troca e remoção dos banners estão numa faixa externa ao preview; esta separação evita sobreposição e melhora a leitura, especialmente no mobile.

A aba de **Categorias** foi redesenhada com indicadores de total, categorias ativas e subcategorias, pesquisa, cards editoriais, capas e formulário separado. O CRUD, a ativação, as subcategorias e o upload persistente foram preservados.

## Identidade visual e experiência

A identidade mantém o vermelho `#b22222` como acento, fundos marfim, texto escuro e cartões claros com linhas suaves. As transições seguem o princípio de microinterações curtas, e existem regras de movimento reduzido para utilizadores que preferem menos animação. A Home pública mantém uma composição editorial de moda, enquanto o painel usa uma linguagem operacional mais limpa sem perder a assinatura da marca.

A revisão não encontrou avaliações, depoimentos ou ratings fabricados na experiência pública. Há apenas fallback técnico simulado no módulo de Mercado Pago para desenvolvimento local quando a credencial não está presente; esse fallback não deve ser usado para aceitar pedidos reais em produção.

## Classificação de risco

| Prioridade | Tema | Estado e recomendação |
|---|---|---|
| P0 | Segurança de acesso ao admin | Sem bloqueador identificado. Manter credenciais fora do código, testar logout e limitar contas secundárias por permissões. |
| P0 | Cobrança e confirmação de pagamento | Sem bloqueador estrutural identificado. Antes do lançamento, executar um pagamento real de baixo valor com webhook recebido e conciliação do pedido. |
| P0 | Exposição de dados do cliente | Sem evidência de exposição no código auditado. Confirmar HTTPS, cookies seguros, política de privacidade e acesso mínimo aos dados no ambiente publicado. |
| P1 | Performance do bundle | O build alerta chunks grandes: `Admin` aproximadamente 618 kB e bundle principal aproximadamente 643 kB minificados antes de gzip. Aplicar code-splitting adicional das secções do admin e carregamento sob demanda. |
| P1 | Observabilidade de integrações | Criar monitorização para webhook Mercado Pago, cotação/etiqueta Melhor Envio, e-mail Resend e erros de checkout, com alertas administrativos sem incluir tokens ou dados sensíveis. |
| P1 | Logística de produção | Validar em produção apenas PAC, SEDEX, Jadlog Econômico, Jadlog Rápido e Loggi, confirmar geração/download de etiqueta e testar rastreio com uma remessa real. |
| P1 | Stock e concorrência | Antes do lançamento, testar dois checkouts simultâneos da mesma variação para confirmar que o stock não fica negativo e que a reserva/baixa é transacional. |
| P1 | Conteúdo real | Substituir banners, produtos, preços, categorias, políticas e mensagens de teste pelos dados definitivos da Eras Label. Não publicar placeholders nem o fallback de pagamento simulado. |
| P2 | Performance percebida | Executar Lighthouse no domínio publicado, otimizar imagens reais e acompanhar LCP, INP, CLS e peso das páginas públicas. |
| P2 | SEO operacional | Confirmar sitemap, robots, canonical, títulos e descrições por produto/categoria e validar a indexação após apontar o domínio. |

## Recomendações de lançamento

A sequência recomendada é criar primeiro o catálogo real, definir stock e variações, rever preços Pix e frete grátis, inserir os textos institucionais definitivos e carregar os banners finais. Depois, deve-se validar o ambiente de produção do Mercado Pago com Pix e cartão, confirmar o webhook e conferir a mudança de estado do pedido. Em seguida, testar a cotação, a etiqueta e o rastreio do Melhor Envio usando exclusivamente os serviços permitidos pela operação da marca.

Antes de substituir o domínio oficial atual, é prudente manter uma janela de homologação, configurar o domínio personalizado no painel, validar DNS e SSL, testar checkout e e-mails num endereço real e só então alterar o apontamento. O domínio antigo deve permanecer disponível durante a transição para permitir rollback operacional.

## Conclusão

O projeto encontra-se tecnicamente preparado para a fase de homologação real e apresenta uma experiência coerente com a direção premium/editorial definida para a Eras Label. O painel administrativo desta rodada está organizado, visualmente mais consistente e com as funções solicitadas nos grupos corretos. O lançamento comercial deve aguardar a validação de produção das integrações, a entrada do catálogo real e a redução do bundle administrativo, classificados como prioridades P1 de operação e qualidade.
