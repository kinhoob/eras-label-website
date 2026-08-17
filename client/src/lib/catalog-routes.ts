export function slugifyCatalogLabel(value: string | null | undefined): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryPath(name: string | null | undefined): string {
  return `/category/${slugifyCatalogLabel(name)}`;
}

export function collectionPath(name: string | null | undefined): string {
  return `/collection/${slugifyCatalogLabel(name)}`;
}

export function uniqueCatalogLabels(values: Array<string | null | undefined>): string[] {
  const labels = new Map<string, string>();
  for (const value of values) {
    const label = String(value ?? "").trim();
    const slug = slugifyCatalogLabel(label);
    if (label && slug && !labels.has(slug)) labels.set(slug, label);
  }
  return Array.from(labels.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
