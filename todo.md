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
- Plataforma de e-commerce da Eras Label totalmente implementada, auditada, com cobertura de testes (51 testes unitários aprovados), build de produção otimizado e rotas lazy validadas.

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

> Nota: a senha fornecida pelo proprietário deve ser armazenada como segredo de ambiente e nunca como texto literal no frontend ou no repositório.

## Pendências adicionais do painel (a executar depois da segurança)
- [ ] Implementar histórico de buscas recentes no armazenamento local
- [ ] Implementar segmentação de campanhas de e-mail por coleção
- [ ] Preparar mapeamento do domínio próprio eraslabel.com para o lançamento oficial

> As pendências adicionais serão tratadas após a autenticação do painel estar protegida.
