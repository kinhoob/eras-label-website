/**
 * Linha editável da tabela de medidas de um produto.
 *
 * Cada produto pode manter a sua própria tabela; campos vazios são permitidos
 * para acomodar modelagens que não usam largura ou comprimento convencional.
 */
export type ProductSizeGuideRow = {
  size: string;
  width: string;
  length: string;
};

/**
 * Remove valores inválidos e limita a entrada para manter a tabela legível e
 * impedir que payloads acidentais criem linhas vazias ou excessivamente longas.
 */
export function normalizeProductSizeGuide(value: unknown): ProductSizeGuideRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const candidate = row as Record<string, unknown>;
      const size = typeof candidate.size === "string" ? candidate.size.trim() : "";
      if (!size) return null;
      return {
        size: size.slice(0, 24),
        width: typeof candidate.width === "string" ? candidate.width.trim().slice(0, 48) : "",
        length: typeof candidate.length === "string" ? candidate.length.trim().slice(0, 48) : "",
      } satisfies ProductSizeGuideRow;
    })
    .filter((row): row is ProductSizeGuideRow => Boolean(row))
    .slice(0, 20);
}

/**
 * Tabela padrão usada apenas quando o produto ainda não tem uma configuração
 * personalizada. O editor pode substituir essa sugestão e persistir a tabela.
 */
export function getDefaultProductSizeGuide(category: string, sizes: string[]): ProductSizeGuideRow[] {
  if (category.trim().toLowerCase() === "bonés") {
    return [{ size: "Único", width: "Ajustável", length: "Circunferência regulável" }];
  }
  const defaults: Record<string, ProductSizeGuideRow> = {
    PP: { size: "PP", width: "50–52 cm", length: "66–68 cm" },
    P: { size: "P", width: "52–54 cm", length: "68–70 cm" },
    M: { size: "M", width: "54–56 cm", length: "70–72 cm" },
    G: { size: "G", width: "56–58 cm", length: "72–74 cm" },
    GG: { size: "GG", width: "58–60 cm", length: "74–76 cm" },
  };
  return sizes.map((size) => defaults[size] ?? { size, width: "", length: "" });
}

/**
 * Escolhe a tabela persistida e, se ela ainda não existir, devolve a referência
 * da categoria filtrada pelos tamanhos realmente disponíveis no inventário.
 */
export function resolveProductSizeGuide(
  saved: unknown,
  category: string,
  sizes: string[],
): ProductSizeGuideRow[] {
  const custom = normalizeProductSizeGuide(saved);
  return custom.length > 0 ? custom : getDefaultProductSizeGuide(category, sizes);
}
