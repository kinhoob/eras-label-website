export type SearchableStorefrontProduct = {
  name: string;
  collection: string;
  category: string;
  color: string;
  sizes: string[];
  detail: string;
};

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
    color: normalizeSearchText(product.color),
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
    const colorContains = fields.color.includes(term);
    const sizeMatches = fields.sizes.some((size) => size === term || size.includes(term));
    const detailContains = fields.detail.includes(term);

    if (!nameContains && !collectionContains && !categoryContains && !colorContains && !sizeMatches && !detailContains) return 0;
    if (nameMatch) score += 100;
    else if (nameStartsWith) score += 70;
    else if (nameContains) score += 50;
    if (collectionContains) score += 28;
    if (categoryContains) score += 20;
    if (colorContains) score += 18;
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
