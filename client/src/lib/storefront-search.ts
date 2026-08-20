export type SearchableStorefrontProduct = {
  name: string;
  collection: string;
  category: string;
  sizes: string[];
  detail: string;
};

export type StorefrontSearchSort = "newest" | "price-asc" | "price-desc" | "bestselling";

type StockAwareStorefrontProduct = {
  stock?: number | null;
  status?: string | null;
  variations?: Array<{ stock?: number | null }> | null;
};

type SortableStorefrontProduct = SearchableStorefrontProduct & StockAwareStorefrontProduct & {
  price: number;
  createdAt?: string | Date | null;
};

/** Considera esgotado apenas quando o status ou o estoque total indicam indisponibilidade. */
export function isStorefrontProductSoldOut(product: StockAwareStorefrontProduct) {
  if (product.status === "soldout") return true;
  if (typeof product.stock === "number") return product.stock <= 0;
  return Array.isArray(product.variations) && product.variations.length > 0 && product.variations.every((variation) => Number(variation.stock ?? 0) <= 0);
}

/** Mantém a curadoria original, mas desloca itens esgotados para o final de forma estável. */
export function sortSoldOutLast<T extends StockAwareStorefrontProduct>(products: T[]) {
  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => Number(isStorefrontProductSoldOut(left.product)) - Number(isStorefrontProductSoldOut(right.product)) || left.index - right.index)
    .map(({ product }) => product);
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getSearchFields(product: SearchableStorefrontProduct) {
  return {
    name: normalizeSearchText(product.name),
    collection: normalizeSearchText(product.collection),
    category: normalizeSearchText(product.category),
    sizes: product.sizes.map(normalizeSearchText),
    detail: normalizeSearchText(product.detail),
  };
}

export function scoreStorefrontProduct(product: SearchableStorefrontProduct, query: string) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  const fields = getSearchFields(product);
  let score = 0;

  for (const term of terms) {
    const nameMatch = fields.name === term;
    const nameStartsWith = fields.name.startsWith(term);
    const nameContains = fields.name.includes(term);
    const collectionContains = fields.collection.includes(term);
    const categoryContains = fields.category.includes(term);
    const sizeMatches = fields.sizes.some((size) => size === term || size.includes(term));
    const detailContains = fields.detail.includes(term);

    if (!nameContains && !collectionContains && !categoryContains && !sizeMatches && !detailContains) return 0;
    if (nameMatch) score += 100;
    else if (nameStartsWith) score += 70;
    else if (nameContains) score += 50;
    if (collectionContains) score += 28;
    if (categoryContains) score += 20;
    if (sizeMatches) score += 16;
    if (detailContains) score += 8;
  }

  return score;
}

export function searchStorefrontProducts<T extends SearchableStorefrontProduct>(products: T[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return products;

  return products
    .map((product, index) => ({ product, score: scoreStorefrontProduct(product, normalizedQuery), index }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ product }) => product);
}

export function getSearchSuggestionText(product: SearchableStorefrontProduct) {
  return `${product.name} · ${product.collection}`;
}

/** Ordena os produtos da pesquisa com uma cópia estável, sem alterar o catálogo original. */
export function sortStorefrontProducts<T extends SortableStorefrontProduct>(products: T[], sort: StorefrontSearchSort) {
  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const leftSoldOut = isStorefrontProductSoldOut(left.product);
      const rightSoldOut = isStorefrontProductSoldOut(right.product);
      if (leftSoldOut && !rightSoldOut) return 1;
      if (!leftSoldOut && rightSoldOut) return -1;
      if (sort === "price-asc") return left.product.price - right.product.price || left.index - right.index;
      if (sort === "price-desc") return right.product.price - left.product.price || left.index - right.index;
      if (sort === "bestselling") {
        const leftSales = Number((left.product as any).salesCount ?? (left.product as any).ordersCount ?? (left.product as any).sales ?? 0);
        const rightSales = Number((right.product as any).salesCount ?? (right.product as any).ordersCount ?? (right.product as any).sales ?? 0);
        if (leftSales !== rightSales) return rightSales - leftSales;
      }
      const leftDate = left.product.createdAt ? new Date(left.product.createdAt).getTime() : 0;
      const rightDate = right.product.createdAt ? new Date(right.product.createdAt).getTime() : 0;
      return rightDate - leftDate || left.index - right.index;
    })
    .map(({ product }) => product);
}
