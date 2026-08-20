# Guia Definitivo de Publicação: Eras Label na Vercel + Domínio HostGator

Este documento apresenta o planeamento estratégico, a análise de custos e o passo a passo técnico para colocar a plataforma de e-commerce **Eras Label** a operar em produção utilizando a **Vercel** para hospedagem e o domínio adquirido na **HostGator**.

---

## 1. Análise de Custos: O que precisa de pagar?

Relativamente à sua pergunta sobre custos adicionais, a resposta direta é: **Não precisa de pagar nada à HostGator além do valor que já pagou pelo domínio**, e **pode começar a usar a Vercel de forma totalmente gratuita (Plano Hobby/Free)**. No entanto, para operar um e-commerce em ambiente de produção real, deve ter em conta os seguintes pontos de custo:

| Componente | Provedor / Serviço | Custo Previsto |
| :--- | :--- | :--- |
| **Domínio (`eraslabel.com`)** | HostGator | **Já pago** (renovação anual padrão do registo de domínio). |
| **Hospedagem da Aplicação** | Vercel (Plano Hobby) | **0 R$/mês** (Gratuito para projetos pessoais e portefólios de alta performance). |
| **Base de Dados MySQL** | PlanetScale, Railway ou Supabase | **0 R$/mês** (Planos gratuitos iniciais) ou planos pagos conforme o volume (aprox. 5 a 10 USD/mês se crescer). |
| **Gateway de Pagamento** | Mercado Pago | **Sem mensalidade** (apenas comissão por transação aprovada). |
| **Logística e Frete** | Melhor Envio | **Sem mensalidade** (apenas o custo das etiquetas geradas). |
| **Disparo de E-mails** | Resend | **Gratuito** até 3.000 e-mails/mês no plano inicial. |

---

## 2. Arquitetura na Vercel (Notas Importantes)

A Vercel é excelente para alojar aplicações React/Next.js e APIs Serverless. Como a Eras Label utiliza um servidor Node.js/Express com tRPC, a Vercel executa as rotas de backend como **Serverless Functions**. 

Para que tudo funcione perfeitamente na Vercel, certifique-se de que:
1. A base de dados MySQL está alojada externamente (ex: PlanetScale ou Railway) e acessível via internet (com SSL ativado).
2. As variáveis de ambiente estão devidamente preenchidas no painel da Vercel.

---

## 3. Passo a Passo para o Deploy na Vercel

### Passo 1: Enviar o código para o seu GitHub
1. Certifique-se de que o seu repositório Git local está sincronizado.
2. Crie um repositório privado ou público no seu próprio GitHub (ex: `eras-label-store`).
3. Faça o push do código limpo (conforme o guia de limpeza em `docs/external-hosting-guide.md`).

### Passo 2: Criar e Configurar o Projeto na Vercel
1. Aceda a [Vercel](https://vercel.com/) e faça login com a sua conta do GitHub.
2. Clique em **Add New...** > **Project** e selecione o repositório `eras-label-store`.
3. Na tela de configuração de Build & Development Settings:
   - **Framework Preset**: Vite (ou Other).
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist/public` (ou o diretório de build correspondente ao seu setup).
   - **Install Command**: `pnpm install`

### Passo 3: Configurar as Variáveis de Ambiente na Vercel
Antes de clicar em Deploy, abra a seção **Environment Variables** na Vercel e adicione todas as chaves secretas do seu e-commerce:
- `DATABASE_URL` (URL de conexão à base de dados MySQL externa)
- `JWT_SECRET` (Chave secreta para assinatura de cookies)
- `MP_ACCESS_TOKEN` e `MP_PUBLIC_KEY` (Credenciais do Mercado Pago)
- `MELHOR_ENVIO_TOKEN`, `MELHOR_ENVIO_CLIENT_ID`, etc. (Credenciais do Melhor Envio)
- `RESEND_API_KEY` (Chave da API do Resend para e-mails)

Clique em **Deploy**. A Vercel irá compilar a aplicação e fornecer um URL temporário (ex: `eras-label.vercel.app`).

---

## 4. Como Ligar o Domínio da HostGator à Vercel

Comprar o domínio na HostGator e hospedar a aplicação na Vercel é um procedimento muito comum. O processo consiste em apontar o domínio da HostGator para os servidores DNS da Vercel (ou configurar registos CNAME/A).

### Método Recomendado (Apontar DNS para a Vercel):
1. Na Vercel, vá ao seu projeto > **Settings** > **Domains** e adicione o seu domínio (`eraslabel.com` e `www.eraslabel.com`).
2. A Vercel fornecerá dois servidores de nomes (Nameservers), por exemplo:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. Aceda ao seu painel de cliente na **HostGator** (Portal do Cliente > Domínios > Gerizar DNS ou Alterar Nameservers).
4. Substitua os servidores de nomes antigos da HostGator pelos **Nameservers da Vercel** fornecidos no passo 2.
5. **Aguarde a propagação**: A propagação global do DNS pode demorar entre 15 minutos a algumas horas. Assim que propagar, a Vercel emitirá automaticamente o certificado SSL (HTTPS) gratuito e o seu site estará no ar em `eraslabel.com`.

---

## 5. Atualização dos Webhooks (Mercado Pago e Melhor Envio)

Após o domínio estar a funcionar em `https://eraslabel.com`, lembre-se de atualizar os URLs de webhook nos painéis externos:
- **Mercado Pago**: Atualize o URL de webhook para `https://eraslabel.com/api/mercadopago/webhook`.
- **Melhor Envio**: Atualize o URL de retorno/webhook de cotação/envio para o seu domínio oficial de produção.
