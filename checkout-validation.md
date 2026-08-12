# Validação do checkout

Data da validação: 2026-08-12.

A pré-visualização foi usada com um pedido de teste da T-Shirt Travessia no valor de R$ 154,90, utilizando os dados sintéticos `Pessoa Teste` e `teste-checkout@example.com`.

## Resultado observado

Após o envio do formulário, o modal entrou no estado de processamento com o título `Confirmando seu pagamento`, o aviso `Não feche esta janela. Estamos registrando seu pedido com segurança.` e o botão bloqueado com o texto `CONFIRMANDO PAGAMENTO...`. O layout também exibiu a observação `A confirmação pode levar alguns segundos.`.

Em seguida, o fluxo avançou para a confirmação visual com `Pagamento aprovado`, `CONFIRMAÇÃO RECEBIDA` e `Seu pagamento foi confirmado.`. A tela exibiu o identificador gerado do pedido, informou que a confirmação foi enviada por e-mail e ofereceu as ações `ACOMPANHAR PEDIDO` e `CONTINUAR COMPRANDO`.

Também foi verificado que a mensagem global de confirmação do pedido aparece após a submissão e que a interface preserva o estilo visual da Eras Label.

## Observação

A validação manual foi feita no ambiente de desenvolvimento com dados de teste e não representa uma cobrança financeira real. O teste automatizado cobre o reducer e as mensagens dos estados `processing`, `success` e `error`; o build e a verificação TypeScript foram executados antes desta validação.


## Validação complementar

A cobertura automatizada do reducer confirmou as transições de processamento para erro e de erro para estado inicial, preservando a mensagem recuperável. O teste focado passou com 6 testes em 2 arquivos, e a verificação TypeScript e o build de produção passaram sem erros. A captura responsiva em 375 × 812 px confirmou que a composição da vitrine permanece utilizável em mobile; os estilos do checkout também possuem regra de coluna única e ajustes de espaçamento para telas menores.

A validação complementar foi concluída sem simular uma cobrança real. O cenário de falha foi exercitado no nível da máquina de estados, que é a camada que alimenta diretamente o banner de erro do modal.


## QA automatizado no navegador — mobile

Em viewport de 375 × 812 px, o fluxo completo foi executado no navegador automatizado. O cenário de falha interceptou a chamada real de `checkout.create` e confirmou `processingVisible: true` e `errorVisible: true`, incluindo a mensagem recuperável no modal. Em uma segunda execução, o checkout real de teste confirmou `successProcessingVisible: true` e `successVisible: true`, com a tela `Pagamento aprovado`. Foram capturadas evidências visuais em `/home/ubuntu/checkout-error-mobile.png` e `/home/ubuntu/checkout-success-mobile.png`; os arquivos permanecem fora do projeto para não impactar o bundle de produção.
