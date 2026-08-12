# Validação do checkout

Data da validação: 2026-08-12.

A pré-visualização foi usada com um pedido de teste da T-Shirt Travessia no valor de R$ 154,90, utilizando os dados sintéticos `Pessoa Teste` e `teste-checkout@example.com`.

## Resultado observado

Após o envio do formulário, o modal entrou no estado de processamento com o título `Confirmando seu pagamento`, o aviso `Não feche esta janela. Estamos registrando seu pedido com segurança.` e o botão bloqueado com o texto `CONFIRMANDO PAGAMENTO...`. O layout também exibiu a observação `A confirmação pode levar alguns segundos.`.

Em seguida, o fluxo avançou para a confirmação visual com `Pagamento aprovado`, `CONFIRMAÇÃO RECEBIDA` e `Seu pagamento foi confirmado.`. A tela exibiu o identificador gerado do pedido, informou que a confirmação foi enviada por e-mail e ofereceu as ações `ACOMPANHAR PEDIDO` e `CONTINUAR COMPRANDO`.

Também foi verificado que a mensagem global de confirmação do pedido aparece após a submissão e que a interface preserva o estilo visual da Eras Label.

## Observação

A validação manual foi feita no ambiente de desenvolvimento com dados de teste e não representa uma cobrança financeira real. O teste automatizado cobre o reducer e as mensagens dos estados `processing`, `success` e `error`; o build e a verificação TypeScript foram executados antes desta validação.
