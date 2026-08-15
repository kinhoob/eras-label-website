import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Clock3, Loader2, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft, type CheckoutPaymentMethod } from "@/lib/checkout-draft";
import { updateCartLineQuantity, removeCartLine } from "@/lib/cart-operations";

 type CheckoutLine = {
  id: number;
  name: string;
  price: number;
  image: string;
  alt: string;
  size: string;
  quantity: number;
};

type CheckoutSuccess = {
  orderNumber: string;
  total: number;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function readInitialCart() {
  return loadCart<CheckoutLine[] extends never[] ? never : CheckoutLine>();
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CheckoutLine[]>(() => readInitialCart());
  const [coupon, setCoupon] = useState(() => loadCheckoutDraft().coupon ?? "");
  const [couponApplied, setCouponApplied] = useState(() => loadCheckoutDraft().couponApplied === true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod>(() => loadCheckoutDraft().selectedPaymentMethod ?? "pix");
  const [cep, setCep] = useState(() => loadCheckoutDraft().shippingCep ?? "");
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);
  const commercialConfigQuery = trpc.catalog.getConfig.useQuery();
  const shippingQuery = trpc.catalog.calculateShipping.useQuery(
    { cep, subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) },
    { enabled: cep.length === 8 },
  );
  const checkoutMutation = trpc.checkout.create.useMutation();

  const pixDiscountPercent = commercialConfigQuery.data?.pixDiscountPercent ?? 5;
  const freeShippingThreshold = commercialConfigQuery.data?.freeShippingThreshold ?? 350;
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const shippingCost = shippingQuery.data?.free ? 0 : (shippingQuery.data?.cost ?? 0);
  const totalBeforePayment = subtotal - discount + shippingCost;
  const pixSavings = selectedPaymentMethod === "pix" ? subtotal * (pixDiscountPercent / 100) : 0;
  const total = Math.max(0, totalBeforePayment - pixSavings);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveCheckoutDraft({
      coupon,
      couponApplied,
      selectedPaymentMethod,
      shippingCep: cep,
    });
  }, [cep, coupon, couponApplied, selectedPaymentMethod]);

  function changeQuantity(line: CheckoutLine, delta: number) {
    setCart((current) => updateCartLineQuantity(current, line.id, line.size, delta));
  }

  function removeItem(line: CheckoutLine) {
    setCart((current) => removeCartLine(current, line.id, line.size));
    toast.success("Item removido da sacola", { description: `${line.name} · tamanho ${line.size}` });
  }

  function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    window.setTimeout(() => {
      setCouponLoading(false);
      if (coupon.trim().toUpperCase() === "ERAS10") {
        setCouponApplied(true);
        toast.success("Cupom ERAS10 aplicado: 10% de desconto.");
      } else {
        setCouponApplied(false);
        toast.error("Cupom não encontrado ou expirado.");
      }
    }, 500);
  }

  function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || cart.length === 0) return;
    if (cep.replace(/\D/g, "").length !== 8) {
      toast.error("Informe um CEP válido para calcular o frete.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");
    checkoutMutation.mutate({
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerCpf: String(form.get("cpf") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: {
        cep: String(form.get("cep") ?? ""),
        street: String(form.get("street") ?? ""),
        number: String(form.get("number") ?? ""),
        complement: String(form.get("complement") ?? ""),
        neighborhood: String(form.get("neighborhood") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
      },
      items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity, price: item.price })),
      subtotal,
      shippingCost,
      discount: discount + pixSavings,
      total,
      paymentMethod: selectedPaymentMethod,
    }, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        setStatus("success");
        setSuccess({ orderNumber: result.orderNumber, total });
        setCart([]);
        saveCart([]);
        clearCheckoutDraft();
        toast.success(`Pagamento confirmado para o pedido ${result.orderNumber}.`);
      },
      onError: (error) => {
        setIsSubmitting(false);
        setStatus("error");
        setErrorMessage(error.message || "Não foi possível confirmar o pagamento.");
        toast.error("Não foi possível confirmar o pagamento. Revise os dados e tente novamente.");
      },
    });
  }

  if (status === "success" && success) {
    return (
      <main className="checkout-page">
        <section className="checkout-success-page" aria-live="polite">
          <span className="checkout-success-icon"><Check size={30} /></span>
          <span className="section-kicker">UMA NOVA ERA COMEÇA AQUI</span>
          <h1>Pagamento confirmado.</h1>
          <p>O pedido <strong>{success.orderNumber}</strong> foi recebido pela Eras Label. Você poderá acompanhar cada etapa na sua conta.</p>
          <div className="checkout-success-total"><span>Total pago</span><strong>{formatPrice(success.total)}</strong></div>
          <div className="checkout-success-actions">
            <Link href="/account" className="primary-button">ACOMPANHAR PEDIDO <ArrowRight size={16} /></Link>
            <Link href="/" className="checkout-secondary-link">CONTINUAR COMPRANDO</Link>
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty-page">
          <ShoppingBagIcon />
          <span className="section-kicker">SACOLA VAZIA</span>
          <h1>Comece uma nova era.</h1>
          <p>Adicione uma peça à sua Sacola para continuar até ao checkout.</p>
          <Link href="/" className="primary-button">VOLTAR À HOME <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-page-header">
        <Link href="/" className="checkout-back-link"><ArrowLeft size={16} /> VOLTAR À LOJA</Link>
        <Link href="/" className="brand-mark">ERAS<span>.</span></Link>
        <span className="checkout-secure-label"><ShieldCheck size={15} /> CHECKOUT SEGURO</span>
      </header>

      <div className="checkout-page-layout">
        <section className="checkout-page-main">
          <div className="checkout-page-intro">
            <span className="section-kicker">FINALIZAR COMPRA</span>
            <h1>Os seus dados.</h1>
            <p>Preencha as informações para receber as peças da sua próxima era.</p>
          </div>

          {status === "error" && <div className="checkout-error-banner" role="alert">{errorMessage}</div>}

          <form className="checkout-page-form" onSubmit={submitCheckout}>
            <div className="checkout-page-form-section">
              <span className="checkout-form-step">01 / IDENTIFICAÇÃO</span>
              <div className="checkout-page-fields">
                <label>Nome completo<input name="customerName" required placeholder="Seu nome" /></label>
                <label>E-mail<input name="customerEmail" required type="email" placeholder="voce@email.com" /></label>
                <label>CPF<input name="cpf" required placeholder="000.000.000-00" /></label>
                <label>Telefone<input name="phone" required placeholder="(00) 00000-0000" /></label>
              </div>
            </div>

            <div className="checkout-page-form-section">
              <span className="checkout-form-step">02 / ENTREGA</span>
              <div className="checkout-page-fields">
                <label>CEP<input name="cep" required value={cep} onChange={(event) => setCep(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000-000" /></label>
                <label>Número<input name="number" required placeholder="123" /></label>
                <label className="wide">Endereço completo<input name="street" required placeholder="Rua, avenida ou travessa" /></label>
                <label>Complemento<input name="complement" placeholder="Apartamento, bloco" /></label>
                <label>Bairro<input name="neighborhood" required placeholder="Seu bairro" /></label>
                <label>Cidade<input name="city" required placeholder="Sua cidade" /></label>
                <label>Estado<input name="state" required placeholder="UF" /></label>
              </div>
              <p className="checkout-page-helper"><Clock3 size={15} /> {shippingQuery.isLoading ? "Calculando frete..." : shippingQuery.data?.deadline ? `Entrega estimada: ${shippingQuery.data.deadline}` : "O valor do frete será calculado após o CEP."}</p>
            </div>

            <div className="checkout-page-form-section">
              <span className="checkout-form-step">03 / PAGAMENTO</span>
              <div className="checkout-payment-options">
                <button type="button" className={selectedPaymentMethod === "pix" ? "active" : ""} onClick={() => setSelectedPaymentMethod("pix")}><strong>Pix</strong><span>{pixDiscountPercent}% de desconto</span></button>
                <button type="button" className={selectedPaymentMethod === "credit_card" ? "active" : ""} onClick={() => setSelectedPaymentMethod("credit_card")}><strong>Cartão</strong><span>Pagamento seguro</span></button>
              </div>
            </div>

            <button type="submit" className="primary-button checkout-page-submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="spinner-icon" /> CONFIRMANDO PAGAMENTO...</> : <>CONFIRMAR PAGAMENTO · {formatPrice(total)} <ArrowRight size={16} /></>}
            </button>
          </form>
        </section>

        <aside className="checkout-page-summary" aria-label="Resumo do pedido">
          <span className="checkout-summary-kicker">RESUMO DA SACOLA</span>
          <h2>{cart.length} {cart.length === 1 ? "item" : "itens"}</h2>
          <div className="checkout-summary-lines">
            {cart.map((line) => (
              <div className="checkout-summary-line" key={`${line.id}-${line.size}`}>
                <img src={line.image} alt={line.alt || line.name} />
                <div><strong>{line.name}</strong><span>Tamanho {line.size} · {line.quantity}x</span><b>{formatPrice(line.price * line.quantity)}</b></div>
                <div className="checkout-summary-actions"><button type="button" onClick={() => changeQuantity(line, -1)} aria-label={`Diminuir quantidade de ${line.name}`}><Minus size={13} /></button><button type="button" onClick={() => changeQuantity(line, 1)} aria-label={`Aumentar quantidade de ${line.name}`}><Plus size={13} /></button><button type="button" onClick={() => removeItem(line)} aria-label={`Remover ${line.name}`}><Trash2 size={13} /></button></div>
              </div>
            ))}
          </div>
          <div className="checkout-coupon-row"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Cupom de desconto" /><button type="button" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? <Loader2 size={14} className="spinner-icon" /> : "APLICAR"}</button></div>
          {couponApplied && <p className="checkout-coupon-applied"><Check size={14} /> ERAS10 aplicado</p>}
          <div className="checkout-page-totals"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>{discount > 0 && <div><span>Desconto</span><strong>- {formatPrice(discount)}</strong></div>}<div><span>Frete</span><strong>{shippingQuery.data?.free ? "Grátis" : shippingQuery.data ? formatPrice(shippingCost) : "A calcular"}</strong></div>{pixSavings > 0 && <div><span>Economia no Pix</span><strong>- {formatPrice(pixSavings)}</strong></div>}<div className="final"><span>Total</span><strong>{formatPrice(total)}</strong></div></div>
          <p className="checkout-free-shipping-note">{subtotal >= freeShippingThreshold ? "Você conquistou frete grátis." : `Frete grátis a partir de ${formatPrice(freeShippingThreshold)}.`}</p>
        </aside>
      </div>
    </main>
  );
}

function ShoppingBagIcon() {
  return <div className="checkout-empty-icon" aria-hidden="true"><span>ERAS</span></div>;
}
