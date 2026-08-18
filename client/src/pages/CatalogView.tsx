import { Link, useLocation, useRoute } from "wouter";
import { searchStorefrontProducts } from "@/lib/storefront-search";
import { PageTransitionHandler } from "@/components/PageTransition";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import OfficialFooter from "@/components/OfficialFooter";

const catalogImageFallback = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85";

export default function CatalogViewPage() {
  const [location] = useLocation();
  const [, paramsCategory] = useRoute("/category/:slug");
  const [, paramsCollection] = useRoute("/collection/:slug");
  const [isCatalogRoute] = useRoute("/catalog");

  const filterType = paramsCategory ? "category" : paramsCollection ? "collection" : isCatalogRoute ? "all" : "all";
  const filterSlug = paramsCategory?.slug || paramsCollection?.slug || "";

  const { data: products = [], isLoading } = trpc.catalog.list.useQuery();
  const { data: categories = [] } = trpc.catalog.categories.useQuery();

  const normalizeImages = (value: unknown): string[] => {
    const parsed = typeof value === "string" ? (() => { try { return JSON.parse(value); } catch { return [value]; } })() : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && "url" in entry && typeof (entry as { url?: unknown }).url === "string") return (entry as { url: string }).url;
      return [];
    });
  };

  const normalizeSlug = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const filteredProducts = products.filter((p: any) => {
    if (filterType === "all") return true;
    if (filterType === "category") {
      const target = normalizeSlug(filterSlug);
      const names = [p.category, p.subcategory, ...(Array.isArray(p.categoryNames) ? p.categoryNames : [])];
      return names.some((name) => normalizeSlug(name) === target || normalizeSlug(name).includes(target));
    }
    const collection = normalizeSlug(p.collection ?? p.collectionName);
    return collection === normalizeSlug(filterSlug) || collection.includes(normalizeSlug(filterSlug));
  });

  const searchQuery = new URLSearchParams(location.split("?")[1] ?? "").get("q") ?? "";
  const searchableProducts = filteredProducts.map((product: any) => ({
    ...product,
    collection: product.collection ?? product.collectionName ?? "",
    category: product.category ?? "",
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    detail: product.detail ?? product.description ?? "",
  }));
  const displayProducts = searchQuery ? searchStorefrontProducts(searchableProducts, searchQuery) : searchableProducts;


  return (
    <div className="public-page-shell catalog-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      <main className="public-page-content catalog-page-main flex-1 max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full">
        {(() => {
          const matchedCategory = filterType === "category" ? categories.find((c: any) => c.slug.toLowerCase() === filterSlug.toLowerCase()) : null;
          const subcategories = matchedCategory ? categories.filter((c: any) => c.parentId === matchedCategory.id && c.active) : [];
          return (
            <>
              <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">
                {searchQuery ? "Resultados da pesquisa" : filterType === "category" ? "Categoria" : filterType === "collection" ? "Coleção" : "Catálogo"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                {searchQuery ? `Pesquisa: ${searchQuery}` : filterType === "all" ? "Todos os produtos" : filterSlug.replace(/-/g, " ")}
              </h1>
              {matchedCategory?.coverImageUrl && (
                <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 bg-[#ded8cc]">
                  <img src={matchedCategory.coverImageUrl} alt={`Capa da categoria ${matchedCategory.name}`} className="w-full h-full object-cover" />
                </div>
              )}
              {subcategories.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap mb-10">
                  <span className="text-xs uppercase tracking-widest text-[#666] font-bold">Subcategorias:</span>
                  {subcategories.map((sub: any) => (
                    <Link key={sub.id} href={`/category/${sub.slug}`} className="px-3 py-1 bg-[#ede8df] hover:bg-[#c95139] hover:text-[#fff] text-xs font-bold uppercase transition-colors border border-[#d4cabf]">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {isLoading ? (
          <div className="text-center py-20 uppercase tracking-widest text-sm">A carregar a era...</div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-[#ede8df] p-12 rounded-lg text-center">
            <h3 className="text-xl font-bold uppercase mb-2">Nenhum produto encontrado nesta seleção</h3>
            <p className="text-sm text-[#554f46] mb-6">{searchQuery ? "Tente outro termo ou explore o catálogo completo." : "Quando houver peças publicadas nesta seleção, elas aparecerão aqui."}</p>
            <Link href="/catalog">
              <Button className="bg-[#23221e] text-[#f6f3ee] hover:bg-[#c95139]">EXPLORAR PRODUTOS</Button>
            </Link>
          </div>
        ) : (
          <div className="catalog-product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {displayProducts.map((p: any) => {
              const images = normalizeImages(p.images);
              const imageSrc = images[0] || p.image;
              return (
                <article key={p.id} className="catalog-product-card group bg-[#ede8df] rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden bg-[#dfd7cc] relative">
                    {imageSrc ? (
                      <img src={imageSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = catalogImageFallback; }} />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs uppercase tracking-[.22em] text-[#8c8378]">Imagem a caminho</div>
                    )}
                  </div>
                  <div className="catalog-product-copy p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#c95139]">{p.collection ?? p.collectionName ?? "Era Geral"}</span>
                      <h2 className="text-lg font-black uppercase mt-1 mb-2">{p.name}</h2>
                      <p className="text-sm font-semibold">R$ {Number(p.price).toFixed(2)}</p>
                    </div>
                    <Link href={`/produto/${p.slug || p.id}`} className="mt-4">
                      <Button variant="outline" className="w-full border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                        VER PRODUTO
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <OfficialFooter />
    </div>
  );
}
