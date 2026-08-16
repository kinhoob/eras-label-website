import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, Clock3, Loader2, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { clearCheckoutDraft, loadCheckoutDraft, saveCheckoutDraft, type CheckoutPaymentMethod } from "@/lib/checkout-draft";
import { updateCartLineQuantity, removeCartLine } from "@/lib/cart-operations";
import { formatCardExpiry, formatCardNumber, formatCpf, hasCheckoutFieldErrors, onlyDigits, validateCheckoutFields, type CheckoutFieldErrors, type CheckoutFields } from "@/lib/checkout-validation";
import { lookupCep, normalizeCep } from "@/lib/cep";
import { calculateInstallmentAmount, calculateInstallmentTotal } from "@/lib/installment-calculator";

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
  items: CheckoutLine[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  paymentMethod: CheckoutPaymentMethod;
  estimatedDelivery: string;
  total: number;
  paymentStatus: string;
  installments?: number;
  installmentInterest?: number;
  pixData?: {
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  } | null;
};

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


function readCheckoutFieldsFromForm(form: HTMLFormElement): CheckoutFields {
  const get = (name: string) => String(new FormData(form).get(name) ?? "");
  return {
    customerName: get("customerName"),
    customerEmail: get("customerEmail"),
    cpf: get("cpf"),
    phone: get("phone"),
    cep: get("cep"),
    number: get("number"),
    street: get("street"),
    neighborhood: get("neighborhood"),
    city: get("city"),
    state: get("state"),
    cardNumber: get("cardNumber"),
    cardName: get("cardName"),
    cardExpiry: get("cardExpiry"),
    cardCvv: get("cardCvv"),
  };
}

type MercadoPagoClient = {
  createCardToken: (params: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: "CPF";
    identificationNumber: string;
  }) => Promise<{ id?: string }>;
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MercadoPagoClient;
  }
}

function inferPaymentMethodId(cardNumber: string) {
  const digits = onlyDigits(cardNumber);
  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));
  if (digits.startsWith("4") || firstFour === 4235) return "visa";
  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720) || firstFour === 5031 || firstFour === 5480) return "master";
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex";
  if (digits.startsWith("60")) return "hipercard";
  // Fallback para cartões de teste de sandbox não mapeados explicitamente
  if (digits.length >= 13) return "master";
  return undefined;
}

async function tokenizeCard(fields: CheckoutFields, publicKey?: string): Promise<{ cardToken: string; paymentMethodId: string }> {
  if (!publicKey) throw new Error("A chave pública do Mercado Pago ainda não está configurada para pagamentos com cartão.");
  if (!window.MercadoPago) throw new Error("O SDK seguro do cartão ainda está a carregar. Tente novamente em alguns segundos.");

  const [monthInput = "", yearInput = ""] = String(fields.cardExpiry ?? "").split("/");
  const month = monthInput.replace(/\D/g, "").padStart(2, "0").slice(-2);
  const yearDigits = yearInput.replace(/\D/g, "");
  const expirationYear = yearDigits.length === 4 ? yearDigits : `20${yearDigits.padStart(2, "0")}`;
  const client = new window.MercadoPago(publicKey, { locale: "pt-BR" });
  const cardNumber = onlyDigits(fields.cardNumber ?? "");
  const tokenPromise = client.createCardToken({
    cardNumber,
    cardholderName: String(fields.cardName ?? "").trim(),
    cardExpirationMonth: month,
    cardExpirationYear: expirationYear,
    securityCode: onlyDigits(fields.cardCvv ?? ""),
    identificationType: "CPF",
    identificationNumber: onlyDigits(fields.cpf),
  });
  const token = await Promise.race([
    tokenPromise,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("O Mercado Pago demorou demasiado para tokenizar o cartão. Verifique a ligação e tente novamente.")), 15000)),
  ]);
  if (!token?.id) throw new Error("Não foi possível validar o cartão. Confirme os dados e tente novamente.");

  const paymentMethodId = inferPaymentMethodId(cardNumber);
  if (!paymentMethodId) throw new Error("Não foi possível identificar a bandeira do cartão.");
  return { cardToken: token.id, paymentMethodId };
}

function readInitialCart() {
  return loadCart<CheckoutLine[] extends never[] ? never : CheckoutLine>();
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CheckoutLine[]>(() => readInitialCart());
  const [coupon, setCoupon] = useState(() => loadCheckoutDraft().coupon ?? "");
  const [couponApplied, setCouponApplied] = useState(() => loadCheckoutDraft().couponApplied === true);
  const [couponDiscountRate, setCouponDiscountRate] = useState(10);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethod>(() => loadCheckoutDraft().selectedPaymentMethod ?? "pix");
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [cep, setCep] = useState(() => loadCheckoutDraft().shippingCep ?? "");
  const [addressFields, setAddressFields] = useState({ street: "", neighborhood: "", city: "", state: "" });
  const [cepLookupStatus, setCepLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [couponLoading, setCouponLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [success, setSuccess] = useState<CheckoutSuccess | null>(null);
  const commercialConfigQuery = trpc.catalog.getConfig.useQuery();
  const shippingQuery = trpc.catalog.calculateShipping.useQuery(
    { cep, subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) },
    { enabled: cep.length === 8 },
  );
  const checkoutConfigQuery = trpc.checkout.publicConfig.useQuery();
  const checkoutMutation = trpc.checkout.create.useMutation();

  const commercialConfig = checkoutConfigQuery.data?.commercial ?? commercialConfigQuery.data;
  const pixDiscountPercent = commercialConfig?.pixDiscountPercent ?? 5;
  const freeShippingThreshold = commercialConfig?.freeShippingThreshold ?? 350;
  const maxInstallments = Math.max(1, commercialConfig?.maxInstallments ?? 12);
  const installmentInterestRate = Math.max(0, commercialConfig?.installmentInterestRate ?? 0);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const couponValidationQuery = trpc.coupons.validate.useQuery({ code: coupon.trim() || "ERAS10", subtotal }, { enabled: false });
  const discount = couponApplied ? subtotal * (couponDiscountRate / 100) : 0;
  const shippingCost = shippingQuery.data?.free ? 0 : (shippingQuery.data?.cost ?? 0);
  const totalBeforePayment = Math.max(0, subtotal - discount + shippingCost);
  const pixSavings = selectedPaymentMethod === "pix" ? subtotal * (pixDiscountPercent / 100) : 0;
  const cardTotal = selectedPaymentMethod === "credit_card" ? calculateInstallmentTotal(totalBeforePayment, selectedInstallments, installmentInterestRate) : totalBeforePayment;
  const installmentInterest = Math.max(0, cardTotal - totalBeforePayment);
  const total = Math.max(0, selectedPaymentMethod === "credit_card" ? cardTotal : totalBeforePayment - pixSavings);

  useEffect(() => {
    setSelectedInstallments((current) => Math.min(Math.max(1, current), maxInstallments));
  }, [maxInstallments]);

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

  useEffect(() => {
    const normalizedCep = normalizeCep(cep);
    if (normalizedCep.length !== 8) {
      setCepLookupStatus("idle");
      return;
    }

    const controller = new AbortController();
    setCepLookupStatus("loading");
    lookupCep(normalizedCep, controller.signal)
      .then((address) => {
        setAddressFields(address);
        setCepLookupStatus("success");
        toast.success("Morada encontrada", { description: `${address.city} · ${address.state}` });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCepLookupStatus("error");
        toast.error("Não foi possível encontrar este CEP", { description: "Confirme os números ou preencha a morada manualmente." });
      });

    return () => controller.abort();
  }, [cep]);

  function changeQuantity(line: CheckoutLine, delta: number) {
    setCart((current) => updateCartLineQuantity(current, line.id, line.size, delta));
  }

  function removeItem(line: CheckoutLine) {
    setCart((current) => removeCartLine(current, line.id, line.size));
    toast.success("Item removido da sacola", { description: `${line.name} · tamanho ${line.size}` });
  }

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (!target.name) return;
    if (target.name === "cpf") target.value = formatCpf(target.value);
    if (target.name === "cardNumber") target.value = formatCardNumber(target.value);
    if (target.name === "cardExpiry") target.value = formatCardExpiry(target.value);
    if (target.name === "coupon") {
      setCouponApplied(false);
      setCouponDiscountRate(0);
    }

    const fields = readCheckoutFieldsFromForm(event.currentTarget);
    const errors = validateCheckoutFields(fields, selectedPaymentMethod);
    const fieldName = target.name as keyof CheckoutFieldErrors;
    if (target.value.trim() || fieldErrors[fieldName]) {
      setFieldErrors((current) => {
        const next = { ...current };
        if (errors[fieldName]) next[fieldName] = errors[fieldName];
        else delete next[fieldName];
        return next;
      });
    }
  }

  async function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await couponValidationQuery.refetch();
      const validation = result.data;
      if (validation?.valid) {
        const rate = subtotal > 0 ? (Number(validation.discount) / subtotal) * 100 : 0;
        setCouponDiscountRate(rate);
        setCouponApplied(true);
        toast.success(`Cupom ${validation.code} aplicado: ${rate.toFixed(0)}% de desconto.`);
      } else {
        setCouponDiscountRate(0);
        setCouponApplied(false);
        toast.error("Cupom não encontrado, expirado ou incompatível com o subtotal.");
      }
    } catch {
      setCouponApplied(false);
      toast.error("Não foi possível validar o cupom agora.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || cart.length === 0) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = readCheckoutFieldsFromForm(form);
    const validationErrors = validateCheckoutFields(fields, selectedPaymentMethod);
    setFieldErrors(validationErrors);
    if (hasCheckoutFieldErrors(validationErrors)) {
      toast.error("Revise os campos destacados antes de finalizar a compra.");
      const firstInvalidField = Object.keys(validationErrors)[0];
      window.setTimeout(() => document.querySelector<HTMLInputElement>(`[name="${firstInvalidField}"]`)?.focus(), 0);
      return;
    }

    setIsSubmitting(true);
    setStatus("processing");
    setErrorMessage("");

    let cardToken: string | undefined;
    let paymentMethodId: string | undefined;
    try {
      const tokenizedCard = selectedPaymentMethod === "credit_card"
        ? await tokenizeCard(fields, checkoutConfigQuery.data?.publicKey ?? undefined)
        : undefined;
      cardToken = tokenizedCard?.cardToken;
      paymentMethodId = tokenizedCard?.paymentMethodId;
    } catch (tokenError) {
      const message = tokenError instanceof Error ? tokenError.message : "Não foi possível validar o cartão.";
      setIsSubmitting(false);
      setStatus("error");
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    checkoutMutation.mutate({
      customerName: fields.customerName.trim(),
      customerEmail: fields.customerEmail.trim(),
      customerCpf: fields.cpf.trim(),
      phone: fields.phone.trim(),
      address: {
        cep: fields.cep,
        street: fields.street.trim(),
        number: fields.number.trim(),
        complement: String(formData.get("complement") ?? "").trim(),
        neighborhood: fields.neighborhood.trim(),
        city: fields.city.trim(),
        state: fields.state.trim().toUpperCase(),
      },
      items: cart.map((item) => ({ productId: item.id, name: item.name, size: item.size, quantity: item.quantity, price: item.price })),
      subtotal,
      shippingCost,
      discount: discount + pixSavings,
      total,
      paymentMethod: selectedPaymentMethod,
      cardToken,
      paymentMethodId,
      installments: selectedPaymentMethod === "credit_card" ? selectedInstallments : undefined,
    }, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        setStatus("success");
        setFieldErrors({});
        setSuccess({
          orderNumber: result.orderNumber,
          items: cart,
          subtotal,
          discount: discount + pixSavings,
          shippingCost,
          paymentMethod: selectedPaymentMethod,
          estimatedDelivery: shippingQuery.data?.deadline ?? "5 a 7 dias úteis",
          total,
          paymentStatus: result.paymentStatus || "pending",
          installments: selectedPaymentMethod === "credit_card" ? selectedInstallments : undefined,
          installmentInterest: selectedPaymentMethod === "credit_card" ? installmentInterest : 0,
          pixData: (result as any).pixData || null,
        });
        setCart([]);
        saveCart([]);
        clearCheckoutDraft();
        if (result.paymentStatus === "approved") {
          toast.success(`Pagamento aprovado para o pedido ${result.orderNumber}!`);
        } else {
          toast.success(`Pedido ${result.orderNumber} gerado! Conclua o pagamento via Pix.`);
        }
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
    const isApproved = success.paymentStatus === "approved";
    const isPix = success.paymentMethod === "pix";
    const isRejected = ["rejected", "cancelled", "refunded"].includes(success.paymentStatus);
    return (
      <main className="checkout-page">
        <section className="checkout-success-page" aria-live="polite" aria-labelledby="checkout-success-title">
          <span className="checkout-success-icon"><Check size={30} /></span>
          <span className="section-kicker">UMA NOVA ERA COMEÇA AQUI</span>
          <h1 id="checkout-success-title">{isApproved ? "Pagamento confirmado." : isRejected ? "Pagamento não aprovado." : "Pedido gerado com sucesso."}</h1>
          <p>O pedido <strong>{success.orderNumber}</strong> foi registrado na Eras Label. {isApproved ? "O pagamento foi aprovado." : isRejected ? "O pagamento foi recusado pelo Mercado Pago. Pode tentar novamente." : isPix ? "Escaneie o QR Code Pix ou copie o código para concluir." : "O pagamento está a ser analisado pelo Mercado Pago. Atualizaremos o seu histórico assim que houver confirmação."}</p>
          <span className={`checkout-payment-status checkout-payment-status-${isApproved ? "approved" : isRejected ? "rejected" : "pending"}`}>{isApproved ? "PAGAMENTO APROVADO" : isRejected ? "PAGAMENTO RECUSADO" : "PAGAMENTO PENDENTE"}</span>
          
          {!isApproved && isPix && success.pixData?.qr_code && (
            <div className="checkout-pix-box" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", margin: "20px 0", textAlign: "center" }}>
              <h3>Pagamento via Pix (Mercado Pago)</h3>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Utilize o aplicativo do seu banco para ler o código abaixo:</p>
              <div style={{ wordBreak: "break-all", background: "#fff", padding: "12px", border: "1px dashed #cbd5e1", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", marginBottom: "12px", maxHeight: "80px", overflowY: "auto" }}>
                {success.pixData.qr_code}
              </div>
              <button 
                type="button" 
                className="primary-button" 
                style={{ fontSize: "13px", padding: "8px 16px" }}
                onClick={() => {
                  navigator.clipboard.writeText(success.pixData!.qr_code!);
                  toast.success("Código Pix Copia e Cola copiado para a área de transferência!");
                }}
              >
                COPIAR CÓDIGO PIX
              </button>
            </div>
          )}

          <div className="checkout-success-total"><span>{isApproved ? "Total pago" : isRejected ? "Total do pedido" : "Total a pagar"}</span><strong>{formatPrice(success.total)}</strong></div>
          <section className="checkout-success-order" aria-label="Resumo do pedido confirmado">
            <div className="checkout-success-order-heading"><span>RESUMO DO PEDIDO</span><strong>{success.items.reduce((sum, item) => sum + item.quantity, 0)} itens</strong></div>
            <div className="checkout-success-order-items">
              {success.items.map((item) => (
                <div className="checkout-success-order-item" key={`${item.id}-${item.size}`}>
                  <img src={item.image} alt={item.alt || item.name} />
                  <div><strong>{item.name}</strong><span>Tamanho {item.size} · {item.quantity}x</span></div>
                  <b>{formatPrice(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="checkout-success-order-totals">
              <div><span>Subtotal</span><strong>{formatPrice(success.subtotal)}</strong></div>
              {success.discount > 0 && <div><span>Descontos</span><strong>- {formatPrice(success.discount)}</strong></div>}
              <div><span>Frete</span><strong>{success.shippingCost === 0 ? "Grátis" : formatPrice(success.shippingCost)}</strong></div>
              <div><span>Pagamento</span><strong>{success.paymentMethod === "pix" ? "Pix" : "Cartão"}</strong></div>
              <div className="final"><span>Total</span><strong>{formatPrice(success.total)}</strong></div>
            </div>
            <p className="checkout-success-delivery"><Clock3 size={15} /> Entrega estimada: {success.estimatedDelivery}</p>
          </section>
          <div className="checkout-success-actions">
            <Link href="/orders" className="primary-button">ACOMPANHAR PEDIDO <ArrowRight size={16} /></Link>
            <Link href="/" className="primary-button checkout-continue-button">CONTINUAR COMPRANDO <ArrowRight size={16} /></Link>
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

          {status === "processing" && (
            <div className="checkout-processing-banner" role="status" aria-live="polite">
              <span className="checkout-processing-spinner"><Loader2 size={18} className="spinner-icon" /></span>
              <div><strong>A confirmar o seu pagamento...</strong><span>Estamos a comunicar com o Mercado Pago. Não feche esta janela.</span></div>
            </div>
          )}
          {status === "error" && <div className="checkout-error-banner" role="alert">{errorMessage}</div>}

          <form className="checkout-page-form" onSubmit={submitCheckout} onChange={handleFormChange} noValidate>
            <div className="checkout-page-form-section">
              <span className="checkout-form-step">01 / IDENTIFICAÇÃO</span>
              <div className="checkout-page-fields">
                <label className={fieldErrors.customerName ? "has-error" : undefined}>Nome completo<input name="customerName" required placeholder="Seu nome" aria-invalid={Boolean(fieldErrors.customerName)} aria-describedby={fieldErrors.customerName ? "customerName-error" : undefined} />{fieldErrors.customerName && <span id="customerName-error" className="field-error" role="alert">{fieldErrors.customerName}</span>}</label>
                <label className={fieldErrors.customerEmail ? "has-error" : undefined}>E-mail<input name="customerEmail" required type="email" placeholder="voce@email.com" aria-invalid={Boolean(fieldErrors.customerEmail)} aria-describedby={fieldErrors.customerEmail ? "customerEmail-error" : undefined} />{fieldErrors.customerEmail && <span id="customerEmail-error" className="field-error" role="alert">{fieldErrors.customerEmail}</span>}</label>
                <label className={fieldErrors.cpf ? "has-error" : undefined}>CPF<input name="cpf" required placeholder="000.000.000-00" aria-invalid={Boolean(fieldErrors.cpf)} aria-describedby={fieldErrors.cpf ? "cpf-error" : undefined} />{fieldErrors.cpf && <span id="cpf-error" className="field-error" role="alert">{fieldErrors.cpf}</span>}</label>
                <label className={fieldErrors.phone ? "has-error" : undefined}>Telefone<input name="phone" required placeholder="(00) 00000-0000" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} />{fieldErrors.phone && <span id="phone-error" className="field-error" role="alert">{fieldErrors.phone}</span>}</label>
              </div>
            </div>

            <div className="checkout-page-form-section">
              <span className="checkout-form-step">02 / ENTREGA</span>
              <div className="checkout-page-fields">
                <label className={fieldErrors.cep ? "has-error" : undefined}>CEP<input name="cep" required value={cep} onChange={(event) => setCep(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="00000-000" aria-invalid={Boolean(fieldErrors.cep)} aria-describedby={fieldErrors.cep ? "cep-error" : undefined} />{fieldErrors.cep && <span id="cep-error" className="field-error" role="alert">{fieldErrors.cep}</span>}</label>
                <label className={fieldErrors.number ? "has-error" : undefined}>Número<input name="number" required placeholder="123" aria-invalid={Boolean(fieldErrors.number)} aria-describedby={fieldErrors.number ? "number-error" : undefined} />{fieldErrors.number && <span id="number-error" className="field-error" role="alert">{fieldErrors.number}</span>}</label>
                <label className={`wide ${fieldErrors.street ? "has-error" : ""}`}>Endereço completo<input name="street" required value={addressFields.street} onChange={(event) => setAddressFields((current) => ({ ...current, street: event.target.value }))} placeholder="Rua, avenida ou travessa" aria-invalid={Boolean(fieldErrors.street)} aria-describedby={fieldErrors.street ? "street-error" : undefined} />{fieldErrors.street && <span id="street-error" className="field-error" role="alert">{fieldErrors.street}</span>}</label>
                <label>Complemento<input name="complement" placeholder="Apartamento, bloco" /></label>
                <label className={fieldErrors.neighborhood ? "has-error" : undefined}>Bairro<input name="neighborhood" required value={addressFields.neighborhood} onChange={(event) => setAddressFields((current) => ({ ...current, neighborhood: event.target.value }))} placeholder="Seu bairro" aria-invalid={Boolean(fieldErrors.neighborhood)} aria-describedby={fieldErrors.neighborhood ? "neighborhood-error" : undefined} />{fieldErrors.neighborhood && <span id="neighborhood-error" className="field-error" role="alert">{fieldErrors.neighborhood}</span>}</label>
                <label className={fieldErrors.city ? "has-error" : undefined}>Cidade<input name="city" required value={addressFields.city} onChange={(event) => setAddressFields((current) => ({ ...current, city: event.target.value }))} placeholder="Sua cidade" aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "city-error" : undefined} />{fieldErrors.city && <span id="city-error" className="field-error" role="alert">{fieldErrors.city}</span>}</label>
                <label className={fieldErrors.state ? "has-error" : undefined}>Estado<input name="state" required value={addressFields.state} onChange={(event) => setAddressFields((current) => ({ ...current, state: event.target.value.toUpperCase().slice(0, 2) }))} placeholder="UF" aria-invalid={Boolean(fieldErrors.state)} aria-describedby={fieldErrors.state ? "state-error" : undefined} />{fieldErrors.state && <span id="state-error" className="field-error" role="alert">{fieldErrors.state}</span>}</label>
              </div>
              <p className={`checkout-page-helper ${cepLookupStatus === "error" ? "has-error" : ""}`}><Clock3 size={15} /> {cepLookupStatus === "loading" ? "A procurar a morada pelo CEP..." : cepLookupStatus === "success" ? "Morada preenchida automaticamente. Pode editar os campos se necessário." : cepLookupStatus === "error" ? "CEP não encontrado. Preencha a morada manualmente." : shippingQuery.isLoading ? "Calculando frete..." : shippingQuery.data?.deadline ? `Entrega estimada: ${shippingQuery.data.deadline}` : "O valor do frete será calculado após o CEP."}</p>
            </div>

            <div className="checkout-page-form-section">
              <span className="checkout-form-step">03 / PAGAMENTO</span>
              <div className="checkout-payment-options">
                <button type="button" className={selectedPaymentMethod === "pix" ? "active" : ""} onClick={() => { setSelectedPaymentMethod("pix"); setFieldErrors((current) => { const next = { ...current }; delete next.cardNumber; delete next.cardName; delete next.cardExpiry; delete next.cardCvv; return next; }); }}><strong>Pix</strong><span>{pixDiscountPercent}% de desconto</span></button>
                <button type="button" className={selectedPaymentMethod === "credit_card" ? "active" : ""} onClick={() => setSelectedPaymentMethod("credit_card")}><strong>Cartão</strong><span>Pagamento seguro</span></button>
              </div>
              {selectedPaymentMethod === "credit_card" && (
                <div className="checkout-page-fields checkout-card-fields">
                  <label className={`wide ${fieldErrors.cardNumber ? "has-error" : ""}`}>Número do cartão
                    <input name="cardNumber" inputMode="numeric" autoComplete="cc-number" maxLength={23} placeholder="0000 0000 0000 0000" aria-invalid={Boolean(fieldErrors.cardNumber)} aria-describedby={fieldErrors.cardNumber ? "cardNumber-error" : undefined} />
                    {fieldErrors.cardNumber && <span id="cardNumber-error" className="field-error" role="alert">{fieldErrors.cardNumber}</span>}
                  </label>
                  <label className={fieldErrors.cardName ? "has-error" : undefined}>Nome no cartão
                    <input name="cardName" autoComplete="cc-name" placeholder="Nome e sobrenome" aria-invalid={Boolean(fieldErrors.cardName)} aria-describedby={fieldErrors.cardName ? "cardName-error" : undefined} />
                    {fieldErrors.cardName && <span id="cardName-error" className="field-error" role="alert">{fieldErrors.cardName}</span>}
                  </label>
                  <label className={fieldErrors.cardExpiry ? "has-error" : undefined}>Validade
                    <input name="cardExpiry" inputMode="numeric" autoComplete="cc-exp" maxLength={5} placeholder="MM/AA" aria-invalid={Boolean(fieldErrors.cardExpiry)} aria-describedby={fieldErrors.cardExpiry ? "cardExpiry-error" : undefined} />
                    {fieldErrors.cardExpiry && <span id="cardExpiry-error" className="field-error" role="alert">{fieldErrors.cardExpiry}</span>}
                  </label>
                  <label className={fieldErrors.cardCvv ? "has-error" : undefined}>CVV
                    <input name="cardCvv" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="123" aria-invalid={Boolean(fieldErrors.cardCvv)} aria-describedby={fieldErrors.cardCvv ? "cardCvv-error" : undefined} />
                    {fieldErrors.cardCvv && <span id="cardCvv-error" className="field-error" role="alert">{fieldErrors.cardCvv}</span>}
                  </label>
                  <label className="wide checkout-installments-field">Parcelamento
                    <select value={selectedInstallments} onChange={(event) => setSelectedInstallments(Number(event.target.value))} aria-label="Número de parcelas">
                      {Array.from({ length: maxInstallments }, (_, index) => index + 1).map((count) => {
                        const installmentTotal = calculateInstallmentTotal(totalBeforePayment, count, installmentInterestRate);
                        return <option key={count} value={count}>{count}x de {formatPrice(calculateInstallmentAmount(installmentTotal, count))}{count > 1 && installmentInterestRate > 0 ? ` · total ${formatPrice(installmentTotal)}` : " sem juros"}</option>;
                      })}
                    </select>
                    <span className="checkout-installments-note">{installmentInterestRate > 0 ? `Taxa configurada: ${installmentInterestRate.toFixed(2)}% ao mês.` : "Parcelamento sem juros configurado pela loja."}</span>
                  </label>
                  <p className="checkout-page-helper wide"><ShieldCheck size={15} /> Os dados do cartão são tokenizados pelo Mercado Pago e nunca ficam armazenados na Eras Label.</p>
                </div>
              )}
            </div>

            <button type="submit" className="primary-button checkout-page-submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} className="spinner-icon" /> A CONFIRMAR PAGAMENTO...</> : <>CONFIRMAR PAGAMENTO · {formatPrice(total)} <ArrowRight size={16} /></>}
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
          <div className="checkout-page-totals"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>{discount > 0 && <div><span>Desconto</span><strong>- {formatPrice(discount)}</strong></div>}<div><span>Frete</span><strong>{shippingQuery.data?.free ? "Grátis" : shippingQuery.data ? formatPrice(shippingCost) : "A calcular"}</strong></div>{pixSavings > 0 && <div><span>Economia no Pix</span><strong>- {formatPrice(pixSavings)}</strong></div>}{selectedPaymentMethod === "credit_card" && selectedInstallments > 1 && <div><span>Juros ({selectedInstallments}x)</span><strong>+ {formatPrice(installmentInterest)}</strong></div>}<div className="final"><span>{selectedPaymentMethod === "credit_card" ? `${selectedInstallments}x no cartão` : "Total"}</span><strong>{formatPrice(total)}</strong></div></div>
          <p className="checkout-free-shipping-note">{subtotal >= freeShippingThreshold ? "Você conquistou frete grátis." : `Frete grátis a partir de ${formatPrice(freeShippingThreshold)}.`}</p>
        </aside>
      </div>
    </main>
  );
}

function ShoppingBagIcon() {
  return <div className="checkout-empty-icon" aria-hidden="true"><span>ERAS</span></div>;
}
