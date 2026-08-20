# Melhor Envio — inserção de frete no carrinho

Fonte consultada: documentação oficial [Inserir fretes no carrinho](https://docs.melhorenvio.com.br/reference/inserir-fretes-no-carrinho), consultada em 20/08/2026.

A requisição `POST /api/v2/me/cart` exige `service`, dados completos de `from` e `to`, `products`, `volumes` e `options`. A documentação também orienta incluir uma identificação do pedido da plataforma em `options.tags`; o exemplo usa `tag` para o número do pedido e `url` para o link direto. Para envios comerciais, `options.invoice` deve conter a chave/XML da NF-e; para envios não comerciais, deve ser usado `options.dce` conforme a regra vigente.

O erro observado (“O campo 'order' é obrigatório”) indica que o fluxo atual precisa enviar uma identificação de pedido válida no payload de inserção do carrinho, alinhada ao pedido Eras Label, além do `service` já corrigido. A implementação deve preservar a validação de documentos e não deve criar ou alterar pedidos reais durante os testes.

## Confirmação adicional da documentação oficial — 20/08/2026

A documentação oficial confirma que `POST /api/v2/me/cart` utiliza `service`, `from`, `to`, `products`, `volumes` e `options`. Para a identificação da venda, `options.tags` é uma lista de objetos com `tag` e `url`; o exemplo oficial não apresenta uma propriedade raiz `order`. Como o erro operacional observado pela conta indica que `order` também está a ser exigido no fluxo/versão actual, o payload da Eras Label deve incluir uma identificação explícita e estável do pedido em `order`, além de `options.tags`, sem remover os campos oficiais. A mesma documentação recomenda `options.insurance_value` com o valor total segurado e alerta que Correios e Loggi não aceitam múltiplos volumes numa única requisição.

Fonte: https://docs.melhorenvio.com.br/reference/inserir-fretes-no-carrinho
