export type StorefrontFilterProduct = {
  category: string;
  categoryNames?: string[];
  sizes: string[];
  color?: string;
  price: number;
};

export type StorefrontFilters = {
  category: string;
  size: string;
  minPrice?: number;
  maxPrice?: number;
};

export function filterStorefrontProducts<T extends StorefrontFilterProduct>(products: T[], filters: StorefrontFilters) {
  return products.filter((product) => {
    const matchesCategory = filters.category === "Todos" || product.category === filters.category || Boolean(product.categoryNames?.includes(filters.category));
    const matchesSize = filters.size === "Todos" || product.sizes.includes(filters.size);
    const matchesMinPrice = filters.minPrice === undefined || product.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === undefined || product.price <= filters.maxPrice;
    return matchesCategory && matchesSize && matchesMinPrice && matchesMaxPrice;
  });
}

export function getStorefrontFilterOptions(products: StorefrontFilterProduct[]) {
  const sizes = Array.from(new Set(products.flatMap((product) => product.sizes))).sort((left, right) => (
    left === "Único" ? -1 : right === "Único" ? 1 : left.localeCompare(right, "pt-BR")
  ));
  return { sizes };
}
