import { useState, useMemo } from "react";
import { Check, Copy, Edit3, Plus, Search, Tag, Trash2, X, Save, ShieldCheck, Percent, DollarSign, Truck, Gift, Layers, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type PromotionForm = {
  id?: number;
  name: string;
  discountType: "buy_x_get_y" | "price_discount" | "cross_selling" | "progressive" | "cart_discount";
  scopeType: "store" | "categories" | "products";
  scopeIds: string;
  allowPromotionalPrice: number;
  combinableWithPrice: number;
  combinableWithShipping: number;
  combinableWithCart: number;
  combinableWithApps: number;
  dateLimitType: "unlimited" | "period";
  startDate: string;
  endDate: string;
  customBadgeEnabled: number;
  customBadgeText: string;
  status: "active" | "inactive";
};

const emptyPromotion: PromotionForm = {
  name: "",
  discountType: "buy_x_get_y",
  scopeType: "store",
  scopeIds: "",
  allowPromotionalPrice: 0,
  combinableWithPrice: 0,
  combinableWithShipping: 0,
  combinableWithCart: 0,
  combinableWithApps: 0,
  dateLimitType: "unlimited",
  startDate: "",
  endDate: "",
  customBadgeEnabled: 0,
  customBadgeText: "",
  status: "active",
};

/**
 * Componente AdminPromotionsSection: Gestão profissional de promoções e descontos automáticos
 * da Eras Label, inspirado no padrão Nuvemshop com seletores de tipo, regras combináveis e etiquetas.
 */
export function AdminPromotionsSection() {
  const utils = trpc.useUtils();
  const promotionsQuery = trpc.promotions.list.useQuery();

  const saveMutation = trpc.promotions.save.useMutation({
    onSuccess: async () => {
      toast.success("Promoção guardada com sucesso.");
      setEditing(null);
      await utils.promotions.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Não foi possível guardar a promoção."),
  });

  const toggleMutation = trpc.promotions.toggle.useMutation({
    onSuccess: async () => {
      await utils.promotions.list.invalidate();
      toast.success("Estado da promoção atualizado.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar a promoção."),
  });

  const removeMutation = trpc.promotions.remove.useMutation({
    onSuccess: async () => {
      await utils.promotions.list.invalidate();
      toast.success("Promoção removida.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível remover a promoção."),
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<PromotionForm | null>(null);

  const promotions = promotionsQuery.data ?? [];

  const filtered = useMemo(() => {
    return promotions.filter((promo: any) => {
      const matchesQuery = promo.name.toLowerCase().includes(query.trim().toLowerCase());
      if (statusFilter === "active" && promo.status !== "active") return false;
      if (statusFilter === "inactive" && promo.status === "active") return false;
      return matchesQuery;
    });
  }, [promotions, query, statusFilter]);

  const startEdit = (promo?: typeof promotions[number]) =>
    setEditing(
      promo
        ? {
            id: promo.id,
            name: promo.name,
            discountType: (promo as any).discountType || "buy_x_get_y",
            scopeType: (promo as any).scopeType || "store",
            scopeIds: (promo as any).scopeIds || "",
            allowPromotionalPrice: Number((promo as any).allowPromotionalPrice || 0),
            combinableWithPrice: Number((promo as any).combinableWithPrice || 0),
            combinableWithShipping: Number((promo as any).combinableWithShipping || 0),
            combinableWithCart: Number((promo as any).combinableWithCart || 0),
            combinableWithApps: Number((promo as any).combinableWithApps || 0),
            dateLimitType: (promo as any).dateLimitType || "unlimited",
            startDate: (promo as any).startDate ? new Date((promo as any).startDate).toISOString().slice(0, 10) : "",
            endDate: (promo as any).endDate ? new Date((promo as any).endDate).toISOString().slice(0, 10) : "",
            customBadgeEnabled: Number((promo as any).customBadgeEnabled || 0),
            customBadgeText: (promo as any).customBadgeText || "",
            status: (promo as any).status || "active",
          }
        : { ...emptyPromotion }
    );

  const update = (key: keyof PromotionForm, value: any) =>
    setEditing((current) => (current ? { ...current, [key]: value } : current));

  const save = () => {
    if (!editing) return;
    saveMutation.mutate({
      ...editing,
      startDate: editing.startDate ? new Date(editing.startDate).toISOString() : null,
      endDate: editing.endDate ? new Date(editing.endDate).toISOString() : null,
    });
  };

  const getDiscountTypeName = (type: string) => {
    switch (type) {
      case "buy_x_get_y": return "Compre X e pague Y";
      case "price_discount": return "Desconto sobre preços";
      case "cross_selling": return "Cross selling";
      case "progressive": return "Desconto progressivo";
      case "cart_discount": return "Desconto no carrinho";
      default: return "Promoção";
    }
  };

  return (
    <section className="admin-content admin-editorial-page admin-promotions-page">
      <div className="admin-editorial-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="section-kicker">GESTÃO DE VENDAS · PROMOÇÕES</span>
          <h2 className="content-title">Promoções Automáticas</h2>
          <p className="section-subtitle">Crie campanhas automáticas como compre X pague Y, descontos por quantidade e cross-selling.</p>
        </div>
        <Button
          type="button"
          onClick={() => startEdit()}
          style={{ background: "#b22222", color: "#fff", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Criar promoção
        </Button>
      </div>

      <div className="content-toolbar admin-toolbar-box" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", background: "#fff", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <div className="search-box" style={{ flex: 1, minWidth: "240px", display: "flex", alignItems: "center", gap: "0.5rem", background: "#f9fafb", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }}>
          <Search size={16} color="#6b7280" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar promoção por nome..."
            style={{ border: "none", background: "transparent", padding: 0, boxShadow: "none", outline: "none" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          aria-label="Filtrar por status"
          style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "14px" }}
        >
          <option value="all">Todos os estados</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      <div className="admin-panel table-panel" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "1rem" }}>Nome da Promoção</th>
              <th style={{ padding: "1rem" }}>Tipo de Desconto</th>
              <th style={{ padding: "1rem" }}>Aplicado a</th>
              <th style={{ padding: "1rem" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {promotionsQuery.isLoading && (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                  A carregar promoções...
                </td>
              </tr>
            )}
            {!promotionsQuery.isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                  <Gift size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
                  <strong>Nenhuma promoção encontrada</strong>
                  <p style={{ fontSize: "13px", marginTop: "0.25rem" }}>Crie a sua primeira promoção automática para impulsionar conversões.</p>
                </td>
              </tr>
            )}
            {!promotionsQuery.isLoading &&
              filtered.map((promo: any) => (
                <tr key={promo.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{promo.name}</div>
                    {promo.customBadgeEnabled === 1 && promo.customBadgeText && (
                      <span style={{ display: "inline-block", background: "#fee2e2", color: "#b22222", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "11px", fontWeight: 600, marginTop: "0.2rem" }}>
                        {promo.customBadgeText}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem", color: "#4b5563", fontSize: "14px" }}>
                    {getDiscountTypeName(promo.discountType)}
                  </td>
                  <td style={{ padding: "1rem", color: "#4b5563", fontSize: "14px", textTransform: "capitalize" }}>
                    {promo.scopeType === "store" ? "Toda a loja" : promo.scopeType}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, background: promo.status === "active" ? "#dcfce7" : "#f3f4f6", color: promo.status === "active" ? "#15803d" : "#4b5563" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: promo.status === "active" ? "#22c55e" : "#9ca3af" }} />
                      {promo.status === "active" ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex.rem", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => toggleMutation.mutate({ id: promo.id, status: promo.status === "active" ? "inactive" : "active" })}
                        style={{ padding: "0.35rem 0.6rem", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px", background: "#fff", cursor: "pointer" }}
                      >
                        {promo.status === "active" ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(promo)}
                        style={{ padding: "0.35rem 0.6rem", fontSize: "12px", border: "1px solid #d1d5db", borderRadius: "4px", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja apagar a promoção "${promo.name}"?`)) {
                            removeMutation.mutate({ id: promo.id });
                          }
                        }}
                        style={{ padding: "0.35rem 0.6rem", fontSize: "12px", border: "1px solid #fecaca", color: "#b22222", borderRadius: "4px", background: "#fff", cursor: "pointer" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1rem" }}>
          <div className="admin-panel admin-modal" style={{ width: "100%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", background: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                {editing.id ? "Editar Promoção" : "Criar Promoção"}
              </h3>
              <button onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4b5563" }} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Nome da promoção</label>
                <Input
                  value={editing.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ex: Leve 3 pague 2 em Camisetas"
                  style={{ width: "100%" }}
                />
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "0.2rem", display: "block" }}>Este nome não será mostrado para seus clientes.</span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Tipo de desconto</label>
                <select
                  value={editing.discountType}
                  onChange={(e) => update("discountType", e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db", background: "#f9fafb", fontSize: "14px" }}
                >
                  <option value="buy_x_get_y">Compre X e pague Y (Compre 3 pague 2, Compre 2 pague 1, etc.)</option>
                  <option value="price_discount">Desconto sobre preços (De R$X por R$Y)</option>
                  <option value="cross_selling">Cross selling (Leve conjunto com desconto)</option>
                  <option value="progressive">Desconto progressivo por quantidade</option>
                  <option value="cart_discount">Desconto sobre o valor total do carrinho</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Aplicar a</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {(["store", "categories", "products"] as const).map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => update("scopeType", scope)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: editing.scopeType === scope ? "1px solid #b22222" : "1px solid #d1d5db",
                        background: editing.scopeType === scope ? "#fef2f2" : "#fff",
                        color: editing.scopeType === scope ? "#b22222" : "#374151",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {scope === "store" ? "Toda a loja" : scope === "categories" ? "Categorias" : "Produtos"}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {editing.scopeType === "store" && "A promoção poderá ser usada em todos os produtos de todas as categorias da loja."}
                  {editing.scopeType === "categories" && "A promoção será aplicada aos produtos pertencentes às categorias selecionadas."}
                  {editing.scopeType === "products" && "A promoção será aplicada especificamente aos produtos selecionados."}
                </p>
                <div style={{ marginTop: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={editing.allowPromotionalPrice === 1}
                      onChange={(e) => update("allowPromotionalPrice", e.target.checked ? 1 : 0)}
                    />
                    Permitir aplicar desconto a produtos com preço promocional.
                  </label>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>Combinar com</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { key: "combinableWithPrice", label: "Descontos sobre preços" },
                    { key: "combinableWithShipping", label: "Frete grátis" },
                    { key: "combinableWithCart", label: "Descontos sobre o valor do carrinho" },
                    { key: "combinableWithApps", label: "Descontos de aplicativos" },
                  ].map((item) => (
                    <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(editing as any)[item.key] === 1}
                        onChange={(e) => update(item.key as any, e.target.checked ? 1 : 0)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>Limites de uso</h4>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => update("dateLimitType", "unlimited")}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      border: editing.dateLimitType === "unlimited" ? "1px solid #b22222" : "1px solid #d1d5db",
                      background: editing.dateLimitType === "unlimited" ? "#fef2f2" : "#fff",
                      color: editing.dateLimitType === "unlimited" ? "#b22222" : "#374151",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Ilimitada
                  </button>
                  <button
                    type="button"
                    onClick={() => update("dateLimitType", "period")}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      border: editing.dateLimitType === "period" ? "1px solid #b22222" : "1px solid #d1d5db",
                      background: editing.dateLimitType === "period" ? "#fef2f2" : "#fff",
                      color: editing.dateLimitType === "period" ? "#b22222" : "#374151",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Período
                  </button>
                </div>
                {editing.dateLimitType === "period" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "#4b5563", display: "block", marginBottom: "0.25rem" }}>Início</label>
                      <Input
                        type="date"
                        value={editing.startDate}
                        onChange={(e) => update("startDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", color: "#4b5563", display: "block", marginBottom: "0.25rem" }}>Fim</label>
                      <Input
                        type="date"
                        value={editing.endDate}
                        onChange={(e) => update("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Etiqueta personalizada</h4>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>Exibe um badge promocional nas fotos dos produtos elegíveis.</p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editing.customBadgeEnabled === 1}
                    onChange={(e) => update("customBadgeEnabled", e.target.checked ? 1 : 0)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{ position: "absolute", cursor: "pointer", inset: 0, backgroundColor: editing.customBadgeEnabled === 1 ? "#b22222" : "#ccc", transition: ".3s", borderRadius: "24px" }} />
                  <span style={{ position: "absolute", content: '""', height: "18px", width: "18px", left: editing.customBadgeEnabled === 1 ? "22px" : "3px", bottom: "3px", backgroundColor: "white", transition: ".3s", borderRadius: "50%" }} />
                </label>
              </div>

              {editing.customBadgeEnabled === 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>Texto da etiqueta</label>
                  <Input
                    value={editing.customBadgeText}
                    onChange={(e) => update("customBadgeText", e.target.value)}
                    placeholder="Ex: PROMOÇÃO, 3 POR 2, etc."
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={save}
                style={{ background: "#b22222", color: "#fff" }}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "A guardar..." : "Guardar promoção"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
