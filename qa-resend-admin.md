# Relatório de QA: Histórico Resend e Newsletter Aprimorada

## 1. Histórico de E-mails do Resend (Painel Administrativo)
- **Tabela de Logs:** Criada a tabela `resend_email_logs` para registar cada tentativa de envio (`sent` ou `failed`), incluindo destinatário, assunto, tipo de template, data e resposta detalhada do provedor.
- **Aba Dedicada:** No painel de administração (`/admin`), a nova aba **"E-mails (Resend)"** lista os envios em tempo real com indicador visual de status e botão para atualizar.
- **Tratamento de Estado Vazio:** Quando nenhum e-mail tiver sido disparado, a interface apresenta uma mensagem limpa orientando que os envios de pedidos, pagamentos e newsletters aparecem automaticamente.

## 2. Experiência de Newsletter Aprimorada
- **Feedback Visual de Carregamento:** O botão de subscrição exibe um indicador animado de progresso ("A subscrever...") e fica desativado durante a chamada para evitar cliques duplicados.
- **Mensagem de Sucesso e Cupom:** Ao concluir a inscrição, o formulário exibe uma caixa de confirmação destacada com o cupom de boas-vindas (`ERAS10`), além de uma notificação toast e a opção de subscrever outro endereço.
- **Validação Automática:** Testes unitários em Vitest cobrem o fluxo e a prevenção de envios duplicados para subscritores já cadastrados.
