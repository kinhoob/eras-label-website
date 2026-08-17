import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, ExternalLink, ShieldCheck, User as UserIcon, LogOut, Check, X, Box, Copy, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";

/* Função utilitária para formatar valores monetários em Reais (BRL) */
function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Account() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isOrdersPage = location === "/orders";
  // Busca os pedidos do utilizador autenticado no backend tRPC.
  const { data: orders, isLoading, isFetching, refetch } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: !!user,
  });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Função para copiar o código de rastreio para a área de transferência com feedback visual temporário
  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Se o usuário não estiver autenticado, exibe tela de prompt de login
  if (!user) {
    return (
      <div className="public-page-shell eras-site auth-required-page min-h-screen flex flex-col">
        <PageTransitionHandler />
        <main className="public-page-content flex-1 pt-32 pb-16 md:pt-40 md:pb-24">
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
        </main>
        <OfficialFooter />
      </div>
    );
  }

  return (
    <div className="public-page-shell eras-site account-page min-h-screen flex flex-col">
      <PageTransitionHandler />
      <main className="public-page-content account-main flex-1 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="account-container">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#8c8378]"><Link href="/" className="hover:text-[#b22222]">Loja</Link>{!isOrdersPage && <><span>/</span><Link href="/orders" className="hover:text-[#b22222]">Pedidos</Link></>}</div>
            <button className="text-xs uppercase tracking-[0.18em] text-[#8c8378] hover:text-[#b22222] inline-flex items-center gap-2" onClick={() => logout()} title="Terminar sessão"><LogOut size={15} /> Sair</button>
          </div>
          {/* Cartão de boas-vindas do colecionador */}
          <div className="account-welcome">
            <div className="user-avatar-badge">
              <UserIcon size={24} />
            </div>
            <div>
              <h1>{isOrdersPage ? "O seu histórico." : `Olá, ${user.name || "Colecionador"}`}</h1>
              <p>{isOrdersPage ? "Acompanhe pagamentos, preparação e entrega das suas compras." : user.email}</p>
            </div>
          </div>

          <section className="orders-section">
            <div className="section-title-row">
              <div>
                <h2>{isOrdersPage ? "HISTÓRICO DE PEDIDOS" : "MEUS PEDIDOS"}</h2>
                <span className="orders-count">{orders?.length ?? 0} pedidos realizados</span>
              </div>
              <button className="orders-refresh-button" type="button" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw size={14} className={isFetching ? "spinner-icon" : ""} /> ATUALIZAR
              </button>
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
                      <div className="order-status-stack">
                        <span className={`order-status-badge ${String(order.status).toLowerCase()}`}>
                          {order.status === "Enviado" && <Truck size={14} />}
                          {order.status === "Entregue" && <CheckCircle2 size={14} />}
                          {order.status === "Processando" && <Clock size={14} />}
                          {order.status}
                        </span>
                        <span className={`order-payment-badge ${order.paymentStatus === "approved" ? "approved" : order.paymentStatus === "failed" || order.paymentStatus === "rejected" ? "failed" : "pending"}`}>
                          <ShieldCheck size={12} /> {order.paymentStatus === "approved" ? "Pagamento confirmado" : order.paymentStatus === "failed" || order.paymentStatus === "rejected" ? "Pagamento recusado" : "Pagamento pendente"}
                        </span>
                      </div>
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
      <OfficialFooter />

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

              <div className={`order-payment-detail ${selectedOrder.paymentStatus === "approved" ? "approved" : selectedOrder.paymentStatus === "failed" || selectedOrder.paymentStatus === "rejected" ? "failed" : "pending"}`}>
                <ShieldCheck size={17} />
                <div><strong>{selectedOrder.paymentStatus === "approved" ? "Pagamento confirmado" : selectedOrder.paymentStatus === "failed" || selectedOrder.paymentStatus === "rejected" ? "Pagamento recusado" : "Pagamento pendente"}</strong><span>Via {selectedOrder.paymentMethod === "credit_card" ? "cartão de crédito" : "Pix"}</span></div>
              </div>

              {/* Informações de Rastreio */}
              {selectedOrder.trackingCode ? (
                <div className="tracking-box">
                  <div className="tracking-title" style={{ display: "flex", alignItems: "center", justifyContent: "between", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Truck size={16} />
                      <strong>Código de Rastreio: {selectedOrder.trackingCode}</strong>
                    </div>
                    <button 
                      className="copy-tracking-btn"
                      onClick={() => handleCopyTracking(selectedOrder.trackingCode)}
                      title="Copiar código de rastreio"
                    >
                      {copiedTracking ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
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
