# QA — Cotação com pacote configurável

## Implementado

O fluxo administrativo de cotação no detalhe do pedido passou a ter dois passos: dados do destino e da encomenda, seguidos pelas modalidades retornadas pelo Melhor Envio. O formulário aceita CEP, altura, largura, comprimento e peso total. A unidade apresentada ao administrador é centímetros e gramas; o backend converte o peso para quilogramas e distribui-o pelas linhas do pedido para montar o payload da API.

A cotação pública continua compatível com o contrato anterior e aceita um pacote opcional. Quando o pacote não é fornecido, conserva-se o padrão técnico existente para não interromper a sacola pública.

## Verificações

- TypeScript: aprovado com `pnpm exec tsc --noEmit`.
- Teste específico: aprovado com 2 testes em `server/shipping-quote.test.ts`.
- Suíte completa: 200 testes aprovados, 1 teste ignorado, em 62 ficheiros.
- Build de produção: aprovado com Vite e esbuild.
- Preview desktop do painel: layout geral carregado sem erro, com os cartões e navegação preservados.
- Preview mobile do painel: viewport de 390 px carregado sem overflow visível; o formulário novo usa grelha responsiva de 4, 2 ou 1 coluna conforme a largura.

## Observação

O build ainda emite o aviso já existente sobre chunks JavaScript superiores a 500 kB, sobretudo no bundle do Admin. Não bloqueia esta funcionalidade, mas permanece como item de optimização de performance antes do lançamento.
