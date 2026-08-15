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
  - [x] Implementar menu lateral com categorias e coleções para desktop e mobile
  - [x] Sincronizar comportamento exato do menu desktop/mobile com a referência Lovable
  - [x] Ajustar animação de ampulheta para estado de transição real
  - [x] Executar build de produção para validação completa

- [x] 11. **Navegação por Páginas Reais e Transição de Ampulheta (0.5s)**
  - [x] Criar rotas dedicadas para cada item do menu (Início, Arquivo de Eras, Manifesto, Eventos, Contato, Categorias e Coleções)
  - [x] Refatorar o menu lateral em componente compartilhado entre todas as páginas (desktop e mobile)
  - [x] Corrigir erros de exportação duplicados no schema Drizzle para limpar o servidor de desenvolvimento
  - [x] Validar todas as rotas e sons com build e testes limpos


## Melhoria solicitada — checkout e pagamento

- [x] Melhorar o checkout com animação de carregamento durante a confirmação do pagamento
- [x] Exibir mensagem de sucesso clara após a confirmação do pagamento
- [x] Exibir feedback de erro recuperável quando a confirmação falhar
- [x] Validar o fluxo de checkout em desktop e mobile
- [x] Criar testes Vitest para os estados do fluxo de confirmação do pagamento


## Validações adicionais identificadas

- [x] Validar manualmente o fluxo de checkout em desktop e mobile, incluindo abertura do modal, processamento, sucesso e erro
- [x] Ampliar os testes automatizados para cobrir a transição real entre os estados processing, success e error


## Gaps de validação encontrados

- [x] Validar manualmente o estado de erro do checkout (submissão falha) e registrar a evidência do feedback recuperável exibido ao usuário
- [x] Validar manualmente o fluxo completo de checkout em viewport mobile, incluindo abertura do modal, processamento e sucesso ou erro


## Melhoria solicitada — resumo detalhado do pedido na confirmacao

- [x] Preservar os dados do pedido confirmado para exibir itens, quantidades e valores na tela de sucesso
- [x] Exibir subtotal, descontos, frete, total e metodo de pagamento no resumo
- [x] Exibir prazo estimado de entrega de forma clara e responsiva
- [x] Criar testes Vitest para o calculo e a apresentacao dos dados do resumo
- [x] Validar TypeScript, build e layout responsivo da confirmacao


## Melhoria solicitada — checkout moderno e animado

- [x] Modernizar o cabeçalho e a hierarquia visual do modal de checkout
- [x] Melhorar campos, seleção de pagamento, resumo e ações principais
- [x] Adicionar microinterações suaves para entrada, foco, hover, progresso e confirmação
- [x] Preservar acessibilidade e reduzir animações com prefers-reduced-motion
- [x] Validar TypeScript, testes, build e responsividade do checkout


## Ajustes complementares do redesign

- [x] Modernizar visualmente a selecao de pagamento (chips Pix e Cartao) para alinhar ao novo checkout
- [x] Ajustar os botoes de acao secundaria da confirmacao para manter consistencia visual
- [x] Validar a selecao de pagamento e as acoes da confirmacao em desktop e mobile


## Validacao complementar da confirmacao

- [x] Validar visualmente e funcionalmente os botoes da confirmacao (checkout-success-actions) em desktop e mobile
- [x] Avancar o QA automatizado ate o estado de sucesso e confirmar a presenca e o layout dos CTAs


## Validacao funcional dos CTAs

- [x] Clicar em ACOMPANHAR PEDIDO no desktop e mobile e verificar a navegacao para a conta
- [x] Clicar em CONTINUAR COMPRANDO no desktop e mobile e verificar o fechamento do modal e retorno ao fluxo


## Ajuste solicitado — Home, ampulheta e páginas institucionais

- [x] Comparar a animação de ampulheta atual com a referência do Lovable
- [x] Reproduzir o comportamento visual e a duração da ampulheta de acordo com a referência
- [x] Simplificar a Home para manter apenas produtos e categorias
- [x] Remover manifesto e eventos da Home sem apagar suas rotas próprias
- [x] Validar navegação, responsividade, TypeScript, testes e build


## Réplica da Referência Autenticada do Lovable

- [x] Auditar a estrutura e as páginas da referência autenticada no Lovable
- [x] Mapear fontes, abas, transições e a animação de ampulheta exata
- [x] Simplificar a Home da Eras Label para exibir exclusivamente produtos e categorias
- [x] Isolar Manifesto e Eventos em páginas dedicadas com roteamento próprio
- [x] Reproduzir o menu lateral unificado (desktop e mobile) idêntico ao Lovable
- [x] Validar rotas, responsividade, testes e build de produção limpos


## Melhoria solicitada — site oficial Eras Label

- [x] Modelar dados para banner rotativo editável, destaques e banner VIP com hover no painel administrativo
- [x] Implementar banner rotativo com troca de imagens editável na Home
- [x] Adicionar seção de destaques ("Destaques da Era") na Home
- [x] Adicionar banner com hover de aproximação e link para o grupo VIP na Home
- [x] Adicionar dropdown de coleções com hover no menu de navegação
- [x] Adicionar botão flutuante de rolar para cima (voltar ao topo)
- [x] Atualizar o rodapé para seguir o padrão oficial da marca
- [x] Validar rotas, responsividade, testes e build de produção


## Gaps de implementacao e QA identificados

- [x] Adicionar modelagem persistente e UI no Admin para configurar a secao de destaques da Home
- [x] Validar manualmente em desktop e mobile o carrossel, destaques, banner VIP, rodape, voltar ao topo, dropdown de colecoes e links/rotas
- [x] Registrar evidencias da validacao manual antes do checkpoint final

- [x] Validar manualmente por interação, em desktop e mobile, o dropdown de Coleções (hover, foco e clique), o botão voltar ao topo e os links/rotas principais da Home
- [x] Atualizar qa-home-findings.md com evidências explícitas das interações validadas antes do checkpoint final

- [x] Validar manualmente em viewport mobile o menu de Coleções, o botão Voltar ao topo e pelo menos uma rota/link principal da Home, registrando o resultado observado
- [x] Validar explicitamente no desktop o dropdown de Coleções por hover e por foco de teclado, além do clique já testado
- [x] Atualizar qa-home-findings.md com evidências separadas de desktop e mobile, incluindo cada interação executada e o resultado

- [x] Validar manualmente em viewport mobile visível no navegador a abertura do menu de Coleções, o botão Voltar ao topo e um link principal, documentando passos e resultado
- [x] Validar explicitamente no desktop a abertura do dropdown de Coleções por hover, além do foco e clique já cobertos
- [x] Completar qa-home-findings.md com a seção desktop de hover e uma seção mobile com interação manual visível

## Refinamento do Rodapé (Remoção da Newsletter e Ícones Sociais)
- [x] Remover a caixa de subscrição de newsletter do rodapé da Home
- [x] Substituir os textos de Instagram e TikTok por ícones visuais interativos no rodapé
- [x] Validar o layout do rodapé em desktop e mobile
- [x] Guardar checkpoint e entregar as alterações

- [x] Validar visualmente no navegador o rodapé atualizado em desktop, confirmando ausência da newsletter, alinhamento das colunas e ícones sociais clicáveis
- [x] Validar no navegador em viewport mobile real o rodapé atualizado, confirmando ausência da newsletter, alinhamento/empilhamento das colunas, espaçamento e legibilidade
- [x] Registrar em qa-home-findings.md as evidências da validação do rodapé após a remoção da newsletter e troca para ícones sociais

- [x] Entregar ao usuário a atualização do rodapé utilizando o checkpoint 4dee36d5

## Correção do Link VIP e Dropdown de Coleções
- [x] Atualizar o link do Grupo VIP no menu lateral e no banner da Home com `https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t`
- [x] Corrigir o comportamento e o posicionamento do dropdown de Coleções no desktop e no mobile
- [x] Validar o funcionamento das coleções e do acesso VIP no navegador
- [x] Guardar checkpoint e entregar a correção

- [x] Validar no navegador desktop e mobile o dropdown/menu de Coleções após a correção, cobrindo abertura, posicionamento, links e fechamento
- [x] Verificar que o problema visual não persiste após ajustar JSX/CSS/handlers do dropdown de Coleções na Home e no menu mobile, com evidências em QA

- [x] Validar no navegador, após a correção final, o clique do link VIP a partir do menu e do banner da Home, registrando a navegação observada
- [x] Executar validação interativa desktop do dropdown de Coleções após o ajuste final, cobrindo hover/foco/clique, posicionamento e fechamento com evidência em QA
- [x] Executar validação interativa mobile do menu de Coleções após o ajuste final, cobrindo abertura, clique em pelo menos uma coleção, retorno e fechamento, com evidência em QA
- [x] Atualizar qa-vip-collections.md com provas explícitas do dropdown/menu aberto e funcionando após o último ajuste visual

- [x] Entregar ao usuário a correção do link VIP e do dropdown de Coleções com o checkpoint `66c9bb5b` anexado

## Redução do Tamanho dos Produtos na Página Inicial
- [x] Ajustar o grid e o aspect-ratio dos cards de produtos na Home para exibi-los menores e mais refinados
- [x] Validar o novo tamanho dos produtos em desktop e mobile
- [x] Guardar checkpoint e entregar a alteração


## Navbar reaparece ao parar o scroll
- [x] Fazer a navbar reaparecer automaticamente quando o utilizador parar de fazer scroll
- [x] Preservar acesso ao menu, sacola, conta e links principais em desktop e mobile
- [x] Animar a entrada/saída da navbar sem causar deslocamento ou overflow no conteúdo
- [x] Validar o comportamento em desktop e mobile, incluindo scroll contínuo e pausa
- [x] Guardar checkpoint e entregar a atualização


## Imagens persistentes e transição da navbar
- [x] Ligar banners da Home aos URLs persistentes gerados pelo upload do painel administrativo
- [x] Ligar todas as imagens dos produtos aos uploads persistentes, preservando múltiplas fotos e fallback seguro
- [x] Confirmar que alterações feitas no Admin são refletidas na Home e nas vistas de produto sem hardcodes de imagens
- [x] Refinar a animação de reaparecimento da navbar para uma transição suave e acessível
- [x] Validar uploads, renderização de imagens, navbar e responsividade em desktop e mobile
- [x] Guardar checkpoint e entregar as melhorias


## Zoom de produtos e contador da Sacola
- [x] Adicionar zoom suave nas imagens dos cards de produto ao passar o rato, sem alterar a grelha
- [x] Garantir que o zoom respeita overflow, toque mobile e movimento reduzido
- [x] Adicionar contador visual acessível na Sacola da navbar com a quantidade total de itens
- [x] Atualizar o contador instantaneamente ao adicionar, remover ou alterar quantidades no carrinho
- [x] Validar a interação em desktop e mobile e cobrir a lógica com testes
- [x] Guardar checkpoint e entregar as melhorias


## Feedback e persistência da Sacola
- [x] Persistir os itens da Sacola no armazenamento local com leitura segura ao iniciar
- [x] Guardar alterações da Sacola ao adicionar, remover e alterar quantidades
- [x] Adicionar estado visual animado de confirmação no botão de adicionar à Sacola
- [x] Exibir toast breve com o nome do produto adicionado
- [x] Respeitar movimento reduzido e preservar a acessibilidade do feedback
- [x] Validar persistência após recarregar, toast, animação e regressões em desktop/mobile
- [x] Guardar checkpoint e entregar as melhorias


## Sacola lateral e gestão direta
- [x] Consolidar painel lateral deslizante da Sacola com abertura pela navbar e fecho por botão, overlay e Escape
- [x] Adicionar controlos acessíveis para aumentar e diminuir quantidades diretamente na Sacola
- [x] Adicionar remoção de itens diretamente na Sacola com feedback visual e desfazer quando aplicável
- [x] Atualizar subtotal, descontos, frete e total em tempo real após cada alteração
- [x] Preservar alterações na persistência local e sincronizar o contador da navbar
- [x] Validar a experiência em desktop e mobile e cobrir as operações com testes
- [x] Guardar checkpoint e entregar a melhoria


## Finalização e visualização rápida
- [x] Consolidar botão de finalizar compra na Sacola com encaminhamento claro para o checkout
- [x] Garantir que a Sacola fecha e o checkout abre sem perder itens, totais ou método de pagamento escolhido
- [x] Criar ou refinar modal de visualização rápida com imagem, nome, preço, descrição, tamanhos e disponibilidade
- [x] Permitir adicionar o produto diretamente à Sacola a partir da visualização rápida
- [x] Garantir fecho por botão, overlay e Escape, com foco e movimento reduzido respeitados
- [x] Validar fluxos de Sacola, checkout e visualização rápida em desktop e mobile com testes
- [x] Guardar checkpoint e entregar a melhoria


## Sucesso da compra, relacionados e validação do checkout
- [x] Criar ou consolidar uma confirmação de compra com resumo do pedido e botão Continuar a comprar
- [x] Garantir que o resumo mostra itens, quantidades, subtotal, descontos, frete, método de pagamento e total
- [x] Adicionar produtos relacionados no modal de visualização rápida com abertura de outro produto sem sair da Home
- [x] Validar nome, e-mail, telefone, CPF, CEP e morada antes de permitir finalizar o checkout
- [x] Mostrar mensagens de erro claras junto aos campos inválidos e impedir submissões incompletas
- [x] Validar os fluxos de erro, sucesso, recomendados e responsividade com testes
- [x] Guardar checkpoint e entregar a melhoria


## Filtros avançados e preenchimento automático por CEP
- [x] Adicionar barra de filtros na loja para tamanho, cor e faixa de preço
- [x] Filtrar produtos de forma combinada, com limpeza individual e botão para limpar tudo
- [x] Mostrar contagem de resultados e estado vazio quando nenhum produto corresponder
- [x] Garantir que os filtros funcionam em desktop, mobile e com catálogo carregado do backend
- [x] Consultar um serviço público de CEP apenas após oito dígitos válidos e preencher rua, bairro, cidade e estado
- [x] Mostrar carregamento, erro e possibilidade de edição manual após a consulta de CEP
- [x] Validar filtros e preenchimento automático com testes unitários e QA responsivo
- [x] Guardar checkpoint e entregar a melhoria


## Lacunas de QA dos filtros e CEP
- [x] Validar limpeza individual explícita de cada filtro, além do botão global
- [x] Testar e documentar o estado vazio quando nenhum produto corresponde aos filtros
- [x] Validar funcionalmente os filtros em mobile real e confirmar dados carregados do backend
- [x] Cobrir no QA os estados loading e erro do CEP e comprovar edição manual posterior
- [x] Executar TypeScript, Vitest e build após esta rodada e registar as saídas
- [x] Guardar um checkpoint novo após resolver todas as lacunas

## Pesquisa inteligente
- [x] Mapear a navegação atual e o catálogo real para a pesquisa
- [x] Implementar barra de pesquisa com preenchimento automático e resultados ligados ao catálogo
- [x] Validar teclado, Escape, clique, mobile e estado sem resultados
- [x] Executar testes, atualizar documentação e guardar checkpoint da pesquisa

Todos os itens acima devem ser marcados como concluídos após a validação final.
