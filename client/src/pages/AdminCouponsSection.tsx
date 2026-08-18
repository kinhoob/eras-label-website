import { useState, useMemo } from "react";
import { Check, Copy, Edit3, Eye, EyeOff, Filter, Percent, Plus, Save, Search, SlidersHorizontal, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type CouponForm = { id?: number; code: string; discountPercent: number; usageLimit: number | null; minPurchase: number; validUntil: string; active: number };
const emptyCoupon: CouponForm = { code: "", discountPercent: 10, usageLimit: null, minPurchase: 0, validUntil: "", active: 1 };

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

  const activeCount = coupons.filter((coupon) => coupon.active === 1).length;
  const totalUses = coupons.reduce((sum, coupon) => sum + Number(coupon.timesUsed ?? 0), 0);

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
      {/* Cabeçalho */}
      <div className="admin-editorial-hero">
        <div>
          <span className="section-kicker">CRESCIMENTO · OFERTAS</span>
          <h2 className="content-title">Cupons</h2>
          <p className="content-subtitle">Crie incentivos com regras claras, acompanhe utilizações e mantenha cada oferta sob controlo.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Button variant="outline" onClick={() => toast.success("Mais sobre promoções e descontos na Eras Label.")}>
            <Percent size={15} /> Conhecer mais descontos
          </Button>
          <Button className="admin-primary-action" onClick={() => startEdit()}>
            <Plus size={16} /> Criar cupom
          </Button>
        </div>
      </div>

      {/* Métricas e Filtros rápidos */}
      <div className="admin-editorial-metrics">
        <div className="admin-editorial-metric">
          <Tag size={18} />
          <span>Cupons ativos</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="admin-editorial-metric">
          <Percent size={18} />
          <span>Utilizações totais</span>
          <strong>{totalUses}</strong>
        </div>
        <div className="admin-editorial-metric">
          <Check size={18} />
          <span>Taxa monitorizada</span>
          <strong>{coupons.length ? "100%" : "—"}</strong>
        </div>
      </div>

      {/* Barra de Ferramentas / Busca / Filtro Nuvemshop */}
      <div className="content-toolbar admin-editorial-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", background: "#fff", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #eae5de", marginBottom: "1.25rem" }}>
        <div className="search-box" style={{ flex: "1 1 280px", maxWidth: "420px" }}>
          <Search size={15} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por código..." />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select
            className="inventory-category-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #dcd6ce", background: "#fff", fontSize: "0.85rem", color: "#333" }}
          >
            <option value="all">Todos os estados</option>
            <option value="active">Apenas ativos</option>
            <option value="inactive">Apenas inativos</option>
          </select>
          <span className="inventory-count" style={{ fontSize: "0.85rem", color: "#666", fontWeight: 500 }}>
            {filtered.length} {filtered.length === 1 ? "cupom" : "cupons"}
          </span>
        </div>
      </div>

      {/* Tabela Nuvemshop-like */}
      {couponsQuery.isLoading ? (
        <div className="admin-panel admin-empty-state">
          <span className="admin-loading-mark" /> A carregar cupons persistidos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-panel admin-empty-state" style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#fff", borderRadius: "10px", border: "1px solid #eae5de" }}>
          <Tag size={32} style={{ color: "#b22222", margin: "0 auto 1rem" }} />
          <strong style={{ fontSize: "1rem", color: "#111", display: "block", marginBottom: "0.25rem" }}>
            {query || statusFilter !== "all" ? "Nenhum cupom corresponde à pesquisa" : "Ainda não existem cupons cadastrados"}
          </strong>
          <span style={{ fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "1.25rem" }}>
            {query || statusFilter !== "all" ? "Tente alterar os termos da busca ou os filtros de estado." : "Crie o primeiro cupom de desconto para os seus clientes."}
          </span>
          {query || statusFilter !== "all" ? (
            <Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Limpar filtros</Button>
          ) : (
            <Button variant="outline" onClick={() => startEdit()}>Criar primeiro cupom</Button>
          )}
        </div>
      ) : (
        <div className="admin-panel table-panel inventory-table-panel" style={{ background: "#fff", borderRadius: "10px", border: "1px solid #eae5de", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eae5de", background: "#faf9f6", color: "#555", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Código</th>
                <th style={{ padding: "0.85rem 1rem" }}>Desconto</th>
                <th style={{ padding: "0.85rem 1rem" }}>Compra Mínima</th>
                <th style={{ padding: "0.85rem 1rem" }}>Vigência</th>
                <th style={{ padding: "0.85rem 1rem" }}>Usos</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon.id} style={{ borderBottom: "1px solid #f2eee9", transition: "background 0.15s" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <strong style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "#111" }}>{coupon.code}</strong>
                      <button
                        type="button"
                        aria-label="Copiar código"
                        title="Copiar código"
                        onClick={() => {
                          void navigator.clipboard?.writeText(coupon.code);
                          toast.success(`Código ${coupon.code} copiado!`);
                        }}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666", padding: "0.15rem" }}
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "#b22222" }}>
                    {Number(coupon.discountPercent).toLocaleString("pt-BR")}% OFF
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#444" }}>
                    {Number(coupon.minPurchase ?? 0) > 0 ? Number(coupon.minPurchase).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Sem mínimo"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#666", fontSize: "0.825rem" }}>
                    {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString("pt-BR") : "Indeterminada"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#444" }}>
                    {coupon.timesUsed ?? 0} {coupon.usageLimit ? `/ ${coupon.usageLimit} usos` : "usos"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`status-pill ${coupon.active ? "success" : "warning"}`} style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {coupon.active ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                      <button
                        type="button"
                        className="table-more"
                        title={coupon.active ? "Desativar cupom" : "Ativar cupom"}
                        onClick={() => toggleMutation.mutate({ id: coupon.id, active: coupon.active ? 0 : 1 })}
                        style={{ background: "transparent", border: "1px solid #dcd6ce", borderRadius: "6px", width: "30px", height: "30px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}
                      >
                        {coupon.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        type="button"
                        className="table-more"
                        title="Editar cupom"
                        onClick={() => startEdit(coupon)}
                        style={{ background: "transparent", border: "1px solid #dcd6ce", borderRadius: "6px", width: "30px", height: "30px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="table-more"
                        title="Excluir cupom"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir o cupom "${coupon.code}"?`)) {
                            removeMutation.mutate({ id: coupon.id });
                          }
                        }}
                        style={{ background: "transparent", border: "1px solid #f5c6c6", borderRadius: "6px", width: "30px", height: "30px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#b22222" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "0.85rem 1rem", background: "#faf9f6", borderTop: "1px solid #eae5de", fontSize: "0.825rem", color: "#666" }}>
            Mostrando 1-{filtered.length} de {coupons.length} cupons guardados
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {editing && (
        <div className="admin-modal-overlay">
          <div className="admin-panel admin-modal admin-editorial-modal">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">EDITOR DE OFERTA</span>
                <h3>{editing.id ? "Editar cupom" : "Criar novo cupom"}</h3>
              </div>
              <button type="button" className="admin-modal-close" aria-label="Fechar" onClick={() => setEditing(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-editorial-form-grid">
              <label>
                Código do Cupom
                <Input value={editing.code} onChange={(event) => update("code", event.target.value.toUpperCase())} placeholder="Ex: ERAS10" />
              </label>
              <label>
                Desconto (%)
                <Input type="number" min="0.01" max="100" step="0.01" value={editing.discountPercent} onChange={(event) => update("discountPercent", Number(event.target.value))} />
              </label>
              <label>
                Limite de Usos (Opcional)
                <Input type="number" min="1" value={editing.usageLimit ?? ""} onChange={(event) => update("usageLimit", event.target.value ? Number(event.target.value) : null)} placeholder="Ex: 100 (vazio = ilimitado)" />
              </label>
              <label>
                Valor Mínimo da Compra (R$)
                <Input type="number" min="0" step="0.01" value={editing.minPurchase} onChange={(event) => update("minPurchase", Number(event.target.value))} />
              </label>
              <label>
                Validade / Data Limite
                <Input type="datetime-local" value={editing.validUntil} onChange={(event) => update("validUntil", event.target.value)} />
              </label>
              <label className="admin-toggle-field" style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                <input type="checkbox" checked={editing.active === 1} onChange={(event) => update("active", event.target.checked ? 1 : 0)} style={{ width: "18px", height: "18px", accentColor: "#b22222" }} />
                <span>Ativar cupom imediatamente após guardar</span>
              </label>
            </div>
            <div className="admin-editorial-modal-footer">
              <span className="admin-editorial-note">A validação do desconto utiliza as regras oficiais e o carrinho da Eras Label.</span>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button className="admin-primary-action" disabled={saveMutation.isPending || !editing.code.trim()} onClick={save}>
                <Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar cupom"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
