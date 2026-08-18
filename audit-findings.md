
## Auditoria inicial do storefront — 2026-08-18

A Home pública carregou com título “Eras Label - Loja Oficial”, anúncio rotativo, navbar global, hero editorial, secção Shop, bloco Eras na Rua, grupo VIP, newsletter e rodapé institucional. A navegação visível inclui Início, Produtos, Coleções, Camisetas, Bonés, conta e Sacola. O estado vazio da Shop é honesto quando não há secções publicadas pelo administrador.

A captura inicial mostrou um estado transitório de carregamento, mas a segunda visualização estabilizou corretamente com hero, conteúdo e rodapé. A página tem 3169 px abaixo do viewport, indicando uma Home longa; será necessário verificar no restante da auditoria se o peso visual e o carregamento das imagens permanecem aceitáveis em mobile.

A preview exibiu a faixa inferior de “Preview mode”, que é chrome do ambiente de preview e não deve ser tratado como conteúdo do site publicado.

### Catálogo

O catálogo carregou com uma grelha pública de produtos reais e links de detalhe. A rota `/catalog` mostra vários itens da coleção Paradox, com preço, imagem, coleção e CTA “Ver produto”; a profundidade da página excede 15 000 px, pelo que a quantidade de itens e imagens deve ser monitorizada para performance e paginação.

A navegação pública manteve anúncio, menu, pesquisa, conta, sacola e links de categorias. Durante a primeira captura apareceu o estado “A carregar a sua era”; na segunda, o catálogo estabilizou. A origem atual das imagens aparece como Unsplash em alguns produtos, o que deve ser substituído/confirmado com uploads reais antes do lançamento para evitar conteúdo de demonstração e dependência externa.

### Pesquisa global

A pesquisa global responde ao termo “camiseta” com dropdown de cinco sugestões e CTA “Ver todos os resultados”. O CTA navega para `/catalog?q=camiseta`, mas a listagem observada continua a apresentar o mesmo conjunto amplo de produtos; é necessário confirmar se o filtro está realmente a ser aplicado ao resultado, não apenas à URL. As miniaturas das sugestões exibiram ícones quebrados enquanto o catálogo usava imagens externas/legadas, indicando prioridade para normalizar URLs e fallback de imagens.

### Detalhe de produto

O detalhe carrega após o skeleton e apresenta galeria com três miniaturas, contador 01/03, preço normal, desconto Pix, parcelamento, frete grátis, accordions de pagamento/envio/detalhes e recomendações da mesma categoria/coleção. A composição está coerente com a estética editorial. Na verificação, não apareceu seletor de tamanho no conteúdo visível deste produto, embora o domínio suporte variações; é necessário confirmar se o produto real tem tamanhos configurados e se o CTA bloqueia compra sem a variação obrigatória. As três imagens atualmente apontam para a mesma imagem externa, o que reduz a qualidade percebida da galeria e deve ser corrigido com fotos reais no CMS.

### Sacola a partir do produto

O CTA “Comprar” adicionou o item sem erro, exibiu toast de confirmação e abriu a sacola lateral. O drawer mostrou quantidade, progresso de frete grátis (44%), cupom, CEP, métodos Pix/cartão, subtotal, economia Pix e CTA de checkout. O item apareceu como “Tamanho: U · Cor: Preto”. A imagem do item no drawer exibiu um caminho `/manus-storage/admin-uploads/front.jpg` que aparentou estar quebrado no browser, apesar da galeria usar imagem externa; é um problema de consistência de assets que deve ser tratado antes do lançamento. O fluxo de quantidade/remover e checkout ainda precisa ser percorrido até ao fim.
Fonte auditada: https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/produto/30001

### Checkout

O checkout terminou o carregamento e apresentou shell editorial consistente: identificação, entrega, pagamento Pix/cartão, resumo lateral, cupão e total. O CTA permanece bloqueado logicamente até preencher os dados, mas ainda não foi submetida uma transação. O resumo mostra novamente imagem quebrada em `/manus-storage/admin-uploads/front.jpg`, enquanto o item tem dados e preço corretos. O valor exibido com Pix no botão é R$ 147,16, ligeiramente diferente do cálculo textual de R$ 147,15 apresentado no detalhe, indicando arredondamento/formatação inconsistente que merece correção.
Fonte auditada: https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/checkout

### Validação de formulário e CEP

O preenchimento sintético dos campos foi aceite e o CEP 01001-000 acionou a procura de morada; o resumo passou de “A calcular” para frete de R$ 16,00 e o total Pix foi atualizado para R$ 163,16. O checkout indicou “A procurar a morada pelo CEP...” durante a operação. O CTA de pagamento ficou disponível após o preenchimento, mas não foi clicado para evitar uma transação. O teste confirmou a integração de cálculo do frete, porém reforça a necessidade de corrigir o asset de imagem quebrado e harmonizar o arredondamento do desconto Pix.
Fonte auditada: https://3000-i1vmpb2fupe7yq0wcir14-ca512cf4.us1.manus.computer/checkout

### Sacola global

A sacola global abre pela navbar e preserva o item após sair do checkout. O drawer tem fundo, X, progresso de frete (44%), controles de quantidade, remoção, cupão, CEP, Pix/cartão e CTA de checkout. O item exibido continua com imagem quebrada em `/manus-storage/admin-uploads/front.jpg`. O total em estado “frete a calcular” apresenta R$ 154,90 apesar de mostrar economia Pix de R$ 7,75; isso é potencialmente confuso e deve ser revisto para distinguir total no Pix de total no cartão. O CTA e os inputs são acessíveis no desktop.
Fonte auditada: Home pública com sacola aberta.

### Quantidade da sacola

O botão de aumentar quantidade atualizou o item de 1 para 2, o subtotal para R$ 309,80 e a barra de frete para 89%; ao diminuir, reverteu para 1 item, R$ 154,90 e 44%. A sincronização funciona e não reproduziu o loop React. A imagem continua quebrada, portanto o problema é de asset/URL, não do contador.
