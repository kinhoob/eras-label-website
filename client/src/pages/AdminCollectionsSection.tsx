import { useMemo, useState } from "react";
import { Archive, ArrowUpRight, Edit3, Image as ImageIcon, Layers3, Plus, Save, X } from "lucide-react";
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
};

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
  const [editing, setEditing] = useState<CollectionForm | null>(null);
  const collections = collectionsQuery.data ?? [];
  const activeCount = useMemo(() => collections.filter((collection) => collection.active === 1).length, [collections]);

  const startEdit = (collection?: typeof collections[number]) => setEditing(collection ? {
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
  } : { ...emptyForm });

  const update = (key: keyof CollectionForm, value: string | number) => setEditing((current) => current ? { ...current, [key]: value } : current);

  return <section className="admin-content admin-editorial-page admin-collections-page">
    <div className="admin-editorial-hero">
      <div>
        <span className="section-kicker">CATÁLOGO EDITORIAL</span>
        <h2 className="content-title">Coleções</h2>
        <p className="content-subtitle">Construa o universo de cada era com narrativa, imagem e destino de compra.</p>
      </div>
      <Button className="admin-primary-action" onClick={() => startEdit()}><Plus size={16} /> Nova coleção</Button>
    </div>
    <div className="admin-editorial-metrics">
      <div className="admin-editorial-metric"><Layers3 size={18} /><span>Publicadas</span><strong>{activeCount}</strong></div>
      <div className="admin-editorial-metric"><ImageIcon size={18} /><span>Com imagem</span><strong>{collections.filter((collection) => Boolean(collection.imageUrl)).length}</strong></div>
      <div className="admin-editorial-metric"><ArrowUpRight size={18} /><span>Total no arquivo</span><strong>{collections.length}</strong></div>
    </div>
    {collectionsQuery.isLoading ? <div className="admin-panel admin-empty-state"><span className="admin-loading-mark" />A carregar coleções persistidas...</div> : collections.length === 0 ? <div className="admin-panel admin-empty-state"><Layers3 size={28} /><strong>Ainda não existem coleções</strong><span>Crie a primeira era editorial para começar a organizar o catálogo.</span><Button variant="outline" onClick={() => startEdit()}>Criar primeira coleção</Button></div> : <div className="admin-collection-grid">
      {collections.map((collection) => <article className={`admin-collection-card ${collection.active ? "is-active" : "is-archived"}`} key={collection.id}>
        <div className="admin-collection-card-image">{collection.imageUrl ? <img src={collection.imageUrl} alt={collection.name} /> : <div className="admin-collection-placeholder"><Layers3 size={28} /><span>Sem imagem de capa</span></div>}<span className="admin-collection-year">{collection.year}</span><span className={`status-pill ${collection.active ? "success" : "warning"}`}>{collection.active ? "Publicada" : "Arquivada"}</span></div>
        <div className="admin-collection-card-body"><span className="section-kicker">COLEÇÃO / {collection.slug}</span><h3>{collection.name}</h3><p>{collection.description || "Sem descrição editorial definida."}</p><div className="admin-collection-card-actions"><button type="button" className="admin-inline-action" onClick={() => startEdit(collection)}><Edit3 size={14} /> Editar</button><button type="button" className="admin-inline-action muted" onClick={() => archiveMutation.mutate({ id: collection.id })} disabled={archiveMutation.isPending}><Archive size={14} /> Arquivar</button></div></div>
      </article>)}
    </div>}
    {editing && <div className="admin-modal-overlay"><div className="admin-panel admin-modal admin-editorial-modal"><div className="panel-heading"><div><span className="section-kicker">EDITOR DE COLEÇÃO</span><h3>{editing.id ? "Editar coleção" : "Nova coleção"}</h3></div><button type="button" className="admin-modal-close" aria-label="Fechar" onClick={() => setEditing(null)}><X size={18} /></button></div><div className="admin-editorial-form-grid"><label>Nome da coleção<Input value={editing.name} onChange={(event) => update("name", event.target.value)} /></label><label>Slug público<Input value={editing.slug} onChange={(event) => update("slug", event.target.value)} placeholder="ex.: paradox" /></label><label>Ano<Input value={editing.year} onChange={(event) => update("year", event.target.value)} /></label><label>Ordem<Input type="number" value={editing.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} /></label><label className="admin-editorial-form-span">Imagem de capa (URL)<Input value={editing.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://..." /></label><label>Texto do botão<Input value={editing.ctaLabel} onChange={(event) => update("ctaLabel", event.target.value)} /></label><label>Destino do botão<Input value={editing.ctaUrl} onChange={(event) => update("ctaUrl", event.target.value)} placeholder="/collections/paradox" /></label><label className="admin-editorial-form-span">Descrição curta<Textarea value={editing.description} onChange={(event) => update("description", event.target.value)} rows={3} /></label><label className="admin-editorial-form-span">Texto editorial<Textarea value={editing.editorialText} onChange={(event) => update("editorialText", event.target.value)} rows={5} /></label></div><div className="admin-editorial-modal-footer"><span className="admin-editorial-note">Os campos são usados na página pública de Coleções.</span><Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button className="admin-primary-action" disabled={saveMutation.isPending || !editing.name.trim() || !editing.slug.trim()} onClick={() => saveMutation.mutate(editing)}><Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar coleção"}</Button></div></div></div>}
  </section>;
}
