import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { getCartItemCount } from "@/lib/cart";
import { removeCartLine, updateCartLineQuantity } from "@/lib/cart-operations";
import { saveCheckoutDraft } from "@/lib/checkout-draft";

export type PublicCartLine = {
  id: number;
  name: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  image?: string;
  alt?: string;
  stock?: number;
};

const editorialCartImage = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PublicCartDrawer() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<PublicCartLine[]>(() => loadCart<PublicCartLine>());
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<boolean | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const [shippingCep, setShippingCep] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [selectedShippingId, setSelectedShippingId] = useState("");

  const { data: commercialConfig } = trpc.catalog.getConfig.useQuery(undefined, { enabled: !location.startsWith("/admin") });
  const pixDiscountPercent = commercialConfig?.pixDiscountPercent ?? 5;
  const freeShippingThreshold = commercialConfig?.freeShippingThreshold ?? 350;
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0), [cart]);
  const couponValidateQuery = trpc.coupons.validate.useQuery(
    { code: coupon.trim(), subtotal },
    { enabled: false },
  );
  const { data: shippingData, isLoading: shippingLoading } = trpc.catalog.calculateShipping.useQuery(
    { cep: shippingCep, subtotal },
    { enabled: shippingCep.length === 8 && cart.length > 0 },
  );
  const shippingOptions = shippingData?.options ?? (shippingData ? [{ id: "default", service: shippingData.service, cost: shippingData.cost, deadline: shippingData.deadline, free: shippingData.free }] : []);
  const activeShippingOption = shippingOptions.find((option) => option.id === selectedShippingId) ?? shippingOptions[0];
  const shippingCost = activeShippingOption?.free ? 0 : Number(activeShippingOption?.cost ?? 0);
  const total = Math.max(0, subtotal - couponDiscount + shippingCost);
  const cartCount = getCartItemCount(cart);
  const progress = freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;

  useEffect(() => {
    if (!shippingData) {
      setSelectedShippingId("");
      return;
    }
    setSelectedShippingId((current) => shippingOptions.some((option) => option.id === current) ? current : (shippingOptions[0]?.id ?? ""));
  }, [shippingData]);

  useEffect(() => {
    if (location.startsWith("/admin") || location.startsWith("/auth")) {
      setIsOpen(false);
      return;
    }
    const syncCart = () => {
      const nextCart = loadCart<PublicCartLine>();
      setCart((current) => JSON.stringify(current) === JSON.stringify(nextCart) ? current : nextCart);
    };
    const openCart = () => setIsOpen(true);
    window.addEventListener("eras-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener("eras-open-cart", openCart);
    return () => {
      window.removeEventListener("eras-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("eras-open-cart", openCart);
    };
  }, [location]);

  // Removido o useEffect que disparava saveCart e dispatchEvent em loop a cada mudança de cart.
  // A persistência agora ocorre diretamente nas funções de mutação (changeQuantity, remove, etc.)
  // para evitar o erro de Maximum update depth exceeded.

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function notifyCartUpdated() {
    window.setTimeout(() => window.dispatchEvent(new Event("eras-cart-updated")), 0);
  }

  function changeQuantity(productId: number, size: string, delta: number, color?: string) {
    const next = updateCartLineQuantity(cart, productId, size, delta, color);
    setCart(next);
    saveCart(next);
    notifyCartUpdated();
  }

  // Remove a linha, persiste a alteração e só depois notifica os outros componentes do storefront.
  function removeItem(item: PublicCartLine) {
    const itemColor = item.color ?? "Preto";
    const next = removeCartLine(cart, item.id, item.size, itemColor);
    setCart(next);
    saveCart(next);
    notifyCartUpdated();
    toast.success("Item removido da sacola.", {
      description: `${item.name} · ${item.size} (${itemColor})`,
      action: {
        label: "Desfazer",
        onClick: () => {
          const restored = cart.some((line) => line.id === item.id && line.size === item.size && (line.color ?? "Preto") === itemColor) ? cart : [...cart, item];
          setCart(restored);
          saveCart(restored);
          notifyCartUpdated();
        },
      },
    });
  }

  async function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await couponValidateQuery.refetch();
      const discount = Number(result.data?.discount ?? 0);
      if (result.data?.valid && discount > 0) {
        setCouponApplied(true);
        setCouponDiscount(discount);
        toast.success(`Cupom aplicado: ${formatPrice(discount)} de desconto.`);
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        toast.error("Cupom inválido, expirado ou valor mínimo não atingido.");
      }
    } catch {
      setCouponApplied(false);
      setCouponDiscount(0);
      toast.error("Erro ao validar o cupom. Tente novamente.");
    } finally {
      setCouponLoading(false);
    }
  }

  function goToCheckout() {
    saveCheckoutDraft({
      coupon,
      couponApplied: couponApplied === true,
      selectedPaymentMethod,
      shippingCep,
      shippingMethod: activeShippingOption?.service,
    });
    setIsOpen(false);
    window.setTimeout(() => window.location.assign("/checkout"), 0);
  }

  if (location.startsWith("/admin") || location.startsWith("/auth") || !isOpen) return null;

  return (
    <div className="overlay public-cart-overlay" onClick={() => setIsOpen(false)}>
      <aside className="side-cart public-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="public-cart-drawer-title" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span className="section-kicker">SACOLA</span>
            <h2 id="public-cart-drawer-title" aria-live="polite">Seu Carrinho ({cartCount})</h2>
          </div>
          <button type="button" className="close-button" onClick={() => setIsOpen(false)} aria-label="Fechar sacola"><X /></button>
        </div>

        <div className="free-shipping-progress" aria-label="Progresso de frete grátis">
          <div className="shipping-progress-text">
            {subtotal >= freeShippingThreshold ? <span><strong>Parabéns!</strong> Você conquistou frete grátis.</span> : <span>Faltam <strong>{formatPrice(Math.max(0, freeShippingThreshold - subtotal))}</strong> para frete grátis.</span>}
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {cart.length === 0 ? (
          <div className="public-cart-empty">
            <div className="public-cart-empty-icon">✦</div>
            <h4>Sua sacola está vazia</h4>
            <p>Ainda não há peças selecionadas. Explore nossas coleções e manifesto para encontrar itens com a essência Eras.</p>
            <button type="button" className="public-cart-explore" onClick={() => { setIsOpen(false); window.location.assign("/catalog"); }}>EXPLORAR CATÁLOGO</button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => {
                const itemColor = item.color ?? "Preto";
                return (
                  <div className="cart-item" key={`${item.id}-${item.size}-${itemColor}`}>
                    <img src={item.image || editorialCartImage} alt={item.alt || item.name} />
                    <div className="cart-item-details">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-variant">Tamanho: {item.size} · Cor: {itemColor}</p>
                      <div className="cart-item-bottom">
                        <div className="quantity-stepper">
                          <button type="button" onClick={() => changeQuantity(item.id, item.size, -1, itemColor)} aria-label="Diminuir quantidade"><Minus size={13} /></button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => changeQuantity(item.id, item.size, 1, itemColor)} aria-label="Aumentar quantidade"><Plus size={13} /></button>
                        </div>
                        <strong>{formatPrice(Number(item.price || 0) * item.quantity)}</strong>
                      </div>
                    </div>
                    <button type="button" className="cart-item-remove" onClick={() => removeItem(item)} aria-label={`Remover ${item.name}`}><X size={15} /></button>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="coupon-box">
                <div className="coupon-input-group">
                  <Input value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(null); setCouponDiscount(0); }} placeholder="Insira seu cupom" disabled={couponLoading} aria-label="Código do cupom" />
                  <button type="button" className="coupon-apply-btn cart-inline-confirm" onClick={() => void applyCoupon()} disabled={couponLoading}>{couponLoading ? <Loader2 size={16} className="spinner-icon" /> : "OK"}</button>
                </div>
                {couponApplied === true && <p className="coupon-feedback success">Cupom aplicado com sucesso.</p>}
                {couponApplied === false && <p className="coupon-feedback error">Cupom inválido ou expirado.</p>}
              </div>

              <div className="cep-calc-box">
                <div className="coupon-input-group">
                  <Input value={cepInput} onChange={(event) => setCepInput(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Insira seu CEP" maxLength={8} aria-label="CEP para cálculo de frete" />
                  <button type="button" className="coupon-apply-btn cart-inline-confirm" onClick={() => setShippingCep(cepInput)} disabled={cepInput.length !== 8}>OK</button>
                </div>
                {shippingLoading && <p className="shipping-info-text">Calculando opções de frete...</p>}
                {shippingData && !shippingLoading && <div className="shipping-options" role="radiogroup" aria-label="Escolha o método de frete">
                  <span className="shipping-options-label">Escolha o frete</span>
                  {shippingOptions.map((option) => (
                    <label className={`shipping-option ${activeShippingOption?.id === option.id ? "is-selected" : ""}`} key={option.id}>
                      <input type="radio" name="shipping-option" value={option.id} checked={activeShippingOption?.id === option.id} onChange={() => setSelectedShippingId(option.id)} />
                      <span className="shipping-option-copy"><strong>{option.service}</strong><small>{option.deadline}</small></span>
                      <strong className="shipping-option-price">{option.free ? "Grátis" : formatPrice(Number(option.cost ?? 0))}</strong>
                    </label>
                  ))}
                </div>}
              </div>

              <div className="payment-methods-selector">
                <span className="eyebrow">MÉTODO DE PAGAMENTO</span>
                <div className="payment-chips">
                  <button type="button" className={`payment-chip ${selectedPaymentMethod === "pix" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("pix")}><strong>Pix</strong><span>{pixDiscountPercent}% OFF</span></button>
                  <button type="button" className={`payment-chip ${selectedPaymentMethod === "credit_card" ? "active" : ""}`} onClick={() => setSelectedPaymentMethod("credit_card")}><strong>Cartão</strong><span>Até 2x sem juros</span></button>
                </div>
              </div>

              <div className="cart-totals">
                <div className="cart-total-row"><span>Subtotal dos produtos</span><strong>{formatPrice(subtotal)}</strong></div>
                {couponDiscount > 0 && <div className="cart-total-row discount"><span>Desconto do cupom</span><strong>- {formatPrice(couponDiscount)}</strong></div>}
                <div className="cart-total-row"><span>{activeShippingOption?.service ?? "Frete"}</span><strong>{shippingData ? (shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)) : "A calcular"}</strong></div>
                {selectedPaymentMethod === "pix" && <div className="cart-total-row pix-savings"><span>Economia no Pix ({pixDiscountPercent}%)</span><strong>- {formatPrice(subtotal * (pixDiscountPercent / 100))}</strong></div>}
                <div className="cart-total-row final"><span>Total da compra</span><strong>{formatPrice(total)}</strong></div>
              </div>

              <button type="button" className="primary-button checkout-button" onClick={goToCheckout}>FINALIZAR COMPRA ({selectedPaymentMethod === "pix" ? "Pix" : "Cartão"}) <ArrowRight size={16} /></button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
