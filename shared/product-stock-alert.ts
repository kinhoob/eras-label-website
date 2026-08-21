/**
 * Limite editorial para sinalizar urgência sem revelar o inventário exato.
 * O cliente vê apenas uma etiqueta textual na fotografia do produto.
 */
export const LOW_STOCK_THRESHOLD = 3;

/**
 * Converte o estoque da variação selecionada na etiqueta pública adequada.
 * Valores inválidos, zero ou acima do limite não exibem alerta.
 */
export function getProductStockAlertLabel(stock: unknown): "POUCAS UNIDADES" | "ÚLTIMA PEÇA" | null {
  const normalizedStock = Number(stock ?? 0);

  if (!Number.isFinite(normalizedStock) || normalizedStock <= 0 || normalizedStock > LOW_STOCK_THRESHOLD) {
    return null;
  }

  return normalizedStock === 1 ? "ÚLTIMA PEÇA" : "POUCAS UNIDADES";
}

/**
 * Mantém o texto auxiliar do seletor de tamanhos informativo sem mostrar
 * quantidades exatas de estoque na experiência pública.
 */
export function getProductSizeAvailabilityLabel(hasSelectedVariation: boolean): string {
  return hasSelectedVariation ? "Tamanho disponível" : "Selecione o tamanho para continuar";
}
