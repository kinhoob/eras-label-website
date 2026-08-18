import { useMemo, useState } from "react";
import { Check, ChevronDown, ClipboardPenLine, LoaderCircle, Plus, ReceiptText, Trash2, UserRound } from "lucide-react";
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

const emptyAddress: AddressDraft = { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", postalCode: "" };

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  const selectedProduct = useMemo(() => products.find((product) => String(product.id) === selectedProductId), [products, selectedProductId]);
  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];
    const variations = Array.isArray(selectedProduct.variations) ? selectedProduct.variations : [];
    return variations.map((variation) => ({ size: String(variation.size), stock: Number(variation.stock ?? 0) })).filter((variation) => variation.stock > 0);
  }, [selectedProduct]);
  const selectedStock = availableSizes.find((variation) => variation.size === selectedSize)?.stock ?? Number(selectedProduct?.totalStock ?? 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + Number(shippingCost || 0) - Number(discount || 0));

  const createOrderMutation = trpc.admin.createManualOrder.useMutation({
    onSuccess: (result) => {
      toast.success(`Pedido ${result.orderNumber} criado com sucesso.`);
      void utils.admin.listOrders.invalidate();
      setCustomerName(""); setCustomerEmail(""); setCustomerCpf(""); setPhone(""); setAddress(emptyAddress); setItems([]); setNotes(""); setShippingCost(0); setDiscount(0);
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
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxStock) } : item);
      const rawImages = selectedProduct.images as unknown;
      const image = Array.isArray(rawImages) ? String(rawImages[0] ?? "") : typeof rawImages === "string" ? rawImages : undefined;
      return [...current, { productId: selectedProduct.id, name: selectedProduct.name, size, quantity, price, image, maxStock: stock }];
    });
    setSelectedQuantity(1);
    toast.success("Peça adicionada ao pedido manual.");
  }

  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return toast.error("Adicione pelo menos uma peça ao pedido.");
    createOrderMutation.mutate({
      customerName, customerEmail, customerCpf, phone: phone || undefined,
      shippingAddress: address,
      items: items.map(({ maxStock: _maxStock, ...item }) => item),
      shippingMethod, paymentMethod, shippingCost: Number(shippingCost || 0), discount: Number(discount || 0), notes: notes || undefined,
      status: paymentStatus === "approved" ? "Processando" : "Aguardando pagamento", paymentStatus,
    });
  }

  return (
    <section className="admin-content manual-order-page">
      <div className="manual-order-hero">
        <div><span className="section-kicker">APARÊNCIA & CMS · OPERAÇÃO</span><h2 className="content-title">Pedido manual</h2><p className="content-subtitle">Registe encomendas feitas por WhatsApp, evento, atendimento privado ou qualquer canal fora da loja.</p></div>
        <div className="manual-order-hero-mark"><ClipboardPenLine size={22} /><span>ORDERS / 01</span></div>
      </div>
      <form className="manual-order-layout" onSubmit={submitOrder}>
        <div className="manual-order-main">
          <div className="admin-panel manual-order-card"><div className="panel-heading"><div><span className="section-kicker">01 · CLIENTE</span><h3>Dados do comprador</h3></div><UserRound size={20} /></div><div className="manual-order-fields"><label><span>Nome completo</span><Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required placeholder="Nome do cliente" /></label><label><span>E-mail</span><Input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} required placeholder="cliente@email.com" /></label><label><span>CPF</span><Input value={customerCpf} onChange={(event) => setCustomerCpf(event.target.value)} required placeholder="000.000.000-00" /></label><label><span>Telefone</span><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(00) 00000-0000" /></label></div></div>
          <div className="admin-panel manual-order-card"><div className="panel-heading"><div><span className="section-kicker">02 · CATÁLOGO</span><h3>Peças do pedido</h3></div><ReceiptText size={20} /></div><div className="manual-order-product-picker"><label><span>Produto</span><select value={selectedProductId} onChange={(event) => { setSelectedProductId(event.target.value); setSelectedSize(""); }} disabled={productsLoading}><option value="">{productsLoading ? "A carregar catálogo..." : "Selecionar produto real"}</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {money(Number(product.price ?? 0))}</option>)}</select></label><label><span>Tamanho / variação</span><select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} disabled={!selectedProduct}><option value="">{availableSizes.length ? "Selecionar tamanho" : "Único / stock geral"}</option>{availableSizes.map((variation) => <option key={variation.size} value={variation.size}>{variation.size} · {variation.stock} disponíveis</option>)}</select></label><label><span>Quantidade</span><Input type="number" min={1} max={Math.max(1, selectedStock)} value={selectedQuantity} onChange={(event) => setSelectedQuantity(Number(event.target.value))} disabled={!selectedProduct} /></label><Button type="button" className="manual-add-item" onClick={addItem} disabled={!selectedProduct}><Plus size={15} /> Adicionar</Button></div><div className="manual-items-list">{items.length === 0 ? <div className="manual-empty-items"><ReceiptText size={24} /><strong>Nenhuma peça adicionada</strong><span>Escolha produtos reais do catálogo acima.</span></div> : items.map((item) => <div className="manual-item-row" key={`${item.productId}-${item.size}`}><div className="manual-item-thumb">{item.image ? <img src={item.image} alt="" /> : <span>ERAS.</span>}</div><div className="manual-item-copy"><strong>{item.name}</strong><span>Tamanho {item.size} · {item.quantity} un.</span></div><b>{money(item.price * item.quantity)}</b><button type="button" onClick={() => setItems((current) => current.filter((entry) => entry !== item))} aria-label={`Remover ${item.name}`}><Trash2 size={15} /></button></div>)}</div></div>
          <div className="admin-panel manual-order-card"><div className="panel-heading"><div><span className="section-kicker">03 · ENTREGA</span><h3>Morada e logística</h3></div></div><div className="manual-order-fields manual-order-address-grid"><label><span>Rua / avenida</span><Input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required /></label><label><span>Número</span><Input value={address.number} onChange={(event) => setAddress({ ...address, number: event.target.value })} required /></label><label><span>Complemento</span><Input value={address.complement} onChange={(event) => setAddress({ ...address, complement: event.target.value })} /></label><label><span>Bairro</span><Input value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} required /></label><label><span>Cidade</span><Input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required /></label><label><span>Estado</span><Input value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} required /></label><label><span>CEP</span><Input value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} required /></label><label><span>Método de envio</span><select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)}><option>Retirada / combinado</option><option>PAC</option><option>SEDEX</option><option>Jadlog Econômico</option><option>Jadlog Rápido</option><option>Loggi</option></select></label></div></div>
          <div className="admin-panel manual-order-card"><div className="panel-heading"><div><span className="section-kicker">04 · OBSERVAÇÕES</span><h3>Contexto interno</h3></div></div><textarea className="manual-order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: pedido fechado no evento, combinar entrega pelo WhatsApp..." /></div>
        </div>
        <aside className="manual-order-summary"><div className="manual-summary-sticky"><div className="manual-summary-label">RESUMO DO PEDIDO</div><div className="manual-summary-total">{money(total)}</div><div className="manual-summary-lines"><span>Subtotal <b>{money(subtotal)}</b></span><span>Envio <b>{money(Number(shippingCost || 0))}</b></span><span>Desconto <b>- {money(Number(discount || 0))}</b></span></div><div className="manual-summary-controls"><label><span>Custo do envio</span><Input type="number" min={0} step="0.01" value={shippingCost} onChange={(event) => setShippingCost(Number(event.target.value))} /></label><label><span>Desconto</span><Input type="number" min={0} step="0.01" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label><label><span>Pagamento</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="pix">Pix</option><option value="credit_card">Cartão</option><option value="cash">Dinheiro</option><option value="transfer">Transferência</option></select></label><label><span>Status do pagamento</span><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="approved">Confirmado</option><option value="pending">Pendente</option></select></label></div><Button className="manual-submit-button" type="submit" disabled={createOrderMutation.isPending || items.length === 0}>{createOrderMutation.isPending ? <><LoaderCircle className="spin" size={16} /> A criar pedido...</> : <><Check size={16} /> Criar pedido manual</>}</Button><p className="manual-summary-note">O pedido será guardado no histórico, ficará disponível para logística e reduzirá o estoque das variações selecionadas.</p></div></aside>
      </form>
    </section>
  );
}
