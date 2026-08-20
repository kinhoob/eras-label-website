# Validação do editor de produto

## Contrato administrativo

O `Admin.tsx` final mantém `description` e `sizeGuide` em `AdminProductOption`, hidrata o estado ao abrir um produto com `getProductDescriptionDraft(product.description)` e `getProductSizeGuideDraft(product.sizeGuide)`, e renderiza ambos como campos controlados. A guia possui tabela com `role="table"`, entradas de tamanho/largura/comprimento, ação `Adicionar linha` e remoção por linha. O salvamento envia a descrição como string e a guia normalizada no payload de `saveProduct`.

## Evidência pública

A página `/produto/tshirtressonador` carregou a descrição persistida e a seção `Guia de tamanhos`, com tabela responsiva de Tamanho, Largura e Comprimento. A captura mobile em viewport de 390 × 844 mostrou a ficha, os detalhes, a guia e o rodapé sem overflow horizontal.

## Persistência e regressões

A coluna JSON `sizeGuide` foi adicionada de forma não destrutiva ao schema e à migração. O write path de criação e atualização persiste a guia normalizada e o retorno do produto a mantém disponível para o frontend. Os testes unitários cobrem draft vazio, hidratação da descrição, normalização de linhas, fallback por categoria, presença do editor no Admin e envio normalizado no payload. O Vitest e o build de produção foram executados após a implementação.

## Escopo de dados

A validação visual usou o produto real `T-SHIRT RESSONADOR` e não criou produto, cliente, pedido ou conteúdo de teste. A criação de linha no painel foi testada e cancelada sem salvar alterações.
