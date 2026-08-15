export type StorefrontFilterProduct = {
  category: string;
  sizes: string[];
  color: string;
  price: number;
};

export type StorefrontFilters = {
  category: string;
  size: string;
  color: string;
  priceRange: "all" | "under150" | "150to200" | "over200";
};

export function filterStorefrontProducts<T extends StorefrontFilterProduct>(products: T[], filters: StorefrontFilters) {
  return products.filter((product) => {
    const matchesCategory = filters.category === "Todos" || product.category === filters.category;
    const matchesSize = filters.size === "Todos" || product.sizes.includes(filters.size);
    const matchesColor = filters.color === "Todas" || product.color === filters.color;
    const matchesPrice = filters.priceRange === "all"
      || (filters.priceRange === "under150" && product.price < 150)
      || (filters.priceRange === "150to200" && product.price >= 150 && product.price <= 200)
      || (filters.priceRange === "over200" && product.price > 200);
    return matchesCategory && matchesSize && matchesColor && matchesPrice;
  });
}

export function getStorefrontFilterOptions(products: StorefrontFilterProduct[]) {
  const sizes = Array.from(new Set(products.flatMap((product) => product.sizes))).sort((left, right) => (
    left === "Único" ? -1 : right === "Único" ? 1 : left.localeCompare(right, "pt-BR")
  ));
  const colors = Array.from(new Set(products.map((product) => product.color))).sort((left, right) => left.localeCompare(right, "pt-BR"));
  return { sizes, colors };
}
