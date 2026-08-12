import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, ExternalLink, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";
import { Link } from "wouter";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Account() {
  const { user, logout } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: !!user,
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (!user) {
    return (
      <div className="eras-site auth-required-page">
        <header className="site-header">
          <Link href="/" className="brand-logo">ERAS.</Link>
        </header>
        <div className="auth-prompt-container">
          <div className="auth-card">
            <h2>ÁREA DO CLIENTE</h2>
            <p>Faça login para acompanhar seus pedidos, consultar códigos de rastreio e gerenciar suas eras na Eras Label.</p>
            <button className="primary-button" onClick={() => window.location.href = "/api/oauth/callback"}>
              ENTRAR COM MANUS OAUTH <ArrowLeft size={16} />
            </button>
            <Link href="/" className="back-home-link">Voltar para a Loja</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="eras-site account-page">
      <header className="site-header">
        <Link href="/" className="brand-logo">ERAS.</Link>
        <div className="header-actions">
          <Link href="/" className="header-link">LOJA</Link>
          <button className="icon-button" onClick={() => logout()} title="Terminar sessão">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="account-main">
        <div className="account-container">
          <div className="account-welcome">
            <div className="user-avatar-badge">
              <UserIcon size={24} />
            </div>
            <div>
              <h1>Olá, {user.name || "Colecionador"}</h1>
              <p>{user.email}</p>
            </div>
          </div>

          <section className="orders-section">
            <div className="section-title-row">
              <h2>MEUS PEDIDOS</h2>
              <span className="orders-count">{orders?.length ?? 0} pedidos realizados</span>
            </div>

            {isLoading ? (
              <div className="account-loading">A carregar pedidos...</div>
            ) : !orders || orders.length === 0 ? (
              <div className="empty-orders">
                <Package size={40} />
                <p>Você ainda não concluiu nenhum pedido.</p>
                <Link href="/" className="primary-button">EXPLORAR COLEÇÃO</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                    <div className="order-header">
                      <div>
                        <span className="order-num">{order.orderNumber}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                        {order.status === "Enviado" && <Truck size={14} />}
                        {order.status === "Entregue" && <CheckCircle2 size={14} />}
                        {order.status === "Processando" && <Clock size={14} />}
                        {order.status}
                      </span>
                    </div>

                    <div className="order-preview-items">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="preview-item">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <p>{item.name}</p>
                            <span>Tam: {item.size} · Qtd: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total-info">
                        <span>Total ({order.paymentMethod === "pix" ? "Pix" : "Cartão"})</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                      <button className="details-button">
                        VER DETALHES E RASTREIO <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedOrder && (
        <div className="overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <span className="section-kicker">DETALHES DO PEDIDO</span>
                <h2>{selectedOrder.orderNumber}</h2>
              </div>
              <button className="close-button" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-scrollable-content">
              <div className="tracking-box">
                <div className="tracking-title">
                  <Truck size={18} />
                  <span>Status de Entrega: <strong>{selectedOrder.status}</strong></span>
                </div>
                {selectedOrder.trackingCode ? (
                  <div className="tracking-details">
                    <span>Código de Rastreio: <strong>{selectedOrder.trackingCode}</strong></span>
                    <span className="carrier-tag">{selectedOrder.shippingService}</span>
                  </div>
                ) : (
                  <p className="tracking-note">O código de rastreio será gerado assim que o pacote for despachado pelo ateliê.</p>
                )}
              </div>

              <div className="modal-items-list">
                <h3>Itens do Pedido</h3>
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="modal-item-row">
                    <img src={item.image} alt={item.name} />
                    <div className="modal-item-info">
                      <p>{item.name}</p>
                      <span>Tamanho {item.size} · {item.quantity}x {formatPrice(item.price)}</span>
                    </div>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="shipping-address-summary">
                <h3>Endereço de Entrega</h3>
                <p>{selectedOrder.address.street}, {selectedOrder.address.number} {selectedOrder.address.complement ? `(${selectedOrder.address.complement})` : ""}</p>
                <p>{selectedOrder.address.neighborhood} — {selectedOrder.address.city}/{selectedOrder.address.state} · CEP: {selectedOrder.address.cep}</p>
              </div>

              <div className="modal-financial-summary">
                <div><span>Subtotal</span><strong>{formatPrice(selectedOrder.subtotal)}</strong></div>
                {selectedOrder.discount > 0 && <div><span>Desconto</span><strong>-{formatPrice(selectedOrder.discount)}</strong></div>}
                <div><span>Frete ({selectedOrder.shippingService})</span><strong>{selectedOrder.shippingCost === 0 ? "GRÁTIS" : formatPrice(selectedOrder.shippingCost)}</strong></div>
                <div className="summary-total">
                  <span>Total Pago</span>
                  <strong>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
