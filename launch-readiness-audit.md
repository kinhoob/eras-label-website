# Auditoria de prontidão para lançamento — Eras Label

## Veredito executivo

A Eras Label está visualmente muito próxima de uma loja publicável e possui um conjunto sólido de funcionalidades: catálogo, páginas editoriais, carrinho, checkout transparente, Mercado Pago, cotação Melhor Envio, painel administrativo, dark mode, PWA, guia de tamanhos por produto e alertas de estoque. A suíte atual foi validada com 47 testes, TypeScript sem erros e build de produção concluído.

Apesar disso, **eu não classificaria o projeto como 100% pronto para receber vendas reais fora do ambiente atual**. Existem alguns pontos técnicos que devem ser resolvidos antes do primeiro lançamento, sobretudo a revalidação server-side de descontos e frete, a remoção do fallback simulado do Mercado Pago e a decisão entre manter os serviços Manus ou adaptar autenticação/storage para a Vercel.

## O que está forte e funcional

| Área | Estado observado |
|---|---|
| Storefront | Home, catálogo, categorias, coleções, produto, manifesto, eventos, contato, tracking, políticas e página 404 com identidade visual consistente. |
| Catálogo | Produtos esgotados continuam visíveis e são enviados para o fim da ordenação; filtros de tamanho, preço, categoria e ordenação estão presentes. |
| Produto | Galeria, troca para segunda imagem, produtos relacionados, guia de tamanhos individual e selo de estoque sem revelar quantidade exata. |
| Estoque | 1 unidade mostra “ÚLTIMA PEÇA”; 2–5 mostram “POUCAS UNIDADES”; 6 ou mais não exibem alerta. A tag não intercepta o CTA. |
| Carrinho/checkout | Drawer responsivo, resumo mobile, cupom, CEP, opções de frete, previsão de entrega, PIX com expiração/regeneração e cartão. |
| Admin | Produtos, variações por tamanho, categorias, coleções, banners, CMS, cupons, promoções, pedidos, envios, clientes, newsletter, estatísticas e página em construção. |
| Pagamentos | Integração real com Mercado Pago, idempotência, mensagens de recusa e webhook assinado. |
| Logística | Cotação Melhor Envio, dimensões/peso do pacote e fluxo de geração/download de etiqueta estão estruturados. |
| Qualidade visual | QA desktop/mobile em claro/escuro sem overflow relevante ou “light leaks” observados nas páginas públicas auditadas. |

## Bloqueadores antes de vender oficialmente

### 1. Checkout não deve confiar em desconto e frete enviados pelo navegador

Em `server/routers.ts`, a procedure pública `checkout.create` recalcula os preços dos produtos no banco, o que é positivo. Porém, `discount` e `shippingCost` ainda chegam do cliente e são usados no total server-side. Um utilizador pode manipular a requisição para enviar um desconto maior ou frete zero sem que o servidor valide novamente o cupom e a cotação escolhida.

**Correção necessária:** enviar o código do cupom e o identificador da opção de frete; recalcular ambos no servidor, validar escopo, validade, limite de uso, primeira compra e frete grátis; rejeitar qualquer diferença entre o valor calculado e o valor recebido.

### 2. O número do pedido deve ser gerado exclusivamente no servidor

A interface pública aceita `orderNumber` opcional e há um fallback aleatório no checkout. O banco possui uma função de sequência anual em `server/db.ts`, mas a geração baseada em “consultar maior número e somar um” pode sofrer colisão em dois pedidos simultâneos.

**Correção necessária:** ignorar qualquer número enviado pelo cliente, gerar `ER-AAAA-001` no servidor e proteger a sequência com transação/lock ou tabela de contador anual. O formato esperado deve ser uniforme em checkout, pedido manual, notificações e webhooks.

### 3. O fallback simulado do Mercado Pago precisa ser bloqueado em produção

`server/mercadopago.ts` retorna PIX mockado e cartão aprovado quando `MP_ACCESS_TOKEN` está ausente. Isso é útil em desenvolvimento, mas perigoso numa migração: uma configuração incompleta poderia parecer um pagamento válido.

**Correção necessária:** em `NODE_ENV=production`, falhar imediatamente se as credenciais não existirem, impedir criação de pedidos pagos em modo mock e adicionar uma verificação de ambiente no arranque/healthcheck.

### 4. Vercel não é uma migração direta do projeto atual

O projeto usa Express como processo principal, tRPC, callback OAuth Manus e storage baseado em `BUILT_IN_FORGE_API_URL`/`BUILT_IN_FORGE_API_KEY`, com imagens servidas por `/manus-storage/*`. O login também depende do SDK OAuth Manus.

**Implicação:** é possível usar Vercel, mas será necessário adaptar o backend para funções compatíveis e decidir se autenticação e storage continuarão dependentes dos serviços Manus. Se a prioridade for lançar rapidamente, o caminho de menor risco é manter a hospedagem atual e ligar um domínio próprio. Se a prioridade for Vercel, essa migração deve ser tratada como uma fase técnica separada, não como simples importação do repositório.

### 5. Sitemap e SEO possuem inconsistências reais

`client/index.html` usa canonical e Open Graph fixos para `www.eraslabel.com` e a imagem social ainda aponta para uma URL de preview Manus. Em `server/sitemap.ts`, os produtos são gerados como `/product/{id}`, enquanto o frontend navega para `/produto/{slug}`. Além disso, o sitemap filtra status `published`, enquanto o fluxo de compra usa `active`.

**Correção necessária:** definir o domínio final por configuração, substituir a imagem social por asset estável, alinhar as rotas do sitemap com as rotas reais (`/produto/{slug}`), revisar o status indexável e criar metadados por produto/categoria. Sem isso, partilhas e indexação podem apontar para URLs incorretas.

### 6. O webhook do Melhor Envio ainda não sincroniza estados

O endpoint `/api/melhor-envio/webhook` responde 200 e registra o evento, mas não atualiza automaticamente o envio/pedido. O acompanhamento pode depender de intervenção manual.

**Correção necessária:** validar o evento, localizar o envio pelo identificador, atualizar status/rastreio no banco de forma idempotente e criar notificações para “em trânsito”, “entregue”, “devolvido” e falhas.

## Pontos importantes antes do lançamento

| Prioridade | Item | Ação recomendada |
|---|---|---|
| P1 | Webhooks | Configurar URLs finais, segredos, validação, idempotência e logs sem dados sensíveis. |
| P1 | Produção | Confirmar `MP_ACCESS_TOKEN`, chave pública, segredo do webhook, token/clientes Melhor Envio, Resend, banco e storage no ambiente final. |
| P1 | Teste real | Fazer uma compra controlada com PIX, cartão aprovado, cartão recusado, expiração/regeneração PIX, cupom, frete grátis, frete pago e etiqueta. |
| P1 | Privacidade | Rever LGPD, consentimento da newsletter, retenção de CPF/endereço, política de trocas e responsável pelo tratamento. |
| P1 | Contingência | Criar backup do banco, procedimento de conciliação manual e alerta para webhook perdido/pagamento pendente. |
| P2 | Notificações | Testar no iPhone real permissões, instalação PWA, venda nova, pagamento aprovado e baixo estoque; confirmar que o serviço push está configurado no ambiente final. |
| P2 | Monitoramento | Adicionar rastreamento de erros server-side, métricas de latência, falhas de pagamento, cotação e envio. |
| P2 | Performance | Otimizar imagens grandes, confirmar lazy loading, revisar fontes externas e medir LCP/CLS/INP em 4G móvel. |
| P2 | Acessibilidade | Repassar foco de modais/drawers, labels, contraste, teclado, leitores de tela e estados de erro do checkout. |
| P3 | Conteúdo | Preencher produtos, guias, categorias, coleções, banners, eventos, políticas e dados de remetente antes do go-live. |

## Decisão recomendada

**Para publicar mais cedo:** manter o backend atual, usar a hospedagem integrada com domínio próprio, corrigir primeiro a validação server-side do checkout, bloquear mocks, alinhar SEO e implementar a sincronização Melhor Envio.

**Para usar Vercel:** primeiro criar uma branch de migração, substituir/adaptar Express, OAuth Manus e storage Manus, configurar banco e assets independentes, validar webhooks no domínio de staging e só então alterar DNS. Não recomendo apontar o domínio principal para a Vercel antes desses testes.

## Conclusão

A base visual e funcional está bem encaminhada, mas a resposta honesta é: **falta uma camada final de endurecimento de produção**. Os seis bloqueadores acima são mais importantes do que novas melhorias estéticas. Resolvidos eles, com uma compra real controlada e revisão jurídica mínima, a Eras Label estará em posição muito mais segura para abrir o domínio ao público.
