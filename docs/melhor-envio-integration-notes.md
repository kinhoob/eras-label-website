

## Verificação oficial — Área Dev e ambientes

A documentação oficial do Melhor Envio informa que a URL base de produção é `https://melhorenvio.com.br` e a URL base de Sandbox é `https://sandbox.melhorenvio.com.br`. As requisições devem incluir `Accept: application/json`, `Content-Type: application/json` quando aplicável e um `User-Agent` com o nome da aplicação e e-mail de contacto.

A autenticação da Área Dev é baseada em OAuth2. O callback cadastrado no aplicativo precisa ser idêntico ao `redirect_uri` usado na autorização; caso contrário, a API devolve `Client invalid`. As permissões relevantes para a Eras Label são `shipping-calculate`, `ecommerce-shipping`, `shipping-generate`, `shipping-preview`, `shipping-print` e `shipping-tracking`, podendo também ser necessário `shipping-checkout` para comprar o frete usando saldo.

Fontes consultadas em 16/08/2026:
- https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio
- https://docs.melhorenvio.com.br/reference/fluxo-de-autoriza%C3%A7%C3%A3o
