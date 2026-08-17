import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu, ShoppingBag } from "lucide-react";
import { CART_STORAGE_KEY, loadCart } from "@/lib/cart-storage";
import { SidebarMenu } from "@/components/SidebarMenu";
import { trpc } from "@/lib/trpc";
import { findPublicCategory, getExtraPublicCategories, publicCategoryHref, type PublicNavigationCategory } from "@/lib/public-navigation";

export default function PublicGlobalNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [cartCount, setCartCount] = useState(() => loadCart<{ quantity: number }>().reduce((sum, item) => sum + item.quantity, 0));
  const isHome = location === "/";
  const isAdminOrAuthRoute = location.startsWith("/admin") || location.startsWith("/auth");
  const { data: categories = [] } = trpc.catalog.categories.useQuery(undefined, { enabled: !isAdminOrAuthRoute });
  const publicCategories = categories as PublicNavigationCategory[];
  const camisetasCategory = findPublicCategory(publicCategories, "camiseta");
  const bonesCategory = findPublicCategory(publicCategories, "bone");
  const extraCategories = getExtraPublicCategories(publicCategories);

  useEffect(() => {
    const syncCart = () => setCartCount(loadCart<{ quantity: number }>().reduce((sum, item) => sum + item.quantity, 0));
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("eras-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("eras-cart-updated", syncCart);
    };
  }, [location]);

  useEffect(() => {
    setIsMenuOpen(false);
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

  return (
    <>
      <div className={`public-global-nav ${isHome ? "public-global-nav--home" : ""} ${isVisible ? "is-visible" : "is-hidden"}`} role="banner">
        <button className="public-global-menu-trigger" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu público">
          <Menu size={18} strokeWidth={1.7} />
          <span>MENU</span>
        </button>
        <Link href="/" className="public-global-brand" aria-label="Voltar para a loja Eras Label">ERAS<span>.</span></Link>
        <nav className="public-global-links" aria-label="Navegação da loja">
          <Link href="/" className={location === "/" ? "is-active" : ""}>Início</Link>
          <Link href="/catalog" className={location === "/catalog" ? "is-active" : ""}>Produtos</Link>
          <Link href={publicCategoryHref(camisetasCategory, "/category/camisetas")} className={location.includes("camiseta") ? "is-active" : ""}>Camisetas</Link>
          <Link href={publicCategoryHref(bonesCategory, "/category/bones")} className={location.includes("bone") ? "is-active" : ""}>Bonés</Link>
          {extraCategories.map((category) => <Link key={category.id} href={publicCategoryHref(category, "/catalog")} className={location.includes(category.slug) ? "is-active" : ""}>{category.name}</Link>)}
        </nav>
        <button type="button" className="public-global-bag" aria-label={`Abrir sacola${cartCount ? ` com ${cartCount} itens` : " vazia"}`} onClick={() => window.dispatchEvent(new Event("eras-open-cart"))}>
          <ShoppingBag size={16} strokeWidth={1.7} />
          <span>SACOLA</span>
          {cartCount > 0 && <strong>{cartCount}</strong>}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onPlaySound={() => undefined} />
    </>
  );
}

export const PUBLIC_CART_STORAGE_KEY = CART_STORAGE_KEY;
