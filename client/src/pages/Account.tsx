import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, ExternalLink, ShieldCheck, User as UserIcon, LogOut, Check, X, Box } from "lucide-react";
import { Link } from "wouter";

/* Função utilitária para formatar valores monetários em Reais (BRL) */
function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Account() {
  const { user, logout } = useAuth();
  // Busca os pedidos do usuário autenticado no backend tRPC
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: !!user,
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Se o usuário não estiver autenticado, exibe tela de prompt de login
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
          {/* Cartão de boas-vindas do colecionador */}
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
                            <span>Tam: {item.size} · {item.quantity}x</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total-info">
                        <span>Total do Pedido</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                      <button className="details-button">
                        VER DETALHES & RASTREIO <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal de Detalhes do Pedido com Linha do Tempo de Entrega Animada */}
      {selectedOrder && (
        <div className="cart-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="cart-drawer order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>DETALHES DO PEDIDO {selectedOrder.orderNumber}</h2>
              <button className="icon-button" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-body" style={{ overflowY: "auto", padding: "1.5rem" }}>
              
              {/* BARRA DE PROGRESSO VISUAL E ANIMADA DA ENTREGA */}
              <div className="delivery-timeline-container">
                <h3>STATUS DA ENTREGA</h3>
                {(() => {
                  // Mapeia o status atual para o índice da etapa (0: Processando, 1: Enviado, 2: Entregue)
                  const statusMap: Record<string, number> = {
                    "Processando": 0,
                    "Enviado": 1,
                    "Entregue": 2,
                  };
                  const currentIndex = statusMap[selectedOrder.status] ?? 0;

                  const steps = [
                    { label: "Preparando", desc: "Separação no Ateliê" },
                    { label: "Enviado", desc: "Em Trânsito" },
                    { label: "Entregue", desc: "Concluído" },
                  ];

                  return (
                    <div className="delivery-progress-wrapper">
                      <div className="delivery-progress-bar-bg">
                        <div 
                          className="delivery-progress-bar-fill" 
                          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                        />
                      </div>
                      <div className="delivery-steps-grid">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentIndex;
                          const isCurrent = idx === currentIndex;
                          return (
                            <div key={idx} className={`delivery-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                              <div className="step-bullet">
                                {isCompleted ? <Check size={12} /> : idx + 1}
                              </div>
                              <span className="step-label">{step.label}</span>
                              <span className="step-desc">{step.desc}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Informações de Rastreio */}
              {selectedOrder.trackingCode ? (
                <div className="tracking-box">
                  <div className="tracking-title">
                    <Truck size={16} />
                    <strong>Código de Rastreio: {selectedOrder.trackingCode}</strong>
                  </div>
                  <div className="tracking-details">
                    <span>Transportadora: {selectedOrder.carrier || "Correios / Logística"}</span>
                    <a 
                      href={`https://www.linkcorreios.com.br/?id=${selectedOrder.trackingCode}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      RASTREAR NO SITE <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="tracking-box">
                  <p className="tracking-note">O código de rastreio será disponibilizado assim que o pedido for despachado pelo ateliê.</p>
                </div>
              )}

              {/* Lista de itens do pedido */}
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

              {/* Endereço de Entrega */}
              <div className="shipping-address-summary">
                <h3>Endereço de Entrega</h3>
                <p>{selectedOrder.address.street}, {selectedOrder.address.number} {selectedOrder.address.complement ? `(${selectedOrder.address.complement})` : ""}</p>
                <p>{selectedOrder.address.neighborhood} — {selectedOrder.address.city}/{selectedOrder.address.state} · CEP: {selectedOrder.address.cep}</p>
              </div>

              {/* Sumário financeiro */}
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
