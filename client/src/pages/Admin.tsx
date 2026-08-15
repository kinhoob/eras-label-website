import { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const orders = [
  { id: "#ER-0108", customer: "Marina Oliveira", date: "Hoje, 14:32", total: "R$ 312,80", payment: "Pago", status: "Em preparação" },
  { id: "#ER-0107", customer: "Caio Nascimento", date: "Hoje, 11:08", total: "R$ 117,50", payment: "Pago", status: "Enviado" },
  { id: "#ER-0106", customer: "Lara Martins", date: "Ontem, 18:45", total: "R$ 154,90", payment: "Pendente", status: "Aguardando pagamento" },
  { id: "#ER-0105", customer: "João Pedro", date: "12 Ago, 09:17", total: "R$ 470,20", payment: "Pago", status: "Entregue" },
];

function EmailLogsSection() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [templateType, setTemplateType] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data: logs = [], isLoading, refetch } = trpc.admin.listEmailLogs.useQuery({
    search: search.trim() !== "" ? search : undefined,
    status,
    templateType,
    sort,
  });

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">INFRAESTRUTURA</span>
          <h2 className="content-title">Histórico de E-mails (Resend)</h2>
        </div>
        <Button onClick={() => void refetch()} variant="outline">Atualizar lista</Button>
      </div>

      <div className="admin-filter-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Pesquisar</label>
          <input
            type="text"
            placeholder="Destinatário, assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', background: '#fff' }}
          >
            <option value="all">Todos os status</option>
            <option value="sent">Enviado (sent)</option>
            <option value="failed">Falha (failed)</option>
            <option value="skipped_not_configured">Não configurado (skipped)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Tipo de Template</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', background: '#fff' }}
          >
            <option value="all">Todos os tipos</option>
            <option value="order_confirmation">Confirmação de Pedido</option>
            <option value="payment_confirmation">Confirmação de Pagamento</option>
            <option value="admin_order">Aviso ao Administrador</option>
            <option value="newsletter_welcome">Newsletter de Boas-vindas</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Ordenar por</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', background: '#fff' }}
          >
            <option value="newest">Mais recentes primeiro</option>
            <option value="oldest">Mais antigos primeiro</option>
          </select>
        </div>
      </div>

      <div className="admin-panel table-panel">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>A carregar histórico de e-mails...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#666' }}>
            <Mail size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p>Nenhum e-mail corresponde aos filtros selecionados.</p>
            <button
              onClick={() => { setSearch(""); setStatus("all"); setTemplateType("all"); setSort("newest"); }}
              style={{ marginTop: '0.75rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#111', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Destinatário</th>
                <th>Assunto</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const dateStr = log.createdAt ? new Date(Number(log.createdAt)).toLocaleString("pt-BR") : "Recentemente";
                const isSuccess = log.status === "sent";
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.85rem', color: '#555' }}>{dateStr}</td>
                    <td><strong>{log.recipient}</strong></td>
                    <td>{log.subject}</td>
                    <td><span className="coupon-mini">{log.templateType}</span></td>
                    <td>
                      <span className={`status-pill ${isSuccess ? "success" : "danger"}`}>
                        {isSuccess ? "Enviado" : "Falhou"}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#666', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.providerResponse || undefined}>
                      {log.providerResponse || "Sucesso"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

type AdminProductOption = { id: number; name: string; collection: string; category: string; price: string; stock: number | null; status: string; images: string[] };
type EditableBanner = { id: string; eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string };
type EditableHighlight = { id: string; productId: number; label: string };
type EditableVipBanner = Omit<EditableBanner, "id">;
const defaultEditableBanners: EditableBanner[] = [
  { id: "drafts", eyebrow: "NOVA ERA · 2026", title: "DRAFTS JÁ DISPONÍVEL", subtitle: "Uma nova coleção em movimento.", imageUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2000&q=90", href: "#shop", cta: "EXPLORAR AGORA" },
  { id: "paradox", eyebrow: "PARADOX COLLECTION", title: "REVIVER. REINVENTAR.", subtitle: "Peças para atravessar o tempo presente.", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90", href: "#shop", cta: "VER COLEÇÃO" },
];
const defaultEditableVipBanner: EditableVipBanner = { eyebrow: "ACESSO ANTECIPADO", title: "ENTRE PARA O GRUPO VIP", subtitle: "Lançamentos, bastidores e as próximas eras primeiro.", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90", href: "https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t", cta: "ENTRAR NO WHATSAPP" };
const defaultEditableHighlights: EditableHighlight[] = [
  { id: "highlight-1", productId: 1, label: "PEÇA-CHAVE" },
  { id: "highlight-2", productId: 2, label: "MAIS VISTO" },
  { id: "highlight-3", productId: 5, label: "ARQUIVO" },
];

export default function Admin() {
  const [active, setActive] = useState("Visão geral");
  const [query, setQuery] = useState("");
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [couponActive, setCouponActive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&q=80&w=1200");
  const [homeBanners, setHomeBanners] = useState<EditableBanner[]>(defaultEditableBanners);
  const [homeHighlights, setHomeHighlights] = useState<EditableHighlight[]>(defaultEditableHighlights);
  const [homeVipBanner, setHomeVipBanner] = useState<EditableVipBanner>(defaultEditableVipBanner);

  const { data: commercialConfig } = trpc.catalog.getConfig.useQuery();
  const { data: homeContent } = trpc.catalog.getHomeContent.useQuery();
  const { data: catalogProducts = [], isLoading: catalogProductsLoading } = trpc.admin.listProducts.useQuery();
  const utils = trpc.useUtils();
  const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(350);

  // Sincronizar quando o dado carregar
  useEffect(() => {
    if (commercialConfig) {
      setPixDiscountPercent(commercialConfig.pixDiscountPercent);
      setFreeShippingThreshold(commercialConfig.freeShippingThreshold);
    }
  }, [commercialConfig]);
  useEffect(() => {
    if (homeContent) {
      if (homeContent.banners?.length) setHomeBanners(homeContent.banners as EditableBanner[]);
      if (homeContent.highlights?.length) setHomeHighlights(homeContent.highlights as EditableHighlight[]);
      if (homeContent.vipBanner) setHomeVipBanner(homeContent.vipBanner as EditableVipBanner);
    }
  }, [homeContent]);

  const saveConfigMutation = trpc.admin.saveConfig.useMutation();
  const saveHomeContentMutation = trpc.admin.saveHomeContent.useMutation();
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productUploading, setProductUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.admin.uploadImage.useMutation();
  const saveProductMutation = trpc.admin.saveProduct.useMutation();

  function handleHomeImageUpload(event: React.ChangeEvent<HTMLInputElement>, target: "banner" | "vip", index?: number) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O ficheiro é muito grande. Escolha uma imagem de até 5MB.");
      return;
    }
    const reader = new FileReader();
    setUploading(true);
    reader.onload = () => {
      uploadMutation.mutate({ fileName: file.name, fileBase64: reader.result as string, contentType: file.type || "image/png" }, {
        onSuccess: (res) => {
          setUploading(false);
          if (target === "vip") setHomeVipBanner((current) => ({ ...current, imageUrl: res.url }));
          if (target === "banner" && typeof index === "number") setHomeBanners((current) => current.map((banner, bannerIndex) => bannerIndex === index ? { ...banner, imageUrl: res.url } : banner));
          toast.success("Imagem da Home carregada com sucesso.");
        },
        onError: () => { setUploading(false); toast.error("Não foi possível carregar a imagem."); },
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("O ficheiro é muito grande. Escolha uma imagem de até 5MB.");
      return;
    }

    const reader = new FileReader();
    setUploading(true);
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type || "image/png",
      }, {
        onSuccess: (res) => {
          setUploading(false);
          setHeroImage(res.url);
          toast.success("Imagem carregada e guardada no armazenamento com sucesso!");
        },
        onError: () => {
          setUploading(false);
          toast.error("Não foi possível carregar a imagem. Tente novamente.");
        }
      });
    };
    reader.readAsDataURL(file);
  }

  function handleMultipleProductUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setProductUploading(true);
    let uploadedCount = 0;
    const newImages = [...productImages];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        uploadMutation.mutate({
          fileName: file.name,
          fileBase64: base64,
          contentType: file.type || "image/png",
        }, {
          onSuccess: (res) => {
            newImages.push(res.url);
            uploadedCount++;
            if (uploadedCount === files.length) {
              setProductImages(newImages);
              setProductUploading(false);
              toast.success(`${files.length} imagem(ns) carregada(s) com sucesso para o produto!`);
            }
          },
          onError: () => {
            uploadedCount++;
            if (uploadedCount === files.length) {
              setProductUploading(false);
              toast.error("Algumas imagens não puderam ser carregadas.");
            }
          }
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const adminProducts = useMemo<AdminProductOption[]>(() => catalogProducts.map((product) => ({
    id: product.id,
    name: product.name,
    collection: product.collection,
    category: product.category,
    price: Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    stock: null,
    status: product.status === "active" ? "Publicado" : product.status === "soldout" ? "Esgotado" : "Rascunho",
    images: Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === "string" && image.length > 0) : [],
  })), [catalogProducts]);
  const filteredProducts = useMemo(() => adminProducts.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())), [adminProducts, query]);
  const navItems = [
    { label: "Visão geral", icon: LayoutDashboard },
    { label: "Pedidos", icon: ClipboardList },
    { label: "Produtos", icon: Package },
    { label: "Clientes", icon: Users },
    { label: "Cupons", icon: Tag },
    { label: "Aparência", icon: Palette },
    { label: "Newsletter", icon: Mail },
    { label: "E-mails (Resend)", icon: Mail },
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
        {active === "Produtos" && <section className="admin-content"><div className="content-toolbar"><div className="search-box"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar produto" /></div><Button onClick={() => {
          setEditingProduct({ name: "", collection: "PARADOX COLLECTION", category: "Camisetas", price: 154.90, pixPrice: 147.15, description: "Peça de vestuário streetwear com acabamento premium.", status: "Publicado" });
          setProductImages([]);
        }}><Plus size={16} /> Novo produto</Button></div><div className="admin-panel table-panel"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.name}><td><div className="table-product"><div className="table-thumb">{product.images[0] ? <img src={product.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package size={16} />}</div><div><strong>{product.name}</strong><span>{product.collection}</span></div></div></td><td>{product.category}</td><td>{product.price}</td><td><span className="stock-ok">{product.stock === null ? "Consultar variações" : `${product.stock} un.`}</span></td><td><span className={`status-pill ${product.status === "Esgotado" ? "danger" : "success"}`}>{product.status}</span></td><td><button className="table-more" onClick={() => {
          setEditingProduct({ id: product.id, name: product.name, collection: product.collection, category: product.category, price: 154.90, pixPrice: 147.15, description: "Peça de vestuário streetwear com acabamento premium.", status: product.status });
          setProductImages(product.images);
        }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section>}

        {editingProduct && (
          <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="admin-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '2rem' }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">GESTÃO DE CATÁLOGO</span>
                  <h3>{editingProduct.name ? `Editar: ${editingProduct.name}` : "Novo Produto"}</h3>
                </div>
                <button onClick={() => setEditingProduct(null)} className="table-more">✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="editor-field">
                  <label>Nome do produto</label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                </div>
                <div className="editor-field">
                  <label>Coleção</label>
                  <Input value={editingProduct.collection} onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })} />
                </div>
                <div className="editor-field">
                  <label>Categoria</label>
                  <Input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} />
                </div>
                <div className="editor-field">
                  <label>Preço normal (R$)</label>
                  <Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="editor-field">
                  <label>Preço PIX (R$)</label>
                  <Input type="number" value={editingProduct.pixPrice} onChange={(e) => setEditingProduct({ ...editingProduct, pixPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="editor-field">
                  <label>Status</label>
                  <select style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} value={editingProduct.status} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}>
                    <option value="Publicado">Publicado</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Esgotado">Esgotado</option>
                  </select>
                </div>
              </div>

              <div className="editor-field" style={{ marginTop: '1rem' }}>
                <label>Descrição do produto</label>
                <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              </div>

              <div className="editor-field" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label>Galeria de Fotos do Produto ({productImages.length})</label>
                  <input type="file" ref={productFileInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleMultipleProductUpload} />
                  <Button type="button" onClick={() => productFileInputRef.current?.click()} disabled={productUploading}>
                    <Upload size={14} /> {productUploading ? "A carregar fotos..." : "Adicionar fotos"}
                  </Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {productImages.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: idx === 0 ? '2px solid #b34125' : '1px solid #ddd', height: '110px', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '75px', overflow: 'hidden', position: 'relative' }}>
                        <img src={url} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {idx === 0 && <span style={{ position: 'absolute', bottom: 2, left: 2, background: '#b34125', color: '#fff', fontSize: '9px', padding: '1px 4px', borderRadius: '3px' }}>Capa</span>}
                        <button 
                          type="button" 
                          onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remover foto"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#f0f0f0', fontSize: '11px' }}>
                        <button 
                          type="button" 
                          disabled={idx === 0}
                          onClick={() => {
                            const arr = [...productImages];
                            const temp = arr[idx];
                            arr[idx] = arr[idx - 1];
                            arr[idx - 1] = temp;
                            setProductImages(arr);
                          }}
                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          ◀ Mover
                        </button>
                        <button 
                          type="button" 
                          disabled={idx === productImages.length - 1}
                          onClick={() => {
                            const arr = [...productImages];
                            const temp = arr[idx];
                            arr[idx] = arr[idx + 1];
                            arr[idx + 1] = temp;
                            setProductImages(arr);
                          }}
                          style={{ background: 'none', border: 'none', cursor: idx === productImages.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === productImages.length - 1 ? 0.3 : 1 }}
                        >
                          Mover ▶
                        </button>
                      </div>
                    </div>
                  ))}
                  {productImages.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', color: '#666', fontSize: '0.85rem', fontStyle: 'italic' }}>Nenhuma foto adicionada. Clique em "Adicionar fotos" para carregar imagens em alta resolução.</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button onClick={() => {
                  saveProductMutation.mutate({
                    ...editingProduct,
                    images: productImages,
                  }, {
                    onSuccess: (res) => {
                      void Promise.all([
                        utils.admin.listProducts.invalidate(),
                        utils.catalog.list.invalidate(),
                      ]);
                      toast.success(res.message);
                      setEditingProduct(null);
                    },
                    onError: () => {
                      toast.error("Erro ao guardar o produto. Tente novamente.");
                    }
                  });
                }}>Guardar produto</Button>
              </div>
            </div>
          </div>
        )}
        {active === "Pedidos" && <section className="admin-content"><div className="order-cards"><div className="metric-card"><span>Todos os pedidos</span><strong>108</strong></div><div className="metric-card"><span>Aguardando pagamento</span><strong>6</strong></div><div className="metric-card"><span>Em preparação</span><strong>11</strong></div><div className="metric-card"><span>Enviados</span><strong>21</strong></div></div><div className="admin-panel table-panel"><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.date}</td><td>{order.total}</td><td><span className={order.payment === "Pago" ? "stock-ok" : "stock-warning"}>{order.payment}</span></td><td><span className="status-pill success">{order.status}</span></td><td><button className="table-more" onClick={() => toast.info(`Detalhes do pedido ${order.id}`)}><Eye size={17} /></button></td></tr>)}</tbody></table></div></section>}
        {active === "Cupons" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">DESCONTOS</span><h2 className="content-title">Cupons de desconto</h2></div><Button onClick={() => toast.success("Novo cupom criado.")}><Plus size={16} /> Criar cupom</Button></div><div className="coupon-admin-grid"><div className="admin-panel coupon-admin-card"><div className="coupon-code">ERAS10 <span className="status-pill success">Ativo</span></div><p>10% de desconto para novos inscritos da newsletter.</p><div className="coupon-info"><span>Usos <strong>34 / ilimitado</strong></span><span>Válido até <strong>31 Dez 2026</strong></span></div><button className="coupon-toggle" onClick={() => setCouponActive((value) => !value)}>{couponActive ? "Desativar cupom" : "Ativar cupom"}</button></div><div className="admin-panel coupon-admin-card"><div className="coupon-code">PARADOX20 <span className="status-pill warning">Rascunho</span></div><p>20% no lançamento da coleção Paradox.</p><div className="coupon-info"><span>Usos <strong>0 / 100</strong></span><span>Válido até <strong>14 Ago 2026</strong></span></div><button className="coupon-toggle" onClick={() => toast.success("Cupom publicado.")}>Publicar cupom</button></div></div></section>}
        {active === "Aparência" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">EDITOR DA LOJA</span><h2 className="content-title">Home oficial e banners</h2></div><Button onClick={() => {
          saveConfigMutation.mutate({ pixDiscountPercent: Number(pixDiscountPercent), freeShippingThreshold: Number(freeShippingThreshold) }, { onSuccess: () => setAppearanceSaved(true), onError: () => toast.error("Erro ao guardar configurações comerciais.") });
          saveHomeContentMutation.mutate({ banners: homeBanners, highlights: homeHighlights, vipBanner: homeVipBanner }, { onSuccess: () => { void utils.catalog.getHomeContent.invalidate(); setAppearanceSaved(true); toast.success("Home, banners e bloco VIP guardados."); }, onError: () => toast.error("Erro ao guardar o conteúdo da Home.") });
        }}>Guardar alterações</Button></div><div className="appearance-grid"><div className="admin-panel appearance-panel"><div className="panel-heading"><div><span className="section-kicker">CONFIGURAÇÕES COMERCIAIS</span><h3>Pix e Frete Grátis</h3></div></div><div className="editor-field"><label>Porcentagem de Desconto no Pix (%)</label><Input type="number" min="0" max="100" value={pixDiscountPercent} onChange={(event) => setPixDiscountPercent(Number(event.target.value))} /></div><div className="editor-field"><label>Valor Mínimo para Frete Grátis (R$)</label><Input type="number" min="0" step="10" value={freeShippingThreshold} onChange={(event) => setFreeShippingThreshold(Number(event.target.value))} /></div></div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">BANNER ROTATIVO</span><h3>Carrossel principal da Home</h3></div><span className="editor-help">{homeBanners.length} slides</span></div>{homeBanners.map((banner, index) => <div className="home-editor-banner" key={banner.id}><div className="home-editor-banner-preview" style={{ backgroundImage: "url(" + banner.imageUrl + ")" }}><span>{String(index + 1).padStart(2, "0")}</span><label><input type="file" accept="image/*" onChange={(event) => handleHomeImageUpload(event, "banner", index)} />{uploading ? "A carregar..." : "Trocar imagem"}</label></div><div className="home-editor-fields"><Input value={banner.eyebrow} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, eyebrow: event.target.value } : item))} placeholder="Etiqueta" /><Input value={banner.title} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Título" /><Input value={banner.subtitle} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item))} placeholder="Texto de apoio" /><div className="home-editor-inline"><Input value={banner.cta} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, cta: event.target.value } : item))} placeholder="CTA" /><Input value={banner.href} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value } : item))} placeholder="Link" /></div></div></div>)}</div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">DESTAQUES</span><h3>Curadoria da Home</h3></div><span className="editor-help">{homeHighlights.length} cards</span></div><p className="editor-description">Escolha os produtos que aparecem no bloco Destaques e defina a etiqueta exibida sobre cada peça.</p>{catalogProductsLoading && <p className="editor-description">A carregar o catálogo real…</p>}{!catalogProductsLoading && adminProducts.length === 0 && <p className="editor-description">Ainda não existem produtos persistidos no catálogo para selecionar.</p>}{homeHighlights.map((highlight, index) => <div className="highlight-editor-row" key={highlight.id}><span className="highlight-editor-index">{String(index + 1).padStart(2, "0")}</span><select value={highlight.productId} onChange={(event) => setHomeHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, productId: Number(event.target.value) } : item))} aria-label={`Produto do destaque ${index + 1}`}>{adminProducts.length > 0 ? adminProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.collection}</option>) : <option value={highlight.productId}>Produto não disponível (ID {highlight.productId})</option>}</select><Input value={highlight.label} onChange={(event) => setHomeHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value.toUpperCase() } : item))} placeholder="Etiqueta" aria-label={`Etiqueta do destaque ${index + 1}`} /><button type="button" className="highlight-remove-button" onClick={() => setHomeHighlights((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current)} aria-label={`Remover destaque ${index + 1}`}>×</button></div>)}<button type="button" className="highlight-add-button" onClick={() => setHomeHighlights((current) => [...current, { id: `highlight-${Date.now()}`, productId: adminProducts[current.length % adminProducts.length].id, label: "NOVA PEÇA" }])} disabled={homeHighlights.length >= 6 || adminProducts.length === 0}><Plus size={15} /> Adicionar destaque</button></div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">BANNER VIP</span><h3>Grupo e acesso antecipado</h3></div></div><div className="home-editor-banner vip-editor-banner"><div className="home-editor-banner-preview" style={{ backgroundImage: "url(" + homeVipBanner.imageUrl + ")" }}><label><input type="file" accept="image/*" onChange={(event) => handleHomeImageUpload(event, "vip")} />{uploading ? "A carregar..." : "Trocar imagem"}</label></div><div className="home-editor-fields"><Input value={homeVipBanner.eyebrow} onChange={(event) => setHomeVipBanner((current) => ({ ...current, eyebrow: event.target.value }))} placeholder="Etiqueta" /><Input value={homeVipBanner.title} onChange={(event) => setHomeVipBanner((current) => ({ ...current, title: event.target.value }))} placeholder="Título" /><Input value={homeVipBanner.subtitle} onChange={(event) => setHomeVipBanner((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Texto de apoio" /><div className="home-editor-inline"><Input value={homeVipBanner.cta} onChange={(event) => setHomeVipBanner((current) => ({ ...current, cta: event.target.value }))} placeholder="CTA" /><Input value={homeVipBanner.href} onChange={(event) => setHomeVipBanner((current) => ({ ...current, href: event.target.value }))} placeholder="Link do grupo VIP" /></div></div></div></div></div>{appearanceSaved && <p className="saved-note"><Check size={14} /> As alterações da Home foram guardadas.</p>}</section>}
        {active === "Newsletter" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">RELACIONAMENTO</span><h2 className="content-title">Newsletter</h2></div><Button onClick={() => toast.success("Exportação preparada.")}>Exportar lista</Button></div><div className="newsletter-admin-top"><div className="metric-card"><span>Total de inscritos</span><strong>1.284</strong><small className="positive">+83 este mês</small></div><div className="metric-card"><span>Cupons enviados</span><strong>1.276</strong><small>ERAS10 · 10% OFF</small></div><div className="metric-card"><span>Taxa de abertura</span><strong>68,4%</strong><small className="positive">acima da média</small></div></div><div className="admin-panel table-panel"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Inscrição</th><th>Cupom</th><th>Status</th></tr></thead><tbody>{[['Marina Oliveira','marina@email.com','Hoje, 13:48'],['Caio Nascimento','caio@email.com','Hoje, 11:02'],['Lara Martins','lara@email.com','Ontem, 18:45'],['João Pedro','joao@email.com','12 Ago, 09:17']].map(([name, email, date]) => <tr key={email}><td><strong>{name}</strong></td><td>{email}</td><td>{date}</td><td><span className="coupon-mini">ERAS10</span></td><td><span className="status-pill success">Enviado</span></td></tr>)}</tbody></table></div></section>}
        {active === "E-mails (Resend)" && <EmailLogsSection />}
        {active === "Clientes" && <section className="admin-content"><div className="empty-admin"><Users size={31} /><h2>Base de clientes</h2><p>Os clientes que criarem uma conta e realizarem pedidos aparecerão aqui.</p><Button onClick={() => toast.info("Exportação de clientes em breve.")}>Exportar clientes</Button></div></section>}
      </main>
    </div>
  );
}
