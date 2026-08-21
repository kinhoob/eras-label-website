import { useState, useMemo } from "react";
import { Archive, ArrowUpRight, Edit3, Image as ImageIcon, Layers3, Plus, RotateCcw, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type CollectionForm = {
  id?: number;
  name: string;
  slug: string;
  year: string;
  description: string;
  editorialText: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  sortOrder: number;
  active: number;
  productIds: number[];
  photos: string[];
};

const emptyForm: CollectionForm = {
  name: "",
  slug: "",
  year: new Date().getFullYear().toString(),
  description: "",
  editorialText: "",
  imageUrl: "",
  ctaLabel: "Explorar coleção",
  ctaUrl: "",
  sortOrder: 0,
  active: 1,
  productIds: [],
  photos: [],
};

/**
 * Componente AdminCollectionsSection: Gerenciamento completo de coleções editoriais
 * da Eras Label, com cards de preview, capas visuais e ações no padrão Nuvemshop/Eras.
 */
export function AdminCollectionsSection() {
  const utils = trpc.useUtils();
  const collectionsQuery = trpc.collections.list.useQuery();

  const saveMutation = trpc.collections.save.useMutation({
    onSuccess: async () => {
      toast.success("Coleção guardada com sucesso.");
      setEditing(null);
      await utils.collections.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Não foi possível guardar a coleção."),
  });

  const archiveMutation = trpc.collections.archive.useMutation({
    onSuccess: async () => {
      toast.success("Coleção arquivada.");
      await utils.collections.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Não foi possível arquivar a coleção."),
  });

  const restoreMutation = trpc.collections.restore.useMutation({
    onSuccess: async () => {
      toast.success("Coleção reativada e visível novamente.");
      await utils.collections.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Não foi possível restaurar a coleção."),
  });

  const [editing, setEditing] = useState<CollectionForm | null>(null);

  const collections = collectionsQuery.data ?? [];
  const activeCount = useMemo(() => collections.filter((c) => c.active === 1).length, [collections]);

  const { data: adminProducts = [] } = trpc.admin.listProducts.useQuery(undefined, { enabled: true });

  const startEdit = (collection?: typeof collections[number]) => {
    let parsedProductIds: number[] = [];
    if (collection && (collection as any).productIds) {
      try {
        parsedProductIds = typeof (collection as any).productIds === "string" 
          ? JSON.parse((collection as any).productIds) 
          : Array.isArray((collection as any).productIds) 
          ? (collection as any).productIds 
          : [];
      } catch {
        parsedProductIds = [];
      }
    }
    let parsedPhotos: string[] = [];
    if (collection && (collection as any).photos) {
      try {
        parsedPhotos = typeof (collection as any).photos === "string"
          ? JSON.parse((collection as any).photos)
          : Array.isArray((collection as any).photos)
          ? (collection as any).photos
          : [];
      } catch {
        parsedPhotos = [];
      }
    }

    // Fallback: se não tiver productIds explícitos mas tiver produtos no catálogo com o nome da coleção
    if (parsedProductIds.length === 0 && collection) {
      parsedProductIds = adminProducts
        .filter((p: any) => p.collection && p.collection.toLowerCase() === collection.name.toLowerCase())
        .map((p: any) => Number(p.id));
    }

    setEditing(
      collection
        ? {
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            year: collection.year,
            description: collection.description ?? "",
            editorialText: collection.editorialText ?? "",
            imageUrl: collection.imageUrl ?? "",
            ctaLabel: collection.ctaLabel ?? "Explorar coleção",
            ctaUrl: collection.ctaUrl ?? "",
            sortOrder: collection.sortOrder,
            active: collection.active,
            productIds: parsedProductIds,
            photos: parsedPhotos,
          }
        : { ...emptyForm, productIds: [], photos: [] }
    );
  };

  const update = (key: keyof CollectionForm, value: string | number) =>
    setEditing((current) => (current ? { ...current, [key]: value } : current));

  return (
    <section className="admin-content admin-editorial-page admin-collections-page" style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Cabeçalho Editorial */}
      <div className="admin-editorial-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "1px solid #eae5de", paddingBottom: "1.5rem" }}>
        <div>
          <span className="section-kicker" style={{ color: "#b22222", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>CATÁLOGO EDITORIAL</span>
          <h2 className="content-title" style={{ fontSize: "1.85rem", fontWeight: 700, color: "#111", marginTop: "0.25rem", fontFamily: "inherit" }}>Coleções</h2>
          <p className="content-subtitle" style={{ color: "#666", fontSize: "0.95rem", marginTop: "0.25rem" }}>Construa o universo de cada era com narrativa, imagem e destino de compra.</p>
        </div>
        <Button 
          onClick={() => startEdit()} 
          style={{ background: "#b22222", color: "#fff", height: "42px", padding: "0 1.25rem", borderRadius: "8px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={16} /> Nova coleção
        </Button>
      </div>

      {/* Métricas do Catálogo */}
      <div className="admin-editorial-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="admin-editorial-metric" style={{ background: "#fff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #eae5de", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ background: "#faf5f5", color: "#b22222", padding: "0.75rem", borderRadius: "8px" }}><Layers3 size={20} /></div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#666", display: "block" }}>Publicadas</span>
            <strong style={{ fontSize: "1.25rem", color: "#111" }}>{activeCount}</strong>
          </div>
        </div>
        <div className="admin-editorial-metric" style={{ background: "#fff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #eae5de", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ background: "#faf5f5", color: "#b22222", padding: "0.75rem", borderRadius: "8px" }}><ImageIcon size={20} /></div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#666", display: "block" }}>Com imagem de capa</span>
            <strong style={{ fontSize: "1.25rem", color: "#111" }}>{collections.filter((c) => Boolean(c.imageUrl)).length}</strong>
          </div>
        </div>
        <div className="admin-editorial-metric" style={{ background: "#fff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #eae5de", display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ background: "#faf5f5", color: "#b22222", padding: "0.75rem", borderRadius: "8px" }}><ArrowUpRight size={20} /></div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#666", display: "block" }}>Total no arquivo</span>
            <strong style={{ fontSize: "1.25rem", color: "#111" }}>{collections.length}</strong>
          </div>
        </div>
      </div>

      {/* Listagem em Grid de Cards */}
      {collectionsQuery.isLoading ? (
        <div className="admin-panel admin-empty-state" style={{ padding: "4rem", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #eae5de" }}>
          <span className="admin-loading-mark" /> A carregar coleções persistidas...
        </div>
      ) : collections.length === 0 ? (
        <div className="admin-panel admin-empty-state" style={{ padding: "4rem 2rem", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #eae5de" }}>
          <Layers3 size={36} style={{ color: "#b22222", margin: "0 auto 1rem" }} />
          <strong style={{ fontSize: "1.1rem", color: "#111", display: "block", marginBottom: "0.25rem" }}>Ainda não existem coleções</strong>
          <span style={{ color: "#666", fontSize: "0.9rem", display: "block", marginBottom: "1.5rem" }}>Crie a primeira era editorial para começar a organizar o catálogo da Eras.</span>
          <Button onClick={() => startEdit()} style={{ background: "#b22222", color: "#fff" }}>Criar primeira coleção</Button>
        </div>
      ) : (
        <div className="admin-collection-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {collections.map((collection) => (
            <article 
              key={collection.id} 
              style={{ 
                background: "#fff", 
                borderRadius: "12px", 
                border: "1px solid #eae5de", 
                overflow: "hidden", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)", 
                display: "flex", 
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                opacity: collection.active ? 1 : 0.75
              }}
            >
              {/* Capa com Preview */}
              <div style={{ position: "relative", height: "180px", background: "#f5f2ed", borderBottom: "1px solid #eae5de", overflow: "hidden" }}>
                {collection.imageUrl ? (
                  <img src={collection.imageUrl} alt={collection.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#888", gap: "0.5rem" }}>
                    <ImageIcon size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Sem imagem de capa</span>
                  </div>
                )}
                <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                  {collection.year}
                </span>
                <span style={{ position: "absolute", top: "12px", right: "12px", background: collection.active ? "#10b981" : "#f59e0b", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                  {collection.active ? "Publicada" : "Arquivada"}
                </span>
              </div>

              {/* Conteúdo do Card */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#b22222", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>
                    COLEÇÃO / {collection.slug}
                  </span>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>{collection.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1.25rem" }}>
                    {collection.description || "Sem descrição editorial definida."}
                  </p>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f2eee9", paddingTop: "0.75rem", marginTop: "auto" }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(collection)}
                    style={{ height: "34px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", borderColor: "#dcd6ce" }}
                  >
                    <Edit3 size={14} /> Editar
                  </Button>
                  {collection.active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveMutation.mutate({ id: collection.id })}
                      disabled={archiveMutation.isPending}
                      style={{ height: "34px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#b22222", borderColor: "#f5c6c6" }}
                    >
                      <Archive size={14} /> Arquivar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate({ id: collection.id })}
                      disabled={restoreMutation.isPending}
                      style={{ height: "34px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#10b981", borderColor: "#a7f3d0" }}
                    >
                      <RotateCcw size={14} /> Reaparecer
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de Criar / Editar Coleção */}
      {editing && (
        <div className="admin-modal-overlay">
          <div className="admin-panel admin-modal admin-editorial-modal" style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eae5de", width: "100%", maxWidth: "680px", padding: "1.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <div className="panel-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #f2eee9", paddingBottom: "1rem" }}>
              <div>
                <span className="section-kicker" style={{ color: "#b22222", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em" }}>EDITOR DE COLEÇÃO</span>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111" }}>{editing.id ? "Editar coleção" : "Nova coleção"}</h3>
              </div>
              <button type="button" className="admin-modal-close" aria-label="Fechar" onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666" }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-editorial-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Nome da coleção
                <Input value={editing.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Paradox" style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Slug público
                <Input value={editing.slug} onChange={(e) => update("slug", e.target.value)} placeholder="ex: paradox" style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Ano
                <Input value={editing.year} onChange={(e) => update("year", e.target.value)} placeholder="2026" style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Ordem de exibição
                <Input type="number" value={editing.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333", gridColumn: "span 2" }}>
                Imagem de capa (URL)
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <Input value={editing.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://..." style={{ height: "40px", flex: 1 }} />
                  {editing.imageUrl && (
                    <div style={{ width: "40px", height: "40px", borderRadius: "6px", overflow: "hidden", border: "1px solid #ccc", flexShrink: 0 }}>
                      <img src={editing.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333", gridColumn: "span 2" }}>
                Galeria de Fotos da Coleção (URLs, uma por linha ou separadas por vírgula)
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexDirection: "column" }}>
                  <Textarea
                    value={Array.isArray(editing.photos) ? editing.photos.join("\n") : ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const list = raw.includes(",") && !raw.includes("\n")
                        ? raw.split(",").map(s => s.trim()).filter(Boolean)
                        : raw.split("\n").map(s => s.trim()).filter(Boolean);
                      setEditing(curr => curr ? { ...curr, photos: list } : curr);
                    }}
                    rows={3}
                    placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                  />
                  {Array.isArray(editing.photos) && editing.photos.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      {editing.photos.map((photoUrl, pIdx) => (
                        <div key={pIdx} style={{ width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", border: "1px solid #ccc", position: "relative" }}>
                          <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Texto do botão
                <Input value={editing.ctaLabel} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Explorar coleção" style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333" }}>
                Destino do botão
                <Input value={editing.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="/collections/paradox" style={{ height: "40px" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333", gridColumn: "span 2" }}>
                Descrição curta
                <Textarea value={editing.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Resumo editorial da coleção..." />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600, color: "#333", gridColumn: "span 2" }}>
                Texto editorial completo
                <Textarea value={editing.editorialText} onChange={(e) => update("editorialText", e.target.value)} rows={4} placeholder="História, manifesto e detalhes da era..." />
              </label>

              <div style={{ gridColumn: "span 2", borderTop: "1px solid #f2eee9", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", display: "block", marginBottom: "0.5rem" }}>
                  Selecionar produtos que fazem parte desta coleção ({editing.productIds.length} selecionados)
                </span>
                <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.75rem" }}>
                  Marque as peças abaixo para vinculá-las automaticamente a esta coleção no Archive e na página pública.
                </p>
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #eae5de", borderRadius: "6px", padding: "0.75rem", background: "#fafafa" }}>
                  {adminProducts.length === 0 ? (
                    <p style={{ fontSize: "0.85rem", color: "#666", textAlign: "center", padding: "1rem" }}>Nenhum produto cadastrado no catálogo.</p>
                  ) : (
                    adminProducts.map((p: any) => {
                      const isChecked = editing.productIds.includes(Number(p.id));
                      return (
                        <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.35rem 0", fontSize: "0.85rem", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditing((curr) => {
                                if (!curr) return curr;
                                const currentIds = curr.productIds || [];
                                const nextIds = checked 
                                  ? [...currentIds, Number(p.id)]
                                  : currentIds.filter((id) => id !== Number(p.id));
                                return { ...curr, productIds: nextIds };
                              });
                            }}
                            style={{ width: "16px", height: "16px", accentColor: "#b22222" }}
                          />
                          <div style={{ width: "32px", height: "32px", borderRadius: "4px", overflow: "hidden", background: "#eee", flexShrink: 0 }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                          </div>
                          <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <strong>{p.name}</strong> <span style={{ color: "#666", fontSize: "0.75rem" }}>· R$ {Number(p.price).toFixed(2)}</span>
                          </div>
                          <span style={{ fontSize: "0.75rem", padding: "2px 6px", background: p.collection ? "#eee" : "#fef2f2", borderRadius: "4px", color: p.collection ? "#333" : "#b22222" }}>
                            {p.collection || "Sem coleção"}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="admin-editorial-modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f2eee9", paddingTop: "1rem" }}>
              <span className="admin-editorial-note" style={{ fontSize: "0.8rem", color: "#666" }}>Os dados são exibidos dinamicamente na página pública de coleções.</span>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button 
                  className="admin-primary-action" 
                  disabled={saveMutation.isPending || !editing.name.trim() || !editing.slug.trim()} 
                  onClick={() => saveMutation.mutate(editing)}
                  style={{ background: "#b22222", color: "#fff", fontWeight: 600 }}
                >
                  <Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar coleção"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
