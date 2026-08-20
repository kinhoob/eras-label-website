# Validação visual dos filtros de Vendas & Entregas

## Desktop — 1280 px

A captura de `/admin?section=sales` abriu a seção correta **Vendas & Entregas (Melhor Envio)**. O painel de filtros ocupa uma composição vertical própria: o cabeçalho aparece acima da grelha, a busca ocupa a primeira coluna e os campos Status do pedido, Pagamento e Período ficam alinhados na mesma linha. A opção “Incluir pedidos arquivados” aparece na linha inferior à esquerda e “Limpar filtros” aparece separado à direita, sem sobreposição com nenhum campo ou rótulo.

A imagem também confirma que a correção da cascata CSS eliminou o comportamento anterior no qual o painel externo herdava uma grelha de cinco colunas e comprimía o conteúdo interno.

## Mobile — 390 × 844 px

A captura mobile confirmou a composição em uma coluna. Busca, Status do pedido, Pagamento e Período aparecem empilhados, cada um com largura interna consistente. O checkbox de pedidos arquivados permanece visível abaixo dos selects e “Limpar filtros” fica em uma linha própria, centralizado e sem sobrepor os campos. Não há corte horizontal nem elementos saindo do painel no viewport validado.
