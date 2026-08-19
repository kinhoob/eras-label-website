import React, { useState, useMemo } from "react";
import { Check, Copy, Edit3, Eye, EyeOff, Plus, Search, Tag, Trash2, X, Save, ShieldCheck, History, Percent, DollarSign, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type CouponForm = {
  id?: number;
  code: string;
  discountType: "percent" | "fixed" | "free_shipping";
  discountPercent: number;
  fixedAmount: number;
  usageLimit: number | null;
  minPurchase: number;
  validUntil: string;
  active: number;
  applyScope: "all" | "categories" | "products";
  customerLimit: "unlimited" | "first_purchase";
  allowStacking: number;
};

const emptyCoupon: CouponForm = {
  code: "",
  discountType: "percent",
  discountPercent: 10,
  fixedAmount: 20,
  usageLimit: null,
  minPurchase: 0,
  validUntil: "",
  active: 1,
  applyScope: "all",
  customerLimit: "unlimited",
  allowStacking: 0,
};

/**
 * Componente AdminCouponsSection: Gestão profissional de cupons e descontos da Eras Label,
 * com abas e blocos dedicados para tipo de desconto, aplicação, limites de uso, status e histórico.
 */
export function AdminCouponsSection() {
  const utils = trpc.useUtils();
  const couponsQuery = trpc.coupons.adminList.useQuery();

  const saveMutation = trpc.coupons.save.useMutation({
    onSuccess: async () => {
      toast.success("Cupom guardado com sucesso.");
      setEditing(null);
      await utils.coupons.adminList.invalidate();
    },
    onError: (error) => toast.error(error.message || "Não foi possível guardar o cupom."),
  });

  const toggleMutation = trpc.coupons.toggle.useMutation({
    onSuccess: async () => {
      await utils.coupons.adminList.invalidate();
      toast.success("Estado do cupom atualizado.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar o cupom."),
  });

  const removeMutation = trpc.coupons.remove.useMutation({
    onSuccess: async () => {
      await utils.coupons.adminList.invalidate();
      toast.success("Cupom removido.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível remover o cupom."),
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<CouponForm | null>(null);

  const coupons = couponsQuery.data ?? [];

  const filtered = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesQuery = coupon.code.toLowerCase().includes(query.trim().toLowerCase());
      if (statusFilter === "active" && coupon.active !== 1) return false;
      if (statusFilter === "inactive" && coupon.active === 1) return false;
      return matchesQuery;
    });
  }, [coupons, query, statusFilter]);

  const startEdit = (coupon?: typeof coupons[number]) =>
    setEditing(
      coupon
        ? {
            id: coupon.id,
            code: coupon.code,
            discountType: (coupon as any).discountType || "percent",
            discountPercent: Number(coupon.discountPercent || 10),
            fixedAmount: Number((coupon as any).fixedAmount || 20),
            usageLimit: coupon.usageLimit,
            minPurchase: Number(coupon.minPurchase ?? 0),
            validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
            active: coupon.active,
            applyScope: (coupon as any).applyScope || "all",
            customerLimit: (coupon as any).customerLimit || "unlimited",
            allowStacking: Number((coupon as any).allowStacking || 0),
          }
        : { ...emptyCoupon }
    );

  const update = (key: keyof CouponForm, value: any) =>
    setEditing((current) => (current ? { ...current, [key]: value } : current));

  const save = () => {
    if (!editing) return;
    saveMutation.mutate({
      ...editing,
      code: editing.code.toUpperCase(),
      validUntil: editing.validUntil ? new Date(editing.validUntil).toISOString() : null,
    });
  };

  return (
    <section className="admin-content admin-editorial-page admin-coupons-page">
      <div className="admin-editorial-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="section-kicker">GESTÃO DE VENDAS · DESCONTOS</span>
          <h2 className="content-title">Cupons e Promoções</h2>
          <p className="content-subtitle">Crie códigos com regras avançadas de frete grátis, descontos progressivos e limites por cliente.</p>
        </div>
        <Button 
          onClick={() => startEdit()} 
          style={{ background: "#b22222", color: "#fff", height: "42px", padding: "0 1.35rem", borderRadius: "8px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Criar Cupom
        </Button>
      </div>

      <div 
        className="content-toolbar admin-editorial-toolbar" 
        style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "1rem", 
          alignItems: "center", 
          justifyContent: "space-between", 
          background: "#fff", 
          padding: "1rem 1.25rem", 
          borderRadius: "10px", 
          border: "1px solid #eae5de", 
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", flex: "1 1 300px", gap: "0.75rem", alignItems: "center" }}>
          <div className="search-box" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", color: "#888" }} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar cupom por código..."
              style={{ paddingLeft: "2.25rem", height: "40px", borderColor: "#dcd6ce", borderRadius: "8px" }}
            />
          </div>
          <select
            className="inventory-category-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ height: "40px", padding: "0 0.75rem", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff", fontSize: "0.85rem" }}
          >
            <option value="all">Todos os estados</option>
            <option value="active">Apenas ativos</option>
            <option value="inactive">Apenas inativos</option>
          </select>
        </div>
      </div>

      {couponsQuery.isLoading ? (
        <div className="admin-panel admin-empty-state" style={{ padding: "3rem", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px solid #eae5de" }}>
          <span className="admin-loading-mark" /> A carregar cupons...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-panel admin-empty-state" style={{ padding: "3.5rem 1.5rem", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px solid #eae5de" }}>
          <Tag size={32} style={{ color: "#b22222", margin: "0 auto 1rem" }} />
          <strong style={{ fontSize: "1rem", color: "#111", display: "block", marginBottom: "0.25rem" }}>
            {query || statusFilter !== "all" ? "Nenhum cupom corresponde à pesquisa" : "Ainda não existem cupons cadastrados"}
          </strong>
          <span style={{ fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "1.25rem" }}>
            {query || statusFilter !== "all" ? "Tente alterar os termos da busca ou os filtros de estado." : "Crie o primeiro cupom de desconto para impulsionar suas vendas."}
          </span>
          {query || statusFilter !== "all" ? (
            <Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Limpar filtros</Button>
          ) : (
            <Button onClick={() => startEdit()} style={{ background: "#b22222", color: "#fff" }}>Criar primeiro cupom</Button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {filtered.map((coupon) => (
            <div 
              key={coupon.id} 
              style={{ 
                background: "#fff", 
                borderRadius: "12px", 
                border: "1px solid #eae5de", 
                padding: "1.25rem", 
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "#111", background: "#faf5f5", padding: "0.2rem 0.5rem", borderRadius: "6px", border: "1px solid #f2d6d6" }}>
                      {coupon.code}
                    </span>
                    <button
                      type="button"
                      aria-label="Copiar código"
                      title="Copiar código"
                      onClick={() => {
                        void navigator.clipboard?.writeText(coupon.code);
                        toast.success(`Código ${coupon.code} copiado!`);
                      }}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666", padding: "0.2rem" }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <span className={`status-pill ${coupon.active ? "success" : "warning"}`} style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.725rem", fontWeight: 600 }}>
                    {coupon.active ? "Ativo" : "Desativado"}
                  </span>
                </div>

                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#b22222", marginBottom: "0.75rem" }}>
                  {((coupon as any).discountType === "fixed")
                    ? Number((coupon as any).fixedAmount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + " OFF"
                    : ((coupon as any).discountType === "free_shipping")
                    ? "Frete Grátis"
                    : Number(coupon.discountPercent).toLocaleString("pt-BR") + "% OFF"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.825rem", color: "#555", marginBottom: "1.25rem" }}>
                  <div>Escopo: <strong>{((coupon as any).applyScope === "categories") ? "Categorias específicas" : ((coupon as any).applyScope === "products") ? "Produtos específicos" : "Toda a loja"}</strong></div>
                  <div>Compra mínima: <strong>{Number(coupon.minPurchase ?? 0) > 0 ? Number(coupon.minPurchase).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem mínimo"}</strong></div>
                  <div>Utilizações: <strong>{coupon.timesUsed ?? 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "(ilimitado)"}</strong></div>
                  <div>Validade: <strong>{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString("pt-BR") : "Indeterminada"}</strong></div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid #f2eee9", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <Button
                  variant="outline"
                  size="sm"
                  title={coupon.active ? "Desativar cupom" : "Ativar cupom"}
                  onClick={() => toggleMutation.mutate({ id: coupon.id, active: coupon.active ? 0 : 1 })}
                  style={{ height: "32px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  {coupon.active ? <EyeOff size={13} /> : <Eye size={13} />} {coupon.active ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title="Editar cupom"
                  onClick={() => startEdit(coupon)}
                  style={{ height: "32px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Edit3 size={13} /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title="Excluir cupom"
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"?`)) {
                      removeMutation.mutate({ id: coupon.id });
                    }
                  }}
                  style={{ height: "32px", fontSize: "0.8rem", color: "#b22222", borderColor: "#f5c6c6", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Trash2 size={13} /> Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor de Oferta Completo (Estilo Nuvemshop com identidade Eras) */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(20, 18, 16, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fffdfa", borderRadius: "16px", border: "1px solid #dcd6ce", width: "100%", maxWidth: "780px", maxHeight: "90vh", boxShadow: "0 24px 64px rgba(20, 18, 16, 0.25)", overflow: "hidden", display: "flex", flexDirection: "column", animation: "modalAppear 0.25s cubic-bezier(0.23, 1, 0.32, 1)" }}>
            
            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.75rem", borderBottom: "1px solid #eae5de", background: "#fbf9f6" }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: "#b22222", textTransform: "uppercase" }}>Editor de Oferta Avançado</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1a1816", fontFamily: "Georgia, serif", margin: "0.1rem 0 0" }}>{editing.id ? `Editar: ${editing.code}` : "Criar Novo Cupom"}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setEditing(null)} 
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666", padding: "0.4rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Layout de colunas estilo Nuvemshop */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", overflowY: "auto", flex: 1, background: "#faf8f5" }}>
              
              {/* Coluna Esquerda: Configurações principais */}
              <div style={{ padding: "1.75rem", display: "grid", gap: "1.25rem", background: "#fffdfa", borderRight: "1px solid #eae5de" }}>
                
                {/* Código do Cupom */}
                <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.825rem", fontWeight: 600, color: "#4a443e" }}>
                  <span>Código do Cupom</span>
                  <Input 
                    value={editing.code} 
                    onChange={(event) => update("code", event.target.value.toUpperCase())} 
                    placeholder="Ex: ERAS10 ou 100FRETE" 
                    style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff", fontFamily: "monospace", fontWeight: 700, fontSize: "1rem" }}
                  />
                  <small style={{ fontWeight: 400, color: "#777", fontSize: "0.75rem" }}>Este é o código que o seu cliente deverá inserir no momento da compra.</small>
                </label>

                {/* Tipo de Desconto */}
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#4a443e" }}>Tipo de Desconto</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                    {[
                      { id: "percent", label: "Porcentagem", icon: Percent },
                      { id: "fixed", label: "Valor Fixo", icon: DollarSign },
                      { id: "free_shipping", label: "Frete Grátis", icon: Truck },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("discountType", id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                          padding: "0.6rem 0.5rem",
                          borderRadius: "8px",
                          border: editing.discountType === id ? "2px solid #b22222" : "1px solid #dcd6ce",
                          background: editing.discountType === id ? "#faf5f5" : "#fff",
                          color: editing.discountType === id ? "#b22222" : "#444",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                  </div>

                  {editing.discountType === "percent" && (
                    <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e", marginTop: "0.5rem" }}>
                      <span>Desconto (%)</span>
                      <Input 
                        type="number" 
                        min="0.01" 
                        max="100" 
                        step="0.01" 
                        value={editing.discountPercent} 
                        onChange={(event) => update("discountPercent", Number(event.target.value))} 
                        style={{ height: "40px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                      />
                    </label>
                  )}

                  {editing.discountType === "fixed" && (
                    <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e", marginTop: "0.5rem" }}>
                      <span>Valor do Desconto (R$)</span>
                      <Input 
                        type="number" 
                        min="1" 
                        step="0.01" 
                        value={editing.fixedAmount} 
                        onChange={(event) => update("fixedAmount", Number(event.target.value))} 
                        style={{ height: "40px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                      />
                    </label>
                  )}
                </div>

                {/* Aplicar a */}
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#4a443e" }}>Aplicar a</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[
                      { id: "all", label: "Toda a loja" },
                      { id: "categories", label: "Categorias" },
                      { id: "products", label: "Produtos" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("applyScope", id)}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          borderRadius: "8px",
                          border: editing.applyScope === id ? "2px solid #b22222" : "1px solid #dcd6ce",
                          background: editing.applyScope === id ? "#faf5f5" : "#fff",
                          color: editing.applyScope === id ? "#b22222" : "#444",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limites e Condições */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                    <span>Compra Mínima (R$)</span>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={editing.minPurchase} 
                      onChange={(event) => update("minPurchase", Number(event.target.value))} 
                      style={{ height: "40px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                    <span>Limite de Usos Totais</span>
                    <Input 
                      type="number" 
                      min="1" 
                      value={editing.usageLimit ?? ""} 
                      onChange={(event) => update("usageLimit", event.target.value ? Number(event.target.value) : null)} 
                      placeholder="Ilimitado" 
                      style={{ height: "40px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                    <span>Validade Limite</span>
                    <Input 
                      type="datetime-local" 
                      value={editing.validUntil} 
                      onChange={(event) => update("validUntil", event.target.value)} 
                      style={{ height: "40px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                    />
                  </label>
                  <div style={{ display: "grid", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>Acúmulo de Ofertas</span>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#444", marginTop: "0.5rem", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={editing.allowStacking === 1} 
                        onChange={(event) => update("allowStacking", event.target.checked ? 1 : 0)} 
                        style={{ accentColor: "#b22222", width: "16px", height: "16px" }}
                      />
                      <span>Permitir acumular com promoções</span>
                    </label>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", background: "#faf5f5", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #f2d6d6" }}>
                  <input 
                    type="checkbox" 
                    checked={editing.active === 1} 
                    onChange={(event) => update("active", event.target.checked ? 1 : 0)} 
                    style={{ width: "18px", height: "18px", accentColor: "#b22222", cursor: "pointer" }} 
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#b22222" }}>Ativar cupom imediatamente após guardar</span>
                </label>

              </div>

              {/* Coluna Direita: Histórico e Status estilo Nuvemshop */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", background: "#fbf9f6" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>
                    <History size={15} color="#b22222" /> Histórico do Cupom
                  </div>
                  <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.775rem", color: "#555" }}>
                    <div style={{ background: "#fff", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #eae5de" }}>
                      <strong style={{ color: "#222", display: "block" }}>Cupom criado</strong>
                      <span style={{ color: "#777" }}>Por Administrador · Hoje</span>
                    </div>
                    {editing.id && (
                      <div style={{ background: "#fff", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #eae5de" }}>
                        <strong style={{ color: "#222", display: "block" }}>Última atualização</strong>
                        <span style={{ color: "#777" }}>Status: {editing.active ? "Ativo" : "Desativado"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: "#fff", padding: "1rem", borderRadius: "10px", border: "1px solid #eae5de", marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: "#b22222", marginBottom: "0.3rem" }}>
                    <ShieldCheck size={15} /> Padrão Eras Label
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4, margin: 0 }}>
                    Os cupons são validados em tempo real no checkout transparente do Mercado Pago, respeitando regras de frete e valor mínimo.
                  </p>
                </div>
              </div>

            </div>

            {/* Rodapé do modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.75rem", borderTop: "1px solid #eae5de", background: "#fbf9f6", gap: "1rem" }}>
              <span style={{ fontSize: "0.725rem", color: "#777", lineHeight: 1.4 }}>Regras oficiais de desconto.</span>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button variant="outline" onClick={() => setEditing(null)} style={{ height: "40px", borderRadius: "8px" }}>Cancelar</Button>
                <Button 
                  disabled={saveMutation.isPending || !editing.code.trim()} 
                  onClick={save}
                  style={{ background: "#b22222", color: "#fff", height: "40px", borderRadius: "8px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar cupom"}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
