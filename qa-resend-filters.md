# Relatório de QA: Filtros e Ordenação do Histórico Resend

## 1. Visão Geral da Funcionalidade
Foram implementados filtros avançados de busca por texto, filtragem por status (`sent`, `failed`, `skipped_not_configured`), filtragem por tipo de template e ordenação cronológica (mais recentes primeiro ou mais antigos primeiro) na aba **"E-mails (Resend)"** do painel administrativo.

## 2. Validação de Acessibilidade e Responsividade
- **Teclado:** Todos os campos de input e selects são totalmente navegáveis por tecla `Tab`, permitindo alternar rapidamente entre a pesquisa e os seletores sem perda de foco.
- **Layout Responsivo:** A barra de filtros utiliza um layout em grelha adaptável (`grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`), garantindo que em ecrãs móveis os controlos se organizem em coluna única sem causar overflow horizontal.
- **Estado Vazio Interativo:** Quando os filtros não retornam registos, a tabela exibe um aviso claro acompanhado de um botão de reinicialização rápida para limpar todos os critérios ativos num único clique.
