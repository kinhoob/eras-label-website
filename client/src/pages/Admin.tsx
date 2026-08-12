import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Eye,
  ImagePlus,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Package,
  Palette,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const adminProducts = [
  { name: "T-Shirt Travessia", collection: "PARADOX COLLECTION", category: "Camisetas", price: "R$ 154,90", stock: 18, status: "Publicado" },
  { name: "T-Shirt Dissociação", collection: "PARADOX COLLECTION", category: "Camisetas", price: "R$ 154,90", stock: 12, status: "Publicado" },
  { name: "T-Shirt Ressonador", collection: "PARADOX COLLECTION", category: "Camisetas", price: "R$ 152,90", stock: 8, status: "Publicado" },
  { name: "Boné Lost Between Eras Off", collection: "LOST BETWEEN ERAS", category: "Bonés", price: "R$ 117,50", stock: 4, status: "Publicado" },
  { name: "Boné Lost Between Eras Marinho", collection: "LOST BETWEEN ERAS", category: "Bonés", price: "R$ 117,50", stock: 0, status: "Esgotado" },
];

const orders = [
  { id: "#ER-0108", customer: "Marina Oliveira", date: "Hoje, 14:32", total: "R$ 312,80", payment: "Pago", status: "Em preparação" },
  { id: "#ER-0107", customer: "Caio Nascimento", date: "Hoje, 11:08", total: "R$ 117,50", payment: "Pago", status: "Enviado" },
  { id: "#ER-0106", customer: "Lara Martins", date: "Ontem, 18:45", total: "R$ 154,90", payment: "Pendente", status: "Aguardando pagamento" },
  { id: "#ER-0105", customer: "João Pedro", date: "12 Ago, 09:17", total: "R$ 470,20", payment: "Pago", status: "Entregue" },
];

export default function Admin() {
  const [active, setActive] = useState("Visão geral");
  const [query, setQuery] = useState("");
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [couponActive, setCouponActive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredProducts = useMemo(() => adminProducts.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const navItems = [
    { label: "Visão geral", icon: LayoutDashboard },
    { label: "Pedidos", icon: ClipboardList },
    { label: "Produtos", icon: Package },
    { label: "Clientes", icon: Users },
    { label: "Cupons", icon: Tag },
    { label: "Aparência", icon: Palette },
    { label: "Newsletter", icon: Mail },
  ];

  function selectNav(label: string) {
    setActive(label);
    setMenuOpen(false);
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-brand"><Link href="/">ERAS<span>.</span></Link><small>ADMIN</small></div>
        <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "active" : ""} onClick={() => selectNav(label)}><Icon size={17} />{label}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button onClick={() => toast.info("Configurações do painel em breve.")}><Settings2 size={17} />Configurações</button><Link href="/" className="back-store"><ArrowLeft size={17} />Voltar à loja</Link></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><button className="admin-mobile-menu" onClick={() => setMenuOpen((value) => !value)}><MoreHorizontal size={20} /></button><div><span className="section-kicker">PAINEL ERAS LABEL</span><h1>{active}</h1></div><div className="admin-header-actions"><span className="admin-avatar">K</span><span>Kinho</span><ChevronDown size={15} /></div></header>
        {active === "Visão geral" && <>
          <div className="admin-welcome"><div><p className="section-kicker">QUARTA-FEIRA, 13 DE AGOSTO</p><h2>Bom dia, Kinho.</h2><p>A sua loja está em movimento. Aqui está o resumo da operação.</p></div><Button onClick={() => selectNav("Produtos")}><Plus size={16} /> Novo produto</Button></div>
          <div className="metric-grid"><div className="metric-card"><span>Faturamento (30 dias)</span><strong>R$ 8.492,40</strong><small className="positive">+18,4% comparado ao período anterior</small></div><div className="metric-card"><span>Pedidos</span><strong>48</strong><small className="positive">+12,1% comparado ao período anterior</small></div><div className="metric-card"><span>Ticket médio</span><strong>R$ 176,92</strong><small>estável nas últimas 4 semanas</small></div><div className="metric-card"><span>Clientes ativos</span><strong>274</strong><small className="positive">+32 novos este mês</small></div></div>
          <div className="admin-dashboard-grid"><section className="admin-panel chart-panel"><div className="panel-heading"><div><span className="section-kicker">VENDAS</span><h3>Faturamento por período</h3></div><button className="period-button">Últimos 30 dias <ChevronDown size={14} /></button></div><div className="fake-chart"><div className="chart-axis"><span>10k</span><span>7,5k</span><span>5k</span><span>2,5k</span><span>0</span></div><div className="chart-bars">{[32, 45, 39, 62, 48, 76, 55, 68, 53, 82, 63, 91].map((height, index) => <div className="chart-bar-wrap" key={index}><div className="chart-bar" style={{ height: `${height}%` }} /><span>{index + 1}–{index + 3}</span></div>)}</div></div></section><section className="admin-panel"><div className="panel-heading"><div><span className="section-kicker">ATENÇÃO</span><h3>Pedidos recentes</h3></div><button className="inline-link" onClick={() => selectNav("Pedidos")}>Ver todos <ArrowLeft size={13} className="rotate-180" /></button></div><div className="mini-orders">{orders.slice(0, 3).map((order) => <div className="mini-order" key={order.id}><div className="order-icon"><ShoppingCart size={15} /></div><div><strong>{order.id} · {order.customer}</strong><span>{order.date}</span></div><b>{order.total}</b></div>)}</div></section></div>
          <section className="admin-panel quick-panel"><div className="panel-heading"><div><span className="section-kicker">ATALHOS</span><h3>Próximos passos</h3></div></div><div className="quick-actions"><button onClick={() => selectNav("Produtos")}><Package size={19} /><span><strong>Adicionar produto</strong><small>Cadastre uma nova peça no catálogo</small></span><ArrowLeft className="rotate-180" size={16} /></button><button onClick={() => selectNav("Aparência")}><ImagePlus size={19} /><span><strong>Atualizar home</strong><small>Troque o editorial ou reorganize a galeria</small></span><ArrowLeft className="rotate-180" size={16} /></button><button onClick={() => selectNav("Newsletter")}><Mail size={19} /><span><strong>Ver inscritos</strong><small>Acompanhe a lista e os cupons enviados</small></span><ArrowLeft className="rotate-180" size={16} /></button></div></section>
        </>}
        {active === "Produtos" && <section className="admin-content"><div className="content-toolbar"><div className="search-box"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto" /></div><Button onClick={() => toast.success("Formulário de novo produto aberto.")}><Plus size={16} /> Novo produto</Button></div><div className="admin-panel table-panel"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.name}><td><div className="table-product"><div className="table-thumb"><Package size={16} /></div><div><strong>{product.name}</strong><span>{product.collection}</span></div></div></td><td>{product.category}</td><td>{product.price}</td><td><span className={product.stock === 0 ? "stock-danger" : product.stock < 6 ? "stock-warning" : "stock-ok"}>{product.stock} un.</span></td><td><span className={`status-pill ${product.status === "Esgotado" ? "danger" : "success"}`}>{product.status}</span></td><td><button className="table-more" onClick={() => toast.info(`Ações de ${product.name}`)}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section>}
        {active === "Pedidos" && <section className="admin-content"><div className="order-cards"><div className="metric-card"><span>Todos os pedidos</span><strong>108</strong></div><div className="metric-card"><span>Aguardando pagamento</span><strong>6</strong></div><div className="metric-card"><span>Em preparação</span><strong>11</strong></div><div className="metric-card"><span>Enviados</span><strong>21</strong></div></div><div className="admin-panel table-panel"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.date}</td><td>{order.total}</td><td><span className={order.payment === "Pago" ? "stock-ok" : "stock-warning"}>{order.payment}</span></td><td><span className="status-pill success">{order.status}</span></td><td><button className="table-more" onClick={() => toast.info(`Detalhes do pedido ${order.id}`)}><Eye size={17} /></button></td></tr>)}</tbody></table></div></section>}
        {active === "Cupons" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">DESCONTOS</span><h2 className="content-title">Cupons de desconto</h2></div><Button onClick={() => toast.success("Novo cupom criado.")}><Plus size={16} /> Criar cupom</Button></div><div className="coupon-admin-grid"><div className="admin-panel coupon-admin-card"><div className="coupon-code">ERAS10 <span className="status-pill success">Ativo</span></div><p>10% de desconto para novos inscritos da newsletter.</p><div className="coupon-info"><span>Usos <strong>34 / ilimitado</strong></span><span>Válido até <strong>31 Dez 2026</strong></span></div><button className="coupon-toggle" onClick={() => setCouponActive((value) => !value)}>{couponActive ? "Desativar cupom" : "Ativar cupom"}</button></div><div className="admin-panel coupon-admin-card"><div className="coupon-code">PARADOX20 <span className="status-pill warning">Rascunho</span></div><p>20% no lançamento da coleção Paradox.</p><div className="coupon-info"><span>Usos <strong>0 / 100</strong></span><span>Válido até <strong>14 Ago 2026</strong></span></div><button className="coupon-toggle" onClick={() => toast.success("Cupom publicado.")}>Publicar cupom</button></div></div></section>}
        {active === "Aparência" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">EDITOR DA LOJA</span><h2 className="content-title">Aparência</h2></div><Button onClick={() => { setAppearanceSaved(true); toast.success("Alterações guardadas."); }}>Guardar alterações</Button></div><div className="appearance-grid"><div className="admin-panel appearance-panel"><div className="panel-heading"><div><span className="section-kicker">HOME</span><h3>Hero principal</h3></div><button className="inline-link"><Eye size={15} /> Pré-visualizar</button></div><div className="appearance-preview"><div className="preview-label">REVIVER.<br /><em>REINVENTAR</em><br />ERAS.</div><div className="preview-controls"><button><ImagePlus size={15} /> Trocar imagem</button><button><Eye size={15} /> Ver no site</button></div></div><div className="editor-field"><label>Título principal</label><Input defaultValue="REVIVER. REINVENTAR ERAS." /></div><div className="editor-field"><label>Texto de apoio</label><Input defaultValue="A ERA EM CURSO · 2026" /></div></div><div className="admin-panel appearance-panel"><div className="panel-heading"><div><span className="section-kicker">EDITORIAIS</span><h3>Galeria da home</h3></div><button className="icon-button"><Plus size={18} /></button></div><div className="editorial-list">{['Editorial Paradox', 'Arquivo Lost Between Eras', 'Próximo encontro'].map((item, index) => <div className="editorial-item" draggable key={item}><span className="drag-handle">⋮⋮</span><div className={`editorial-swatch swatch-${index}`} /><span>{item}</span><MoreHorizontal size={16} /></div>)}</div><p className="editor-help">Arraste os blocos para reordenar os conteúdos da página inicial.</p></div></div>{appearanceSaved && <p className="saved-note">As últimas alterações foram guardadas agora.</p>}</section>}
        {active === "Newsletter" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">RELACIONAMENTO</span><h2 className="content-title">Newsletter</h2></div><Button onClick={() => toast.success("Exportação preparada.")}>Exportar lista</Button></div><div className="newsletter-admin-top"><div className="metric-card"><span>Total de inscritos</span><strong>1.284</strong><small className="positive">+83 este mês</small></div><div className="metric-card"><span>Cupons enviados</span><strong>1.276</strong><small>ERAS10 · 10% OFF</small></div><div className="metric-card"><span>Taxa de abertura</span><strong>68,4%</strong><small className="positive">acima da média</small></div></div><div className="admin-panel table-panel"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Inscrição</th><th>Cupom</th><th>Status</th></tr></thead><tbody>{[['Marina Oliveira','marina@email.com','Hoje, 13:48'],['Caio Nascimento','caio@email.com','Hoje, 11:02'],['Lara Martins','lara@email.com','Ontem, 18:45'],['João Pedro','joao@email.com','12 Ago, 09:17']].map(([name, email, date]) => <tr key={email}><td><strong>{name}</strong></td><td>{email}</td><td>{date}</td><td><span className="coupon-mini">ERAS10</span></td><td><span className="status-pill success">Enviado</span></td></tr>)}</tbody></table></div></section>}
        {active === "Clientes" && <section className="admin-content"><div className="empty-admin"><Users size={31} /><h2>Base de clientes</h2><p>Os clientes que criarem uma conta e realizarem pedidos aparecerão aqui.</p><Button onClick={() => toast.info("Exportação de clientes em breve.")}>Exportar clientes</Button></div></section>}
      </main>
    </div>
  );
}
