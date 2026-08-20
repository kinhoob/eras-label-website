import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getOrderStatusLabel, getPaymentLabel, getPaymentTone, isPaymentConfirmed } from "@shared/payment-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { filterOrdersWithReadyLabels } from "@/lib/order-label-filter";
import { Download, Eye, FileText, ExternalLink, Truck, Package, LoaderCircle, CreditCard, Users, Check, Minus, Files, X, Clock3, MapPin, ReceiptText, RefreshCw, Archive, Send } from "lucide-react";

type DeliveryStep = {
  key: string;
  label: string;
  description: string;
};

const DELIVERY_STEPS: DeliveryStep[] = [
  { key: "received", label: "Pedido recebido", description: "O pedido foi registado na Eras Label." },
  { key: "paid", label: "Pagamento confirmado", description: "O pagamento foi aprovado ou está em processamento." },
  { key: "preparing", label: "Em preparação", description: "A equipa está a separar e embalar as peças." },
  { key: "shipped", label: "Enviado", description: "A encomenda foi entregue à transportadora." },
  { key: "delivered", label: "Entregue", description: "A entrega foi concluída." },
];

function getFulfillmentStatus(order: any): "pending_packaging" | "packed" | "shipped" | "archived" {
  if (order.fulfillmentStatus === "archived" || order.archivedAt) return "archived";
  if (order.fulfillmentStatus === "shipped") return "shipped";
  if (order.fulfillmentStatus === "packed") return "packed";
  return "pending_packaging";
}

function getFulfillmentAction(order: any) {
  const status = getFulfillmentStatus(order);
  if (status === "pending_packaging") return { next: "packed" as const, label: "Embalar pedido", icon: Package };
  if (status === "packed") return { next: "shipped" as const, label: "Marcar como enviado", icon: Send };
  if (status === "shipped") return { next: "archived" as const, label: "Arquivar pedido", icon: Archive };
  return null;
}

function getDeliveryStepIndex(order: any) {
  const status = String(order.status ?? "").toLowerCase();
  const fulfillmentStatus = getFulfillmentStatus(order);
  if (status.includes("cancel") || status.includes("recus")) return -1;
  if (status.includes("entregue")) return 4;
  if (fulfillmentStatus === "archived" || fulfillmentStatus === "shipped" || status.includes("enviado") || order.trackingCode || order.shippingOrderId) return 3;
  if (fulfillmentStatus === "packed" || status.includes("prepara") || status.includes("process") || status.includes("embalar")) return 2;
  if (["approved", "authorized", "in_process", "paid", "pago"].includes(String(order.paymentStatus ?? "").toLowerCase())) return 1;
  return 0;
}

function formatOrderDate(value: unknown) {
  if (!value) return "Data não informada";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Data não informada" : date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminSalesSection() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: orders = [], isLoading, refetch } = trpc.admin.listOrders.useQuery({ includeArchived });
  const utils = trpc.useUtils();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<any[]>([]);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [labelPdfUrl, setLabelPdfUrl] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [bulkLabelPdfUrl, setBulkLabelPdfUrl] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<"all" | "ready">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "7" | "30" | "90">("all");
  const [quoteStep, setQuoteStep] = useState<1 | 2>(1);
  const [quoteForm, setQuoteForm] = useState({
    cepDestination: "",
    widthCm: "20",
    heightCm: "5",
    lengthCm: "32",
    weightGrams: "500",
  });

  useEffect(() => {
    if (!selectedOrder) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) return;
    const address = selectedOrder.address || selectedOrder.shippingAddress || {};
    const itemsCount = Array.isArray(selectedOrder.items) ? selectedOrder.items.reduce((acc: number, item: any) => acc + Number(item.quantity || 1), 0) : 1;
    // Cálculo realista de dimensões e peso por encomenda (ex: base 20x5x32cm + 300g por peça)
    const calculatedWeight = Math.max(300, itemsCount * 300);
    const calculatedWidth = 20;
    const calculatedHeight = Math.min(25, 5 + Math.floor(itemsCount / 2) * 3);
    const calculatedLength = 32;

    setQuoteForm({
      cepDestination: String(address.cep || "").replace(/\D/g, ""),
      widthCm: String(calculatedWidth),
      heightCm: String(calculatedHeight),
      lengthCm: String(calculatedLength),
      weightGrams: String(calculatedWeight),
    });
    setShippingQuotes([]);
    setQuoteStep(1);
  }, [selectedOrder?.id]);

  // Um pedido está pronto para download quando já tem um PDF persistido ou
  // um ID de envio que permite obtê-lo no Melhor Envio sob demanda.
  const visibleOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const periodStart = periodFilter === "all" ? null : Date.now() - Number(periodFilter) * 24 * 60 * 60 * 1000;
    const sourceOrders = labelFilter === "ready" ? filterOrdersWithReadyLabels(orders) : orders;

    return sourceOrders.filter((order: any) => {
      const matchesSearch = !normalizedSearch || [order.orderNumber, order.customerName, order.customerEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || String(order.status ?? "").toLowerCase() === statusFilter.toLowerCase();
      const matchesPayment = paymentFilter === "all" || String(order.paymentStatus ?? "").toLowerCase() === paymentFilter.toLowerCase();
      const matchesPeriod = !periodStart || new Date(order.createdAt).getTime() >= periodStart;
      return matchesSearch && matchesStatus && matchesPayment && matchesPeriod;
    });
  }, [labelFilter, orders, paymentFilter, periodFilter, searchTerm, statusFilter]);
  const visibleOrderIds = visibleOrders.map((order: any) => order.id);
  const visibleSelectedOrderIds = selectedOrderIds.filter((orderId) => visibleOrderIds.includes(orderId));

  const updateFulfillmentMutation = trpc.admin.updateFulfillmentStatus.useMutation({
    onSuccess: (data) => {
      setSelectedOrder(data.order);
      void refetch();
      void utils.admin.listOrders.invalidate();
      const labels: Record<string, string> = {
        packed: "Pedido marcado como embalado.",
        shipped: "Pedido marcado como enviado.",
        archived: "Pedido arquivado e removido da lista activa.",
      };
      toast.success(labels[data.order.fulfillmentStatus] || "Estado operacional actualizado.");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível actualizar o estado do pedido.");
    },
  });

  const reconcilePaymentMutation = trpc.admin.reconcilePayment.useMutation({
    onSuccess: (data) => {
      if (data.order) setSelectedOrder(data.order);
      void refetch();
      if (data.success) {
        toast.success("Pagamento sincronizado: o Mercado Pago confirmou a aprovação.");
      } else {
        toast.info(`O Mercado Pago ainda informa o pagamento como ${data.paymentStatus}.`);
      }
    },
    onError: (err) => {
      toast.error("Não foi possível sincronizar o pagamento: " + err.message);
    },
  });

  const calculateShippingMutation = trpc.admin.calculateShippingQuote.useMutation({
    onSuccess: (data) => {
      setCalculatingShipping(false);
      setShippingQuotes(data.quotes || []);
      setQuoteStep(2);
      toast.success("Cotação obtida com sucesso via Melhor Envio!");
    },
    onError: (err) => {
      setCalculatingShipping(false);
      const msg = err.message || "";
      if (msg.includes("401") || msg.includes("Unauthenticated")) {
        toast.error("Token do Melhor Envio inválido ou não configurado para produção. Configure o token em Configurações > Secrets.");
      } else {
        toast.error("Erro ao cotar frete no Melhor Envio: " + msg);
      }
    },
  });

  const handleCotarMelhorEnvio = (order: any) => {
    const numericPackage = {
      widthCm: Number(quoteForm.widthCm),
      heightCm: Number(quoteForm.heightCm),
      lengthCm: Number(quoteForm.lengthCm),
      weightGrams: Number(quoteForm.weightGrams),
    };
    const hasInvalidPackage = Object.values(numericPackage).some((value) => !Number.isFinite(value) || value <= 0);
    const cleanCep = quoteForm.cepDestination.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      toast.error("Informe um CEP de destino válido com 8 dígitos.");
      return;
    }
    if (hasInvalidPackage) {
      toast.error("Preencha altura, largura, comprimento e peso com valores maiores que zero.");
      return;
    }

    setCalculatingShipping(true);
    setShippingQuotes([]);
    calculateShippingMutation.mutate({
      cepDestination: cleanCep,
      package: numericPackage,
      items: order.items.map((item: any, index: number) => ({
        id: String(item.productId ?? item.id ?? index + 1),
        price: Number(item.price ?? item.unitPrice ?? 0),
        quantity: Number(item.quantity ?? 1),
      })),
    });
  };

  const generateLabelMutation = trpc.admin.generateShippingLabel.useMutation({
    onSuccess: (data) => {
      setSelectedOrder((current: any) => current ? { ...current, shippingOrderId: data.shippingOrderId, labelPdfUrl: undefined } : current);
      setLabelPdfUrl(null);
      toast.success("Etiqueta adicionada ao carrinho do Melhor Envio. Após a compra e geração, o PDF poderá ser visualizado aqui.");
    },
    onError: (err) => {
      toast.error("Erro ao gerar etiqueta: " + err.message);
    },
  });

  const handleEmitirEtiqueta = (orderId: number, serviceId: number) => {
    if (!confirm("Deseja enviar este pedido para o carrinho do Melhor Envio e gerar a etiqueta de postagem?")) return;
    generateLabelMutation.mutate({ orderId, serviceId });
  };

  const downloadLabelMutation = trpc.admin.downloadShippingLabel.useMutation({
    onSuccess: (data) => {
      setLabelPdfUrl(data.labelPdfUrl);
      setSelectedOrder((current: any) => current ? { ...current, shippingOrderId: data.shippingOrderId, labelPdfUrl: data.labelPdfUrl } : current);
      toast.success("PDF da etiqueta disponível para visualização e download.");
    },
    onError: (err) => {
      toast.error("Não foi possível obter o PDF da etiqueta: " + err.message);
    },
  });

  const handleVisualizarEtiqueta = (order: any) => {
    const existingUrl = order.labelPdfUrl;
    if (existingUrl) {
      setLabelPdfUrl(existingUrl);
      return;
    }
    downloadLabelMutation.mutate({ orderId: order.id, shipmentId: order.shippingOrderId || undefined });
  };

  const activeLabelPdfUrl = labelPdfUrl || selectedOrder?.labelPdfUrl || null;
  const allOrdersSelected = visibleOrders.length > 0 && visibleOrders.every((order: any) => visibleSelectedOrderIds.includes(order.id));

  const bulkDownloadLabelsMutation = trpc.admin.downloadBulkShippingLabels.useMutation({
    onSuccess: (data) => {
      setBulkLabelPdfUrl(data.labelPdfUrl);
      const skippedCount = data.skippedOrders?.length ?? 0;
      toast.success(
        skippedCount > 0
          ? `${data.pageCount} etiqueta(s) consolidada(s); ${skippedCount} pedido(s) ignorado(s) por falta de PDF.`
          : `${data.pageCount} etiqueta(s) consolidada(s) num único PDF.`,
      );
    },
    onError: (err) => {
      toast.error("Não foi possível consolidar as etiquetas: " + err.message);
    },
  });

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  };

  const toggleAllOrders = () => {
    setSelectedOrderIds((current) => allOrdersSelected
      ? current.filter((orderId) => !visibleOrderIds.includes(orderId))
      : Array.from(new Set([...current, ...visibleOrderIds])));
  };

  const handleBulkDownload = () => {
    if (visibleSelectedOrderIds.length === 0) {
      toast.error("Selecione pelo menos um pedido para baixar as etiquetas.");
      return;
    }
    setBulkLabelPdfUrl(null);
    bulkDownloadLabelsMutation.mutate({ orderIds: visibleSelectedOrderIds });
  };

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">GESTÃO COMERCIAL</span>
          <h2 className="content-title">Vendas & Entregas (Melhor Envio)</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", flexWrap: "wrap" }} role="group" aria-label="Filtro de etiquetas">
            <Button
              size="sm"
              variant={labelFilter === "all" ? "default" : "outline"}
              onClick={() => setLabelFilter("all")}
            >
              Todas ({orders.length})
            </Button>
            <Button
              size="sm"
              variant={labelFilter === "ready" ? "default" : "outline"}
              onClick={() => setLabelFilter("ready")}
            >
              Etiquetas prontas ({filterOrdersWithReadyLabels(orders).length})
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {visibleSelectedOrderIds.length > 0 && (
            <Button
              onClick={handleBulkDownload}
              disabled={bulkDownloadLabelsMutation.isPending}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {bulkDownloadLabelsMutation.isPending ? <LoaderCircle className="spin" size={14} /> : <Files size={14} />}
              {bulkDownloadLabelsMutation.isPending ? "A consolidar..." : `Baixar ${visibleSelectedOrderIds.length} etiqueta(s)`}
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>Atualizar lista</Button>
        </div>
      </div>

      <div className="sales-filter-panel admin-panel" aria-label="Filtros de vendas">
        <div className="sales-search-field">
          <label htmlFor="sales-search">Pesquisar pedidos</label>
          <div className="sales-search-input-wrap">
            <Input id="sales-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Número, cliente ou e-mail" />
            {searchTerm && <button type="button" className="sales-clear-search" onClick={() => setSearchTerm("")} aria-label="Limpar pesquisa"><X size={15} /></button>}
          </div>
        </div>
        <label className="sales-filter-control"><span>Status do pedido</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos os status</option><option value="Processando">Processando</option><option value="Em preparação">Em preparação</option><option value="Embalado">Embalado</option><option value="Enviado">Enviado</option><option value="Entregue">Entregue</option><option value="Arquivado">Arquivado</option><option value="Cancelado">Cancelado</option></select></label>
        <label className="sales-filter-control"><span>Pagamento</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}><option value="all">Todos</option><option value="approved">Aprovado</option><option value="pending">Pendente</option><option value="rejected">Recusado</option></select></label>
        <label className="sales-filter-control"><span>Período</span><select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value as "all" | "7" | "30" | "90")}><option value="all">Todo o histórico</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label>
        <label className="sales-archive-toggle"><input type="checkbox" checked={includeArchived} onChange={(event) => { setIncludeArchived(event.target.checked); setSelectedOrderIds([]); }} /> <span>Mostrar arquivados</span></label>
        <Button type="button" variant="outline" className="sales-reset-filters" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPaymentFilter("all"); setPeriodFilter("all"); setLabelFilter("all"); setIncludeArchived(false); }}>Limpar filtros</Button>
      </div>

      {bulkLabelPdfUrl && (
        <div className="admin-panel" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "flex", alignItems: "center", gap: "6px" }}><FileText size={16} /> PDF consolidado pronto</strong>
            <p className="editor-description" style={{ margin: "4px 0 0" }}>As etiquetas disponíveis da seleção foram reunidas num único arquivo PDF.</p>
          </div>
          <a
            href={bulkLabelPdfUrl}
            download="etiquetas-eras-label.pdf"
            target="_blank"
            rel="noreferrer"
            className="button"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
          >
            <Download size={14} /> Descarregar PDF consolidado
          </a>
        </div>
      )}

      <div className="order-cards">
        <div className="metric-card">
          <span>Total de Vendas</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric-card">
          <span>Pagamentos Aprovados</span>
          <strong className="positive">{orders.filter((o: any) => isPaymentConfirmed(o.paymentStatus) || o.payment === "Pago").length}</strong>
        </div>
        <div className="metric-card">
          <span>Aguardando Pagamento</span>
          <strong className="warning">{orders.filter((o: any) => !isPaymentConfirmed(o.paymentStatus) && !["rejected", "failed", "cancelled"].includes(String(o.paymentStatus ?? "").toLowerCase())).length}</strong>
        </div>
        <div className="metric-card">
          <span>Volume filtrado</span>
          <strong>R$ {visibleOrders.reduce((total: number, order: any) => total + Number(order.total || 0), 0).toFixed(2)}</strong>
          <small>{visibleOrders.length} pedido(s) no recorte atual</small>
        </div>
      </div>

      <div className="admin-panel table-panel">
        {isLoading ? (
          <p className="editor-description" style={{ padding: "2rem", textAlign: "center" }}>A carregar vendas e dados de entrega...</p>
        ) : visibleOrders.length === 0 ? (
          <p className="editor-description" style={{ padding: "2rem", textAlign: "center" }}>
            {labelFilter === "ready"
              ? "Ainda não existem pedidos com etiquetas prontas para download."
              : "Ainda não existem vendas registadas no sistema."}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "42px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={allOrdersSelected}
                    ref={(element) => {
                      if (element) element.indeterminate = selectedOrderIds.length > 0 && !allOrdersSelected;
                    }}
                    onChange={toggleAllOrders}
                    aria-label="Selecionar todos os pedidos"
                  />
                </th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Método de Entrega</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Data</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order: any) => {
                const address = order.address || order.shippingAddress || {};
                const shippingLabel = order.shippingService || order.shippingMethod || "Correios / Logística";
                const isPaid = isPaymentConfirmed(order.paymentStatus) || order.payment === "Pago";

                return (
                  <tr key={order.id}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        aria-label={`Selecionar pedido ${order.orderNumber}`}
                      />
                    </td>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>
                      <div>{order.customerName}</div>
                      <small style={{ color: "var(--muted-foreground)" }}>{order.customerEmail}</small>
                    </td>
                    <td>
                      <span className="status-pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Truck size={13} /> {shippingLabel}
                      </span>
                      {address.cep && <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>CEP: {address.cep}</div>}
                    </td>
                    <td>
                      <span className={isPaid ? "stock-ok" : "stock-warning"}>
                        {getPaymentLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td><strong>R$ {Number(order.total).toFixed(2)}</strong></td>
                    <td>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td style={{ textAlign: "right" }}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye size={14} style={{ marginRight: "4px" }} /> Detalhes & Envio
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && createPortal(
        <div className="admin-sales-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="admin-panel admin-modal admin-sales-modal" style={{ background: "var(--background)", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span className="section-kicker">DETALHES DO PEDIDO</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => { setSelectedOrder(null); setShippingQuotes([]); setLabelPdfUrl(null); }}
                style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-sales-summary-grid" style={{ marginBottom: "1.5rem" }}>
              <div style={{ background: "var(--card)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={15} /> Cliente e Morada
                </h4>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Nome:</strong> {selectedOrder.customerName}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>E-mail:</strong> {selectedOrder.customerEmail}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>CPF:</strong> {selectedOrder.customerCpf || "Não informado"}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Morada:</strong> {selectedOrder.address?.street || selectedOrder.shippingAddress?.street}, {selectedOrder.address?.number || selectedOrder.shippingAddress?.number} {selectedOrder.address?.complement ? `- ${selectedOrder.address.complement}` : ""}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Bairro / Cidade:</strong> {selectedOrder.address?.neighborhood || selectedOrder.shippingAddress?.neighborhood}, {selectedOrder.address?.city || selectedOrder.shippingAddress?.city} - {selectedOrder.address?.state || selectedOrder.shippingAddress?.state}</p>
                <p style={{ fontSize: "0.85rem" }}><strong>CEP:</strong> {selectedOrder.address?.cep || selectedOrder.shippingAddress?.cep}</p>
              </div>

              <div style={{ background: "var(--card)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CreditCard size={15} /> Pagamento e Frete
                </h4>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Método:</strong> {selectedOrder.paymentMethod?.toUpperCase()}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Status Pagamento:</strong> <span className={`status-pill ${getPaymentTone(selectedOrder.paymentStatus)}`}>{getPaymentLabel(selectedOrder.paymentStatus)}</span></p>
                {!["approved", "authorized"].includes(String(selectedOrder.paymentStatus ?? "").toLowerCase()) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={reconcilePaymentMutation.isPending}
                    onClick={() => reconcilePaymentMutation.mutate({ orderNumber: selectedOrder.orderNumber })}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "0.35rem 0 0.65rem" }}
                  >
                    {reconcilePaymentMutation.isPending ? <LoaderCircle className="spin" size={14} /> : <RefreshCw size={14} />}
                    {reconcilePaymentMutation.isPending ? "A sincronizar..." : "Sincronizar Mercado Pago"}
                  </Button>
                )}
                {selectedOrder.paymentFailureReason && !["approved", "authorized", "paid"].includes(String(selectedOrder.paymentStatus ?? "").toLowerCase()) && (
                  <p style={{ fontSize: "0.85rem", marginBottom: "4px", color: "#b22222", background: "rgba(178,34,34,0.08)", padding: "6px 8px", borderRadius: "4px" }}>
                    <strong>Motivo da Falha / Recusa:</strong> {selectedOrder.paymentFailureReason}
                  </p>
                )}
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Método de Entrega:</strong> {selectedOrder.shippingService || selectedOrder.shippingMethod}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Subtotal Produtos:</strong> R$ {Number(selectedOrder.subtotal || selectedOrder.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0).toFixed(2)}</p>
                {Number(selectedOrder.discount || 0) > 0 && (
                  <p style={{ fontSize: "0.85rem", marginBottom: "4px", color: "#b22222" }}><strong>Descontos / Cupão:</strong> - R$ {Number(selectedOrder.discount || 0).toFixed(2)}</p>
                )}
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Frete:</strong> R$ {Number(selectedOrder.shippingCost || 0).toFixed(2)}</p>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, borderTop: "1px solid var(--border)", paddingTop: "6px", marginTop: "4px" }}><strong>Total Final Pago:</strong> R$ {Number(selectedOrder.total || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="admin-order-delivery-panel" style={{ marginBottom: "1.5rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <div>
                  <span className="section-kicker">ACOMPANHAMENTO</span>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginTop: "0.25rem" }}><Clock3 size={16} /> Status da entrega</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.3rem" }}>Visão consolidada do estado atual do pedido e da logística.</p>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.45rem" }}>
                  <strong style={{ display: "block", color: "#b22222" }}>{getOrderStatusLabel(selectedOrder.status)}</strong>
                  <small style={{ color: "var(--muted-foreground)" }}>Atualizado em {formatOrderDate(selectedOrder.updatedAt || selectedOrder.createdAt)}</small>
                  {getFulfillmentAction(selectedOrder) && (
                    (() => {
                      const action = getFulfillmentAction(selectedOrder)!;
                      const ActionIcon = action.icon;
                      return (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => updateFulfillmentMutation.mutate({ orderId: selectedOrder.id, status: action.next })}
                          disabled={updateFulfillmentMutation.isPending || !isPaymentConfirmed(selectedOrder.paymentStatus)}
                          title={!isPaymentConfirmed(selectedOrder.paymentStatus) ? "O pagamento precisa de estar aprovado antes da operação." : undefined}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                          {updateFulfillmentMutation.isPending ? <LoaderCircle className="spin" size={14} /> : <ActionIcon size={14} />}
                          {updateFulfillmentMutation.isPending ? "A actualizar..." : action.label}
                        </Button>
                      );
                    })()
                  )}
                </div>
              </div>
              {getDeliveryStepIndex(selectedOrder) < 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem", borderRadius: "8px", background: "rgba(178,34,34,0.08)", color: "#8e1b1b" }}>
                  <X size={17} /> <span>Este pedido está cancelado ou com pagamento recusado. Verifique o motivo antes de preparar o envio.</span>
                </div>
              ) : (
                <div className="admin-order-delivery-timeline" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.5rem" }}>
                  {DELIVERY_STEPS.map((step, index) => {
                    const currentStep = getDeliveryStepIndex(selectedOrder);
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    return (
                      <div key={step.key} style={{ position: "relative", minWidth: 0 }}>
                        <div style={{ height: "3px", background: isCompleted ? "#b22222" : "var(--border)", margin: "0 0 0.65rem", borderRadius: "999px" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: isCompleted ? "#b22222" : "var(--muted-foreground)" }}>
                          <span style={{ width: "24px", height: "24px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", border: `1px solid ${isCompleted ? "#b22222" : "var(--border)"}`, background: isCompleted ? "rgba(178,34,34,0.1)" : "transparent" }}>
                            {isCompleted ? <Check size={13} /> : <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />}
                          </span>
                          <strong style={{ fontSize: "0.72rem", lineHeight: 1.25 }}>{step.label}</strong>
                        </div>
                        <p style={{ fontSize: "0.68rem", lineHeight: 1.35, color: isCurrent ? "var(--foreground)" : "var(--muted-foreground)", margin: "0.45rem 0 0" }}>{isCurrent ? step.description : index < currentStep ? "Concluído" : "Aguardando"}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}><Truck size={14} /> {selectedOrder.carrier || selectedOrder.shippingService || selectedOrder.shippingMethod || "Transportadora não definida"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}><MapPin size={14} /> {selectedOrder.trackingCode ? `Rastreio: ${selectedOrder.trackingCode}` : "Código de rastreio ainda não informado"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem" }}><ReceiptText size={14} /> Pedido criado em {formatOrderDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <Package size={16} /> Itens do Pedido ({selectedOrder.items?.length || 0})
              </h4>
              <div className="admin-sales-items-scroll" style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Produto</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Tamanho</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Qtd</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 12px" }}>{item.name}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.size}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>R$ {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: "var(--muted)", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="admin-sales-shipping-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span className="section-kicker">MELHOR ENVIO</span>
                  <h4 style={{ fontSize: "1rem", fontWeight: 650, display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <Truck size={16} /> Cotar frete e preparar etiqueta
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "4px", maxWidth: "620px" }}>Informe o CEP e as medidas reais da embalagem. O peso é enviado em gramas e convertido para quilogramas no Melhor Envio.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--muted-foreground)" }} aria-label={`Passo ${quoteStep} de 2`}>
                  <span style={{ color: quoteStep >= 1 ? "#b22222" : "inherit", fontWeight: 700 }}>01 Dados</span>
                  <span aria-hidden="true">/</span>
                  <span style={{ color: quoteStep === 2 ? "#b22222" : "inherit", fontWeight: quoteStep === 2 ? 700 : 500 }}>02 Opções</span>
                </div>
              </div>

              {quoteStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="admin-sales-shipping-form-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <MapPin size={16} color="#b22222" />
                      <div>
                        <strong style={{ display: "block", fontSize: "0.9rem" }}>Endereço de destino</strong>
                        <span style={{ fontSize: "0.74rem", color: "var(--muted-foreground)" }}>CEP usado para calcular as modalidades disponíveis.</span>
                      </div>
                    </div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600 }} htmlFor="admin-shipping-cep">CEP de destino</label>
                    <Input id="admin-shipping-cep" value={quoteForm.cepDestination} onChange={(event) => setQuoteForm((current) => ({ ...current, cepDestination: event.target.value.replace(/\D/g, "").slice(0, 8) }))} placeholder="00000-000" inputMode="numeric" style={{ marginTop: "6px", maxWidth: "320px" }} />
                  </div>

                  <div className="admin-sales-shipping-form-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Package size={16} color="#b22222" />
                      <div>
                        <strong style={{ display: "block", fontSize: "0.9rem" }}>Encomenda</strong>
                        <span style={{ fontSize: "0.74rem", color: "var(--muted-foreground)" }}>Medidas externas do pacote já fechado, como no fluxo de envio avulso.</span>
                      </div>
                    </div>
                    <div className="admin-sales-package-grid" style={{ display: "grid", gap: "10px" }}>
                      {[{ key: "heightCm", label: "Altura", unit: "cm" }, { key: "widthCm", label: "Largura", unit: "cm" }, { key: "lengthCm", label: "Comprimento", unit: "cm" }, { key: "weightGrams", label: "Peso", unit: "g" }].map((field) => (
                        <label key={field.key} style={{ display: "block", fontSize: "0.76rem", fontWeight: 600 }} htmlFor={`admin-shipping-${field.key}`}>
                          {field.label}
                          <div style={{ position: "relative", marginTop: "6px" }}>
                            <Input id={`admin-shipping-${field.key}`} type="number" min="0.01" step="0.01" value={quoteForm[field.key as keyof typeof quoteForm]} onChange={(event) => setQuoteForm((current) => ({ ...current, [field.key]: event.target.value }))} inputMode="decimal" style={{ paddingRight: "32px" }} />
                            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{field.unit}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "10px" }}>Use o peso total da encomenda. Para este pedido, o valor declarado calculado é R$ {Number(selectedOrder.subtotal || selectedOrder.total || 0).toFixed(2)}.</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
                    <Button onClick={() => handleCotarMelhorEnvio(selectedOrder)} disabled={calculatingShipping}>
                      {calculatingShipping ? <><LoaderCircle className="spin" size={14} /> A calcular...</> : "Continuar para opções"}
                    </Button>
                  </div>
                </div>
              )}

              {quoteStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem" }}>Modalidades ativas</strong>
                      <p style={{ fontSize: "0.74rem", color: "var(--muted-foreground)", marginTop: "3px" }}>Escolha uma modalidade para adicionar o pedido ao carrinho do Melhor Envio.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setQuoteStep(1); setShippingQuotes([]); }}>Editar pacote</Button>
                  </div>
                  <div className="admin-sales-quote-summary" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                    CEP: <strong style={{ color: "var(--foreground)" }}>{quoteForm.cepDestination}</strong> · Peso: <strong style={{ color: "var(--foreground)" }}>{quoteForm.weightGrams} g</strong> · Dimensões: <strong style={{ color: "var(--foreground)" }}>{quoteForm.heightCm} × {quoteForm.widthCm} × {quoteForm.lengthCm} cm</strong>
                  </div>
                  {shippingQuotes.length > 0 ? shippingQuotes.map((q: any) => (
                    <div key={q.id} className="admin-sales-quote-row" style={{ background: "var(--card)", padding: "12px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", border: "1px solid var(--border)", flexWrap: "wrap" }}>
                      <div>
                        <strong>{q.company?.name || "Transportadora"} — {q.name || q.service}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "3px" }}>Entrega estimada: {q.delivery_range ? `${q.delivery_range.min ?? "?"} a ${q.delivery_range.max ?? "?"}` : q.delivery_time ?? "a confirmar"} dias úteis</div>
                      </div>
                      <div className="admin-sales-quote-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong>R$ {Number(q.custom_price ?? q.price ?? 0).toFixed(2)}</strong>
                        <Button size="sm" onClick={() => handleEmitirEtiqueta(selectedOrder.id, q.id)} disabled={generateLabelMutation.isPending}>
                          {generateLabelMutation.isPending ? "A gerar..." : "Gerar etiqueta"}
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Nenhuma modalidade foi devolvida para este pacote e CEP.</p>
                  )}
                </div>
              )}

              <div style={{ marginTop: "1rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileText size={15} /> PDF da etiqueta
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "4px" }}>
                      Depois de comprar e gerar o envio no Melhor Envio, obtenha o PDF diretamente nesta tela.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Button
                      size="sm"
                      onClick={() => handleVisualizarEtiqueta(selectedOrder)}
                      disabled={downloadLabelMutation.isPending || (!selectedOrder.shippingOrderId && !selectedOrder.labelPdfUrl)}
                    >
                      {downloadLabelMutation.isPending ? <><LoaderCircle className="spin" size={14} /> A obter PDF...</> : <><Eye size={14} /> Visualizar PDF</>}
                    </Button>
                    {activeLabelPdfUrl && (
                      <a
                        href={activeLabelPdfUrl}
                        download={`etiqueta-${selectedOrder.orderNumber}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="button outline"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "0.8rem" }}
                      >
                        <Download size={14} /> Descarregar PDF
                      </a>
                    )}
                  </div>
                </div>
                {activeLabelPdfUrl ? (
                  <div style={{ marginTop: "1rem", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>
                    <iframe
                      src={activeLabelPdfUrl}
                      title={`Etiqueta de envio do pedido ${selectedOrder.orderNumber}`}
                      style={{ display: "block", width: "100%", height: "520px", border: 0 }}
                    />
                  </div>
                ) : (
                  <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                    A etiqueta ainda não tem um PDF disponível. Gere e compre o envio no Melhor Envio para habilitar esta ação.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
