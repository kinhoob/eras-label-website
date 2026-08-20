# Relatório de Validação do Modo Noturno — Eras Label

Este documento registra a validação explícita do modo noturno (`html.dark`) em todas as páginas públicas do storefront.

| Rota / Superfície | Elementos Validados | Estado no Tema Escuro (#171514 / #211e1c) |
|---|---|---|
| **`/` (Home)** | Hero, Banners, Shop, Seções, Rodapé | Superfícies em carvão profundo, textos em marfim claro (`#f1ece4`), rodapé opaco e sem vazamentos de luz. |
| **`/catalog` (Catálogo)** | Grelha de produtos, filtros de tamanho/preço, ordenação | Contraste de texto ajustado, produtos esgotados mantendo fotografia nítida com selo vermelho compactado. |
| **`/product` (Detalhe)** | Swiper de fotos, seletor de variações, botão de compra | Imagens em moldura refinada sem escurecimento indevido, botão de compra bloqueado para esgotados. |
| **`/checkout` (Checkout)** | Dados do cliente, frete, PIX/Cartão, resumo | Superfície em tom carvão, inputs legíveis, QR Code com temporizador e QR regenerável. |
| **`/account` (Conta)** | Histórico de pedidos, cartões, perfil | Cartões alinhados com a paleta escura, informações de entrega e status sem perda de leitura. |
| **`/bag` / Sacola** | Drawer lateral, itens, subtotal, cupom | Fundo opaco, controle de quantidade e subtotal com contraste aprimorado. |
| **Menu Lateral (Sidebar)** | Drawer deslizante, fechar X, overlay blur | Empilhamento z-index garantido acima da navbar sticky, fechamento por X e toque no overlay validados. |
| **Navbar & Controles** | Logo, links, busca, theme toggle, conta, sacola | Espaçamento adequado em mobile entre o botão sol/lua, conta e sacola; estados de hover e focus visíveis (`:hover`, `:focus-visible`). |
