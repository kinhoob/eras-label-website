import { categoryPath } from "@/lib/catalog-routes";

/** Categoria mínima retornada pelo catálogo público e necessária para a navegação. */
export type PublicNavigationCategory = {
  id: number;
  name: string;
  slug: string;
};

/** Normaliza acentos e caixa para encontrar categorias sem depender da grafia exata. */
export function normalizePublicLabel(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Procura uma categoria do painel pelo termo semântico usado na navbar. */
export function findPublicCategory(categories: PublicNavigationCategory[], keyword: string): PublicNavigationCategory | undefined {
  return categories.find((category) => normalizePublicLabel(category.name).includes(keyword));
}

/** Mantém até três categorias adicionais no desktop, sem duplicar Camisetas e Bonés. */
export function getExtraPublicCategories(categories: PublicNavigationCategory[]): PublicNavigationCategory[] {
  return categories
    .filter((category) => {
      const normalized = normalizePublicLabel(category.name);
      return !normalized.includes("camiseta") && !normalized.includes("bone");
    })
    .slice(0, 3);
}

/** Resolve o destino de uma categoria do painel ou um fallback estável para a navegação. */
export function publicCategoryHref(category: PublicNavigationCategory | undefined, fallback: string): string {
  return category ? categoryPath(category.name) : fallback;
}
