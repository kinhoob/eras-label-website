import { type FormEvent, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ClipboardPenLine,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  Plus,
  ReceiptText,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type ManualItem = {
  productId: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
  maxStock: number;
};

type AddressDraft = {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyAddress: AddressDraft = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
};

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Obtém a primeira imagem de um produto sem assumir o formato vindo do backend. */
function imageFromProduct(product: unknown) {
  if (!product || typeof product !== "object") return undefined;
  const images = (product as { images?: unknown }).images;
  if (Array.isArray(images)) return String(images[0] ?? "") || undefined;
  return typeof images === "string" && images.length > 0 ? images : undefined;
}

export default function AdminManualOrderSection() {
  const { data: products = [], isLoading: productsLoading } = trpc.admin.listProducts.useQuery();
  const utils = trpc.useUtils();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressDraft>(emptyAddress);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("Retirada / combinado");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [paymentStatus, setPaymentStatus] = useState("approved");
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ManualItem[]>([]);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === selectedProductId),
    [products, selectedProductId],
  );
  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];
    const variations = Array.isArray(selectedProduct.variations) ? selectedProduct.variations : [];
    return variations
      .map((variation) => ({ size: String(variation.size), stock: Number(variation.stock ?? 0) }))
      .filter((variation) => variation.stock > 0);
  }, [selectedProduct]);
  const selectedStock = availableSizes.find((variation) => variation.size === selectedSize)?.stock ?? Number(selectedProduct?.totalStock ?? 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + Number(shippingCost || 0) - Number(discount || 0));
  const selectedProductImage = imageFromProduct(selectedProduct);

  const createOrderMutation = trpc.admin.createManualOrder.useMutation({
    onSuccess: (result) => {
      toast.success(`Pedido ${result.orderNumber} criado com sucesso.`);
      void utils.admin.listOrders.invalidate();
      setCustomerName("");
      setCustomerEmail("");
      setCustomerCpf("");
      setPhone("");
      setAddress(emptyAddress);
      setItems([]);
      setNotes("");
      setShippingCost(0);
      setDiscount(0);
    },
    onError: (error) => toast.error(error.message || "Não foi possível criar o pedido manual."),
  });

  function addItem() {
    if (!selectedProduct) return toast.error("Escolha um produto do catálogo.");
    const size = selectedSize || (availableSizes.length > 0 ? availableSizes[0].size : "Único");
    const stock = availableSizes.find((variation) => variation.size === size)?.stock ?? Number(selectedProduct.totalStock ?? 0);
    if (stock <= 0) return toast.error("Esta variação está sem estoque.");
    const quantity = Math.min(Math.max(1, selectedQuantity), stock);
    const price = Number(selectedProduct.price ?? 0);
    setItems((current) => {
      const existing = current.find((item) => item.productId === selectedProduct.id && item.size === size);
      if (existing) {
        return current.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxStock) } : item);
      }
      return [...current, {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        size,
        quantity,
        price,
        image: imageFromProduct(selectedProduct),
        maxStock: stock,
      }];
    });
    setSelectedQuantity(1);
    toast.success("Peça adicionada ao pedido manual.");
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return toast.error("Adicione pelo menos uma peça ao pedido.");
    createOrderMutation.mutate({
      customerName,
      customerEmail,
      customerCpf,
      phone: phone || undefined,
      shippingAddress: address,
      items: items.map(({ maxStock: _maxStock, ...item }) => item),
      shippingMethod,
      paymentMethod,
      shippingCost: Number(shippingCost || 0),
      discount: Number(discount || 0),
      notes: notes || undefined,
      status: paymentStatus === "approved" ? "Processando" : "Aguardando pagamento",
      paymentStatus,
    });
  }

  return (
    <section className="admin-content manual-order-page">
      {/* Cabeçalho editorial: contextualiza a operação e cria uma entrada visual mais premium. */}
      <header className="manual-order-hero">
        <div className="manual-order-hero-copy">
          <span className="section-kicker">OPERAÇÃO · PEDIDO FORA DA LOJA</span>
          <h2 className="content-title">Pedido manual</h2>
          <p className="content-subtitle">Registe encomendas feitas por WhatsApp, eventos, atendimento privado ou qualquer canal fora da loja.</p>
        </div>
        <div className="manual-order-hero-index">
          <ClipboardPenLine size={19} />
          <span>ORDERS / 01</span>
          <strong>Rascunho operacional</strong>
        </div>
      </header>

      <form className="manual-order-layout" onSubmit={submitOrder}>
        <div className="manual-order-main">
          {/* Etapa 01: dados do cliente e contacto de operação. */}
          <section className="admin-panel manual-order-card manual-order-card--customer">
            <div className="panel-heading manual-order-heading">
              <div className="manual-order-heading-copy"><span className="section-kicker">01 · CLIENTE</span><h3>Dados do comprador</h3><p>Identifique a pessoa que receberá este pedido.</p></div>
              <span className="manual-order-icon"><UserRound size={18} /></span>
            </div>
            <div className="manual-order-fields">
              <label><span>Nome completo</span><Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required placeholder="Nome do cliente" autoComplete="name" /></label>
              <label><span>E-mail</span><Input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} required placeholder="cliente@email.com" autoComplete="email" /></label>
              <label><span>CPF</span><Input value={customerCpf} onChange={(event) => setCustomerCpf(event.target.value)} required placeholder="000.000.000-00" inputMode="numeric" /></label>
              <label><span>Telefone</span><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(00) 00000-0000" autoComplete="tel" /></label>
            </div>
          </section>

          {/* Etapa 02: catálogo com seleção guiada e preview do produto escolhido. */}
          <section className="admin-panel manual-order-card manual-order-card--catalog">
            <div className="panel-heading manual-order-heading">
              <div className="manual-order-heading-copy"><span className="section-kicker">02 · CATÁLOGO</span><h3>Peças do pedido</h3><p>Escolha produtos reais, variações disponíveis e quantidade.</p></div>
              <span className="manual-order-count"><b>{items.length}</b> {items.length === 1 ? "item" : "itens"}</span>
            </div>
            <div className="manual-order-product-picker">
              <label className="manual-order-product-select"><span>Produto</span><div className="manual-order-select-wrap"><select value={selectedProductId} onChange={(event) => { setSelectedProductId(event.target.value); setSelectedSize(""); }} disabled={productsLoading}><option value="">{productsLoading ? "A carregar catálogo..." : "Selecionar produto real"}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {money(Number(product.price ?? 0))}</option>)}</select><ChevronDown size={16} /></div></label>
              <label><span>Tamanho / variação</span><div className="manual-order-select-wrap"><select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} disabled={!selectedProduct}><option value="">{availableSizes.length ? "Selecionar tamanho" : "Único / stock geral"}</option>{availableSizes.map((variation) => <option key={variation.size} value={variation.size}>{variation.size} · {variation.stock} disponíveis</option>)}</select><ChevronDown size={16} /></div></label>
              <label><span>Quantidade</span><Input type="number" min={1} max={Math.max(1, selectedStock)} value={selectedQuantity} onChange={(event) => setSelectedQuantity(Number(event.target.value))} disabled={!selectedProduct} /></label>
              <Button type="button" className="manual-add-item" onClick={addItem} disabled={!selectedProduct}><Plus size={15} /> Adicionar peça</Button>
            </div>
            {selectedProduct && <div className="manual-selected-product"><div className="manual-selected-product-thumb">{selectedProductImage ? <img src={selectedProductImage} alt="" /> : <span>ERAS.</span>}</div><div><span>PRODUTO SELECIONADO</span><strong>{selectedProduct.name}</strong><small>{availableSizes.length ? `${availableSizes.length} variações disponíveis` : "Stock geral"}</small></div><b>{money(Number(selectedProduct.price ?? 0))}</b></div>}
            <div className="manual-items-list">
              {items.length === 0 ? <div className="manual-empty-items"><span className="manual-empty-icon"><Package size={22} /></span><strong>Nenhuma peça adicionada</strong><span>Escolha um produto real do catálogo acima para começar o pedido.</span></div> : items.map((item) => <div className="manual-item-row" key={`${item.productId}-${item.size}`}><div className="manual-item-thumb">{item.image ? <img src={item.image} alt="" /> : <span>ERAS.</span>}</div><div className="manual-item-copy"><strong>{item.name}</strong><span>Tamanho {item.size} · {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}</span></div><b>{money(item.price * item.quantity)}</b><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry !== item))} aria-label={`Remover ${item.name}`}><Trash2 size={15} /></button></div>)}
            </div>
          </section>

          {/* Etapa 03: endereço e método de entrega. */}
          <section className="admin-panel manual-order-card manual-order-card--delivery">
            <div className="panel-heading manual-order-heading"><div className="manual-order-heading-copy"><span className="section-kicker">03 · ENTREGA</span><h3>Morada e logística</h3><p>Defina onde o pedido será entregue e como será enviado.</p></div><span className="manual-order-icon"><MapPin size={18} /></span></div>
            <div className="manual-order-fields manual-order-address-grid">
              <label><span>Rua / avenida</span><Input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required autoComplete="street-address" /></label>
              <label><span>Número</span><Input value={address.number} onChange={(event) => setAddress({ ...address, number: event.target.value })} required /></label>
              <label><span>Complemento</span><Input value={address.complement} onChange={(event) => setAddress({ ...address, complement: event.target.value })} /></label>
              <label><span>Bairro</span><Input value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} required /></label>
              <label><span>Cidade</span><Input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required autoComplete="address-level2" /></label>
              <label><span>Estado</span><Input value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} required autoComplete="address-level1" /></label>
              <label><span>CEP</span><Input value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} required inputMode="numeric" autoComplete="postal-code" /></label>
              <label><span>Método de envio</span><div className="manual-order-select-wrap"><select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)}><option>Retirada / combinado</option><option>PAC</option><option>SEDEX</option><option>Jadlog Econômico</option><option>Jadlog Rápido</option><option>Loggi</option></select><ChevronDown size={16} /></div></label>
            </div>
          </section>

          {/* Etapa 04: observações internas separadas dos dados do cliente. */}
          <section className="admin-panel manual-order-card manual-order-card--notes">
            <div className="panel-heading manual-order-heading"><div className="manual-order-heading-copy"><span className="section-kicker">04 · OBSERVAÇÕES</span><h3>Contexto interno</h3><p>Adicione informações que ajudem a equipa a cumprir o pedido.</p></div><span className="manual-order-icon"><ClipboardPenLine size={18} /></span></div>
            <textarea className="manual-order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: pedido fechado no evento, combinar entrega pelo WhatsApp..." />
          </section>
        </div>

        {/* Resumo fixo: concentra valores, pagamento e a ação principal de criação. */}
        <aside className="manual-order-summary">
          <div className="manual-summary-sticky">
            <div className="manual-summary-topline"><div><span className="section-kicker">RESUMO DO PEDIDO</span><h3>Conferência final</h3></div><span className="manual-summary-status">RASCUNHO</span></div>
            <div className="manual-summary-total">{money(total)}</div>
            <p className="manual-summary-caption">O valor final será registado no histórico de vendas.</p>
            <div className="manual-summary-lines"><span><em>Subtotal</em><b>{money(subtotal)}</b></span><span><em>Envio</em><b>{money(Number(shippingCost || 0))}</b></span><span><em>Desconto</em><b className="manual-discount-value">- {money(Number(discount || 0))}</b></span></div>
            <div className="manual-summary-controls">
              <label><span><Tag size={13} /> Custo do envio</span><Input type="number" min={0} step="0.01" value={shippingCost} onChange={(event) => setShippingCost(Number(event.target.value))} /></label>
              <label><span><Tag size={13} /> Desconto</span><Input type="number" min={0} step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label>
              <label><span><CreditCard size={13} /> Pagamento</span><div className="manual-order-select-wrap"><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="pix">Pix</option><option value="credit_card">Cartão</option><option value="cash">Dinheiro</option><option value="transfer">Transferência</option></select><ChevronDown size={16} /></div></label>
              <label><span><ReceiptText size={13} /> Status do pagamento</span><div className="manual-order-select-wrap"><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="approved">Confirmado</option><option value="pending">Pendente</option></select><ChevronDown size={16} /></div></label>
            </div>
            <Button className="manual-submit-button" type="submit" disabled={createOrderMutation.isPending || items.length === 0}>{createOrderMutation.isPending ? <><LoaderCircle className="spin" size={16} /> A criar pedido...</> : <><Check size={16} /> Criar pedido manual</>}</Button>
            <p className="manual-summary-note">O pedido será guardado no histórico, ficará disponível para logística e reduzirá o estoque das variações selecionadas.</p>
          </div>
        </aside>
      </form>
    </section>
  );
}
