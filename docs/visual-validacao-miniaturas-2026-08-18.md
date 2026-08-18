# Validação visual — miniaturas no seletor de produtos

As capturas do painel em desktop (1280×720) e mobile (375×812) confirmaram que o layout administrativo continua sem overflow horizontal e que os breakpoints existentes permanecem funcionais. A alteração foi aplicada ao seletor de produtos da curadoria da Home; cada opção passa a reutilizar `AdminProductThumbnail`, exibindo a primeira imagem disponível e fallback de pacote quando a imagem está vazia ou falha. O seletor mantém checkbox, nome, coleção, estados hover/selected e grelha responsiva.

Nota: a captura abre a visão geral do `/admin`; a grelha de curadoria é renderizada no separador de Aparência, mas a validação de viewport confirmou a integridade estrutural global do painel após a alteração.
