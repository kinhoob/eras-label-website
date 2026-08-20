# Guia de Limpeza e Migração para Hospedagem Externa (Eras Label)

Este documento detalha exatamente quais os ficheiros e diretórios que podem ser removidos do projeto para limpar o repositório antes de o hospedar em plataformas externas (como Vercel, Railway, Render, VPS própria ou servidores dedicados), mantendo 100% da funcionalidade e estabilidade da loja e do painel administrativo.

---

## 1. O que pode ser removido com total segurança

Os ficheiros listados abaixo foram utilizados para validações internas, auditorias de qualidade e registos de depuração do ambiente de desenvolvimento. Nenhum deles afeta o funcionamento do código de produção da Eras Label.

### A. Ficheiros de Relatórios de QA e Auditoria na Raiz
Pode remover os seguintes ficheiros markdown de relatórios antigos:
- `.audit-findings.md`
- `audit-findings.md`
- `audit-report.md`
- `checkout-validation.md`
- `fiscal-and-shipping-guide.md`
- `official-nav-reference.md`
- `official-site-audit.md`
- `qa-active-filters.md`
- `qa-audit-report.md`
- `qa-branded-templates.md`
- `qa-cart-feedback-findings.md`
- `qa-cart-zoom-findings.md`
- `qa-checkout-success-findings.md`
- `qa-filters-cep-findings.md`
- `qa-final-report.md`
- `qa-home-findings.md`
- `qa-inventory-visual.md`
- `qa-navbar-findings.md`
- `qa-resend-admin.md`
- `qa-resend-filters.md`
- `qa-resend.md`
- `qa-search-sort.md`
- `qa-side-cart-findings.md`
- `qa-smart-search.md`
- `qa-vip-collections.md`
- `sidebar-validation.md`
- `validation-notes-2026-08-17.md`
- `visual-validation-notes.md`

### B. Scripts de Teste de QA em Python na Raiz
Estes scripts foram utilizados para simulações pontuais e testes visuais automatizados:
- `qa-cart-feedback.py`
- `qa-cart-zoom.py`
- `qa-checkout-quickview.py`
- `qa-checkout-success.py`
- `qa-filters-cep.py`
- `qa-quickview-debug.py`
- `qa-side-cart.py`

### C. Diretório de Logs de Depuração (`.manus-logs/`)
Contém os registos temporários do servidor de desenvolvimento:
- `.manus-logs/` (pode remover a pasta inteira)

### D. Configurações Específicas de Infraestrutura Interna
- `.manus/` (pasta de configuração interna)
- `.project-config.json` (metadados da sandbox)

---

## 2. O que NÃO DEVE ser removido (Essencial para Produção)

Estes componentes formam o núcleo da aplicação e são estritamente necessários para o funcionamento da loja, do painel administrativo, da base de dados e das integrações de pagamento e logística:

| Diretório / Ficheiro | Função Crítica |
| :--- | :--- |
| `client/` | Código fonte frontend em React 19, páginas, componentes e rotas da loja e painel admin. |
| `server/` | Servidor Express, rotas tRPC, lógica de negócios, webhooks do Mercado Pago e Melhor Envio. |
| `drizzle/` | Esquema da base de dados MySQL (`schema.ts`) e migrações SQL. |
| `shared/` | Tipos e constantes compartilhados entre frontend e backend. |
| `package.json` & `pnpm-lock.yaml` | Gestão de dependências e scripts de build (`pnpm build`). |
| `vite.config.ts` & `tsconfig.json` | Configurações do compilador e bundler. |

---

## 3. Instruções de Limpeza Rápida via Linha de Comando

Se desejar limpar o repositório antes de fazer o push para o seu próprio GitHub (ou GitLab/Bitbucket), execute os seguintes comandos na raiz do projeto:

```bash
# Remover relatórios de auditoria e QA
rm -f *.md qa-*.py

# Remover diretório de logs e metadados internos do Manus
rm -rf .manus-logs .manus .project-config.json

# Confirmar estado limpo do repositório
git status
```

---

## 4. Recomendações para Hospedagem Externa

1. **Base de Dados MySQL**: Como a aplicação utiliza Drizzle ORM com MySQL, certifique-se de configurar uma base de dados externa (ex: PlanetScale, Railway MySQL, RDS da AWS ou Supabase/Neon com adaptadores equivalentes) e apontar a variável de ambiente `DATABASE_URL`.
2. **Variáveis de Ambiente**: Configure no seu provedor de hospedagem (Railway, Render, Vercel ou VPS) as chaves de produção:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET`
   - `MELHOR_ENVIO_TOKEN`, `MELHOR_ENVIO_CLIENT_ID`, etc.
   - `RESEND_API_KEY`
3. **Build e Execução**: O comando de build padrão do projeto é `pnpm build` e o arranque do servidor executa o output gerado em `dist/index.js`.
