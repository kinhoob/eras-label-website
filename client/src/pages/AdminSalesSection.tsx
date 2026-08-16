import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClipboardList, Eye, Truck, Package, Check, LoaderCircle, MapPin, CreditCard, Users } from "lucide-react";

export default function AdminSalesSection() {
  const { data: orders = [], isLoading, refetch } = trpc.admin.listOrders.useQuery();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<any[]>([]);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  const calculateShippingMutation = trpc.admin.calculateShippingQuote.useMutation({
    onSuccess: (data) => {
      setCalculatingShipping(false);
      setShippingQuotes(data.quotes || []);
      toast.success("Cotação obtida com sucesso via Melhor Envio!");
    },
    onError: (err) => {
      setCalculatingShipping(false);
      toast.error("Erro ao cotar frete no Melhor Envio: " + err.message);
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

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">GESTÃO COMERCIAL</span>
          <h2 className="content-title">Vendas & Entregas (Melhor Envio)</h2>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Atualizar lista</Button>
      </div>

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
        ) : orders.length === 0 ? (
          <p className="editor-description" style={{ padding: "2rem", textAlign: "center" }}>Ainda não existem vendas registadas no sistema.</p>
        ) : (
          <table>
            <thead>
              <tr>
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
              {orders.map((order: any) => {
                const address = order.address || order.shippingAddress || {};
                const shippingLabel = order.shippingService || order.shippingMethod || "Correios / Logística";
                const isPaid = order.paymentStatus === "approved" || order.payment === "Pago";

                return (
                  <tr key={order.id}>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="admin-panel" style={{ background: "var(--background)", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span className="section-kicker">DETALHES DO PEDIDO</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{selectedOrder.orderNumber}</h3>
              </div>
              <Button variant="outline" onClick={() => { setSelectedOrder(null); setShippingQuotes([]); }}>Fechar</Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
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
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    <div key={q.id} style={{ background: "var(--card)", padding: "8px 12px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border)" }}>
                      <div>
                        <strong>{q.company?.name} — {q.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Prazo estimado: {q.delivery_time} dias úteis</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong>R$ {Number(q.custom_price || q.price).toFixed(2)}</strong>
                        <Button size="sm" onClick={() => toast.success(`Serviço ${q.name} selecionado para emissão de etiqueta.`)}>
                          Emitir Etiqueta
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
