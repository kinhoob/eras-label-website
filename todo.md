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

- [ ] Validar manualmente o estado de erro do checkout (submissão falha) e registrar a evidência do feedback recuperável exibido ao usuário
- [ ] Validar manualmente o fluxo completo de checkout em viewport mobile, incluindo abertura do modal, processamento e sucesso ou erro
