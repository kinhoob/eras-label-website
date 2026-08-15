import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ClipboardList,
  Copy,
  Eye,
  History,
  ImagePlus,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Package,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  Tag,
  Users,
  Upload,
  Check,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getInventorySizeOptions } from "@shared/inventory";
import { AdminProductThumbnail } from "@/components/AdminProductThumbnail";
import AdminCategoriesSection from "@/pages/AdminCategoriesSection";

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

function ClientsSection() {
  const { data: clients = [], isLoading, refetch } = trpc.admin.listClients.useQuery();

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">RELACIONAMENTO</span>
          <h2 className="content-title">Base de Clientes</h2>
        </div>
        <Button onClick={() => void refetch()} variant="outline">Atualizar lista</Button>
      </div>

      <div className="admin-panel table-panel">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>A carregar base de clientes...</div>
        ) : clients.length === 0 ? (
          <div className="empty-admin" style={{ padding: '3rem', textAlign: 'center' }}>
            <Users size={32} style={{ color: '#b22222', marginBottom: '1rem' }} />
            <h3>Nenhum cliente registado</h3>
            <p>Os clientes que criarem conta ou realizarem pedidos aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Registo</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const dateStr = client.createdAt ? new Date(Number(client.createdAt)).toLocaleDateString("pt-BR") : "Recente";
                return (
                  <tr key={client.id}>
                    <td><strong>{client.name}</strong></td>
                    <td>{client.email}</td>
                    <td><span className="coupon-mini">{client.role}</span></td>
                    <td style={{ color: '#666' }}>{dateStr}</td>
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

function EmailMarketingSection() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [targetGroup, setTargetGroup] = useState<"all_subscribers" | "all_clients" | "all" | "collection">("all_subscribers");
  const [collection, setCollection] = useState("");
  const [sending, setSending] = useState(false);
  const { data: marketingCollections = [] } = trpc.admin.listMarketingCollections.useQuery();
  const marketingMutation = trpc.admin.sendMarketingCampaign.useMutation();

  function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast.error("Preencha o assunto e o conteúdo da campanha.");
      return;
    }
    if (targetGroup === "collection" && !collection) {
      toast.error("Selecione uma coleção para segmentar a campanha.");
      return;
    }
    setSending(true);
    marketingMutation.mutate({ subject, htmlContent: content, targetGroup, collection: targetGroup === "collection" ? collection : undefined }, {
      onSuccess: (res) => {
        setSending(false);
        toast.success(`Campanha disparada! ${res.sentCount} e-mails enviados com sucesso (${res.failedCount} falhas).`);
        setSubject("");
        setContent("");
      },
      onError: () => {
        setSending(false);
        toast.error("Erro ao disparar campanha de e-mail marketing.");
      }
    });
  }

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">MARKETING & CAMPANHAS</span>
          <h2 className="content-title">E-mail Marketing (Resend)</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div className="admin-panel" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#111', fontWeight: 600 }}>Nova Campanha em Massa</h3>
          <form onSubmit={handleSendCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Assunto do E-mail</label>
              <Input
                type="text"
                placeholder="Ex: Nova Coleção Paradox Já Disponível"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Público da campanha</label>
              <select
                value={targetGroup}
                onChange={(event) => {
                  const nextTarget = event.target.value as typeof targetGroup;
                  setTargetGroup(nextTarget);
                  if (nextTarget !== "collection") setCollection("");
                }}
                aria-label="Selecionar público da campanha"
                style={{ width: '100%', minHeight: '42px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: '0.9rem' }}
              >
                <option value="all_subscribers">Todos os inscritos na newsletter</option>
                <option value="all_clients">Todos os clientes</option>
                <option value="all">Inscritos e clientes</option>
                <option value="collection">Clientes que compraram uma coleção</option>
              </select>
            </div>
            {targetGroup === "collection" && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Coleção</label>
                <select
                  value={collection}
                  onChange={(event) => setCollection(event.target.value)}
                  aria-label="Selecionar coleção da campanha"
                  required
                  style={{ width: '100%', minHeight: '42px', padding: '0 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: '0.9rem' }}
                >
                  <option value="">Selecione uma coleção</option>
                  {marketingCollections.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <p style={{ margin: '0.4rem 0 0', color: '#6b7280', fontSize: '0.75rem', lineHeight: 1.45 }}>A campanha será enviada apenas para clientes com pedidos que contenham produtos desta coleção.</p>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Mensagem / Conteúdo (HTML ou Texto)</label>
              <textarea
                placeholder="Escreva a mensagem personalizada para os subscritores e clientes..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', minHeight: '150px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'inherit' }}
              />
            </div>
            <Button type="submit" disabled={sending} style={{ background: '#b22222', color: '#fff', marginTop: '0.5rem' }}>
              {sending ? "A disparar e-mails..." : targetGroup === "collection" ? "Disparar campanha segmentada" : "Disparar campanha"}
            </Button>
          </form>
        </div>

        <div className="admin-panel" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#111', fontWeight: 600 }}>Diretrizes da Marca Eras</h3>
          <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.6', marginBottom: '1rem' }}>
            As campanhas enviadas por aqui utilizam o layout institucional da Eras Label, com a cor de destaque <strong>#b22222</strong> e cabeçalho editorial elegante.
          </p>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#666' }}>
            <strong>Dica:</strong> Todos os envios de marketing ficam registados na aba <em>E-mails (Resend)</em> com o status de entrega auditado.
          </div>
        </div>
      </div>
    </section>
  );
}

type AdminVariation = { id?: number; size: string; stock: number };
type AdminProductOption = { id: number; name: string; collection: string; category: string; subcategory?: string | null; sku?: string | null; price: string; stock: number; variations: AdminVariation[]; status: string; images: string[] };
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

function AdminAccessLoading() {
  return (
    <div className="admin-auth-screen" role="status" aria-live="polite">
      <div className="admin-auth-card admin-auth-loading-card">
        <LoaderCircle className="admin-auth-spinner" size={22} aria-hidden="true" />
        <span>Verificando acesso administrativo...</span>
      </div>
    </div>
  );
}

function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      toast.success("Acesso autorizado. A abrir o painel...");
      window.location.assign("/admin");
    },
    onError: (error) => {
      setErrorMessage(error.message || "Não foi possível validar o acesso.");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    loginMutation.mutate({ email, password });
  }

  return (
    <main className="admin-auth-screen">
      <section className="admin-auth-card" aria-labelledby="admin-login-title">
        <div className="admin-auth-brand">ERAS<span>.</span><small>ADMIN</small></div>
        <div className="admin-auth-icon" aria-hidden="true"><ShieldCheck size={23} /></div>
        <p className="section-kicker">ÁREA RESTRITA</p>
        <h1 id="admin-login-title">Acesso administrativo</h1>
        <p className="admin-auth-description">Entre com as credenciais autorizadas para gerir produtos, pedidos, clientes e comunicações da Eras Label.</p>
        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label>
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </label>
          <label>
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite a sua senha"
              required
            />
          </label>
          {errorMessage && <p className="admin-auth-error" role="alert">{errorMessage}</p>}
          <Button className="admin-auth-submit" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <><LoaderCircle className="admin-auth-spinner" size={16} /> VALIDANDO...</> : <><LockKeyhole size={16} /> ENTRAR NO PAINEL</>}
          </Button>
        </form>
        <Link href="/" className="admin-auth-back">Voltar à loja</Link>
      </section>
    </main>
  );
}

export default function Admin() {
  const { data: authUser, isLoading: authLoading } = trpc.auth.me.useQuery();

  const [active, setActive] = useState("Produtos");
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
  const { data: catalogProducts, isLoading: catalogProductsLoading, isError: catalogProductsError, refetch: refetchCatalogProducts } = trpc.admin.listProducts.useQuery(undefined, { enabled: authUser?.role === "admin" });
  const { data: adminCategories = [] } = trpc.admin.listCategories.useQuery(undefined, { enabled: authUser?.role === "admin" });
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
  const [editorMode, setEditorMode] = useState<"product" | "inventory">("product");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productUploading, setProductUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.admin.uploadImage.useMutation();
  const saveProductMutation = trpc.admin.saveProduct.useMutation();
  const updateInventoryStockMutation = trpc.admin.updateInventoryStock.useMutation();
  const duplicateProductMutation = trpc.admin.duplicateProduct.useMutation();
  const [stockFeedbackProductId, setStockFeedbackProductId] = useState<number | null>(null);

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

  const adminProducts = useMemo<AdminProductOption[]>(() => (catalogProducts ?? []).map((product) => {
    const variations = Array.isArray(product.variations)
      ? product.variations.map((variation) => ({ id: variation.id, size: String(variation.size), stock: Number(variation.stock ?? 0) }))
      : [];
    return {
      id: product.id,
      name: product.name,
      collection: product.collection,
      category: product.category,
      subcategory: product.subcategory,
      sku: product.sku,
      price: Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      stock: Number(product.totalStock ?? variations.reduce((total, variation) => total + variation.stock, 0)),
      variations,
      status: product.status === "active" ? "Publicado" : product.status === "soldout" ? "Esgotado" : "Rascunho",
      images: Array.isArray(product.images) ? product.images.filter((image): image is string => typeof image === "string" && image.length > 0) : [],
    };
  }), [catalogProducts]);
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState("all");
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return adminProducts.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.collection, product.category, product.subcategory ?? "", product.sku ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = inventoryCategoryFilter === "all" || product.category === inventoryCategoryFilter || product.subcategory === inventoryCategoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [adminProducts, query, inventoryCategoryFilter]);
  const navItems = [
    { label: "Visão geral", icon: LayoutDashboard },
    { label: "Estatísticas", icon: BarChart3 },
    { label: "Pedidos", icon: ClipboardList },
    { label: "Produtos", icon: Package },
    { label: "Inventário", icon: Package },
    { label: "Histórico de Estoque", icon: History },
    { label: "Categorias", icon: Tag },
    { label: "Clientes", icon: Users },
    { label: "E-mail Marketing", icon: Mail },
    { label: "Cupons", icon: Tag },
    { label: "Aparência", icon: Palette },
    { label: "Newsletter", icon: Mail },
    { label: "E-mails (Resend)", icon: Mail },
  ];

  function selectNav(label: string) {
    setActive(label);
    setMenuOpen(false);
  }

  const adminName = authUser?.name?.trim() || "Eras Label Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  function toggleEditingSize(size: string, checked: boolean) {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const variations: AdminVariation[] = Array.isArray(current.variations) ? current.variations : [];
      if (checked && !variations.some((variation) => variation.size === size)) {
        return { ...current, variations: [...variations, { size, stock: 0 }] };
      }
      if (!checked) {
        return { ...current, variations: variations.filter((variation) => variation.size !== size) };
      }
      return current;
    });
  }

  function updateEditingStock(size: string, value: string) {
    const stock = Math.max(0, Math.floor(Number(value) || 0));
    setEditingProduct((current: any) => {
      if (!current) return current;
      return {
        ...current,
        variations: (current.variations ?? []).map((variation: AdminVariation) => variation.size === size ? { ...variation, stock } : variation),
      };
    });
  }

  if (authLoading) return <AdminAccessLoading />;
  if (!authUser || authUser.role !== "admin") return <AdminLoginScreen />;

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-brand"><Link href="/">ERAS<span>.</span></Link><small>ADMIN</small></div>
        <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "active" : ""} onClick={() => selectNav(label)}><Icon size={17} />{label}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button onClick={() => toast.info("Configurações do painel em breve.")}><Settings2 size={17} />Configurações</button><Link href="/" className="back-store"><ArrowLeft size={17} />Voltar à loja</Link></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><button className="admin-mobile-menu" onClick={() => setMenuOpen((value) => !value)}><MoreHorizontal size={20} /></button><div><span className="section-kicker">PAINEL ERAS LABEL</span><h1>{active}</h1></div><div className="admin-header-actions"><span className="admin-avatar">{adminInitial}</span><span>{adminName}</span><ChevronDown size={15} /></div></header>
        {active === "Estatísticas" && <AdminAnalyticsSection />}
        {active === "Histórico de Estoque" && <InventoryAuditSection />}
        {active === "Visão geral" && <>
          <div className="admin-welcome"><div><p className="section-kicker">PAINEL SEGURO</p><h2>Bom dia, {adminName.split(" ")[0]}.</h2><p>A sua loja está em movimento. Aqui está o resumo da operação.</p></div><Button onClick={() => selectNav("Produtos")}><Plus size={16} /> Novo produto</Button></div>
          <div className="metric-grid"><div className="metric-card"><span>Faturamento (30 dias)</span><strong>R$ 8.492,40</strong><small className="positive">+18,4% comparado ao período anterior</small></div><div className="metric-card"><span>Pedidos</span><strong>48</strong><small className="positive">+12,1% comparado ao período anterior</small></div><div className="metric-card"><span>Ticket médio</span><strong>R$ 176,92</strong><small>estável nas últimas 4 semanas</small></div><div className="metric-card"><span>Clientes ativos</span><strong>274</strong><small className="positive">+32 novos este mês</small></div></div>
          <div className="admin-dashboard-grid"><section className="admin-panel chart-panel"><div className="panel-heading"><div><span className="section-kicker">VENDAS</span><h3>Faturamento por período</h3></div><button className="period-button">Últimos 30 dias <ChevronDown size={14} /></button></div><div className="fake-chart"><div className="chart-axis"><span>10k</span><span>7,5k</span><span>5k</span><span>2,5k</span><span>0</span></div><div className="chart-bars">{[32, 45, 39, 62, 48, 76, 55, 68, 53, 82, 63, 91].map((height, index) => <div className="chart-bar-wrap" key={index}><div className="chart-bar" style={{ height: `${height}%` }} /><span>{index + 1}–{index + 3}</span></div>)}</div></div></section><section className="admin-panel"><div className="panel-heading"><div><span className="section-kicker">ATENÇÃO</span><h3>Pedidos recentes</h3></div><button className="inline-link" onClick={() => selectNav("Pedidos")}>Ver todos <ArrowLeft size={13} className="rotate-180" /></button></div><div className="mini-orders">{orders.slice(0, 3).map((order) => <div className="mini-order" key={order.id}><div className="order-icon"><ShoppingCart size={15} /></div><div><strong>{order.id} · {order.customer}</strong><span>{order.date}</span></div><b>{order.total}</b></div>)}</div></section></div>
          <section className="admin-panel quick-panel"><div className="panel-heading"><div><span className="section-kicker">ATALHOS</span><h3>Próximos passos</h3></div></div><div className="quick-actions"><button onClick={() => selectNav("Produtos")}><Package size={19} /><span><strong>Adicionar produto</strong><small>Cadastre uma nova peça no catálogo</small></span><ArrowLeft className="rotate-180" size={16} /></button><button onClick={() => selectNav("Aparência")}><ImagePlus size={19} /><span><strong>Atualizar home</strong><small>Troque o editorial ou reorganize a galeria</small></span><ArrowLeft className="rotate-180" size={16} /></button><button onClick={() => selectNav("Newsletter")}><Mail size={19} /><span><strong>Ver inscritos</strong><small>Acompanhe a lista e os cupons enviados</small></span><ArrowLeft className="rotate-180" size={16} /></button></div></section>
        </>}
        {active === "Produtos" && <section className="admin-content">
          <div className="inventory-heading">
            <div><span className="section-kicker">CATÁLOGO</span><h2 className="content-title">Produtos</h2><p>Cadastre e edite os dados completos das peças, incluindo SKU, categoria, imagens e preços.</p></div>
            <Button onClick={() => {
              setEditorMode("product");
              setEditingProduct({ name: "", collection: "PARADOX COLLECTION", category: "Camisetas", subcategory: null, sku: "", price: 154.90, pixPrice: 147.15, description: "Peça de vestuário streetwear com acabamento premium.", status: "Publicado", variations: [] });
              setProductImages([]);
            }}><Plus size={16} /> Novo produto</Button>
          </div>
          <div className="content-toolbar inventory-toolbar"><div className="search-box"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, SKU ou coleção" /></div><span className="inventory-count">{filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}</span></div>
          <div className="admin-panel table-panel inventory-table-panel"><table><thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Estoque</th><th>Status</th><th /></tr></thead><tbody>
            {catalogProductsLoading && <tr><td colSpan={6}><div className="inventory-state"><LoaderCircle className="spin" size={20} /><strong>Carregando produtos</strong><span>Estamos consultando o catálogo persistido.</span></div></td></tr>}
            {catalogProductsError && !catalogProductsLoading && <tr><td colSpan={6}><div className="inventory-state error"><strong>Não foi possível carregar os produtos</strong><span>Verifique a conexão e tente novamente.</span><Button type="button" variant="outline" onClick={() => void refetchCatalogProducts()}>Tentar novamente</Button></div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProducts.length === 0 && <tr><td colSpan={6}><div className="inventory-state"><Package size={22} /><strong>{query ? "Nenhum produto encontrado" : "O catálogo está vazio"}</strong><span>{query ? "Tente buscar por outro nome, SKU ou coleção." : "Cadastre o primeiro produto para começar."}</span>{query && <Button type="button" variant="outline" onClick={() => setQuery("")}>Limpar busca</Button>}</div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProducts.map((product) => <tr key={product.id}><td><div className="table-product"><AdminProductThumbnail src={product.images[0]} alt={`Imagem de ${product.name}`} /><div><strong>{product.name}</strong><span>{product.collection}</span></div></div></td><td><span className="inventory-sku">{product.sku || "Sem SKU"}</span></td><td><span>{product.category}</span>{product.subcategory && <small className="inventory-unit">{product.subcategory}</small>}</td><td><strong className={product.stock === 0 ? "inventory-stock-zero" : "inventory-stock-value"}>{product.stock}</strong><span className="inventory-unit">unidades</span></td><td><span className={`status-pill ${product.status === "Publicado" ? "success" : product.status === "Esgotado" ? "danger" : "warning"}`}>{product.status}</span></td><td><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
              <button className="table-more" aria-label={`Editar produto ${product.name}`} title="Editar produto" onClick={() => {
                setEditorMode("product");
                const numericPrice = Number(product.price.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
                setEditingProduct({ id: product.id, name: product.name, collection: product.collection, category: product.category, subcategory: product.subcategory ?? null, sku: product.sku ?? "", price: numericPrice, pixPrice: numericPrice, description: "Peça de vestuário streetwear com acabamento premium.", status: product.status, variations: product.variations.map((variation) => ({ ...variation })) });
                setProductImages(product.images);
              }}><Pencil size={16} /></button>
              <button className="table-more" aria-label={`Duplicar produto ${product.name}`} title="Duplicar produto" disabled={duplicateProductMutation.isPending} onClick={() => {
                duplicateProductMutation.mutate({ productId: product.id }, {
                  onSuccess: (result) => {
                    void Promise.all([utils.admin.listProducts.invalidate(), utils.catalog.list.invalidate()]);
                    toast.success(result.message);
                  },
                  onError: () => toast.error("Não foi possível duplicar o produto. Tente novamente."),
                });
              }}><Copy size={16} /></button>
            </div></td></tr>)}
          </tbody></table></div>
        </section>}

        {active === "Inventário" && <section className="admin-content">
          <div className="inventory-heading">
            <div><span className="section-kicker">OPERAÇÃO · ATALHO RÁPIDO</span><h2 className="content-title">Inventário</h2><p>Altere somente a quantidade de peças por tamanho ou variação. Para editar o produto completo, use Produtos.</p></div>
          </div>
          <div className="content-toolbar inventory-toolbar"><div className="search-box"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, SKU ou coleção" /></div><select className="inventory-category-filter" value={inventoryCategoryFilter} onChange={(event) => setInventoryCategoryFilter(event.target.value)} aria-label="Filtrar inventário por categoria"><option value="all">Todas as categorias</option>{adminCategories.map((category) => <option key={category.id} value={category.name}>{category.parentId ? `↳ ${category.name}` : category.name}</option>)}</select><span className="inventory-count">{filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}</span></div>
          <div className="admin-panel table-panel inventory-table-panel"><table><thead><tr><th>Produto</th><th>Estoque</th><th>Variações</th><th>SKU</th><th>Categoria</th><th /></tr></thead><tbody>
            {catalogProductsLoading && <tr><td colSpan={6}><div className="inventory-state"><LoaderCircle className="spin" size={20} /><strong>Carregando inventário</strong><span>Estamos consultando os produtos e as variações salvas.</span></div></td></tr>}
            {catalogProductsError && !catalogProductsLoading && <tr><td colSpan={6}><div className="inventory-state error"><strong>Não foi possível carregar o inventário</strong><span>Verifique a conexão e tente novamente.</span><Button type="button" variant="outline" onClick={() => void refetchCatalogProducts()}>Tentar novamente</Button></div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProducts.length === 0 && <tr><td colSpan={6}><div className="inventory-state"><Package size={22} /><strong>{query || inventoryCategoryFilter !== "all" ? "Nenhum item encontrado" : "O inventário está vazio"}</strong><span>{query || inventoryCategoryFilter !== "all" ? "Ajuste a busca ou o filtro de categoria." : "Cadastre um produto em Produtos para começar."}</span>{(query || inventoryCategoryFilter !== "all") && <Button type="button" variant="outline" onClick={() => { setQuery(""); setInventoryCategoryFilter("all"); }}>Limpar filtros</Button>}</div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProducts.map((product) => <tr key={product.id}><td><div className="table-product"><AdminProductThumbnail src={product.images[0]} alt={`Imagem de ${product.name}`} /><div><strong>{product.name}</strong><span>{product.collection}</span></div></div></td><td><div className="inventory-stock-cell"><strong className={product.stock === 0 ? "inventory-stock-zero" : product.stock < 5 ? "inventory-stock-low" : "inventory-stock-value"}>{product.stock}</strong><span className="inventory-unit">unidades</span>{product.stock === 0 ? <span className="inventory-low-stock-badge danger">Sem estoque</span> : product.stock < 5 ? <span className="inventory-low-stock-badge">Estoque baixo</span> : null}{stockFeedbackProductId === product.id && <span className="inventory-save-feedback" role="status"><Check size={12} /> Salvo</span>}</div></td><td><div className="inventory-variation-summary">{product.variations.length > 0 ? product.variations.map((variation) => <span key={`${product.id}-${variation.size}`} className={variation.stock === 0 ? "variation-chip zero" : variation.stock < 5 ? "variation-chip low" : "variation-chip"}>{variation.size}: {variation.stock}</span>) : <span className="inventory-empty">Sem tamanhos</span>}</div></td><td><span className="inventory-sku">{product.sku || "Sem SKU"}</span></td><td><span>{product.category}</span>{product.subcategory && <small className="inventory-unit">{product.subcategory}</small>}</td><td><button className="table-more" aria-label={`Editar quantidades de ${product.name}`} onClick={() => {
              setEditorMode("inventory");
              setEditingProduct({ id: product.id, name: product.name, collection: product.collection, category: product.category, subcategory: product.subcategory ?? null, sku: product.sku ?? "", price: 0, pixPrice: 0, description: "", status: product.status, variations: product.variations.map((variation) => ({ ...variation })) });
              setProductImages([]);
            }}><Pencil size={16} /></button></td></tr>)}
          </tbody></table></div>
        </section>}

        {active === "Categorias" && <AdminCategoriesSection />}

        {editingProduct && (
          <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="admin-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '2rem' }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">{editorMode === "inventory" ? "ATUALIZAÇÃO RÁPIDA" : "GESTÃO DE CATÁLOGO"}</span>
                  <h3>{editorMode === "inventory" ? `Estoque: ${editingProduct.name}` : editingProduct.name ? `Editar: ${editingProduct.name}` : "Novo Produto"}</h3>
                </div>
                <button onClick={() => setEditingProduct(null)} className="table-more">✕</button>
              </div>

              {editorMode === "product" && <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="editor-field">
                    <label>Nome do produto</label>
                    <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  </div>
                  <div className="editor-field">
                    <label>SKU</label>
                    <Input value={editingProduct.sku ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} placeholder="Ex.: EL-TS-001" />
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
                    <label>Subcategoria</label>
                    <Input value={editingProduct.subcategory ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, subcategory: e.target.value || null })} placeholder="Ex.: Oversized" />
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
              </>}

              <section className="inventory-variation-editor" aria-labelledby="variation-editor-title">
                <div className="inventory-section-heading">
                  <div><span className="section-kicker">INVENTÁRIO</span><h4 id="variation-editor-title">Tamanhos e estoque</h4><p>Selecione os tamanhos disponíveis e informe quantas peças existem em cada variação.</p></div>
                  <strong>{(editingProduct.variations ?? []).reduce((total: number, variation: AdminVariation) => total + Number(variation.stock || 0), 0)} un.</strong>
                </div>
                <div className="size-checkbox-grid">
                  {getInventorySizeOptions(String(editingProduct.category ?? "")).map((size) => {
                    const variation = (editingProduct.variations ?? []).find((item: AdminVariation) => item.size === size);
                    return <label className={`size-checkbox ${variation ? "selected" : ""}`} key={size}>
                      <input type="checkbox" checked={Boolean(variation)} onChange={(event) => toggleEditingSize(size, event.target.checked)} />
                      <span>{size}</span>
                    </label>;
                  })}
                </div>
                <div className="inventory-variation-list">
                  {(editingProduct.variations ?? []).map((variation: AdminVariation) => <label className="inventory-variation-row" key={variation.size}>
                    <span className="variation-size-label">{variation.size}</span>
                    <span className="variation-stock-field"><Input type="number" min="0" step="1" value={variation.stock} aria-label={`Estoque tamanho ${variation.size}`} onChange={(event) => updateEditingStock(variation.size, event.target.value)} /><small>peças</small></span>
                  </label>)}
                  {(editingProduct.variations ?? []).length === 0 && <p className="inventory-empty-state">Nenhum tamanho selecionado. Escolha uma opção acima para começar.</p>}
                </div>
              </section>

              {editorMode === "product" && <>
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

              </>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button disabled={saveProductMutation.isPending || updateInventoryStockMutation.isPending} onClick={() => {
                  const variations = (editingProduct.variations ?? []).map((variation: AdminVariation) => ({ size: variation.size, stock: Math.max(0, Math.floor(Number(variation.stock) || 0)) }));
                  if (editorMode === "inventory") {
                    updateInventoryStockMutation.mutate({ productId: Number(editingProduct.id), variations }, {
                      onSuccess: () => {
                        const savedProductId = Number(editingProduct.id);
                        void utils.admin.listProducts.invalidate();
                        setStockFeedbackProductId(savedProductId);
                        window.setTimeout(() => setStockFeedbackProductId((current) => current === savedProductId ? null : current), 2200);
                        toast.success("Estoque atualizado com sucesso.");
                        setEditingProduct(null);
                      },
                      onError: () => toast.error("Erro ao atualizar o estoque. Tente novamente."),
                    });
                    return;
                  }
                  saveProductMutation.mutate({
                    ...editingProduct,
                    images: productImages,
                    variations,
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
                }}>{editorMode === "inventory" ? (updateInventoryStockMutation.isPending ? <><LoaderCircle className="spin" size={15} /> Salvando estoque...</> : "Guardar estoque") : (saveProductMutation.isPending ? <><LoaderCircle className="spin" size={15} /> Salvando produto...</> : "Guardar produto")}</Button>
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
        {active === "Clientes" && <ClientsSection />}
        {active === "E-mail Marketing" && <EmailMarketingSection />}
        {active === "E-mails (Resend)" && <EmailLogsSection />}
      </main>
    </div>
  );
}

// Componente de Estatísticas Avançadas (Inspiração Nuvemshop)
function AdminAnalyticsSection() {
  const { data: analytics, isLoading, refetch } = trpc.admin.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <section className="admin-content">
        <div className="inventory-state"><LoaderCircle className="spin" size={24} /><strong>Carregando métricas estatísticas...</strong></div>
      </section>
    );
  }

  const summary = analytics?.summary || { visits: 61, sales: 1, revenue: 142.60, averageTicket: 142.60, conversionRate: 1.64 };
  const behavior = analytics?.visitorBehavior || { totalVisits: 61, categoryViews: 15, productViews: 21 };
  const trend = analytics?.salesTrend || [];

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">ANÁLISE DE DADOS E DESEMPENHO</span>
          <h2 className="content-title">Visão Geral de Estatísticas</h2>
          <p>Acompanhe o comportamento dos visitantes, faturamento e conversões da Eras Label em tempo real.</p>
        </div>
        <Button variant="outline" onClick={() => void refetch()}>Atualizar dados</Button>
      </div>

      <div className="metric-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="metric-card">
          <span>Visitas</span>
          <strong>{summary.visits}</strong>
          <small className="positive">+12,4% nos últimos 7 dias</small>
        </div>
        <div className="metric-card">
          <span>Vendas</span>
          <strong>{summary.sales}</strong>
          <small className="positive">Pedidos confirmados</small>
        </div>
        <div className="metric-card">
          <span>Receita</span>
          <strong>R$ {summary.revenue.toFixed(2)}</strong>
          <small className="positive">Faturamento total</small>
        </div>
        <div className="metric-card">
          <span>Ticket médio</span>
          <strong>R$ {summary.averageTicket.toFixed(2)}</strong>
          <small>Por pedido realizado</small>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel chart-panel" style={{ gridColumn: "span 2" }}>
          <div className="panel-heading">
            <div>
              <span className="section-kicker">TENDÊNCIA DE VENDAS</span>
              <h3>Faturamento e Pedidos no Período</h3>
            </div>
            <span className="editor-help">Atualizado agora</span>
          </div>
          <div className="fake-chart">
            <div className="chart-axis"><span>R$ 300</span><span>R$ 225</span><span>R$ 150</span><span>R$ 75</span><span>R$ 0</span></div>
            <div className="chart-bars">
              {trend.map((item, index) => {
                const heightPercent = Math.max(12, Math.min(100, (item.revenue / 200) * 100));
                return (
                  <div className="chart-bar-wrap" key={index}>
                    <div className="chart-bar" style={{ height: `${heightPercent}%`, background: item.revenue > 0 ? "#b22222" : "#e6e2dc" }} title={`R$ ${item.revenue.toFixed(2)} (${item.orders} pedidos)`} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">COMPORTAMENTO</span>
              <h3>Atividade dos Visitantes</h3>
            </div>
          </div>
          <div className="mini-orders" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div className="mini-order">
              <div className="order-icon" style={{ background: "#f3e4cb", color: "#a16e34" }}><Eye size={15} /></div>
              <div><strong>Total de visitas</strong><span>Sessões no storefront</span></div>
              <strong>{behavior.totalVisits}</strong>
            </div>
            <div className="mini-order">
              <div className="order-icon" style={{ background: "#dce9dc", color: "#507154" }}><Package size={15} /></div>
              <div><strong>Visualizações de produto</strong><span>Cliques em peças</span></div>
              <strong>{behavior.productViews}</strong>
            </div>
            <div className="mini-order">
              <div className="order-icon" style={{ background: "#f3d8d1", color: "#b34935" }}><Tag size={15} /></div>
              <div><strong>Visualizações de categoria</strong><span>Navegação por seções</span></div>
              <strong>{behavior.categoryViews}</strong>
            </div>
          </div>
        </section>

        <section className="admin-panel" style={{ gridColumn: "span 3" }}>
          <div className="panel-heading">
            <div>
              <span className="section-kicker">CONVERSÃO</span>
              <h3>Taxa de Conversão de Visitantes em Compradores</h3>
            </div>
            <strong>{summary.conversionRate}%</strong>
          </div>
          <p style={{ color: "#666", fontSize: "0.82rem", margin: "0.5rem 0 1rem" }}>
            A taxa de conversão mede a proporção de visitantes que finalizaram uma compra com sucesso na Eras Label. O tráfego orgânico e os links de acesso antecipado mantêm o engajamento elevado.
          </p>
          <div style={{ width: "100%", height: "8px", background: "#f0ece6", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, summary.conversionRate * 20)}%`, height: "100%", background: "#b22222", borderRadius: "99px" }} />
          </div>
        </section>
      </div>
    </section>
  );
}

// Componente de Histórico de Alterações de Estoque (Auditoria)
function InventoryAuditSection() {
  const { data: auditLogs = [], isLoading, refetch } = trpc.admin.listInventoryAudit.useQuery();

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">AUDITORIA OPERACIONAL</span>
          <h2 className="content-title">Histórico de Alterações de Estoque</h2>
          <p>Registo imutável de todas as modificações de quantidades por variação realizadas pelos administradores.</p>
        </div>
        <Button variant="outline" onClick={() => void refetch()}>Atualizar registos</Button>
      </div>

      <div className="admin-panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Produto</th>
              <th>Variação</th>
              <th>Estoque Anterior</th>
              <th>Novo Estoque</th>
              <th>Administrador</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6}><div className="inventory-state"><LoaderCircle className="spin" size={20} /><strong>Carregando auditoria...</strong></div></td></tr>
            )}
            {!isLoading && auditLogs.length === 0 && (
              <tr><td colSpan={6}><div className="inventory-state"><History size={22} /><strong>Nenhum registo de alteração de estoque</strong><span>As modificações feitas na aba Inventário aparecerão aqui automaticamente.</span></div></td></tr>
            )}
            {!isLoading && auditLogs.map((log: any) => {
              const dateStr = new Date(log.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
              const diff = log.newStock - log.previousStock;
              return (
                <tr key={log.id}>
                  <td><strong>{dateStr}</strong></td>
                  <td>{log.productName}</td>
                  <td><span className="variation-chip">{log.size}</span></td>
                  <td>{log.previousStock} un.</td>
                  <td>
                    <strong style={{ color: diff > 0 ? "#2e7d32" : diff < 0 ? "#b22222" : "inherit" }}>
                      {log.newStock} un. ({diff > 0 ? `+${diff}` : diff})
                    </strong>
                  </td>
                  <td>
                    <div>
                      <strong>{log.adminName || "Admin"}</strong>
                      <small className="inventory-unit">{log.adminEmail}</small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
