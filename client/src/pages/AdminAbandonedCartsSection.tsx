import { useMemo, useState } from "react";
import { Archive, ChevronDown, Clock3, Mail, PackageOpen, Search, ShoppingBag, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: Date | string | number) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminAbandonedCartsSection() {
  const { data: carts = [], isLoading } = trpc.admin.listAbandonedCarts.useQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "recovered">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => carts.filter((cart) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [cart.customerName, cart.customerEmail, String(cart.id)].some((value) => String(value ?? "").toLowerCase().includes(query));
    const matchesStatus = status === "all" || (status === "recovered" ? cart.recovered : !cart.recovered);
    return matchesSearch && matchesStatus;
  }), [carts, search, status]);

  const totalValue = carts.reduce((sum, cart) => sum + Number(cart.total || 0), 0);
  const openCount = carts.filter((cart) => !cart.recovered).length;
  const recoveredCount = carts.filter((cart) => cart.recovered).length;

  return (
    <section className="admin-content abandoned-carts-page">
      <div className="abandoned-carts-hero"><div><span className="section-kicker">VENDAS & CLIENTES · RECUPERAÇÃO</span><h2 className="content-title">Carrinhos abandonados</h2><p className="content-subtitle">Veja sessões de compra que foram preenchidas mas não chegaram ao checkout concluído.</p></div><div className="abandoned-hero-stamp"><ShoppingBag size={21} /><span>RECOVERY / LIVE DATA</span></div></div>
      <div className="abandoned-metrics"><div className="abandoned-metric"><span>Em aberto</span><strong>{openCount}</strong><small>carrinhos aguardando ação</small></div><div className="abandoned-metric"><span>Recuperados</span><strong>{recoveredCount}</strong><small>registos convertidos</small></div><div className="abandoned-metric"><span>Valor observado</span><strong>{money(totalValue)}</strong><small>soma dos carrinhos persistidos</small></div></div>
      <div className="admin-panel abandoned-carts-panel"><div className="abandoned-toolbar"><div className="admin-search-field"><Search size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar nome, e-mail ou ID..." /></div><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filtrar carrinhos"><option value="all">Todos os carrinhos</option><option value="open">Em aberto</option><option value="recovered">Recuperados</option></select></div>{isLoading ? <div className="dashboard-empty-state"><Clock3 className="spin" size={18} /> A carregar carrinhos reais...</div> : filtered.length === 0 ? <div className="abandoned-empty-state"><Archive size={34} /><strong>{carts.length === 0 ? "Ainda não existem carrinhos abandonados" : "Nenhum carrinho corresponde aos filtros"}</strong><span>{carts.length === 0 ? "Quando um cliente preencher a sacola e não concluir a compra, o registo aparecerá aqui. Não foram adicionados dados fictícios." : "Altere a pesquisa ou o filtro de estado para consultar os registos disponíveis."}</span></div> : <div className="abandoned-table-wrap"><table className="abandoned-table"><thead><tr><th>Cliente</th><th>Itens</th><th>Valor</th><th>Última atividade</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((cart) => { const items = Array.isArray(cart.items) ? cart.items : []; const isExpanded = expandedId === cart.id; return <tr key={cart.id} className={isExpanded ? "is-expanded" : ""}><td><div className="abandoned-customer"><span className="abandoned-avatar"><UserRound size={15} /></span><div><strong>{cart.customerName || "Cliente não identificado"}</strong><small>{cart.customerEmail || "Sem e-mail capturado"}</small></div></div></td><td><span className="abandoned-item-count"><PackageOpen size={14} /> {items.length} {items.length === 1 ? "item" : "itens"}</span></td><td><strong>{money(Number(cart.total || 0))}</strong></td><td><span className="abandoned-date">{formatDate(cart.createdAt)}</span></td><td><span className={`status-pill ${cart.recovered ? "success" : "warning"}`}>{cart.recovered ? "Recuperado" : "Em aberto"}</span></td><td><button type="button" className="abandoned-expand-button" onClick={() => setExpandedId(isExpanded ? null : cart.id)} aria-label={`Ver carrinho ${cart.id}`}><ChevronDown size={17} className={isExpanded ? "rotate-180" : ""} /></button>{isExpanded && <div className="abandoned-detail-popover"><div className="abandoned-detail-heading"><strong>Itens do carrinho</strong>{cart.customerEmail && <a href={`mailto:${cart.customerEmail}`}><Mail size={14} /> Contactar</a>}</div>{items.length === 0 ? <span>Itens não disponíveis neste registo.</span> : items.map((item, index) => <div className="abandoned-detail-item" key={`${cart.id}-${index}`}><span>{String(item.name ?? "Produto")}</span><small>{String(item.size ?? "Tamanho único")} · {String(item.quantity ?? 1)} un.</small></div>)}<small className="abandoned-detail-created">Criado em {formatDate(cart.createdAt)}</small></div>}</td></tr>; })}</tbody></table></div>}</div>
    </section>
  );
}
