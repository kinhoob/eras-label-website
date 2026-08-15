import { useMemo, useRef, useState } from "react";
import { Archive, Check, ImagePlus, LoaderCircle, Pencil, Plus, Search, Tag, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Estado editável do formulário de categoria.
 * parentId nulo representa uma categoria de nível superior; um valor preenchido
 * transforma o registro em subcategoria da categoria selecionada.
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

  function openNewCategory() {
    const nextOrder = allCategories.reduce((max, category) => Math.max(max, category.sortOrder), -1) + 1;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setIsFormOpen(true);
  }

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

  function closeForm() {
    setForm(emptyForm);
    setIsFormOpen(false);
  }

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
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">CATÁLOGO</span>
          <h2 className="content-title">Categorias</h2>
          <p className="admin-section-description">Organize categorias, subcategorias e capas editoriais sem editar o código.</p>
        </div>
        <Button onClick={openNewCategory} className="admin-primary-button"><Plus size={16} /> Nova categoria</Button>
      </div>

      <div className="admin-category-toolbar">
        <div className="admin-search-field">
          <Search size={16} aria-hidden="true" />
          <Input aria-label="Buscar categorias" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, slug ou categoria pai" />
        </div>
        <span className="admin-result-count">{categories.length} categoria{categories.length === 1 ? "" : "s"}</span>
      </div>

      {isFormOpen && (
        <form className="admin-category-form admin-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div><span className="section-kicker">EDITOR</span><h3>{form.id ? "Editar categoria" : "Nova categoria"}</h3></div>
            <button type="button" className="admin-icon-button" aria-label="Fechar editor" onClick={closeForm}><X size={17} /></button>
          </div>
          <div className="admin-category-form-grid">
            <label><span>Nome da categoria</span><Input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Camisetas" /></label>
            <label><span>Categoria pai</span><select value={form.parentId ?? ""} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value ? Number(event.target.value) : null }))}><option value="">Categoria principal</option>{parentCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label><span>Ordem no menu</span><Input type="number" min={0} max={10000} value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Math.max(0, Number(event.target.value) || 0) }))} /></label>
            <label className="admin-category-description"><span>Descrição (opcional)</span><textarea maxLength={500} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Texto curto para orientar a navegação." /></label>
            <label className="admin-category-check"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /><span>Exibir esta categoria na loja</span></label>
          </div>

          <div className="category-cover-editor">
            <div>
              <span className="section-kicker">IMAGEM EDITORIAL</span>
              <h4>Capa da categoria</h4>
              <p>Use uma imagem horizontal para representar a categoria na loja.</p>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
            {form.coverImageUrl ? <div className="category-cover-preview"><img src={form.coverImageUrl} alt={`Capa de ${form.name || "categoria"}`} /><button type="button" aria-label="Remover capa" onClick={() => setForm((current) => ({ ...current, coverImageUrl: "" }))}><X size={15} /></button></div> : <div className="category-cover-empty"><ImagePlus size={24} /><span>Nenhuma capa selecionada</span></div>}
            <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()} disabled={uploadImage.isPending}><Upload size={15} /> {uploadImage.isPending ? "Carregando..." : "Enviar capa"}</Button>
          </div>
          <div className="admin-form-actions"><Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button><Button type="submit" className="admin-primary-button" disabled={saveCategory.isPending || uploadImage.isPending}>{saveCategory.isPending ? <><LoaderCircle size={16} className="admin-auth-spinner" /> Salvando...</> : <><Check size={16} /> Salvar categoria</>}</Button></div>
        </form>
      )}

      <div className="admin-panel table-panel admin-categories-table">
        {categoriesQuery.isLoading ? (
          <div className="admin-state-message"><LoaderCircle size={22} className="admin-auth-spinner" /><p>Carregando categorias...</p></div>
        ) : categoriesQuery.isError ? (
          <div className="admin-state-message"><Tag size={24} /><p>Não foi possível carregar as categorias.</p><Button variant="outline" onClick={() => void categoriesQuery.refetch()}>Tentar novamente</Button></div>
        ) : categories.length === 0 ? (
          <div className="admin-state-message"><Tag size={24} /><p>{search ? "Nenhuma categoria corresponde à busca." : "Ainda não há categorias cadastradas."}</p><Button variant="outline" onClick={search ? () => setSearch("") : openNewCategory}>{search ? "Limpar busca" : "Criar primeira categoria"}</Button></div>
        ) : (
          <table>
            <thead><tr><th>Categoria</th><th>Slug público</th><th>Produtos</th><th>Status</th><th>Ordem</th><th>Ações</th></tr></thead>
            <tbody>{categories.map((category) => {
              const parent = allCategories.find((candidate) => candidate.id === category.parentId);
              return <tr key={category.id}>
                <td><div className={`admin-category-name ${parent ? "is-subcategory" : ""}`}>{category.coverImageUrl ? <img className="category-cover-thumb" src={category.coverImageUrl} alt="" /> : <span className="admin-category-icon"><Tag size={16} /></span>}<div><strong>{parent ? `↳ ${category.name}` : category.name}</strong><small>{parent ? `Subcategoria de ${parent.name}` : (category.description || "Sem descrição")}</small></div></div></td>
                <td><code>/{category.slug}</code></td>
                <td>{category.productCount}</td>
                <td><span className={`status-pill ${category.active ? "success" : "danger"}`}>{category.active ? "Ativa" : "Arquivada"}</span></td>
                <td>{category.sortOrder}</td>
                <td><div className="admin-row-actions"><button className="admin-icon-button" aria-label={`Editar ${category.name}`} onClick={() => openEditCategory(category)}><Pencil size={15} /></button>{category.active ? <button className="admin-icon-button danger" aria-label={`Arquivar ${category.name}`} disabled={archiveCategory.isPending} onClick={() => archiveCategory.mutate({ id: category.id })}><Archive size={15} /></button> : null}</div></td>
              </tr>;
            })}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
