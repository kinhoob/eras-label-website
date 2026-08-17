import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { filterOrdersWithReadyLabels } from "@/lib/order-label-filter";
import { Download, Eye, FileText, ExternalLink, Truck, Package, LoaderCircle, CreditCard, Users, Check, Minus, Files, X } from "lucide-react";

export default function AdminSalesSection() {
  const { data: orders = [], isLoading, refetch } = trpc.admin.listOrders.useQuery();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<any[]>([]);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [labelPdfUrl, setLabelPdfUrl] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [bulkLabelPdfUrl, setBulkLabelPdfUrl] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<"all" | "ready">("all");

  // Um pedido está pronto para download quando já tem um PDF persistido ou
  // um ID de envio que permite obtê-lo no Melhor Envio sob demanda.
  const visibleOrders = labelFilter === "ready" ? filterOrdersWithReadyLabels(orders) : orders;
  const visibleOrderIds = visibleOrders.map((order: any) => order.id);
  const visibleSelectedOrderIds = selectedOrderIds.filter((orderId) => visibleOrderIds.includes(orderId));

  const calculateShippingMutation = trpc.admin.calculateShippingQuote.useMutation({
    onSuccess: (data) => {
      setCalculatingShipping(false);
      setShippingQuotes(data.quotes || []);
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
    const cepDest = order.address?.cep || order.shippingAddress?.cep || "50000000";
    setCalculatingShipping(true);
    calculateShippingMutation.mutate({
      cepDestination: cepDest.replace(/\D/g, ""),
      items: order.items.map((item: any) => ({
        price: item.price,
        quantity: item.quantity,
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
          <strong className="positive">{orders.filter((o: any) => o.paymentStatus === "approved" || o.payment === "Pago").length}</strong>
        </div>
        <div className="metric-card">
          <span>Aguardando Pagamento</span>
          <strong className="warning">{orders.filter((o: any) => o.paymentStatus === "pending").length}</strong>
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
                const isPaid = order.paymentStatus === "approved" || order.payment === "Pago";

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
                        {isPaid ? "Pago (Aprovado)" : "Pendente"}
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

      {selectedOrder && (
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
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Status Pagamento:</strong> {selectedOrder.paymentStatus}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Método de Entrega:</strong> {selectedOrder.shippingService || selectedOrder.shippingMethod}</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "4px" }}><strong>Frete:</strong> R$ {Number(selectedOrder.shippingCost || 0).toFixed(2)}</p>
                <p style={{ fontSize: "0.85rem" }}><strong>Total do Pedido:</strong> R$ {Number(selectedOrder.total || 0).toFixed(2)}</p>
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

            <div style={{ background: "var(--muted)", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="admin-sales-shipping-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Truck size={15} /> Integração Melhor Envio (Frete & Etiquetas)
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Cote opções reais de Correios e transportadoras para o CEP do cliente.</p>
                </div>
                <Button onClick={() => handleCotarMelhorEnvio(selectedOrder)} disabled={calculatingShipping}>
                  {calculatingShipping ? <><LoaderCircle className="spin" size={14} /> A cotar...</> : "Cotar no Melhor Envio"}
                </Button>
              </div>

              {shippingQuotes.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Opções Disponíveis:</span>
                  {shippingQuotes.map((q: any) => (
                    <div key={q.id} className="admin-sales-quote-row" style={{ background: "var(--card)", padding: "8px 12px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
                      <div>
                        <strong>{q.company?.name} — {q.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Prazo estimado: {q.delivery_time} dias úteis</div>
                      </div>
                      <div className="admin-sales-quote-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong>R$ {Number(q.custom_price || q.price).toFixed(2)}</strong>
                        <Button size="sm" onClick={() => handleEmitirEtiqueta(selectedOrder.id, q.id)} disabled={generateLabelMutation.isPending}>
                          {generateLabelMutation.isPending ? "A gerar..." : "Gerar Etiqueta"}
                        </Button>
                      </div>
                    </div>
                  ))}
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
        </div>
      )}
    </section>
  );
}
