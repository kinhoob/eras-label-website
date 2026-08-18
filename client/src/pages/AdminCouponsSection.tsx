import { useState, useMemo } from "react";
import { Check, Copy, Edit3, Eye, EyeOff, Plus, Search, Tag, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type CouponForm = {
  id?: number;
  code: string;
  discountPercent: number;
  usageLimit: number | null;
  minPurchase: number;
  validUntil: string;
  active: number;
};

const emptyCoupon: CouponForm = {
  code: "",
  discountPercent: 10,
  usageLimit: null,
  minPurchase: 0,
  validUntil: "",
  active: 1,
};

/**
 * Componente AdminCouponsSection: Gerenciamento limpo e unificado de cupons de desconto
 * da Eras Label, com barra de pesquisa superior, botão de criação único e modal editor refinado.
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

  // Filtra cupons com base na pesquisa por código e estado
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
            discountPercent: Number(coupon.discountPercent),
            usageLimit: coupon.usageLimit,
            minPurchase: Number(coupon.minPurchase ?? 0),
            validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
            active: coupon.active,
          }
        : { ...emptyCoupon }
    );

  const update = (key: keyof CouponForm, value: string | number | null) =>
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
      {/* Cabeçalho unificado com título e botão de ação principal */}
      <div className="admin-editorial-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="section-kicker">GESTÃO DE VENDAS · CUPONS</span>
          <h2 className="content-title">Cupons de Desconto</h2>
          <p className="content-subtitle">Crie códigos promocionais, defina regras e acompanhe a utilização em tempo real.</p>
        </div>
        <Button 
          onClick={() => startEdit()} 
          style={{ background: "#b22222", color: "#fff", height: "42px", padding: "0 1.35rem", borderRadius: "8px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Criar Cupom
        </Button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
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
            style={{ padding: "0.5rem 0.75rem", height: "40px", borderRadius: "8px", border: "1px solid #dcd6ce", background: "#fff", fontSize: "0.85rem", color: "#333" }}
          >
            <option value="all">Todos os estados</option>
            <option value="active">Apenas ativos</option>
            <option value="inactive">Apenas inativos</option>
          </select>
        </div>
      </div>

      {/* Listagem de cupons em Cards */}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
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

                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#b22222", marginBottom: "0.75rem" }}>
                  {Number(coupon.discountPercent).toLocaleString("pt-BR")}% OFF
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.85rem", color: "#555", marginBottom: "1.25rem" }}>
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

      {/* Modal de Criação / Edição (Editor de Oferta) redesenhado na estética Eras */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(20, 18, 16, 0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fffdfa", borderRadius: "16px", border: "1px solid #dcd6ce", width: "100%", maxWidth: "520px", boxShadow: "0 24px 64px rgba(20, 18, 16, 0.25)", overflow: "hidden", animation: "modalAppear 0.25s cubic-bezier(0.23, 1, 0.32, 1)" }}>
            
            {/* Cabeçalho do modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #eae5de", background: "#fbf9f6" }}>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: "#b22222", textTransform: "uppercase" }}>Editor de Oferta</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#1a1816", fontFamily: "Georgia, serif", margin: "0.1rem 0 0" }}>{editing.id ? "Editar Cupom" : "Novo Cupom Promocional"}</h3>
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

            {/* Corpo do formulário */}
            <div style={{ padding: "1.5rem", display: "grid", gap: "1.1rem", maxHeight: "75vh", overflowY: "auto" }}>
              <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                <span>Código do Cupom</span>
                <Input 
                  value={editing.code} 
                  onChange={(event) => update("code", event.target.value.toUpperCase())} 
                  placeholder="Ex: ERAS10" 
                  style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                  <span>Desconto (%)</span>
                  <Input 
                    type="number" 
                    min="0.01" 
                    max="100" 
                    step="0.01" 
                    value={editing.discountPercent} 
                    onChange={(event) => update("discountPercent", Number(event.target.value))} 
                    style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                  <span>Limite de Usos</span>
                  <Input 
                    type="number" 
                    min="1" 
                    value={editing.usageLimit ?? ""} 
                    onChange={(event) => update("usageLimit", event.target.value ? Number(event.target.value) : null)} 
                    placeholder="Ilimitado" 
                    style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                  <span>Valor Mínimo (R$)</span>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={editing.minPurchase} 
                    onChange={(event) => update("minPurchase", Number(event.target.value))} 
                    style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600, color: "#4a443e" }}>
                  <span>Validade Limite</span>
                  <Input 
                    type="datetime-local" 
                    value={editing.validUntil} 
                    onChange={(event) => update("validUntil", event.target.value)} 
                    style={{ height: "42px", borderRadius: "8px", borderColor: "#dcd6ce", background: "#fff" }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", cursor: "pointer", background: "#fbf9f6", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #eae5de" }}>
                <input 
                  type="checkbox" 
                  checked={editing.active === 1} 
                  onChange={(event) => update("active", event.target.checked ? 1 : 0)} 
                  style={{ width: "18px", height: "18px", accentColor: "#b22222", cursor: "pointer" }} 
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#2c2622" }}>Ativar cupom imediatamente após guardar</span>
              </label>
            </div>

            {/* Rodapé do modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderTop: "1px solid #eae5de", background: "#fbf9f6", gap: "1rem" }}>
              <span style={{ fontSize: "0.725rem", color: "#777", lineHeight: 1.4 }}>Regras oficiais da Eras Label.</span>
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
