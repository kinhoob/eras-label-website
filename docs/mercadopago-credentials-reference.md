# Referência de credenciais do Mercado Pago

Fonte oficial: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials
Fonte oficial sobre OAuth: https://www.mercadopago.com.br/developers/pt/docs/security/oauth/creation

- As credenciais são vinculadas a uma aplicação em "Suas integrações".
- Credenciais de teste ficam em Testes > Credenciais de teste e ficam disponíveis após criar a aplicação.
- Credenciais de produção ficam em Produção > Credenciais de produção e exigem ativação com dados do negócio, indústria, website, aceite dos termos e reCAPTCHA.
- Public Key deve ser usada no frontend para tokenização e dados públicos de meios de pagamento.
- Access Token é privado e deve ser usado somente no backend, preferencialmente no header Authorization: Bearer.
- Para esta aplicação Eras Label, os nomes de ambiente esperados são MP_ACCESS_TOKEN e MP_PUBLIC_KEY.
- Nunca inserir Access Token no código, frontend, chat público, logs ou repositório.
- O fluxo OAuth é destinado a aplicações que acessam contas de terceiros; para a própria conta da Eras Label, usar o par de credenciais da aplicação no painel.
