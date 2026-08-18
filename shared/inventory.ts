/**
 * Opções de tamanho usadas no catálogo da Eras Label.
 * A lista numérica atende calças e bermudas; a lista alfabética atende peças de vestuário.
 */
export const APPAREL_SIZE_OPTIONS = ["PP", "P", "M", "G", "GG"] as const;
export const NUMERIC_SIZE_OPTIONS = ["34", "36", "38", "40", "42", "44", "46"] as const;
export const ONE_SIZE_OPTIONS = ["ÚNICO"] as const;

/**
 * Escolhe a matriz de tamanhos adequada à categoria do produto.
 * O matching é tolerante a acentos e variações de escrita, porque a categoria pode ser editada pelo admin.
 */
export function getInventorySizeOptions(category: string) {
  const normalized = category.toLocaleLowerCase("pt-BR");
  if (/(calça|calca|bermuda|jeans)/i.test(normalized)) return NUMERIC_SIZE_OPTIONS;
  if (/(boné|bone|chapéu|chapeu|acessório|acessorio)/i.test(normalized)) return ONE_SIZE_OPTIONS;
  return APPAREL_SIZE_OPTIONS;
}

/** Variação de produto: o estoque é controlado apenas por tamanho. */
export type InventoryVariationInput = { size: string; stock: number };
export type NormalizedInventoryVariation = { size: string; stock: number };

/**
 * Normaliza o payload de estoque antes de persistir os dados.
 * Tamanhos são validados, maiúsculas aplicadas, entradas repetidas são consolidadas
 * pelo último valor informado e o estoque nunca fica negativo ou fracionado.
 *
 * O campo de cor é deliberadamente ignorado para manter compatibilidade com dados
 * legados sem reintroduzir cores na experiência de administração.
 */
export function normalizeInventoryVariations(variations: Array<InventoryVariationInput | { size: string; color?: string; stock: number }> = []): NormalizedInventoryVariation[] {
  const normalized = variations
    .map((variation) => ({
      size: String(variation.size ?? "").trim().toUpperCase(),
      stock: Math.max(0, Math.floor(Number(variation.stock) || 0)),
    }))
    .filter((variation) => variation.size.length > 0);

  const map = new Map<string, NormalizedInventoryVariation>();
  for (const item of normalized) map.set(item.size, item);
  return Array.from(map.values());
}

/** Soma o estoque de todas as variações selecionadas. */
export function sumInventoryStock(variations: Array<{ stock: number | null | undefined }>) {
  return variations.reduce((total, variation) => total + Math.max(0, Number(variation.stock) || 0), 0);
}
