# Auditoria visual — visibilidade e link de produto

Data: 2026-08-17

- O painel `/admin` abriu corretamente em desktop e exibiu o título do projeto `Eras Label - Loja Oficial` no preview.
- A rota `/produto/produto-link-privado` respondeu 404 porque o slug era apenas um valor de teste inexistente no banco; isso confirma que slugs inexistentes não geram uma página fantasma.
- A rota `/produto/camiseta-paradox-oversized` resolveu um produto publicado real e a estrutura mobile da página por slug renderizou corretamente em 390px: cabeçalho, galeria, coleção e título empilham sem overflow.
- As imagens do produto de teste consultado aparecem quebradas porque os URLs armazenados nesse registro não estão disponíveis no storage; não é uma falha da resolução por slug. Produtos reais devem usar os URLs devolvidos pelo upload do painel.
- A Home continua responsiva em 390px, com barra de anúncio, cabeçalho, hero e destaque visíveis.

Próxima validação: concluir testes automatizados, revisar o todo e salvar checkpoint.
