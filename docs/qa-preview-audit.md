# Auditoria técnica do preview — Eras Label

**Data da revisão:** 20 de agosto de 2026  
**Ambiente:** preview do projeto `eras-label-website`  
**Objetivo:** validar os fluxos públicos, administrativos, pagamentos, logística e proteção contra dados fictícios sem executar alterações destrutivas adicionais.

## Verificações concluídas

A suíte completa Vitest foi executada com `ERAS_TEST_MODE=1` e terminou sem falhas. O build de produção com Vite e esbuild também foi concluído. O teste específico de Melhor Envio confirma que o payload enviado ao endpoint `/me/cart` usa o campo obrigatório `service` e rejeita `serviceId` inválido antes de chamar a API.

O catálogo público não possui fallback de produtos fictícios na Home. Os estados vazios continuam visuais e editoriais, mas não persistem produtos, pedidos ou clientes. Produtos públicos esgotados continuam listados e são ordenados no final conforme a regra do catálogo.

A transição sacola → checkout preserva o cupão, o desconto validado, o frete grátis quando aplicável, a transportadora escolhida e o custo de envio. O checkout não precisa de uma segunda confirmação quando esses dados continuam válidos.

O estado de pagamento Mercado Pago é separado do estado operacional do pedido: o histórico do cliente e o painel administrativo exibem pagamento aprovado independentemente de o pedido ainda estar em preparação. A reconciliação Pix e o webhook mantêm pedidos legitimamente pendentes sem os promover artificialmente.

As consultas de contagem comercial foram realizadas apenas em modo de leitura. Não foram executadas exclusões adicionais, seeds, migrações destrutivas ou criação manual de clientes/produtos durante esta auditoria.

## Limites do preview

O preview não substitui a validação de domínio público. O webhook do Melhor Envio precisa de uma URL pública estável e acessível para o registo definitivo; o domínio oficial `www.eraslabel.com` deve ser apontado apenas depois da aprovação dos testes no preview. A publicação do domínio e a confirmação final dos webhooks continuam a ser etapas de lançamento, não alterações executadas nesta revisão.

A autenticação de produção, a entrega real de e-mails e a autorização de pagamentos devem ser confirmadas com uma transação controlada pelo proprietário no ambiente publicado. Os testes automatizados usam isolamento para não gravar dados comerciais no banco partilhado.

## Critérios de aceite para o lançamento

| Área | Critério verificável | Estado |
|---|---|---|
| Catálogo | Produtos públicos, inclusive esgotados, aparecem em todos os produtos, categorias e coleções | Validado |
| Sacola | Cupão e frete validados seguem para o checkout sem confirmação duplicada | Validado |
| Pagamento | Pagamento aprovado não é apresentado como pagamento pendente; preparação permanece separada | Validado |
| Logística | Payload de etiqueta envia `service` ao Melhor Envio e bloqueia serviço inválido | Validado |
| Dados | Testes não criam dados comerciais fora do modo isolado | Validado |
| Preview | Build e suíte Vitest concluídos sem falhas | Validado |
| Domínio | URL pública estável e webhooks definitivos registados após publicação | Pendente de publicação |

## Próximo passo recomendado

Publicar apenas depois de o proprietário confirmar a revisão visual e realizar uma compra controlada com credenciais de produção. Em seguida, apontar o domínio, registar os webhooks no endereço público e repetir a confirmação de pagamento, e-mail e etiqueta sem apagar dados reais.

## Modelo operacional

| Ambiente | Uso | Proteção e responsabilidade |
|---|---|---|
| Preview | Validação visual, funcional e de integração antes do lançamento | Testes executados com `ERAS_TEST_MODE=1`; não deve ser tratado como confirmação final de domínio ou entrega ao cliente |
| Sandbox | Testes controlados de pagamento e logística sem cobrança/etiqueta de produção | Deve usar credenciais e endpoints de teste quando disponíveis; nunca misturar fixtures com dados comerciais reais |
| Produção | Compras, pagamentos, e-mails, webhooks e etiquetas reais | Exige publicação, domínio público estável, segredos de produção e transação controlada pelo proprietário |

A suíte automatizada deve manter o modo isolado por padrão. Testes de pagamento que consultem serviços externos ficam separados e opt-in; qualquer teste de produção deve ser executado manualmente pelo proprietário, nunca durante `pnpm test`.

## Verificação pós-restart

Após o restart do servidor, o processo voltou a iniciar em `http://localhost:3000/` com TypeScript sem erros. Os logs recentes do browser mostram apenas a ligação do Vite, inicialização do coletor e React DevTools; não há novo erro de parser do `PublicCartDrawer`. O encerramento `ELIFECYCLE` observado imediatamente antes do restart foi transitório e não se repetiu no arranque seguinte. O aviso de `baseline-browser-mapping` é informativo e não bloqueia a aplicação.

## Estado resumido dos módulos administrativos

| Módulo | Estado no preview |
|---|---|
| Dashboard, métricas e notificações | Validado com estados vazios honestos, filtros de período e alertas controlados |
| Produtos, categorias e coleções | Validado com publicação, não listado, oculto, stock por tamanho, preço e associação editorial |
| Vendas, pedidos e pagamentos | Validado com estados de pagamento separados da preparação e detalhe do pedido |
| Envios e Melhor Envio | Validado com cotação, etiqueta e payload `service`; domínio público continua pendente para o registo definitivo |
| Marketing, cupões e promoções | Validado com regras de primeira compra, frete grátis, descontos e persistência no checkout |
| CMS, aparência, eventos e Archive | Validado com edição de textos, imagens/links e pré-visualização |
| Clientes, contactos e newsletter | Validado com separação de tipos, histórico e exportação |
| Definições, equipa e segurança | Validado com acesso protegido e credenciais fora do frontend |

A revisão visual mantém a identidade editorial Eras, o acento `#b22222`, tipografia leve nos títulos, hierarquia consistente e estados responsivos para desktop e mobile. Labels administrativos e públicos usados nos fluxos auditados permanecem em português; qualquer texto editorial adicional continua editável pelo administrador.

## Resumo de entrega

| Classificação | Itens |
|---|---|
| Pronto no preview | Catálogo, carrinho, cupão/frete → checkout, pagamentos, reconciliação Pix, Melhor Envio, Admin, testes e build |
| Pendente de publicação | Apontar `www.eraslabel.com`, registar webhooks definitivos e repetir uma compra controlada no domínio público |
| Bloqueado por decisão do proprietário | Publicar o site, alterar o domínio oficial ou apagar dados ambíguos sem confirmação explícita |

## Observação de performance

O build de produção concluiu em 4,42 s sem falhas. Os chunks públicos e administrativos estão comprimidos, mas o bundler sinalizou dois bundles acima de 500 kB: `index` com 650,77 kB e `Admin` com 743,03 kB (97,36 kB gzip). Isto não bloqueia o lançamento, porém recomenda-se uma próxima etapa de code-splitting/dynamic import das rotas administrativas e componentes pesados para reduzir o JavaScript inicial.

A revisão dos logs recentes após o restart não encontrou novos erros de aplicação ou TypeScript. O histórico ainda contém a ocorrência antiga de parser error anterior ao restart; ela deve ser interpretada como histórico, não como erro ativo.

## Declaração de conteúdo e NF-e

A plataforma mantém o fluxo de envio e etiquetas do Melhor Envio, mas não deve ser apresentada como emissora de NF-e ou declaração de conteúdo automática sem um provedor fiscal, credenciais e requisitos tributários definidos pelo proprietário. Este item fica **bloqueado por decisão/configuração do proprietário**, e não por erro do checkout ou do Melhor Envio. A operação pode continuar com a geração de etiquetas já validada, enquanto a emissão fiscal permanece uma integração futura separada.

## SEO durante o preview

Durante o preview, o sitemap e os metadados de canonical/Open Graph devem ser tratados como provisórios. A validação definitiva de URLs absolutas, indexação e domínio canónico só deve ocorrer depois de o domínio oficial estar publicado e apontado para a aplicação. Nenhum bloqueio de checkout, catálogo ou painel administrativo depende desses valores enquanto o ambiente de preview estiver em uso.
