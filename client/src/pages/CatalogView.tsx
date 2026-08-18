import { useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { searchStorefrontProducts, sortStorefrontProducts, type StorefrontSearchSort } from "@/lib/storefront-search";
import { filterStorefrontProducts, getStorefrontFilterOptions } from "@/lib/storefront-filters";
import { PageTransitionHandler } from "@/components/PageTransition";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import OfficialFooter from "@/components/OfficialFooter";

const catalogImageFallback = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85";

function normalizeSlug(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeImages(value: unknown): string[] {
  const parsed = typeof value === "string" ? (() => {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  })() : value;

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry) => {
    if (typeof entry === "string") return entry;
    if (entry && typeof entry === "object" && "url" in entry && typeof (entry as { url?: unknown }).url === "string") {
      return (entry as { url: string }).url;
    }
    return [];
  });
}

function formatPrice(value: unknown) {
  return Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CatalogViewPage() {
  const [location] = useLocation();
  const [, paramsCategory] = useRoute("/category/:slug");
  const [, paramsCollection] = useRoute("/collection/:slug");
  const [, isCatalogRoute] = useRoute("/catalog");

  const filterType = paramsCategory ? "category" : paramsCollection ? "collection" : isCatalogRoute ? "all" : "all";
  const filterSlug = paramsCategory?.slug || paramsCollection?.slug || "";
  const searchQuery = new URLSearchParams(location.split("?")[1] ?? "").get("q") ?? "";

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedSize, setSelectedSize] = useState("Todos");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortOrder, setSortOrder] = useState<StorefrontSearchSort>("price-asc");

  const { data: products = [], isLoading } = trpc.catalog.list.useQuery();
  const { data: categories = [] } = trpc.catalog.categories.useQuery();

  const searchableProducts = useMemo(() => products.map((product: any) => ({
    ...product,
    collection: product.collection ?? product.collectionName ?? "",
    category: product.category ?? "",
    categoryNames: Array.isArray(product.categoryNames) ? product.categoryNames : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    detail: product.detail ?? product.description ?? "",
    price: Number(product.price ?? 0),
  })), [products]);

  const routeFilteredProducts = useMemo(() => searchableProducts.filter((product: any) => {
    if (filterType === "category") {
      const target = normalizeSlug(filterSlug);
      const names = [product.category, product.subcategory, ...product.categoryNames];
      return names.some((name) => normalizeSlug(name) === target || normalizeSlug(name).includes(target));
    }

    if (filterType === "collection") {
      const collection = normalizeSlug(product.collection);
      const target = normalizeSlug(filterSlug);
      return collection === target || collection.includes(target);
    }

    return true;
  }), [filterSlug, filterType, searchableProducts]);

  const categoryOptions = useMemo(() => {
    const configured = categories
      .filter((category: any) => category.active)
      .map((category: any) => category.name)
      .filter(Boolean);
    const derived = searchableProducts.flatMap((product: any) => product.categoryNames.length > 0 ? product.categoryNames : [product.category]).filter(Boolean);
    return Array.from(new Set(["Todos", ...configured, ...derived]));
  }, [categories, searchableProducts]);

  const { sizes: sizeOptions } = useMemo(() => getStorefrontFilterOptions(searchableProducts), [searchableProducts]);
  const normalizedMinPrice = Number.parseFloat(priceMin.replace(",", "."));
  const normalizedMaxPrice = Number.parseFloat(priceMax.replace(",", "."));
  const categoryFilter = filterType === "all" ? selectedCategory : "Todos";

  const displayProducts = useMemo(() => {
    const filtered = filterStorefrontProducts(routeFilteredProducts, {
      category: categoryFilter,
      size: selectedSize,
      minPrice: Number.isFinite(normalizedMinPrice) ? normalizedMinPrice : undefined,
      maxPrice: Number.isFinite(normalizedMaxPrice) ? normalizedMaxPrice : undefined,
    });
    const searched = searchQuery.trim() ? searchStorefrontProducts(filtered, searchQuery) : filtered;
    return sortStorefrontProducts(searched, sortOrder);
  }, [categoryFilter, normalizedMaxPrice, normalizedMinPrice, routeFilteredProducts, searchQuery, selectedSize, sortOrder]);

  const matchedCategory = filterType === "category"
    ? categories.find((category: any) => normalizeSlug(category.slug) === normalizeSlug(filterSlug))
    : null;
  const subcategories = matchedCategory
    ? categories.filter((category: any) => category.parentId === matchedCategory.id && category.active)
    : [];
  const activeFilterCount = [
    selectedCategory !== "Todos" && filterType === "all",
    selectedSize !== "Todos",
    Boolean(priceMin.trim() || priceMax.trim()),
    sortOrder !== "price-asc",
  ].filter(Boolean).length;

  function clearFilters() {
    setSelectedCategory("Todos");
    setSelectedSize("Todos");
    setPriceMin("");
    setPriceMax("");
    setSortOrder("price-asc");
  }

  const title = searchQuery
    ? `Pesquisa: ${searchQuery}`
    : filterType === "all"
      ? "Todos os produtos"
      : filterSlug.replace(/-/g, " ");

  return (
    <div className="public-page-shell catalog-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      <main className="public-page-content catalog-page-main flex-1 w-full">
        <header className="catalog-page-header">
          <div>
            <span className="catalog-kicker">{searchQuery ? "Resultados da pesquisa" : filterType === "category" ? "Categoria" : filterType === "collection" ? "Coleção" : "Catálogo"}</span>
            <h1>{title}</h1>
            <p className="catalog-result-summary">
              {isLoading ? "A carregar a era..." : `${displayProducts.length} ${displayProducts.length === 1 ? "peça disponível" : "peças disponíveis"}`}
            </p>
          </div>
          {filterType !== "all" && <Link className="catalog-back-link" href="/catalog">Ver todos os produtos ↗</Link>}
        </header>

        {matchedCategory?.coverImageUrl && (
          <div className="catalog-category-cover">
            <img src={matchedCategory.coverImageUrl} alt={`Capa da categoria ${matchedCategory.name}`} />
          </div>
        )}

        {subcategories.length > 0 && (
          <div className="catalog-subcategories">
            <span>Subcategorias</span>
            {subcategories.map((subcategory: any) => (
              <Link key={subcategory.id} href={`/category/${subcategory.slug}`}>{subcategory.name}</Link>
            ))}
          </div>
        )}

        <div className="catalog-layout">
          <aside className="catalog-filter-sidebar" aria-label="Filtros do catálogo">
            <div className="catalog-filter-heading">
              <div>
                <span className="catalog-filter-kicker">Refinar</span>
                <h2><SlidersHorizontal size={15} aria-hidden="true" /> Filtros</h2>
              </div>
              {activeFilterCount > 0 && <span className="catalog-filter-count">{activeFilterCount}</span>}
            </div>

            <div className="catalog-filter-group">
              <span className="catalog-filter-label">Categorias</span>
              <div className="catalog-category-links">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={categoryFilter === category ? "is-active" : ""}
                    disabled={filterType !== "all"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {filterType !== "all" && <small>Esta página já está filtrada por {filterSlug.replace(/-/g, " ")}.</small>}
            </div>

            <div className="catalog-filter-group">
              <span className="catalog-filter-label">Tamanho</span>
              <div className="catalog-size-options">
                <button type="button" className={selectedSize === "Todos" ? "is-active" : ""} onClick={() => setSelectedSize("Todos")}>Todos</button>
                {sizeOptions.map((size) => (
                  <button key={size} type="button" className={selectedSize === size ? "is-active" : ""} onClick={() => setSelectedSize(size)}>{size}</button>
                ))}
              </div>
            </div>

            <div className="catalog-filter-group catalog-price-group">
              <span className="catalog-filter-label">Preço</span>
              <div className="catalog-price-fields">
                <label>
                  <span>De</span>
                  <input inputMode="decimal" type="number" min="0" placeholder="R$ 0" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} />
                </label>
                <label>
                  <span>Até</span>
                  <input inputMode="decimal" type="number" min="0" placeholder="Sem limite" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} />
                </label>
              </div>
            </div>

            <div className="catalog-filter-group">
              <label className="catalog-filter-label" htmlFor="catalog-sort">Ordenar por</label>
              <select id="catalog-sort" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as StorefrontSearchSort)}>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="newest">Mais recentes</option>
              </select>
            </div>

            <button type="button" className="catalog-clear-filters" onClick={clearFilters}>
              <RotateCcw size={13} aria-hidden="true" /> Limpar filtros
            </button>
          </aside>

          <section className="catalog-page-products" aria-live="polite">
            {isLoading ? (
              <div className="catalog-state-message"><span className="catalog-state-spinner" /> A carregar a era...</div>
            ) : displayProducts.length === 0 ? (
              <div className="catalog-state-message">
                <h3>Nenhum produto encontrado nesta seleção</h3>
                <p>{searchQuery ? "Tente outro termo ou explore o catálogo completo." : "Ajuste os filtros para descobrir outras peças da Eras Label."}</p>
                <Button type="button" onClick={clearFilters} className="catalog-empty-action">LIMPAR FILTROS</Button>
              </div>
            ) : (
              <div className="catalog-product-grid">
                {displayProducts.map((product: any) => {
                  const images = normalizeImages(product.images);
                  const imageSrc = images[0] || product.image;
                  return (
                    <article key={product.id} className="catalog-product-card group">
                      <Link href={`/produto/${product.slug || product.id}`} className="catalog-product-media" aria-label={`Ver ${product.name}`}>
                        {imageSrc ? (
                          <img src={imageSrc} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = catalogImageFallback; }} />
                        ) : (
                          <span>Imagem a caminho</span>
                        )}
                      </Link>
                      <div className="catalog-product-copy">
                        <div className="catalog-product-heading">
                          <div>
                            <span>{product.collection || "Era Geral"}</span>
                            <h2>{product.name}</h2>
                          </div>
                          <strong>{formatPrice(product.price)}</strong>
                        </div>
                        <p>{product.pixPrice ? `${formatPrice(product.pixPrice)} no Pix` : "Edição limitada"}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <OfficialFooter />
    </div>
  );
}
