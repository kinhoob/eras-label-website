

# QA — sucesso da compra, validação e relacionados

- TypeScript, Vitest e build de produção concluídos sem erros; a suíte final passou com 14 ficheiros e 35 testes.
- O checkout dedicado impede submissões vazias, mostra mensagens junto aos campos inválidos e foca o primeiro campo com erro.
- O formulário aceita dados formatados de CPF, telefone e CEP quando os valores normalizados são válidos.
- O QA interativo confirmou o fluxo completo: visualização rápida, seleção de produto relacionado, adição à Sacola, navegação para `/checkout`, resumo persistido e estado de sucesso com o botão “CONTINUAR COMPRANDO”.
- A visualização rápida mostra três produtos relacionados, permite trocar de produto sem fechar o modal e mantém fecho por overlay/Escape.
- A validação foi repetida em viewport desktop 1280×900 e mobile 375×812; as capturas confirmaram layout responsivo da Home e da rota de checkout.
