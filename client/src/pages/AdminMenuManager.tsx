import { useState } from "react";
import { Plus, Trash2, Edit3, GripVertical, ExternalLink, Globe, Layers, Navigation, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function AdminMenuManager() {
  const { data: menus = [], refetch } = trpc.catalog.listCustomMenus.useQuery();
  const [activeTab, setActiveTab] = useState<"header" | "footer">("header");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);

  const saveMutation = trpc.admin.saveCustomMenu.useMutation({
    onSuccess: () => {
      toast.success(editingId ? "Item de menu atualizado com sucesso!" : "Novo link adicionado ao menu!");
      setLabel("");
      setUrl("");
      setSortOrder(0);
      setEditingId(null);
      void refetch();
    },
    onError: (err) => toast.error(err.message || "Erro ao salvar menu."),
  });

  const deleteMutation = trpc.admin.deleteCustomMenu.useMutation({
    onSuccess: () => {
      toast.success("Item removido do menu.");
      void refetch();
    },
    onError: (err) => toast.error(err.message || "Erro ao remover item."),
  });

  const handleSave = () => {
    if (!label.trim() || !url.trim()) {
      toast.error("Preencha o nome e o destino do link.");
      return;
    }
    saveMutation.mutate({
      id: editingId ?? undefined,
      location: activeTab,
      label: label.trim(),
      url: url.trim(),
      sortOrder: Number(sortOrder) || 0,
      isVisible: 1,
    });
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setActiveTab(m.location);
    setLabel(m.label);
    setUrl(m.url);
    setSortOrder(m.sortOrder ?? 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLabel("");
    setUrl("");
    setSortOrder(0);
  };

  const filteredMenus = menus.filter((m: any) => m.location === activeTab);

  return (
    <section className="admin-content admin-editorial-page">
      {/* Cabeçalho da Seção */}
      <div className="admin-editorial-hero" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="section-kicker">LOJA ONLINE · NAVEGAÇÃO</span>
          <h2 className="content-title">Menus e Links</h2>
          <p className="content-subtitle">Personalize a sua loja adicionando links ao menu principal ou gerindo as informações do rodapé.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant={activeTab === "header" ? "default" : "outline"}
            onClick={() => { setActiveTab("header"); cancelEdit(); }}
            style={activeTab === "header" ? { background: "#111", color: "#fff" } : {}}
          >
            <Navigation size={15} /> Menu Principal
          </Button>
          <Button
            variant={activeTab === "footer" ? "default" : "outline"}
            onClick={() => { setActiveTab("footer"); cancelEdit(); }}
            style={activeTab === "footer" ? { background: "#111", color: "#fff" } : {}}
          >
            <Globe size={15} /> Informações / Rodapé
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Formulário lateral de Adição/Edição estilo Nuvemshop */}
        <div className="admin-panel" style={{ background: "#fff", padding: "1.5rem", borderRadius: "10px", border: "1px solid #eae5de" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#111", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={16} style={{ color: "#b22222" }} />
            {editingId ? "Editar Item de Menu" : `Adicionar ao ${activeTab === "header" ? "Menu Principal" : "Rodapé"}`}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "#333" }}>Nome / Rótulo</label>
              <Input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Coleção Inverno, Sobre nós..."
                style={{ background: "#faf9f6" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "#333" }}>Link de Destino (URL ou Caminho)</label>
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: /catalog, /manifesto, /produtos"
                style={{ background: "#faf9f6" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem", display: "block" }}>
                Use caminhos relativos (ex: <code style={{ background: "#f2eee9", padding: "0.1rem 0.3rem", borderRadius: "3px" }}>/catalog</code>) ou URLs externas.
              </span>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "#333" }}>Ordem de Exibição</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
                style={{ background: "#faf9f6" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit} style={{ flex: 1 }}>
                  Cancelar
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !label.trim() || !url.trim()}
                style={{ background: "#b22222", color: "#fff", flex: 2 }}
              >
                {saveMutation.isPending ? "A guardar..." : editingId ? "Atualizar item" : "Adicionar link"}
              </Button>
            </div>
          </div>
        </div>

        {/* Bloco de Listagem e Reordenação Estilo Nuvemshop */}
        <div className="admin-panel" style={{ background: "#fff", borderRadius: "10px", border: "1px solid #eae5de", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #eae5de", background: "#faf9f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111" }}>
                {activeTab === "header" ? "Menu principal" : "Informações do rodapé"}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#666" }}>
                {filteredMenus.length} {filteredMenus.length === 1 ? "item configurado" : "itens configurados"}
              </span>
            </div>
          </div>

          {filteredMenus.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#666" }}>
              <Navigation size={32} style={{ color: "#dcd6ce", margin: "0 auto 1rem" }} />
              <strong style={{ fontSize: "0.95rem", color: "#111", display: "block", marginBottom: "0.25rem" }}>
                Nenhum link configurado neste menu
              </strong>
              <span style={{ fontSize: "0.825rem", color: "#666" }}>
                Adicione o primeiro link usando o formulário à esquerda.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredMenus.map((m: any) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid #f2eee9",
                    background: editingId === m.id ? "#fff8f8" : "#fff",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <GripVertical size={16} style={{ color: "#bbb", cursor: "grab" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.15rem" }}>
                        <strong style={{ fontSize: "0.925rem", color: "#111" }}>{m.label}</strong>
                        <span style={{ fontSize: "0.7rem", background: "#f2eee9", color: "#444", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                          Ordem: {m.sortOrder}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#666" }}>
                        <span>Destino: {m.url}</span>
                        <a href={m.url} target="_blank" rel="noreferrer" style={{ color: "#b22222", display: "inline-flex" }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="table-more"
                      title="Editar item"
                      onClick={() => startEdit(m)}
                      style={{ background: "transparent", border: "1px solid #dcd6ce", borderRadius: "6px", width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      className="table-more"
                      title="Excluir item"
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja remover "${m.label}" do menu?`)) {
                          deleteMutation.mutate({ id: m.id });
                        }
                      }}
                      style={{ background: "transparent", border: "1px solid #f5c6c6", borderRadius: "6px", width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#b22222" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
