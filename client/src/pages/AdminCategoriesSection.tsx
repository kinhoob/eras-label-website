import { useMemo, useRef, useState } from "react";
import { Archive, Check, ChevronRight, ImagePlus, LoaderCircle, Pencil, Plus, Search, Tag, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Estado editável do formulário de categoria.
 * parentId nulo representa uma categoria principal; um valor preenchido
 * transforma o registo numa subcategoria da categoria escolhida.
 */
type CategoryForm = {
  id?: number;
  name: string;
  description: string;
  parentId: number | null;
  coverImageUrl: string;
  active: boolean;
  sortOrder: number;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  parentId: null,
  coverImageUrl: "",
  active: true,
  sortOrder: 0,
};

/**
 * Gestão administrativa de categorias e subcategorias.
 * O componente mantém apenas metadados editoriais; os produtos continuam
 * sendo cadastrados na aba Produtos e o estoque permanece no Inventário.
 */
export default function AdminCategoriesSection() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const categoriesQuery = trpc.admin.listCategories.useQuery();
  const uploadImage = trpc.admin.uploadImage.useMutation();
  const saveCategory = trpc.admin.saveCategory.useMutation({
    onSuccess: async () => {
      toast.success(form.id ? "Categoria atualizada." : "Categoria criada.");
      setForm(emptyForm);
      setIsFormOpen(false);
      await categoriesQuery.refetch();
    },
    onError: (error) => toast.error(error.message || "Não foi possível salvar a categoria."),
  });
  const archiveCategory = trpc.admin.archiveCategory.useMutation({
    onSuccess: async () => {
      toast.success("Categoria arquivada.");
      await categoriesQuery.refetch();
    },
    onError: (error) => toast.error(error.message || "Não foi possível arquivar a categoria."),
  });

  const allCategories = categoriesQuery.data ?? [];
  const parentCategories = useMemo(
    () => allCategories.filter((category) => !category.parentId && category.id !== form.id),
    [allCategories, form.id],
  );
  const categories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allCategories.filter((category) => {
      if (!term) return true;
      const parent = allCategories.find((candidate) => candidate.id === category.parentId);
      return category.name.toLowerCase().includes(term)
        || category.slug.toLowerCase().includes(term)
        || parent?.name.toLowerCase().includes(term);
    });
  }, [allCategories, search]);

  const topLevelCount = allCategories.filter((category) => !category.parentId).length;
  const subcategoryCount = allCategories.filter((category) => Boolean(category.parentId)).length;
  const activeCount = allCategories.filter((category) => Boolean(category.active)).length;
  const coverCount = allCategories.filter((category) => Boolean(category.coverImageUrl)).length;

  /** Abre um formulário limpo e calcula automaticamente a próxima posição do menu. */
  function openNewCategory() {
    const nextOrder = allCategories.reduce((max, category) => Math.max(max, category.sortOrder), -1) + 1;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setIsFormOpen(true);
  }

  /** Carrega uma categoria existente no editor sem alterar o catálogo. */
  function openEditCategory(category: (typeof allCategories)[number]) {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      parentId: category.parentId ?? null,
      coverImageUrl: category.coverImageUrl ?? "",
      active: Boolean(category.active),
      sortOrder: category.sortOrder,
    });
    setIsFormOpen(true);
  }

  /** Faz upload da capa no storage oficial e guarda somente a URL retornada no formulário. */
  function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A capa deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      uploadImage.mutate({
        fileName: file.name,
        fileBase64: String(reader.result),
        contentType: file.type || "image/jpeg",
      }, {
        onSuccess: (result) => {
          setForm((current) => ({ ...current, coverImageUrl: result.url }));
          toast.success("Imagem de capa carregada.");
        },
        onError: () => toast.error("Não foi possível carregar a imagem de capa."),
      });
    };
    reader.readAsDataURL(file);
  }

  /** Fecha o editor e devolve o formulário ao estado inicial. */
  function closeForm() {
    setForm(emptyForm);
    setIsFormOpen(false);
  }

  /** Persiste os metadados editoriais e mantém a validação no backend. */
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCategory.mutate({
      id: form.id,
      name: form.name,
      description: form.description || undefined,
      parentId: form.parentId,
      coverImageUrl: form.coverImageUrl || null,
      active: form.active ? 1 : 0,
      sortOrder: form.sortOrder,
    });
  }

  return (
    <section className="admin-content categories-workspace">
      {/* Cabeçalho editorial da área: contexto, ação principal e linguagem comum ao CMS. */}
      <div className="content-toolbar categories-toolbar">
        <div>
          <span className="section-kicker">ARQUITETURA DO CATÁLOGO</span>
          <h2 className="content-title">Categorias</h2>
          <p className="content-subtitle">Crie a estrutura que organiza a loja, defina capas editoriais e escolha o que fica visível no menu público.</p>
        </div>
        <Button onClick={openNewCategory} className="admin-primary-button"><Plus size={16} /> Nova categoria</Button>
      </div>

      {/* Métricas rápidas ajudam a perceber a saúde da taxonomia sem abrir outra tela. */}
      <div className="category-overview-cards" aria-label="Resumo das categorias">
        <div><span>Total de categorias</span><strong>{allCategories.length}</strong><small>{topLevelCount} principais · {subcategoryCount} subcategorias</small></div>
        <div><span>Publicadas</span><strong>{activeCount}</strong><small>disponíveis no menu da loja</small></div>
        <div><span>Capas editoriais</span><strong>{coverCount}</strong><small>imagens prontas para a navegação</small></div>
        <div><span>Produtos classificados</span><strong>{allCategories.reduce((total, category) => total + Number(category.productCount || 0), 0)}</strong><small>associações no catálogo</small></div>
      </div>

      {/* Pesquisa ampla e contador ficam isolados num painel para não competir com os cards. */}
      <div className="category-filter-panel admin-panel">
        <div className="category-search-field">
          <Search size={16} aria-hidden="true" />
          <Input aria-label="Buscar categorias" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, slug ou categoria pai" />
          {search && <button type="button" className="category-search-clear" aria-label="Limpar busca" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
        <div className="category-filter-meta"><span className="section-kicker">CATÁLOGO</span><strong>{categories.length} resultado{categories.length === 1 ? "" : "s"}</strong></div>
      </div>

      {/* Editor em bloco próprio: a capa e os seus controlos ficam fora da imagem, sem sobreposição. */}
      {isFormOpen && (
        <form className="admin-category-form admin-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div><span className="section-kicker">EDITOR DE TAXONOMIA</span><h3>{form.id ? "Editar categoria" : "Nova categoria"}</h3></div>
            <button type="button" className="admin-icon-button" aria-label="Fechar editor" onClick={closeForm}><X size={17} /></button>
          </div>
          <div className="category-form-layout">
            <div className="admin-category-form-grid">
              <label><span>Nome da categoria</span><Input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Camisetas" /></label>
              <label><span>Categoria pai</span><select value={form.parentId ?? ""} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value ? Number(event.target.value) : null }))}><option value="">Categoria principal</option>{parentCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label><span>Ordem no menu</span><Input type="number" min={0} max={10000} value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Math.max(0, Number(event.target.value) || 0) }))} /></label>
              <label className="admin-category-description"><span>Descrição editorial (opcional)</span><textarea maxLength={500} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Texto curto para orientar a navegação." /></label>
              <label className="admin-category-check"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /><span>Exibir esta categoria na loja</span></label>
            </div>

            <div className="category-cover-editor">
              <div className="category-cover-copy"><span className="section-kicker">IMAGEM EDITORIAL</span><h4>Capa da categoria</h4><p>Prefira uma imagem horizontal, limpa e com espaço para o título na página pública.</p></div>
              <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
              {form.coverImageUrl ? <div className="category-cover-preview"><img src={form.coverImageUrl} alt={`Capa de ${form.name || "categoria"}`} /><div className="category-cover-caption"><span>Pré-visualização</span><button type="button" aria-label="Remover capa" onClick={() => setForm((current) => ({ ...current, coverImageUrl: "" }))}><X size={15} /></button></div></div> : <div className="category-cover-empty"><ImagePlus size={24} /><span>Nenhuma capa selecionada</span><small>A imagem aparecerá aqui antes de guardar.</small></div>}
              <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()} disabled={uploadImage.isPending}><Upload size={15} /> {uploadImage.isPending ? "A carregar..." : form.coverImageUrl ? "Substituir capa" : "Enviar capa"}</Button>
            </div>
          </div>
          <div className="admin-form-actions"><Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button><Button type="submit" className="admin-primary-button" disabled={saveCategory.isPending || uploadImage.isPending}>{saveCategory.isPending ? <><LoaderCircle size={16} className="admin-auth-spinner" /> A guardar...</> : <><Check size={16} /> Guardar categoria</>}</Button></div>
        </form>
      )}

      {/* Cards substituem a tabela fria e tornam capa, estado e hierarquia legíveis num relance. */}
      <div className="category-card-grid">
        {categoriesQuery.isLoading ? (
          <div className="admin-panel admin-state-message category-grid-state"><LoaderCircle size={22} className="admin-auth-spinner" /><p>A carregar categorias...</p></div>
        ) : categoriesQuery.isError ? (
          <div className="admin-panel admin-state-message category-grid-state"><Tag size={24} /><p>Não foi possível carregar as categorias.</p><Button variant="outline" onClick={() => void categoriesQuery.refetch()}>Tentar novamente</Button></div>
        ) : categories.length === 0 ? (
          <div className="admin-panel admin-state-message category-grid-state"><Tag size={24} /><p>{search ? "Nenhuma categoria corresponde à busca." : "Ainda não há categorias cadastradas."}</p><Button variant="outline" onClick={search ? () => setSearch("") : openNewCategory}>{search ? "Limpar busca" : "Criar primeira categoria"}</Button></div>
        ) : categories.map((category) => {
          const parent = allCategories.find((candidate) => candidate.id === category.parentId);
          return (
            <article className={`category-editor-card ${parent ? "is-subcategory" : ""}`} key={category.id}>
              <div className="category-card-media">
                {category.coverImageUrl ? <img src={category.coverImageUrl} alt="" /> : <div className="category-card-placeholder"><Tag size={22} /><span>Sem capa</span></div>}
                <span className={`category-card-status ${category.active ? "is-active" : "is-archived"}`}>{category.active ? "Publicada" : "Arquivada"}</span>
                <span className="category-card-order">#{String(category.sortOrder).padStart(2, "0")}</span>
              </div>
              <div className="category-card-body">
                <div className="category-card-heading"><div><span className="section-kicker">{parent ? "SUBCATEGORIA" : "CATEGORIA PRINCIPAL"}</span><h3>{category.name}</h3></div><span className="category-card-count">{category.productCount} peças</span></div>
                <p>{parent ? <><ChevronRight size={13} /> Subcategoria de {parent.name}</> : (category.description || "Sem descrição editorial")}</p>
                <code>/{category.slug}</code>
                <div className="category-card-actions"><button type="button" className="category-card-action" onClick={() => openEditCategory(category)}><Pencil size={14} /> Editar</button>{category.active && <button type="button" className="category-card-action is-danger" disabled={archiveCategory.isPending} onClick={() => archiveCategory.mutate({ id: category.id })}><Archive size={14} /> Arquivar</button>}</div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
