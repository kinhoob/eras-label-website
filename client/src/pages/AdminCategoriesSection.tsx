import { useMemo, useState } from "react";
import { Archive, Check, LoaderCircle, Pencil, Plus, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type CategoryForm = {
  id?: number;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  active: true,
  sortOrder: 0,
};

export default function AdminCategoriesSection() {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const categoriesQuery = trpc.admin.listCategories.useQuery();
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

  const categories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (categoriesQuery.data ?? []).filter((category) => {
      if (!term) return true;
      return category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term);
    });
  }, [categoriesQuery.data, search]);

  function openNewCategory() {
    const nextOrder = (categoriesQuery.data ?? []).reduce((max, category) => Math.max(max, category.sortOrder), -1) + 1;
    setForm({ ...emptyForm, sortOrder: nextOrder });
    setIsFormOpen(true);
  }

  function openEditCategory(category: NonNullable<typeof categoriesQuery.data>[number]) {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      active: Boolean(category.active),
      sortOrder: category.sortOrder,
    });
    setIsFormOpen(true);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveCategory.mutate({
      id: form.id,
      name: form.name,
      description: form.description || undefined,
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
          <p className="admin-section-description">Organize os caminhos de descoberta da loja e associe produtos sem editar o código.</p>
        </div>
        <Button onClick={openNewCategory} className="admin-primary-button"><Plus size={16} /> Nova categoria</Button>
      </div>

      <div className="admin-category-toolbar">
        <div className="admin-search-field">
          <Search size={16} aria-hidden="true" />
          <Input aria-label="Buscar categorias" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou slug" />
        </div>
        <span className="admin-result-count">{categories.length} categoria{categories.length === 1 ? "" : "s"}</span>
      </div>

      {isFormOpen && (
        <form className="admin-category-form admin-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div><span className="section-kicker">EDITOR</span><h3>{form.id ? "Editar categoria" : "Nova categoria"}</h3></div>
            <button type="button" className="admin-icon-button" aria-label="Fechar editor" onClick={() => { setForm(emptyForm); setIsFormOpen(false); }}><X size={17} /></button>
          </div>
          <div className="admin-category-form-grid">
            <label><span>Nome da categoria</span><Input required minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Camisetas" /></label>
            <label><span>Ordem no menu</span><Input type="number" min={0} max={10000} value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Math.max(0, Number(event.target.value) || 0) }))} /></label>
            <label className="admin-category-description"><span>Descrição (opcional)</span><textarea maxLength={500} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Texto curto para orientar a navegação." /></label>
            <label className="admin-category-check"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /><span>Exibir esta categoria na loja</span></label>
          </div>
          <div className="admin-form-actions"><Button type="button" variant="outline" onClick={() => { setForm(emptyForm); setIsFormOpen(false); }}>Cancelar</Button><Button type="submit" className="admin-primary-button" disabled={saveCategory.isPending}>{saveCategory.isPending ? <><LoaderCircle size={16} className="admin-auth-spinner" /> Salvando...</> : <><Check size={16} /> Salvar categoria</>}</Button></div>
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
            <tbody>{categories.map((category) => (
              <tr key={category.id}>
                <td><div className="admin-category-name"><span className="admin-category-icon"><Tag size={16} /></span><div><strong>{category.name}</strong><small>{category.description || "Sem descrição"}</small></div></div></td>
                <td><code>/{category.slug}</code></td>
                <td>{category.productCount}</td>
                <td><span className={`status-pill ${category.active ? "success" : "danger"}`}>{category.active ? "Ativa" : "Arquivada"}</span></td>
                <td>{category.sortOrder}</td>
                <td><div className="admin-row-actions"><button className="admin-icon-button" aria-label={`Editar ${category.name}`} onClick={() => openEditCategory(category)}><Pencil size={15} /></button>{category.active ? <button className="admin-icon-button danger" aria-label={`Arquivar ${category.name}`} disabled={archiveCategory.isPending} onClick={() => archiveCategory.mutate({ id: category.id })}><Archive size={15} /></button> : null}</div></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}
