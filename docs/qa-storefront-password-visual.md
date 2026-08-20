# QA visual — acesso por palavra-passe da página em construção

## 20 de Agosto de 2026

A verificação desktop do storefront e do painel administrativo foi concluída após integrar o estado de desbloqueio e o formulário público. A navbar pública mantém o layout e a sidebar administrativa mantém os seus cartões, filtros e navegação sem deslocamentos visíveis. A página em construção não estava activa nesta configuração de preview, portanto a validação do formulário em estado bloqueado foi coberta pelos testes do helper e pelo build; deve ser confirmada manualmente depois de activar o modo no painel.

Não foram observados erros de TypeScript no servidor de desenvolvimento. O build de produção e os testes específicos do acesso por palavra-passe foram executados com sucesso.

## Verificação mobile

A viewport de 390 × 844 px foi verificada para a Home e para o painel. A navbar pública mantém o menu, a marca e a sacola dentro da largura disponível; o painel conserva os cartões de período e métricas sem overflow horizontal visível. O formulário de palavra-passe usa largura fluida e scroll vertical interno da página bloqueada, pelo que permanece utilizável em ecrãs pequenos.
