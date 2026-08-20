/**
 * Campos comerciais usados pelo editor de produto.
 *
 * O tipo é local ao helper para que a validação permaneça reutilizável sem
 * acoplar o formulário a tipos internos da página administrativa.
 */
export type ProductDraftInput = {
  name?: string | null;
  collection?: string | null;
  category?: string | null;
  subcategory?: string | null;
  sku?: string | null;
  slug?: string | null;
  visibility?: "visible" | "unlisted" | "hidden";
  categoryIds?: number[];
  price?: number | string | null;
  pixPrice?: number | string | null;
  promotionalPrice?: number | string | null;
  description?: string | null;
  status?: string | null;
  variations?: Array<{ size: string; stock: number }>;
};

/**
 * Cria o estado inicial do editor de produto.
 *
 * O cadastro começa intencionalmente vazio: nome, textos, coleção, categoria,
 * preços e status só recebem valor depois da decisão explícita do administrador.
 * A visibilidade inicial continua visível porque é uma regra de publicação, não
 * um conteúdo comercial pré-preenchido.
 */
export function createEmptyProductDraft(): ProductDraftInput {
  return {
    name: "",
    collection: "",
    category: "",
    subcategory: null,
    sku: "",
    slug: "",
    visibility: "visible",
    categoryIds: [],
    price: "",
    pixPrice: "",
    promotionalPrice: null,
    description: "",
    status: "",
    variations: [],
  };
}

/**
 * Valida os campos mínimos antes de enviar o produto ao backend.
 *
 * O backend também valida preços positivos, mas esta camada evita uma chamada
 * desnecessária e mostra ao administrador exatamente o que precisa ser definido.
 */
export function validateProductDraft(draft: ProductDraftInput): string | null {
  const name = String(draft.name ?? "").trim();
  const normalPrice = Number(draft.price);
  const pixPrice = Number(draft.pixPrice);
  const status = String(draft.status ?? "");

  if (!name || name.length < 2) return "Informe o nome do produto antes de guardar.";
  if (!Number.isFinite(normalPrice) || normalPrice <= 0 || !Number.isFinite(pixPrice) || pixPrice <= 0) {
    return "Defina um preço normal e um preço Pix válidos antes de guardar.";
  }
  if (!["Publicado", "Rascunho", "Esgotado"].includes(status)) {
    return "Escolha o status do produto antes de guardar.";
  }

  return null;
}
