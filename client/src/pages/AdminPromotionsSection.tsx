import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Plus, Trash2, Edit3, X, Check, AlertCircle } from "lucide-react";

export function AdminPromotionsSection() {
  const utils = trpc.useUtils();
  const promotionsQuery = trpc.promotions.list.useQuery();
  const [editing, setEditing] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const saveMutation = trpc.promotions.save.useMutation({
    onSuccess: () => {
      utils.promotions.list.invalidate();
      setEditing(null);
      setSuccessMessage("Promoção guardada com sucesso.");
      setTimeout(() => setSuccessMessage(""), 4000);
    },
  });

  const removeMutation = trpc.promotions.remove.useMutation({
    onSuccess: () => {
      utils.promotions.list.invalidate();
      setSuccessMessage("Promoção removida com sucesso.");
      setTimeout(() => setSuccessMessage(""), 4000);
    },
  });

  const toggleMutation = trpc.promotions.toggle.useMutation({
    onSuccess: () => {
      utils.promotions.list.invalidate();
    },
  });

  const createNew = () => {
    setEditing({
      name: "",
      discountType: "buy_x_get_y",
      scopeType: "store",
      scopeIds: "",
      allowStackingPrice: 0,
      allowStackingShipping: 0,
      allowStackingCart: 0,
      allowStackingApps: 0,
      usageLimitType: "unlimited",
      usageLimitTotal: null,
      usageLimitPerCustomer: "unlimited",
      dateLimitType: "unlimited",
      validUntil: "",
      customBadgeEnabled: 0,
      customBadgeText: "",
      status: "active",
    });
  };

  const startEdit = (promo: any) => {
    setEditing({ ...promo });
  };

  const update = (field: string, value: any) => {
    setEditing((prev: any) => ({ ...prev, [field]: value }));
  };

  const save = () => {
    if (!editing?.name) {
      alert("Por favor, preencha o nome da promoção.");
      return;
    }
    saveMutation.mutate(editing);
  };

  const getDiscountTypeName = (type: string) => {
    switch (type) {
      case "buy_x_get_y": return "Compre X e pague Y";
      case "price_discount": return "Desconto sobre preços";
      case "cross_selling": return "Cross selling";
      case "progressive": return "Desconto progressivo";
      case "cart_discount": return "Desconto no carrinho";
      default: return type;
    }
  };

  return (
    <section className="admin-section" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Promoções Automáticas</h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "0.25rem" }}>Crie campanhas dinâmicas, descontos por quantidade e ofertas especiais.</p>
        </div>
        <Button
          onClick={createNew}
          style={{ background: "#b22222", color: "#fff", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}
        >
          <Plus size={16} /> Criar promoção
        </Button>
      </div>

      {successMessage && (
        <div style={{ background: "#dcfce7", color: "#15803d", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "14px", fontWeight: 500, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #bbf7d0" }}>
          <Check size={16} /> {successMessage}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#fbf9f6", borderBottom: "1px solid #e5e7eb", color: "#4b5563", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "1rem" }}>Nome da promoção</th>
              <th style={{ padding: "1rem" }}>Tipo</th>
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
            {!promotionsQuery.isLoading && (!promotionsQuery.data || promotionsQuery.data.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center", color: "#6b7280" }}>
                  <Gift size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
                  <strong>Nenhuma promoção encontrada</strong>
                  <p style={{ fontSize: "13px", marginTop: "0.25rem" }}>Crie a sua primeira promoção automática para impulsionar conversões.</p>
                </td>
              </tr>
            )}
            {!promotionsQuery.isLoading && promotionsQuery.data?.map((promo: any) => (
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
                  <div style={{ display: "inline-flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1rem", overflowY: "auto" }}>
          <div className="admin-panel admin-modal" style={{ width: "100%", maxWidth: "750px", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", margin: "auto" }}>
            
            {/* Cabeçalho Fixo do Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", padding: "1.25rem 1.75rem", background: "#fbf9f6", flexShrink: 0 }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                {editing.id ? "Editar Promoção" : "Criar Promoção"}
              </h3>
              <button onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4b5563", padding: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            {/* Corpo com Rolagem Interna */}
            <div style={{ padding: "1.75rem", overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                  {editing.scopeType === "products" && "A promoção será aplicada aos produtos específicos selecionados."}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Combinar com</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={editing.allowStackingPrice === 1}
                      onChange={(e) => update("allowStackingPrice", e.target.checked ? 1 : 0)}
                      style={{ accentColor: "#b22222", width: "16px", height: "16px" }}
                    />
                    <span>Descontos sobre preços</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={editing.allowStackingShipping === 1}
                      onChange={(e) => update("allowStackingShipping", e.target.checked ? 1 : 0)}
                      style={{ accentColor: "#b22222", width: "16px", height: "16px" }}
                    />
                    <span>Frete grátis</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={editing.allowStackingCart === 1}
                      onChange={(e) => update("allowStackingCart", e.target.checked ? 1 : 0)}
                      style={{ accentColor: "#b22222", width: "16px", height: "16px" }}
                    />
                    <span>Descontos sobre o valor do carrinho</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={editing.allowStackingApps === 1}
                      onChange={(e) => update("allowStackingApps", e.target.checked ? 1 : 0)}
                      style={{ accentColor: "#b22222", width: "16px", height: "16px" }}
                    />
                    <span>Descontos de aplicativos</span>
                  </label>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Limites de uso</h4>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Validade limite</label>
                <Input
                  type="datetime-local"
                  value={editing.validUntil || ""}
                  onChange={(e) => update("validUntil", e.target.value)}
                  style={{ width: "100%" }}
                />
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
                  <span style={{ position: "absolute", height: "18px", width: "18px", left: editing.customBadgeEnabled === 1 ? "22px" : "3px", bottom: "3px", backgroundColor: "white", transition: ".3s", borderRadius: "50%" }} />
                </label>
              </div>

              {editing.customBadgeEnabled === 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "0.25rem" }}>Texto da etiqueta</label>
                  <Input
                    value={editing.customBadgeText || ""}
                    onChange={(e) => update("customBadgeText", e.target.value)}
                    placeholder="Ex: PROMOÇÃO, 3 POR 2, etc."
                  />
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "1.25rem 1.75rem", background: "#fbf9f6", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
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
