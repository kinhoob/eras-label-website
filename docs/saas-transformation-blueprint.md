# Estratégia de Transformação em SaaS Multi-Marca (White-Label)

Este documento descreve os passos arquiteturais, contratuais e técnicos necessários para transformar a plataforma **Eras Label** num produto de e-commerce comercializável (SaaS white-label) para outras marcas de streetwear e vestuário, permitindo que o Kinho (kinhoob) monetize o motor desenvolvido.

---

## 1. Visão Geral da Arquitectura Multi-Marca

Para converter uma loja dedicada (como a Eras Label) num motor reutilizável para múltiplos clientes, é necessário migrar de uma base de dados partilhada sem inquilino (`tenant_id`) para uma arquitetura **multi-tenant isolada por organização**, onde cada cliente gerencia o seu próprio catálogo, pedidos, clientes e chaves de integração.

| Componente | Abordagem Actual (Eras Label) | Abordagem Proposta (SaaS Multi-Marca) |
| :--- | :--- | :--- |
| **Identidade Visual** | Fixa na estética `#b22222` e logotipo Eras Label | Sistema de temas dinâmico (`primary_color`, `logo_url`, fontes) |
| **Gestão de Dados** | Tabelas globais (`products`, `orders`, `customers`) | Tabelas segregadas por `tenant_id` ou BD dedicada |
| **Credenciais de Pagamento** | Chaves globais de Mercado Pago e Melhor Envio | Configuração encriptada por tenant no painel admin |
| **Domínio e Rotas** | Domínio único gerido na plataforma | Suporte a subdomínios (`marcadecor.seusite.com`) e domínios próprios (`marcadecor.com.br`) |

---

## 2. Mudanças Críticas no Código e Base de Dados

Para efetuar a transição com segurança, os seguintes pontos estruturais devem ser desacoplados:

1. **Inclusão da Coluna `tenant_id` em Todas as Tabelas:**
   - Adicionar o identificador da organização nas tabelas de produtos, categorias, coleções, pedidos, clientes, cupons, promoções e logs de auditoria.
   - Garantir que todas as queries no `server/db.ts` e procedures no `server/routers.ts` filtrem rigorosamente por `tenant_id`.

2. **Abstração de Configurações e Branding:**
   - Substituir referências estáticas à Eras Label por uma tabela de metadados da organização (`tenants`), carregada dinamicamente no carregamento do layout público e do painel administrativo.
   - Permitir que o lojista altere no painel a paleta de cores, logotipo, banners da página inicial e links de redes sociais.

3. **Cofre de Segredos por Inquilino (Credentials Vault):**
   - As credenciais do Mercado Pago (`access_token`, `public_key`) e do Melhor Envio (`token`, `client_id`) devem ser guardadas encriptadas na tabela de configurações de cada tenant, em vez de depender apenas de variáveis de ambiente globais.

---

## 3. Modelo de Negócio e Onboarding (SaaS)

* **Planos de Subscrição:**
  - *Starter:* Limite de produtos, taxa por transação reduzida, suporte via ticket.
  - *Pro:* Produtos ilimitados, integrações avançadas, domínio personalizado e relatórios em tempo real.
  - *Enterprise:* Servidor dedicado, suporte prioritário e personalizações exclusivas.
* **Painel do Super Administrador:**
  - Um painel central para o Kinho gerir os lojistas cadastrados, suspender contas por inadimplência, monitorar o uso de recursos e visualizar o faturamento da plataforma de software.

---

## 4. Próximos Passos Recomendados

1. **Isolamento de Estado:** Criar a tabela `tenants` e associar os registos actuais da Eras Label ao ID `tenant_eras_label`.
2. **Parametrização Visual:** Substituir as cores e logotipos hardcoded por variáveis CSS injetadas dinamicamente a partir da tabela de tenant.
3. **Validação Comercial:** Apresentar a solução como um "E-commerce de Alta Performance para Streetwear" para outras marcas conhecidas do ecossistema local.

---
*Documento elaborado para a estratégia de expansão comercial de Kinho / Eras Label.*
