# Contrato do PDF de etiquetas do Melhor Envio

Fontes oficiais consultadas em 2026-08-16:

- https://docs.melhorenvio.com.br/reference/inserir-fretes-no-carrinho
- https://docs.melhorenvio.com.br/reference/compra-de-fretes-1
- https://docs.melhorenvio.com.br/reference/geracao-de-etiquetas
- https://docs.melhorenvio.com.br/reference/impressao-de-etiquetas
- https://docs.melhorenvio.com.br/reference/impressao-de-etiquetas-em-arquivo

O endpoint `/api/v2/me/cart` retorna o ID UUID do envio no campo `id`; esse ID deve ser guardado para checkout, geração e impressão. O endpoint `/api/v2/me/shipment/checkout` compra os envios do carrinho usando os IDs retornados pelo carrinho, desde que haja saldo na carteira. Depois da compra, `/api/v2/me/shipment/generate` recebe `{ orders: [id] }` e gera a etiqueta. Após a geração, `/api/v2/me/shipment/print` recebe `{ mode: "public", orders: [id] }` e retorna `{ url: "..." }`; links privados exigem login na conta que gerou a etiqueta. Para obter um arquivo PDF, `/api/v2/me/imprimir/pdf/{id}` usa GET autenticado e aceita os formatos pdf, zpl ou jpeg; no Sandbox, a documentação informa que a impressão em arquivo está disponível apenas para serviços Jadlog.

A implementação da Eras Label usa o ID retornado pelo carrinho, faz download server-side do PDF autenticado, armazena bytes PDF pelo helper interno de storage e retorna ao admin apenas o caminho interno do arquivo. O PDF não deve ser obtido diretamente no navegador com o token do Melhor Envio.
