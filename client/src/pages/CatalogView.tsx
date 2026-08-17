import { useState } from "react";
import { Link, useRoute } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function CatalogViewPage() {
  const [, paramsCategory] = useRoute("/category/:slug");
  const [, paramsCollection] = useRoute("/collection/:slug");
  const [isCatalogRoute] = useRoute("/catalog");

  const filterType = paramsCategory ? "category" : paramsCollection ? "collection" : isCatalogRoute ? "all" : "all";
  const filterSlug = paramsCategory?.slug || paramsCollection?.slug || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data: products = [], isLoading } = trpc.catalog.list.useQuery();
  const { data: categories = [] } = trpc.catalog.categories.useQuery(undefined, { enabled: menuOpen });

  const playClickSound = () => playInteractionSound(soundEnabled);

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
    .replace(/[\\u0300-\\u036f]/g, "")
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
    return normalizeSlug(p.collection ?? p.collectionName) === normalizeSlug(filterSlug)
      || normalizeSlug(p.collection ?? p.collectionName).includes(normalizeSlug(filterSlug));
  });
  const displayProducts = filteredProducts;

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      {/* Top Header */}
      <header className="catalog-page-header border-b border-[#dfd7cc] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f6f3ee]/95 backdrop-blur z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { playClickSound(); setMenuOpen(true); }}
            className="p-1 hover:text-[#c95139] transition-colors"
            aria-label="Abrir Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <Link href="/" onClick={playClickSound} className="font-serif text-2xl font-black tracking-widest uppercase">
            ERAS.
          </Link>
        </div>
        <div className="catalog-page-actions flex items-center gap-6">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs uppercase tracking-widest flex items-center gap-1 hover:text-[#c95139]">
            {soundEnabled ? "Som Ativo" : "Mudo"}
          </button>
          <Link href="/auth" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#c95139]">Conta</Link>
        </div>
      </header>

      {/* Content */}
      <main className="catalog-page-main flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        {(() => {
          const matchedCategory = filterType === "category" ? categories.find((c: any) => c.slug.toLowerCase() === filterSlug.toLowerCase()) : null;
          const subcategories = matchedCategory ? categories.filter((c: any) => c.parentId === matchedCategory.id && c.active) : [];
          return (
            <>
              <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">
                {filterType === "category" ? "Categoria" : filterType === "collection" ? "Coleção" : "Catálogo"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                {filterType === "all" ? "Todos os produtos" : filterSlug.replace(/-/g, " ")}
              </h1>
              {matchedCategory?.coverImageUrl && (
                <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 bg-[#ded8cf]">
                  <img src={matchedCategory.coverImageUrl} alt={`Capa da categoria ${matchedCategory.name}`} className="w-full h-full object-cover" />
                </div>
              )}
              {subcategories.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap mb-10">
                  <span className="text-xs uppercase tracking-widest text-[#666] font-bold">Subcategorias:</span>
                  {subcategories.map((sub: any) => (
                    <Link key={sub.id} href={`/category/${sub.slug}`} onClick={playClickSound} className="px-3 py-1 bg-[#ede8df] hover:bg-[#c95139] hover:text-[#fff] text-xs font-bold uppercase transition-colors border border-[#d4cabf]">
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {isLoading ? (
          <div className="text-center py-20 uppercase tracking-widest text-sm">Carregando era...</div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-[#ede8df] p-12 rounded-lg text-center">
            <h3 className="text-xl font-bold uppercase mb-2">Nenhum produto encontrado nesta seleção</h3>
            <p className="text-sm text-[#554f46] mb-6">Explore outras categorias ou volte à página inicial.</p>
            <Link href="/" onClick={playClickSound}>
              <Button className="bg-[#23221e] text-[#f6f3ee] hover:bg-[#c95139]">Voltar ao Início</Button>
            </Link>
          </div>
        ) : (
          <div className="catalog-product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {displayProducts.map((p: any) => {
              const fallbackImage = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85";
              const images = normalizeImages(p.images);
              const imageSrc = images[0] || p.image || fallbackImage;
              return (
                <div key={p.id} className="catalog-product-card group bg-[#ede8df] rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden bg-[#dfd7cc] relative">
                    <img src={imageSrc} alt={p.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="catalog-product-copy p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#c95139]">{p.collection ?? p.collectionName ?? "Era Geral"}</span>
                      <h3 className="text-lg font-black uppercase mt-1 mb-2">{p.name}</h3>
                      <p className="text-sm font-semibold">R$ {Number(p.price).toFixed(2)}</p>
                    </div>
                    <Link href={`/produto/${p.slug || p.id}`} onClick={playClickSound} className="mt-4">
                      <Button variant="outline" className="w-full border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                        Ver na Loja
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <div className="lovable-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="lovable-side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="lovable-menu-header">
              <span className="lovable-menu-kicker">EXPLORAR ERAS</span>
              <button onClick={() => { playClickSound(); setMenuOpen(false); }} className="p-2 font-bold uppercase text-sm">Fechar [X]</button>
            </div>
            <div className="lovable-menu-links">
              <Link href="/" onClick={() => { playClickSound(); setMenuOpen(false); }}>Início</Link>
              <Link href="/archive" onClick={() => { playClickSound(); setMenuOpen(false); }}>Arquivo de Eras</Link>
              <Link href="/manifesto" onClick={() => { playClickSound(); setMenuOpen(false); }}>Manifesto Completo</Link>
              <Link href="/events" onClick={() => { playClickSound(); setMenuOpen(false); }}>Eventos</Link>
              <Link href="/contact" onClick={() => { playClickSound(); setMenuOpen(false); }}>Contato</Link>
              <a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" onClick={playClickSound} className="vip-whatsapp">
                Grupo VIP no WhatsApp
              </a>
            </div>
            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">CATEGORIAS</span>
              <div className="lovable-menu-sublinks">
                <Link href="/catalog" onClick={() => { playClickSound(); setMenuOpen(false); }}>Todos os Produtos</Link>
                {categories.length > 0 ? categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`} onClick={() => { playClickSound(); setMenuOpen(false); }}>{category.name}</Link>
                )) : <>
                  <Link href="/category/camisetas" onClick={() => { playClickSound(); setMenuOpen(false); }}>Camisetas</Link>
                  <Link href="/category/bones" onClick={() => { playClickSound(); setMenuOpen(false); }}>Bonés</Link>
                </>}
              </div>
            </div>
            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">COLEÇÕES</span>
              <div className="lovable-menu-sublinks">
                <Link href="/collection/paradox" onClick={() => { playClickSound(); setMenuOpen(false); }}>Paradox Collection</Link>
                <Link href="/collection/lost-between-eras" onClick={() => { playClickSound(); setMenuOpen(false); }}>Lost Between Eras</Link>
                <Link href="/collection/raizes" onClick={() => { playClickSound(); setMenuOpen(false); }}>Raízes — Recife & La Ursa</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
