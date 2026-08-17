import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { CART_STORAGE_KEY, loadCart } from "@/lib/cart-storage";

export default function PublicGlobalNav() {
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(() => loadCart<{ quantity: number }>().reduce((sum, item) => sum + item.quantity, 0));

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

  if (location === "/" || location.startsWith("/admin") || location.startsWith("/auth")) return null;

  return (
    <div className="public-global-nav" role="banner">
      <Link href="/" className="public-global-brand" aria-label="Voltar para a loja Eras Label">ERAS<span>.</span></Link>
      <Link href="/checkout" className="public-global-bag" aria-label={`Abrir sacola${cartCount ? ` com ${cartCount} itens` : " vazia"}`}>
        <ShoppingBag size={16} strokeWidth={1.7} />
        <span>SACOLA</span>
        {cartCount > 0 && <strong>{cartCount}</strong>}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

export const PUBLIC_CART_STORAGE_KEY = CART_STORAGE_KEY;
