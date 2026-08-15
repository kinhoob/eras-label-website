# QA visual do inventário

Data da verificação: 15/08/2026.

A captura desktop em 1280×720 confirmou que o Admin abre diretamente em Inventário, apresenta navegação lateral, título e descrição, botão de novo produto, busca, contador de produtos, colunas de produto/estoque/variações/SKU/histórico e fallback visual para produtos sem imagem.

A captura mobile em 390×844 confirmou que o menu compacto, cabeçalho, título, botão de novo produto, busca e tabela permanecem acessíveis sem corte horizontal imediato. A listagem reduz as colunas para privilegiar a identificação do produto e pode continuar por rolagem vertical.

Os estados de carregamento, erro e busca vazia foram adicionados ao corpo da tabela com mensagens claras e ações de recuperação. A captura representa o estado carregado com produtos; os estados alternativos são cobertos por renderização condicional no código e devem ser exercitados com falha de rede ou busca sem correspondência.
