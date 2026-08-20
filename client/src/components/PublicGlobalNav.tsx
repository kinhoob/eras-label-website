import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronDown, Menu, Moon, Search, ShoppingBag, Sun, UserRound } from "lucide-react";
import { CART_STORAGE_KEY, loadCart } from "@/lib/cart-storage";
import { SidebarMenu } from "@/components/SidebarMenu";
import { trpc } from "@/lib/trpc";
import { publicCategoryHref, type PublicNavigationCategory } from "@/lib/public-navigation";
import type { StorefrontConfig } from "../../../shared/storefront";
import { hasStorefrontAnnouncement } from "../../../shared/storefront-logic";
import { useTheme } from "@/contexts/ThemeContext";

function GlobalAnnouncementBar({ config }: { config?: StorefrontConfig }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const messages = config?.announcement.messages ?? [];
  const rotationSeconds = config?.announcement.rotationSpeedSeconds ?? 5;
  const showArrows = config?.announcement.showArrows ?? true;

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % messages.length), Math.max(2000, rotationSeconds * 1000));
    return () => window.clearInterval(timer);
  }, [messages.length, rotationSeconds]);

  useEffect(() => {
    if (activeIndex >= messages.length && messages.length > 0) setActiveIndex(0);
  }, [activeIndex, messages.length]);

  if (!config || !hasStorefrontAnnouncement(config) || messages.length === 0) return null;

  const message = messages[activeIndex % messages.length];
  const style = { backgroundColor: config.announcement.backgroundColor, color: config.announcement.textColor };
  const changeMessage = (direction: number) => setActiveIndex((current) => (current + direction + messages.length) % messages.length);

  return (
    <div className="public-global-announcement" style={style} role="status" aria-live="polite">
      {showArrows && messages.length > 1 && <button type="button" onClick={() => changeMessage(-1)} aria-label="Anúncio anterior">‹</button>}
      {message.href?.trim() ? (
        message.href.startsWith("/") ? <Link href={message.href} className="public-global-announcement-message" key={`${activeIndex}-${message.text}`}>{message.text}</Link> : <a href={message.href} className="public-global-announcement-message" target="_blank" rel="noreferrer">{message.text}</a>
      ) : <span className="public-global-announcement-message" key={`${activeIndex}-${message.text}`}>{message.text}</span>}
      {showArrows && messages.length > 1 && <button type="button" onClick={() => changeMessage(1)} aria-label="Próximo anúncio">›</button>}
    </div>
  );
}

/**
 * Barra de navegação pública única da loja.
 * Mantém pesquisa, rotas de categoria, carrinho e menu lateral consistentes
 * em todas as páginas públicas, sem aparecer no painel administrativo.
 */
export default function PublicGlobalNav() {
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [cartCount, setCartCount] = useState(() => loadCart<{ quantity: number }>().reduce((sum, item) => sum + item.quantity, 0));
  const isHome = location === "/";
  const isAdminOrAuthRoute = location.startsWith("/admin") || location.startsWith("/auth");
  const { data: categories = [] } = trpc.catalog.categories.useQuery(undefined, { enabled: !isAdminOrAuthRoute });
  const { data: navProducts = [], isLoading: isProductsLoading } = trpc.catalog.list.useQuery(undefined, { enabled: !isAdminOrAuthRoute });
  const { data: storefrontConfig } = trpc.catalog.getStorefrontConfig.useQuery(undefined, { enabled: !isAdminOrAuthRoute });
  const { data: collections = [] } = trpc.collections.list.useQuery(undefined, { enabled: !isAdminOrAuthRoute });
  const publicCategories = categories as PublicNavigationCategory[];

  // Normaliza acentos e espaços para que “bonés” e “bones” encontrem o mesmo produto.
  const normalizeSearchText = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
  const normalizedSearch = normalizeSearchText(searchQuery);

  // Filtra os produtos publicados usando os mesmos campos que o catálogo público conhece.
  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return (navProducts as any[]).filter((product) => {
      const searchable = [
        product.name,
        product.collection,
        product.collectionName,
        product.category,
        product.subcategory,
        ...(Array.isArray(product.categoryNames) ? product.categoryNames : []),
        product.detail,
        product.description,
      ]
        .filter(Boolean)
        .map(normalizeSearchText)
        .join(" ");
      return searchable.includes(normalizedSearch);
    }).slice(0, 5);
  }, [navProducts, normalizedSearch]);

  const getSearchImage = (product: any) => {
    if (typeof product.image === "string" && product.image) return product.image;
    if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed[0] : product.images;
      } catch {
        return product.images;
      }
    }
    if (Array.isArray(product.images) && product.images[0]) {
      return typeof product.images[0] === "string" ? product.images[0] : product.images[0].url;
    }
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=320&q=80";
  };

  const publicCollections = useMemo(() => (collections as any[])
    .filter((collection) => collection?.active !== 0)
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) || String(b.year ?? "").localeCompare(String(a.year ?? ""))), [collections]);

  useEffect(() => {
    const syncCart = () => {
      const nextCount = loadCart<{ quantity: number }>().reduce((sum, item) => sum + item.quantity, 0);
      setCartCount((current) => current === nextCount ? current : nextCount);
    };
    window.addEventListener("storage", syncCart);
    window.addEventListener("eras-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("eras-cart-updated", syncCart);
    };
  }, [location]);

  useEffect(() => {
    // Reidrata o termo quando o utilizador chega ao catálogo através da navbar.
    const queryFromUrl = new URLSearchParams(location.split("?")[1] ?? "").get("q") ?? "";
    setSearchQuery(queryFromUrl);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCollectionsOpen(false);
    setIsProductsOpen(false);
    setIsVisible(true);
  }, [location]);

  useEffect(() => {
    let previousY = window.scrollY;
    let stopTimer: number | undefined;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const movingUp = currentY < previousY;
      setIsVisible(currentY < 24 || movingUp);
      previousY = currentY;
      if (stopTimer) window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => setIsVisible(true), 180);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimer) window.clearTimeout(stopTimer);
    };
  }, [isHome]);

  if (isAdminOrAuthRoute) return null;

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setIsSearchOpen(true);
      return;
    }
    // A query completa fica na URL para que CatalogView aplique exatamente o mesmo filtro.
    setIsSearchOpen(false);
    navigate(`/catalog?q=${encodeURIComponent(query)}`);
  };

  const openProduct = (product: any) => {
    setIsSearchOpen(false);
    navigate(`/produto/${product.slug || product.id}`);
  };

  return (
    <>
      <GlobalAnnouncementBar config={storefrontConfig} />
      <div className={`public-global-nav ${isHome ? "public-global-nav--home" : ""} ${isVisible ? "is-visible" : "is-hidden"}`} role="banner">
        <div className="public-global-left-tools">
          <button className="public-global-menu-trigger" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu público">
            <Menu size={18} strokeWidth={1.7} />
            <span>MENU</span>
          </button>

          <form className={`public-global-search-wrap ${isSearchOpen ? "is-open" : ""}`} onSubmit={submitSearch} role="search">
            <div className="public-global-search">
              <Search size={16} strokeWidth={1.7} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(event) => { setSearchQuery(event.target.value); setIsSearchOpen(true); }}
                onKeyDown={(event) => { if (event.key === "Escape") { setIsSearchOpen(false); event.currentTarget.blur(); } }}
                placeholder="O que você está buscando?"
                aria-label="Pesquisar produtos"
                aria-controls="public-global-search-results"
                autoComplete="off"
              />
              {searchQuery && <button type="button" className="public-global-search-clear" onClick={() => setSearchQuery("")} aria-label="Limpar busca">×</button>}
              <button type="submit" aria-label="Pesquisar"><ArrowRight size={14} /></button>
            </div>

            {isSearchOpen && (
              <div id="public-global-search-results" className="public-global-search-results" role="listbox" aria-label="Resultados da pesquisa">
                {isProductsLoading && normalizedSearch ? (
                  <p className="public-global-search-hint" role="status" aria-live="polite">A procurar peças para si…</p>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="public-global-search-heading"><span>RESULTADOS DA PESQUISA</span><small>{searchResults.length} sugestões</small></div>
                    {searchResults.map((product: any) => (
                      <button key={product.id} type="button" role="option" className="public-global-search-result" onMouseDown={(event) => event.preventDefault()} onClick={() => openProduct(product)}>
                        <img src={getSearchImage(product)} alt="" />
                        <span><strong>{product.name}</strong><small>{product.collection || product.category || "Eras Label"}</small></span>
                        <b>R$ {Number(product.price || 0).toFixed(2).replace(".", ",")}</b>
                      </button>
                    ))}
                    <button type="submit" className="public-global-search-see-all">VER TODOS OS RESULTADOS <ArrowRight size={13} /></button>
                  </>
                ) : (
                  <div className="public-global-search-empty">
                    <strong>Nenhum produto encontrado.</strong>
                    <span>Tente outro termo ou veja todo o catálogo.</span>
                    <button type="submit">VER CATÁLOGO <ArrowRight size={13} /></button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <Link href="/" className="public-global-brand" aria-label="Voltar para a loja Eras Label"><img src="/eras-logo-sticker.webp" alt="Eras Label" style={{ height: "60px", width: "auto", objectFit: "contain", display: "block" }} /></Link>

        <div className="public-global-right-tools">
          <button
            type="button"
            className="public-global-theme-toggle"
            onClick={() => toggleTheme?.()}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo noturno"}
            title={theme === "dark" ? "Modo claro" : "Modo noturno"}
          >
            {theme === "dark" ? <Sun size={17} strokeWidth={1.7} aria-hidden="true" /> : <Moon size={17} strokeWidth={1.7} aria-hidden="true" />}
          </button>
          <Link href="/account" className="public-global-account" aria-label="Abrir minha conta"><UserRound size={17} strokeWidth={1.7} /></Link>
          <button type="button" className="public-global-bag" aria-label={`Abrir sacola${cartCount ? ` com ${cartCount} itens` : " vazia"}`} onClick={() => window.dispatchEvent(new Event("eras-open-cart"))}>
            <ShoppingBag size={16} strokeWidth={1.7} />
            <span>SACOLA</span>
            {cartCount > 0 && <strong>{cartCount}</strong>}
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        <nav className="public-global-links" aria-label="Navegação da loja">
          <Link href="/" className={location === "/" ? "is-active" : ""}>Início</Link>
          <div className={`public-global-products ${isProductsOpen ? "is-open" : ""}`} onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)}>
            <button
              type="button"
              className={isProductsOpen || location === "/catalog" || location.startsWith("/category/") ? "is-active" : ""}
              aria-expanded={isProductsOpen}
              aria-haspopup="menu"
              onFocus={() => setIsProductsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsProductsOpen(false);
                  event.currentTarget.blur();
                }
              }}
              onClick={() => {
                setIsProductsOpen((value) => !value);
                setIsCollectionsOpen(false);
              }}
            >
              Produtos <ChevronDown size={12} aria-hidden="true" />
            </button>
            <div className="public-global-products-menu" role="menu" aria-label="Produtos por categoria">
              <span className="public-global-products-eyebrow">CATÁLOGO</span>
              <Link href="/catalog" role="menuitem" onClick={() => setIsProductsOpen(false)}>Todos os produtos <ArrowRight size={13} /></Link>
              {publicCategories.length > 0 ? publicCategories.map((category) => (
                <Link key={category.id} href={publicCategoryHref(category, "/catalog")} role="menuitem" onClick={() => setIsProductsOpen(false)}>
                  <span>{category.name}</span><ArrowRight size={13} aria-hidden="true" />
                </Link>
              )) : <span className="public-global-products-empty">Nenhuma categoria publicada</span>}
            </div>
          </div>
          <div className={`public-global-collections ${isCollectionsOpen ? "is-open" : ""}`} onMouseEnter={() => setIsCollectionsOpen(true)} onMouseLeave={() => setIsCollectionsOpen(false)}>
            <button type="button" className={isCollectionsOpen || location.startsWith("/archive") || location.startsWith("/collection/") ? "is-active" : ""} aria-expanded={isCollectionsOpen} aria-haspopup="menu" onClick={() => { setIsCollectionsOpen((value) => !value); setIsProductsOpen(false); }}>
              Coleções <ChevronDown size={12} aria-hidden="true" />
            </button>
            <div className="public-global-collections-menu" role="menu">
              <span className="public-global-collections-eyebrow">ERAS</span>
              <Link href="/archive" role="menuitem" onClick={() => setIsCollectionsOpen(false)}>Todas as coleções <ArrowRight size={13} /></Link>
              {publicCollections.map((collection: any) => <Link key={collection.id} href={collection.ctaUrl || `/collection/${collection.slug || collection.id}`} role="menuitem" onClick={() => setIsCollectionsOpen(false)}><span>{collection.name}</span><small>{collection.year}</small></Link>)}
            </div>
          </div>
        </nav>
      </div>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onPlaySound={() => undefined} />
    </>
  );
}

export const PUBLIC_CART_STORAGE_KEY = CART_STORAGE_KEY;
