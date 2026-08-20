export function getProductDescription(description: unknown): string {
  if (typeof description !== "string") return "Descrição ainda não informada pelo administrador.";
  const normalized = description.trim();
  return normalized || "Descrição ainda não informada pelo administrador.";
}

export function hasSavedProductDescription(description: unknown): boolean {
  return typeof description === "string" && description.trim().length > 0;
}

export function getProductTitleSizeClass(): string {
  return "product-title";
}

export function getProductGalleryWidth(): string {
  return "min(100%, 560px)";
}

export function getRelatedProductsHeadingSize(): string {
  return "clamp(1.75rem, 2.8vw, 2.9rem)";
}

export function getProductLayoutGap(): string {
  return "clamp(36px, 4vw, 64px)";
}

export function getProductRelatedGridGap(): string {
  return "22px";
}
