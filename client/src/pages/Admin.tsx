import { useState, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  BellRing,
  ChevronDown,
  ChevronRight,
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
  Download,
  RefreshCw,
  Ruler,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  SlidersHorizontal,
  Megaphone,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getPaymentLabel, isPaymentConfirmed } from "@shared/payment-status";
import { readAdminPreference, writeAdminPreference } from "@/lib/admin-preferences";
import { getInventorySizeOptions } from "@shared/inventory";
import { AdminProductThumbnail } from "@/components/AdminProductThumbnail";
import AdminCategoriesSection from "@/pages/AdminCategoriesSection";
import AdminSalesSection from "@/pages/AdminSalesSection";
import AdminManualOrderSection from "@/pages/AdminManualOrderSection";
import AdminAbandonedCartsSection from "@/pages/AdminAbandonedCartsSection";
import { AdminCollectionsSection } from "@/pages/AdminCollectionsSection";
import { AdminEventsSection } from "@/pages/AdminEventsSection";
import { AdminCouponsSection } from "@/pages/AdminCouponsSection";
import { AdminPromotionsSection } from "@/pages/AdminPromotionsSection";
import { AdminMenuManager } from "@/pages/AdminMenuManager";
import { exportToCSV } from "@/lib/csv-export";
import type { StorefrontConfig } from "../../../shared/storefront";
import { optimizeProductImage } from "@/lib/image-optimizer";
import { createEmptyProductDraft, getProductDescriptionDraft, getProductSizeGuideDraft, validateProductDraft, type ProductSizeGuideRow } from "@/lib/product-editor";
import { buildAdminNavGroups, getAdminNavGroupId, type AdminNavIcon } from "@/lib/admin-navigation";
import { parseCmsContent, serializeCmsContent, type CmsEventBlock, type CmsStoryBlock } from "@shared/cms";

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidAnalyticsDateRange(startDate: string, endDate: string) {
  return Boolean(startDate && endDate && startDate <= endDate);
}

function getAdminNavIcon(icon: AdminNavIcon) {
  switch (icon) {
    case "analytics": return BarChart3;
    case "sales": return ShoppingCart;
    case "catalog": return Package;
    case "history": return History;
    case "alerts": return BellRing;
    case "categories": return Tag;
    case "customers": return Users;
    case "marketing": return Mail;
    case "coupon": return Tag;
    case "appearance": return Palette;
    case "cms": return Pencil;
    case "menus": return SlidersHorizontal;
    case "settings": return Settings2;
    case "team": return ShieldCheck;
    case "dashboard":
    default: return LayoutDashboard;
  }
}

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

      <div className="admin-filter-bar admin-search-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#fff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem', color: '#374151' }}>Pesquisar</label>
          <input
            type="text"
            placeholder="Destinatário, assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
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

function ClientsSection({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { data: clients = [], isLoading, refetch } = trpc.admin.listClients.useQuery();

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">RELACIONAMENTO</span>
          <h2 className="content-title">Base de Clientes</h2>
        </div>
        <div className="clients-toolbar-actions"><Button onClick={() => onNavigate("Pedido Manual")} className="admin-primary-button"><Plus size={15} /> Pedido manual</Button><Button onClick={() => onNavigate("Carrinhos Abandonados")} variant="outline"><ShoppingCart size={15} /> Carrinhos abandonados</Button><Button onClick={() => void refetch()} variant="outline">Atualizar lista</Button></div>
      </div>

      <div className="client-overview-cards" aria-label="Resumo de relacionamento"><div><span>Clientes registados</span><strong>{clients.length}</strong><small>contas e pedidos identificados</small></div><div><span>Operação comercial</span><strong>2</strong><small>atalhos no mesmo grupo de clientes</small></div><button type="button" onClick={() => onNavigate("Pedido Manual")}><Plus size={17} /><span><strong>Criar pedido offline</strong><small>Registe uma venda feita fora da loja.</small></span><ChevronRight size={16} /></button><button type="button" onClick={() => onNavigate("Carrinhos Abandonados")}><ShoppingCart size={17} /><span><strong>Recuperar carrinhos</strong><small>Consulte oportunidades de conversão.</small></span><ChevronRight size={16} /></button></div>

      <div className="admin-panel table-panel clients-table-panel">
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

      <div className="email-marketing-layout">
        <div className="admin-panel marketing-compose-panel" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div className="marketing-panel-heading"><div><span className="section-kicker">CRIAR ENVIO</span><h3>Nova Campanha em Massa</h3></div><Mail size={20} /></div>
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

        <div className="admin-panel marketing-guidelines-panel" style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div className="marketing-panel-heading"><div><span className="section-kicker">IDENTIDADE</span><h3>Diretrizes da Marca Eras</h3></div><span className="marketing-mark">ERAS.</span></div>
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
type ProductVisibility = "visible" | "unlisted" | "hidden";
type AdminProductOption = { id: number; name: string; collection: string; category: string; subcategory?: string | null; sku?: string | null; slug?: string | null; visibility?: ProductVisibility; categoryIds?: number[]; price: string; pixPrice: string; promotionalPrice: number | null; description?: string | null; sizeGuide?: ProductSizeGuideRow[] | null; stock: number; variations: AdminVariation[]; status: string; images: string[] };

function normalizeProductVisibility(value: unknown): ProductVisibility {
  return value === "unlisted" || value === "hidden" ? value : "visible";
}
type EditableBannerTargetType = "custom" | "catalog" | "category" | "collection";
type EditableBanner = { id: string; eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string; targetType?: EditableBannerTargetType; targetValue?: string };
type EditableHighlight = { id: string; productId: number; label: string };
type EditableProductSection = { id: string; eyebrow: string; title: string; description: string; productIds: number[] };
type EditableVipBanner = Omit<EditableBanner, "id">;
type EditableHomeSectionTitles = { highlights: string; shop: string; community: string };
const defaultEditableBanners: EditableBanner[] = [
  { id: "drafts", eyebrow: "NOVA ERA · 2026", title: "DRAFTS JÁ DISPONÍVEL", subtitle: "Uma nova coleção em movimento.", imageUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2000&q=90", href: "#shop", cta: "EXPLORAR AGORA", targetType: "custom" },
  { id: "paradox", eyebrow: "PARADOX COLLECTION", title: "REVIVER. REINVENTAR.", subtitle: "Peças para atravessar o tempo presente.", imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90", href: "#shop", cta: "VER COLEÇÃO", targetType: "custom" },
];
const defaultEditableVipBanner: EditableVipBanner = { eyebrow: "ACESSO ANTECIPADO", title: "ENTRE PARA O GRUPO VIP", subtitle: "Lançamentos, bastidores e as próximas eras primeiro.", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90", href: "https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t", cta: "ENTRAR NO WHATSAPP" };
const defaultEditableHighlights: EditableHighlight[] = [
  { id: "highlight-1", productId: 1, label: "PEÇA-CHAVE" },
  { id: "highlight-2", productId: 2, label: "MAIS VISTO" },
  { id: "highlight-3", productId: 5, label: "ARQUIVO" },
];
const defaultEditableProductSections: EditableProductSection[] = [];

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

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

function StorefrontSettingsPanel({
  config,
  onChange,
  passwordDraft,
  onPasswordChange,
  clearPassword,
  onClearPasswordChange,
}: {
  config: StorefrontConfig | null;
  onChange: (config: StorefrontConfig) => void;
  passwordDraft: string;
  onPasswordChange: (password: string) => void;
  clearPassword: boolean;
  onClearPasswordChange: (clear: boolean) => void;
}) {
  if (!config) {
    return (
      <div className="storefront-settings-panel storefront-settings-loading">
        <LoaderCircle className="admin-auth-spinner" size={20} aria-hidden="true" />
        <span>A carregar as configurações públicas da loja...</span>
      </div>
    );
  }

  const updateAnnouncement = (patch: Partial<StorefrontConfig["announcement"]>) =>
    onChange({ ...config, announcement: { ...config.announcement, ...patch } });
  const updateMaintenance = (patch: Partial<StorefrontConfig["maintenance"]>) =>
    onChange({ ...config, maintenance: { ...config.maintenance, ...patch } });
  const updateDrop = (patch: Partial<StorefrontConfig["drop"]>) =>
    onChange({ ...config, drop: { ...config.drop, ...patch } });
  const dropDate = config.drop.targetAt
    ? new Date(config.drop.targetAt).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })
    : "Data ainda não definida";

  return (
    <section className="storefront-settings-panel">
      <div className="storefront-settings-header">
        <div>
          <span className="section-kicker">EXPERIÊNCIA PÚBLICA</span>
          <h3>Próximo drop &amp; acesso à loja</h3>
          <p>Prepare a próxima era com uma comunicação clara, um contador preciso e um modo de acesso controlado.</p>
        </div>
        <span className={`storefront-status-chip ${config.maintenance.enabled ? "is-active" : ""}`}>
          <span aria-hidden="true" />
          {config.maintenance.enabled ? "Loja trancada" : "Loja aberta"}
        </span>
      </div>

      <div className="storefront-settings-grid">
        <article className={`storefront-control-card storefront-lock-card ${config.maintenance.enabled ? "is-active" : ""}`}>
          <div className="storefront-card-topline">
            <span className="storefront-card-index">01</span>
            <span className="storefront-card-kicker"><LockKeyhole size={14} /> ACESSO</span>
          </div>
          <div className="storefront-card-title-row">
            <div>
              <h4>Trancar site</h4>
              <p>Mostre uma mensagem de preparação enquanto a área pública fica inacessível.</p>
            </div>
            <label className="storefront-switch" aria-label="Trancar a loja para visitantes">
              <input type="checkbox" checked={config.maintenance.enabled} onChange={(event) => updateMaintenance({ enabled: event.target.checked })} />
              <span aria-hidden="true" />
            </label>
          </div>

          <div className="storefront-lock-preview">
            <div className="storefront-lock-preview-brand">ERAS<span>.</span><LockKeyhole size={14} /></div>
            <strong>{config.maintenance.title || "Página em construção"}</strong>
            <p>{config.maintenance.message || "Estamos a preparar a próxima era."}</p>
            {config.drop.enabled && <span className="storefront-lock-preview-drop">{config.drop.title || "PRÓXIMO DROP"}</span>}
          </div>

          <div className="storefront-field-stack">
            <label className="storefront-field"><span>Título da página</span><Input maxLength={100} value={config.maintenance.title} onChange={(event) => updateMaintenance({ title: event.target.value })} placeholder="Página em construção" /></label>
            <label className="storefront-field"><span>Mensagem para clientes</span><textarea maxLength={500} value={config.maintenance.message} onChange={(event) => updateMaintenance({ message: event.target.value })} placeholder="Avise os clientes sobre o próximo drop." /></label>
            <label className="storefront-field"><span>Texto do botão de acesso VIP</span><Input maxLength={100} value={config.maintenance.accessLabel} onChange={(event) => updateMaintenance({ accessLabel: event.target.value })} placeholder="Entrar no acesso reservado" /></label>
            <label className="storefront-field"><span>{config.maintenance.passwordConfigured ? "Alterar palavra-passe VIP" : "Criar palavra-passe VIP"}</span><Input type="password" autoComplete="new-password" minLength={6} maxLength={200} value={passwordDraft} onChange={(event) => { onPasswordChange(event.target.value); if (clearPassword) onClearPasswordChange(false); }} placeholder={config.maintenance.passwordConfigured ? "Deixe vazio para manter a actual" : "Mínimo de 6 caracteres"} /></label>
            <label className="storefront-password-clear"><input type="checkbox" checked={clearPassword} onChange={(event) => { onClearPasswordChange(event.target.checked); if (event.target.checked) onPasswordChange(""); }} /> <span>Remover a palavra-passe e deixar o acesso sem senha</span></label>
            <p className="storefront-field-help">A senha é guardada apenas como hash no servidor. Quem tiver o link e esta palavra-passe poderá abrir a loja durante o período do drop.</p>
          </div>
        </article>

        <article className={`storefront-control-card storefront-drop-card ${config.drop.enabled ? "is-active" : ""}`}>
          <div className="storefront-card-topline">
            <span className="storefront-card-index">02</span>
            <span className="storefront-card-kicker"><Megaphone size={14} /> LANÇAMENTO</span>
          </div>
          <div className="storefront-card-title-row">
            <div>
              <h4>Próximo drop</h4>
              <p>Ative um contador regressivo para criar expectativa antes da abertura.</p>
            </div>
            <label className="storefront-switch" aria-label="Mostrar contador regressivo">
              <input type="checkbox" checked={config.drop.enabled} onChange={(event) => updateDrop({ enabled: event.target.checked })} />
              <span aria-hidden="true" />
            </label>
          </div>

          <div className="storefront-drop-preview">
            <span className="storefront-drop-preview-label">CONTAGEM REGRESSIVA</span>
            <strong>{config.drop.title || "PRÓXIMO DROP"}</strong>
            <div className="storefront-countdown-visual" aria-hidden="true">
              {["00", "00", "00", "00"].map((value, index) => (
                <span key={index}><b>{value}</b><small>{["dias", "horas", "min", "seg"][index]}</small></span>
              ))}
            </div>
            <small className="storefront-drop-date">{dropDate}</small>
          </div>

          <div className="storefront-field-grid">
            <label className="storefront-field"><span>Título do contador</span><Input maxLength={100} value={config.drop.title} onChange={(event) => updateDrop({ title: event.target.value })} placeholder="PRÓXIMO DROP" /></label>
            <label className="storefront-field"><span>Data e hora do drop</span><Input type="datetime-local" value={toDateTimeLocal(config.drop.targetAt)} onChange={(event) => updateDrop({ targetAt: fromDateTimeLocal(event.target.value) })} /></label>
          </div>
          <p className="storefront-field-help">A contagem usa o fuso horário local do navegador do visitante e termina automaticamente quando o drop começar.</p>
        </article>
      </div>

      <div className="storefront-announcement-card">
        <div className="storefront-announcement-heading">
          <div>
            <span className="storefront-card-kicker"><Megaphone size={14} /> COMUNICAÇÃO</span>
            <h4>Barra de anúncio</h4>
            <p>Use mensagens curtas para comunicar frete, Pix e novidades em todas as páginas.</p>
          </div>
          <label className="storefront-switch" aria-label="Exibir barra de anúncio na loja">
            <input type="checkbox" checked={config.announcement.enabled} onChange={(event) => updateAnnouncement({ enabled: event.target.checked })} />
            <span aria-hidden="true" />
          </label>
        </div>
        <div className="announcement-message-list storefront-announcement-list">
          <div className="announcement-list-heading"><span>Mensagens rotativas</span><small>{config.announcement.messages.length}/8</small></div>
          {config.announcement.messages.map((message, index) => (
            <div className="announcement-message-row" key={message.id}>
              <span className="announcement-message-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="announcement-message-fields">
                <Input maxLength={180} value={message.text} onChange={(event) => updateAnnouncement({ messages: config.announcement.messages.map((item) => item.id === message.id ? { ...item, text: event.target.value } : item) })} placeholder="Ex.: Frete grátis acima de R$ 350" aria-label={`Mensagem ${index + 1}`} />
                <Input maxLength={500} value={message.href} onChange={(event) => updateAnnouncement({ messages: config.announcement.messages.map((item) => item.id === message.id ? { ...item, href: event.target.value } : item) })} placeholder="Link opcional: /faq ou https://..." aria-label={`Link da mensagem ${index + 1}`} />
              </div>
              <button type="button" className="announcement-remove-button" disabled={config.announcement.messages.length <= 1} onClick={() => updateAnnouncement({ messages: config.announcement.messages.filter((item) => item.id !== message.id) })} aria-label={`Remover mensagem ${index + 1}`}>×</button>
            </div>
          ))}
          <button type="button" className="announcement-add-button" disabled={config.announcement.messages.length >= 8} onClick={() => updateAnnouncement({ messages: [...config.announcement.messages, { id: `announcement-${Date.now()}`, text: "NOVA MENSAGEM", href: "" }] })}><Plus size={14} /> Adicionar mensagem</button>
        </div>
        <div className="storefront-announcement-options">
          <label className="storefront-field"><span>Velocidade de rotação</span><select className="admin-filter-select" value={config.announcement.rotationSpeedSeconds ?? 4} onChange={(event) => updateAnnouncement({ rotationSpeedSeconds: Number(event.target.value) })}>{[2, 3, 4, 5, 6, 8, 10, 15].map((sec) => <option key={sec} value={sec}>{sec} segundos</option>)}</select></label>
          <label className="storefront-color-field"><span>Fundo</span><Input type="color" value={config.announcement.backgroundColor} onChange={(event) => updateAnnouncement({ backgroundColor: event.target.value })} /></label>
          <label className="storefront-color-field"><span>Texto</span><Input type="color" value={config.announcement.textColor} onChange={(event) => updateAnnouncement({ textColor: event.target.value })} /></label>
          <label className="storefront-inline-check"><input type="checkbox" checked={config.announcement.showArrows !== false} onChange={(event) => updateAnnouncement({ showArrows: event.target.checked })} /><span>Exibir setas de navegação</span></label>
        </div>
      </div>
    </section>
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

  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return "Visão geral";
    const section = new URLSearchParams(window.location.search).get("section")?.trim().toLowerCase();
    const sectionLabels: Record<string, string> = {
      stats: "Estatísticas",
      estatisticas: "Estatísticas",
      sales: "Vendas",
      vendas: "Vendas",
      orders: "Pedidos",
      pedidos: "Pedidos",
      clients: "Clientes",
      clientes: "Clientes",
      products: "Produtos",
      produtos: "Produtos",
      collections: "Coleções",
      colecoes: "Coleções",
      inventory: "Inventário",
      inventario: "Inventário",
      appearance: "Aparência",
      aparencia: "Aparência",
      cms: "Aparência",
    };
    return section ? sectionLabels[section] ?? "Visão geral" : "Visão geral";
  });
  const [query, setQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<number | null>(null);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [couponActive, setCouponActive] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>({ overview: true });
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&q=80&w=1200");
  const [homeBanners, setHomeBanners] = useState<EditableBanner[]>(defaultEditableBanners);
  const [homeHighlights, setHomeHighlights] = useState<EditableHighlight[]>(defaultEditableHighlights);
  const [homeProductSections, setHomeProductSections] = useState<EditableProductSection[]>(defaultEditableProductSections);
  const [newSectionType, setNewSectionType] = useState<"shop" | "category" | "collection">("shop");
  const [homeVipBanner, setHomeVipBanner] = useState<EditableVipBanner>(defaultEditableVipBanner);
  const [homeSectionTitles, setHomeSectionTitles] = useState<EditableHomeSectionTitles>({ highlights: "Destaques", shop: "Produtos da Era", community: "Visto fora do estúdio." });
  const [storefrontConfigDraft, setStorefrontConfigDraft] = useState<StorefrontConfig | null>(null);
  const [storefrontPasswordDraft, setStorefrontPasswordDraft] = useState("");
  const [clearStorefrontPassword, setClearStorefrontPassword] = useState(false);

  const isAdmin = authUser?.role === "admin";
  const needsProducts = isAdmin && ["Visão geral", "Produtos", "Coleções", "Categorias", "Aparência", "Descontos"].includes(active);
  const needsOrders = isAdmin && ["Visão geral", "Vendas", "Pedidos", "Clientes"].includes(active);
  const needsCategories = isAdmin && ["Produtos", "Coleções", "Categorias", "Aparência"].includes(active);
  const { data: commercialConfig } = trpc.catalog.getConfig.useQuery();
  const { data: storefrontConfig } = trpc.catalog.getStorefrontConfig.useQuery();
  const { data: homeContent } = trpc.catalog.getHomeContent.useQuery();
  const { data: catalogProducts, isLoading: catalogProductsLoading, isError: catalogProductsError, refetch: refetchCatalogProducts } = trpc.admin.listProducts.useQuery(undefined, { enabled: needsProducts });
  const { data: adminOrders = [], isLoading: adminOrdersLoading } = trpc.admin.listOrders.useQuery(undefined, { enabled: needsOrders });
  const { data: adminCategories = [] } = trpc.admin.listCategories.useQuery(undefined, { enabled: needsCategories });
  const { data: adminCollections = [] } = trpc.collections.list.useQuery(undefined, { enabled: needsProducts });
  const utils = trpc.useUtils();
  const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(350);
  const [maxInstallments, setMaxInstallments] = useState<number>(12);
  const [interestFreeInstallments, setInterestFreeInstallments] = useState<number>(3);
  const [installmentInterestRate, setInstallmentInterestRate] = useState<number>(2.99);

  // Sincronizar quando o dado carregar
  useEffect(() => {
    if (commercialConfig) {
      setPixDiscountPercent(commercialConfig.pixDiscountPercent);
      setFreeShippingThreshold(commercialConfig.freeShippingThreshold);
      setMaxInstallments(commercialConfig.maxInstallments ?? 12);
      setInterestFreeInstallments(commercialConfig.interestFreeInstallments ?? 3);
      setInstallmentInterestRate(commercialConfig.installmentInterestRate ?? 2.99);
    }
  }, [commercialConfig]);
  useEffect(() => {
    if (homeContent) {
      if (homeContent.banners?.length) setHomeBanners(homeContent.banners as EditableBanner[]);
      if (homeContent.highlights) setHomeHighlights(homeContent.highlights as EditableHighlight[]);
      if (Array.isArray(homeContent.productSections)) setHomeProductSections(homeContent.productSections.map((section) => ({ eyebrow: "SHOP", description: "", ...section })) as EditableProductSection[]);
      if (homeContent.vipBanner) setHomeVipBanner(homeContent.vipBanner as EditableVipBanner);
      if (homeContent.sectionTitles) setHomeSectionTitles((current) => ({ ...current, ...(homeContent.sectionTitles as Partial<EditableHomeSectionTitles>) }));
    }
  }, [homeContent]);
  useEffect(() => {
    if (storefrontConfig) {
      setStorefrontConfigDraft(storefrontConfig);
      setStorefrontPasswordDraft("");
      setClearStorefrontPassword(false);
    }
  }, [storefrontConfig]);

  const saveConfigMutation = trpc.admin.saveConfig.useMutation();
  const saveHomeContentMutation = trpc.admin.saveHomeContent.useMutation();
  const saveStorefrontConfigMutation = trpc.admin.saveStorefrontConfig.useMutation();
  const getStorefrontSavePayload = () => {
    if (!storefrontConfigDraft) return null;
    const payload = { ...storefrontConfigDraft } as typeof storefrontConfigDraft & { accessPassword?: string; clearAccessPassword?: boolean };
    if (storefrontPasswordDraft.trim().length >= 6) payload.accessPassword = storefrontPasswordDraft.trim();
    if (clearStorefrontPassword) payload.clearAccessPassword = true;
    return payload;
  };
  const resetStorefrontPasswordDraft = () => {
    setStorefrontPasswordDraft("");
    setClearStorefrontPassword(false);
  };
  const [uploading, setUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editorMode, setEditorMode] = useState<"product" | "inventory">("product");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productUploading, setProductUploading] = useState(false);
  const [productUploadProgress, setProductUploadProgress] = useState({ completed: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.admin.uploadImage.useMutation();
  const saveProductMutation = trpc.admin.saveProduct.useMutation();
  const updateInventoryStockMutation = trpc.admin.updateInventoryStock.useMutation();
  const duplicateProductMutation = trpc.admin.duplicateProduct.useMutation();
  const deleteProductMutation = trpc.admin.deleteProduct.useMutation();
  const bulkProductActionMutation = trpc.admin.bulkProductAction.useMutation();
  const [stockFeedbackProductId, setStockFeedbackProductId] = useState<number | null>(null);

  function addHomeBanner() {
    setHomeBanners((current) => [...current, {
      id: `banner-${Date.now()}-${current.length + 1}`,
      eyebrow: "NOVA ERA",
      title: "",
      subtitle: "",
      imageUrl: "",
      href: "#shop",
      cta: "EXPLORAR",
      targetType: "custom",
    }]);
    setAppearanceSaved(false);
    toast.success("Novo banner adicionado ao editor.");
  }

  function removeHomeBanner(index: number) {
    setHomeBanners((current) => {
      if (current.length <= 1) {
        toast.error("A Home precisa de pelo menos um banner.");
        return current;
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setAppearanceSaved(false);
  }

  function moveHomeBanner(index: number, direction: -1 | 1) {
    setHomeBanners((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setAppearanceSaved(false);
  }

  function duplicateHomeBanner(index: number) {
    setHomeBanners((current) => {
      const source = current[index];
      if (!source) return current;
      const duplicate = { ...source, id: `banner-${Date.now()}-${current.length + 1}`, title: source.title ? `${source.title} · CÓPIA` : "" };
      return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)];
    });
    setAppearanceSaved(false);
    toast.success("Banner duplicado. Ajuste o conteúdo antes de guardar.");
  }

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

  async function handleMultipleProductUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setProductUploading(true);
    setProductUploadProgress({ completed: 0, total: files.length });
    const uploadedUrls: string[] = [];
    let failedCount = 0;
    let originalBytes = 0;
    let optimizedBytes = 0;

    // O processamento é sequencial para não bloquear o navegador com várias
    // operações Canvas simultâneas nem aumentar a memória usada no painel.
    for (const file of files) {
      try {
        const optimized = await optimizeProductImage(file);
        const response = await uploadMutation.mutateAsync({
          fileName: optimized.fileName,
          fileBase64: optimized.dataUrl,
          contentType: optimized.contentType,
        });
        uploadedUrls.push(response.url);
        originalBytes += optimized.originalBytes;
        optimizedBytes += optimized.optimizedBytes;
      } catch (error) {
        failedCount += 1;
        console.error("Falha ao otimizar ou carregar imagem do produto", error);
      } finally {
        setProductUploadProgress((current) => ({ ...current, completed: current.completed + 1 }));
      }
    }

    setProductImages((current) => [...current, ...uploadedUrls]);
    setProductUploading(false);

    if (uploadedUrls.length > 0) {
      const savedPercent = originalBytes > 0 ? Math.max(0, Math.round((1 - optimizedBytes / originalBytes) * 100)) : 0;
      const summary = `${uploadedUrls.length} imagem(ns) otimizada(s) e carregada(s)${savedPercent > 0 ? ` — ${savedPercent}% menos peso` : ""}.`;
      if (failedCount > 0) toast.warning(`${summary} ${failedCount} ficheiro(s) não puderam ser processados.`);
      else toast.success(summary);
    } else {
      toast.error("Não foi possível processar nenhuma imagem. Use JPG, PNG ou WebP válidos.");
    }
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
      slug: product.slug,
      visibility: normalizeProductVisibility(product.visibility),
      categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds.map(Number) : [],
      price: Number(product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      pixPrice: Number(product.pixPrice ?? product.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      promotionalPrice: product.promotionalPrice !== null && product.promotionalPrice !== undefined ? Number(product.promotionalPrice) : null,
      description: getProductDescriptionDraft(product.description),
      sizeGuide: getProductSizeGuideDraft(product.sizeGuide),
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
  const filteredProductCatalog = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedCategory = productCategoryFilter === null
      ? null
      : adminCategories.find((category) => Number(category.id) === productCategoryFilter);
    const selectedCategoryName = selectedCategory?.name?.trim().toLowerCase();

    return adminProducts.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.name, product.collection, product.category, product.subcategory ?? "", product.sku ?? ""].some((value) => value.toLowerCase().includes(normalizedQuery));
      if (productCategoryFilter === null) return matchesQuery;
      const matchesCategoryId = (product.categoryIds ?? []).includes(productCategoryFilter);
      const matchesLegacyCategory = Boolean(selectedCategoryName) && [product.category, product.subcategory ?? ""].some((value) => value.trim().toLowerCase() === selectedCategoryName);
      return matchesQuery && (matchesCategoryId || matchesLegacyCategory);
    });
  }, [adminCategories, adminProducts, productCategoryFilter, query]);
  const selectedProductCategory = productCategoryFilter === null
    ? null
    : adminCategories.find((category) => Number(category.id) === productCategoryFilter) ?? null;
  const isSuperAdmin = authUser?.email?.trim().toLowerCase() === "theeraslabel@gmail.com";
  const navGroups = useMemo(() => buildAdminNavGroups(isSuperAdmin), [isSuperAdmin]);

  // Mantém a categoria da página atual aberta quando a navegação ocorre por
  // atalhos internos, como os cards de "Próximas etapas" da visão geral.
  useEffect(() => {
    const activeGroupId = getAdminNavGroupId(navGroups, active);
    if (!activeGroupId) return;
    setOpenNavGroups((current) => current[activeGroupId]
      ? current
      : { ...current, [activeGroupId]: true });
  }, [active, navGroups]);

  useEffect(() => {
    if (active === "Produtos") setProductsDropdownOpen(true);
  }, [active]);

  function selectNav(label: string) {
    if (label !== "Produtos") setProductCategoryFilter(null);
    if (label === "Produtos") setProductCategoryFilter(null);
    setActive(label);
    setMenuOpen(false);
  }

  function selectProductCategory(categoryId: number) {
    setActive("Produtos");
    setProductCategoryFilter(categoryId);
    setProductsDropdownOpen(true);
    setMenuOpen(false);
  }

  // Alterna somente o dropdown solicitado, deixando as restantes categorias
  // fechadas para a sidebar permanecer compacta e fácil de percorrer.
  function toggleNavGroup(groupId: string) {
    setOpenNavGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  function toggleProductSelection(productId: number, checked: boolean) {
    setSelectedProductIds((current) => checked
      ? Array.from(new Set([...current, productId]))
      : current.filter((id) => id !== productId));
  }

  function toggleVisibleProductSelection(checked: boolean) {
    const visibleIds = filteredProductCatalog.map((product) => product.id);
    setSelectedProductIds((current) => checked
      ? Array.from(new Set([...current, ...visibleIds]))
      : current.filter((id) => !visibleIds.includes(id)));
  }

  function runBulkProductAction(action: "duplicate" | "delete" | "category") {
    if (selectedProductIds.length === 0) {
      toast.info("Selecione pelo menos um produto para continuar.");
      return;
    }
    if (action === "category" && !bulkCategoryId) {
      toast.error("Escolha uma categoria antes de associar os produtos.");
      return;
    }
    if (action === "delete" && !window.confirm(`Excluir ${selectedProductIds.length} produto(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return;
    bulkProductActionMutation.mutate({
      action,
      productIds: selectedProductIds,
      ...(action === "category" ? { categoryId: Number(bulkCategoryId) } : {}),
    }, {
      onSuccess: (result) => {
        setSelectedProductIds([]);
        setBulkCategoryId("");
        void Promise.all([utils.admin.listProducts.invalidate(), utils.catalog.list.invalidate()]);
        toast.success(result.message);
      },
      onError: (error) => toast.error(error.message || "Não foi possível concluir a ação em lote."),
    });
  }

  const { data: myAdminDetails } = trpc.admin.myAdminDetails.useQuery(undefined, {
    enabled: Boolean(authUser && authUser.role === "admin"),
  });
  const adminName = myAdminDetails?.name?.trim() || authUser?.name?.trim() || "Eras Label Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  function toggleEditingVariation(size: string, checked: boolean) {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const variations: AdminVariation[] = Array.isArray(current.variations) ? current.variations : [];
      const exists = variations.some((variation) => variation.size === size);
      if (checked && !exists) return { ...current, variations: [...variations, { size, stock: 0 }] };
      if (!checked) return { ...current, variations: variations.filter((variation) => variation.size !== size) };
      return current;
    });
  }

  function updateEditingVariationStock(size: string, value: string) {
    const stock = Math.max(0, Math.floor(Number(value) || 0));
    setEditingProduct((current: any) => {
      if (!current) return current;
      return {
        ...current,
        variations: (current.variations ?? []).map((variation: AdminVariation) => variation.size === size ? { ...variation, stock } : variation),
      };
    });
  }

  function addEditingSizeGuideRow() {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const sizeGuide: ProductSizeGuideRow[] = Array.isArray(current.sizeGuide) ? current.sizeGuide : [];
      return { ...current, sizeGuide: [...sizeGuide, { size: "", width: "", length: "" }] };
    });
  }

  function updateEditingSizeGuideRow(index: number, field: keyof ProductSizeGuideRow, value: string) {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const sizeGuide: ProductSizeGuideRow[] = Array.isArray(current.sizeGuide) ? current.sizeGuide : [];
      return {
        ...current,
        sizeGuide: sizeGuide.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
      };
    });
  }

  function removeEditingSizeGuideRow(index: number) {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const sizeGuide: ProductSizeGuideRow[] = Array.isArray(current.sizeGuide) ? current.sizeGuide : [];
      return { ...current, sizeGuide: sizeGuide.filter((_, rowIndex) => rowIndex !== index) };
    });
  }

  function toggleEditingCategory(categoryId: number, checked: boolean) {
    setEditingProduct((current: any) => {
      if (!current) return current;
      const categoryIds: number[] = Array.isArray(current.categoryIds) ? current.categoryIds.map(Number) : [];
      const nextIds = checked
        ? Array.from(new Set([...categoryIds, categoryId]))
        : categoryIds.filter((id) => id !== categoryId);
      return { ...current, categoryIds: nextIds };
    });
  }

  if (authLoading) return <AdminAccessLoading />;
  if (!authUser || authUser.role !== "admin") return <AdminLoginScreen />;

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-brand"><Link href="/"><img src="/eras-logo-sticker.webp" alt="Eras Label Admin" style={{ height: "52px", width: "auto", objectFit: "contain", display: "block" }} /></Link><small>ADMIN</small></div>
        <nav className="admin-nav-groups" aria-label="Navegação administrativa">
          {navGroups.map((group) => {
            const isOpen = Boolean(openNavGroups[group.id]);
            const hasActiveItem = group.items.some((item) => item.label === active);
            const GroupIcon = getAdminNavIcon(group.icon);

            return (
              <div className="admin-nav-group" key={group.id}>
                <button
                  type="button"
                  className={`admin-nav-group-trigger ${hasActiveItem ? "has-active" : ""} ${isOpen ? "open" : ""}`}
                  aria-expanded={isOpen}
                  aria-controls={`admin-nav-group-${group.id}`}
                  onClick={() => toggleNavGroup(group.id)}
                >
                  <span className="admin-nav-group-trigger-label">
                    <GroupIcon size={16} aria-hidden="true" />
                    <span>{group.label}</span>
                  </span>
                  <ChevronDown className={`admin-nav-group-chevron ${isOpen ? "open" : ""}`} size={15} aria-hidden="true" />
                </button>
                <div
                  id={`admin-nav-group-${group.id}`}
                  className={`admin-nav-group-items ${isOpen ? "open" : ""}`}
                  role="group"
                  aria-label={group.label}
                  aria-hidden={!isOpen}
                >
                  <div className="admin-nav-group-items-inner">
                    {group.items.map((item) => {
                      const ItemIcon = getAdminNavIcon(item.icon);
                      const isActive = active === item.label;
                      const isProductsItem = group.id === "catalog" && item.label === "Produtos";
                      return (
                        <div className={`admin-nav-item-wrap ${isProductsItem ? "has-product-categories" : ""}`} key={item.label}>
                          <button
                            type="button"
                            className={`admin-nav-item ${isActive ? "active" : ""}`}
                            onClick={() => {
                              if (isProductsItem) {
                                selectNav("Produtos");
                                setProductsDropdownOpen((current) => !current);
                              } else {
                                selectNav(item.label);
                              }
                            }}
                            aria-expanded={isProductsItem ? productsDropdownOpen : undefined}
                            tabIndex={isOpen ? 0 : -1}
                          >
                            <ItemIcon size={15} aria-hidden="true" />
                            <span>{item.label}</span>
                            {isProductsItem && <ChevronDown className={`admin-nav-product-chevron ${productsDropdownOpen ? "open" : ""}`} size={13} aria-hidden="true" />}
                          </button>
                          {isProductsItem && productsDropdownOpen && (
                            <div className="admin-nav-product-categories" role="group" aria-label="Categorias de produtos">
                              <button
                                type="button"
                                className={`admin-nav-product-category ${isActive && productCategoryFilter === null ? "active" : ""}`}
                                onClick={() => selectNav("Produtos")}
                                tabIndex={isOpen ? 0 : -1}
                              >
                                <Package size={13} aria-hidden="true" />
                                <span>Todos os produtos</span>
                              </button>
                              {adminCategories.length === 0 ? (
                                <span className="admin-nav-product-category-empty">Ainda não há categorias.</span>
                              ) : adminCategories.map((category) => {
                                const categoryId = Number(category.id);
                                const categoryIsActive = isActive && productCategoryFilter === categoryId;
                                return (
                                  <button
                                    type="button"
                                    key={category.id}
                                    className={`admin-nav-product-category ${categoryIsActive ? "active" : ""}`}
                                    onClick={() => selectProductCategory(categoryId)}
                                    tabIndex={isOpen ? 0 : -1}
                                  >
                                    <Tag size={13} aria-hidden="true" />
                                    <span>{category.parentId ? `↳ ${category.name}` : category.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", marginBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {myAdminDetails?.avatarUrl ? (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }}>
                <img src={myAdminDetails.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#b22222", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{adminInitial}</span>
            )}
            <span style={{ fontSize: "0.85rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{myAdminDetails?.name || adminName}</span>
          </div>
        </div>
      </aside>
      <button type="button" className="admin-sidebar-scrim" aria-label="Fechar menu administrativo" onClick={() => setMenuOpen(false)} />
      <main className="admin-main">
        <AdminHeaderBar authUser={authUser} active={active} setMenuOpen={setMenuOpen} adminInitial={adminInitial} adminName={adminName} onNavigate={selectNav} />
        {active === "Estatísticas" && <AdminAnalyticsSection />}
        {active === "Histórico de Estoque" && <InventoryAuditSection />}
        {active === "CMS Institucional" && <AdminCmsManager />}
        {active === "Menus Dinâmicos" && <AdminMenuManager />}
        {active === "Visão geral" && <AdminDashboardHome adminName={adminName} adminOrders={adminOrders} adminOrdersLoading={adminOrdersLoading} catalogCount={adminProducts.length} onNavigate={selectNav} />}
        {active === "Produtos" && <section className="admin-content">
          <div className="inventory-heading">
            <div><span className="section-kicker">CATÁLOGO</span><h2 className="content-title">Produtos</h2><p>Cadastre e edite os dados completos das peças, incluindo SKU, categoria, imagens e preços.</p>{selectedProductCategory && <div className="product-category-filter-chip"><Tag size={13} /><span>Categoria: <strong>{selectedProductCategory.name}</strong></span><button type="button" onClick={() => setProductCategoryFilter(null)} aria-label="Remover filtro de categoria">×</button></div>}</div>
            <Button onClick={() => {
              setEditorMode("product");
              setEditingProduct(createEmptyProductDraft());
              setProductImages([]);
            }}><Plus size={16} /> Novo produto</Button>
          </div>
          <div className="content-toolbar inventory-toolbar">
            <div className="search-box"><Search size={15} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, SKU ou coleção" /></div>
            <span className="inventory-count">{filteredProductCatalog.length} {filteredProductCatalog.length === 1 ? "produto" : "produtos"}</span>
          </div>
          {selectedProductIds.length > 0 && <div className="bulk-product-actions" role="toolbar" aria-label="Ações para produtos selecionados">
            <span className="bulk-product-selection-count">{selectedProductIds.length} selecionado(s)</span>
            <Button type="button" variant="outline" disabled={bulkProductActionMutation.isPending} onClick={() => runBulkProductAction("duplicate")}><Copy size={15} /> Duplicar</Button>
            <Button type="button" variant="outline" disabled={bulkProductActionMutation.isPending} onClick={() => runBulkProductAction("delete")}><X size={15} /> Apagar</Button>
            <select className="inventory-category-filter" value={bulkCategoryId} onChange={(event) => setBulkCategoryId(event.target.value)} aria-label="Escolher categoria para os produtos selecionados"><option value="">Adicionar à categoria...</option>{adminCategories.map((category) => <option key={category.id} value={category.id}>{category.parentId ? `↳ ${category.name}` : category.name}</option>)}</select>
            <Button type="button" disabled={bulkProductActionMutation.isPending || !bulkCategoryId} onClick={() => runBulkProductAction("category")}><Tag size={15} /> Adicionar</Button>
          </div>}
          <div className="admin-panel table-panel inventory-table-panel"><table><thead><tr><th className="product-selection-cell"><Checkbox checked={filteredProductCatalog.length > 0 && filteredProductCatalog.every((product) => selectedProductIds.includes(product.id))} onCheckedChange={(checked) => toggleVisibleProductSelection(checked === true)} aria-label="Selecionar todos os produtos visíveis" /></th><th>Produto</th><th>SKU</th><th>Categoria</th><th>Estoque</th><th>Status</th><th /></tr></thead><tbody>
            {catalogProductsLoading && <tr><td colSpan={7}><div className="inventory-state"><LoaderCircle className="spin" size={20} /><strong>Carregando produtos</strong><span>Estamos consultando o catálogo persistido.</span></div></td></tr>}
            {catalogProductsError && !catalogProductsLoading && <tr><td colSpan={7}><div className="inventory-state error"><strong>Não foi possível carregar os produtos</strong><span>Verifique a conexão e tente novamente.</span><Button type="button" variant="outline" onClick={() => void refetchCatalogProducts()}>Tentar novamente</Button></div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProductCatalog.length === 0 && <tr><td colSpan={7}><div className="inventory-state"><Package size={22} /><strong>{query || selectedProductCategory ? "Nenhum produto encontrado" : "O catálogo está vazio"}</strong><span>{query || selectedProductCategory ? "Tente outra pesquisa ou escolha uma categoria diferente." : "Cadastre o primeiro produto para começar."}</span>{(query || selectedProductCategory) && <Button type="button" variant="outline" onClick={() => { setQuery(""); setProductCategoryFilter(null); }}>Limpar filtros</Button>}</div></td></tr>}
            {!catalogProductsLoading && !catalogProductsError && filteredProductCatalog.map((product) => <tr key={product.id}><td className="product-selection-cell"><Checkbox checked={selectedProductIds.includes(product.id)} onCheckedChange={(checked) => toggleProductSelection(product.id, checked === true)} aria-label={`Selecionar ${product.name}`} /></td><td><div className="table-product"><AdminProductThumbnail src={product.images[0]} alt={`Imagem de ${product.name}`} /><div><strong>{product.name}</strong><span>{product.collection}</span></div></div></td><td><span className="inventory-sku">{product.sku || "Sem SKU"}</span></td><td><span>{product.category}</span>{product.subcategory && <small className="inventory-unit">{product.subcategory}</small>}</td><td><strong className={product.stock === 0 ? "inventory-stock-zero" : "inventory-stock-value"}>{product.stock}</strong><span className="inventory-unit">unidades</span></td><td><span className={`status-pill ${product.status === "Publicado" ? "success" : product.status === "Esgotado" ? "danger" : "warning"}`}>{product.status}</span></td><td><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.35rem" }}>
              <button className="table-more" aria-label={`Editar produto ${product.name}`} title="Editar produto" onClick={() => {
                setEditorMode("product");
                const numericPrice = Number(product.price.replace(/[^0-9,]/g, "").replace(",", ".")) || 0;
                const numericPix = Number(product.pixPrice?.replace(/[^0-9,]/g, "").replace(",", ".")) || numericPrice;
                const numericPromo = product.promotionalPrice !== null && product.promotionalPrice !== undefined ? Number(String(product.promotionalPrice).replace(/[^0-9,]/g, "").replace(",", ".")) : null;
                setEditingProduct({ id: product.id, name: product.name, collection: product.collection, category: product.category, subcategory: product.subcategory ?? null, sku: product.sku ?? "", slug: product.slug ?? "", visibility: product.visibility ?? "visible", categoryIds: product.categoryIds ?? [], price: numericPrice, pixPrice: numericPix, promotionalPrice: Number.isNaN(numericPromo) ? null : numericPromo, description: getProductDescriptionDraft(product.description), sizeGuide: getProductSizeGuideDraft(product.sizeGuide), status: product.status, variations: product.variations.map((variation) => ({ size: variation.size, stock: variation.stock })) });
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

        {active === "Coleções" && <AdminCollectionsSection />}
        {active === "Eventos" && <AdminEventsSection />}
        {active === "Cupons" && <AdminCouponsSection />}
        {active === "Promoções" && <AdminPromotionsSection />}
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
              setEditingProduct({ id: product.id, name: product.name, collection: product.collection, category: product.category, subcategory: product.subcategory ?? null, sku: product.sku ?? "", slug: product.slug ?? "", visibility: product.visibility ?? "visible", categoryIds: product.categoryIds ?? [], price: 0, pixPrice: 0, description: "", status: product.status, variations: product.variations.map((variation) => ({ ...variation })) });
              setProductImages([]);
            }}><Pencil size={16} /></button><button type="button" className="table-more" style={{ color: '#b22222', borderColor: '#b22222', marginLeft: '0.4rem', padding: '0.2rem 0.5rem', fontSize: '11px' }} title="Excluir produto" onClick={() => {
              if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                deleteProductMutation.mutate({ productId: product.id }, {
                  onSuccess: (result) => {
                    void Promise.all([utils.admin.listProducts.invalidate(), utils.catalog.list.invalidate()]);
                    toast.success(result.message);
                  },
                  onError: () => toast.error("Não foi possível excluir o produto. Tente novamente."),
                });
              }
            }}>Excluir</button></td></tr>)}
          </tbody></table></div>
        </section>}

        {active === "Categorias" && <AdminCategoriesSection />}

        {editingProduct && (
          <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="admin-panel admin-modal admin-modal--product" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', padding: '2rem' }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">{editorMode === "inventory" ? "ATUALIZAÇÃO RÁPIDA" : "GESTÃO DE CATÁLOGO"}</span>
                  <h3>{editorMode === "inventory" ? `Estoque: ${editingProduct.name}` : editingProduct.name ? `Editar: ${editingProduct.name}` : "Novo Produto"}</h3>
                </div>
                <button type="button" onClick={() => setEditingProduct(null)} className="admin-modal-close" aria-label="Fechar editor de produto" title="Fechar"><X size={18} /></button>
              </div>

              {editorMode === "product" && <>
                <div className="product-editor-grid" style={{ marginTop: '1rem' }}>
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
                    <select
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#111' }}
                      value={editingProduct.collection}
                      onChange={(e) => setEditingProduct({ ...editingProduct, collection: e.target.value })}
                    >
                      <option value="">Selecione uma coleção...</option>
                      {adminCollections.map((col: any) => (
                        <option key={col.id || col.slug} value={col.name}>
                          {col.name} ({col.year})
                        </option>
                      ))}
                      {editingProduct.collection && !adminCollections.some((col: any) => col.name === editingProduct.collection) && (
                        <option value={editingProduct.collection}>{editingProduct.collection} (Atual)</option>
                      )}
                    </select>
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
                    <label>Link do produto</label>
                    <Input value={editingProduct.slug ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })} placeholder="ex.: camiseta-drafts-preta" />
                    <small className="editor-help">Use letras minúsculas, números e hífens. Este será o endereço público da peça.</small>
                  </div>
                  <div className="editor-field">
                    <label>Visibilidade</label>
                    <select style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} value={editingProduct.visibility ?? "visible"} onChange={(e) => setEditingProduct({ ...editingProduct, visibility: e.target.value as ProductVisibility })}>
                      <option value="visible">Visível — aparece na loja</option>
                      <option value="unlisted">Não listado — somente por link</option>
                      <option value="hidden">Oculto — não aparece publicamente</option>
                    </select>
                  </div>
                  <div className="editor-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Categorias do produto</label>
                    <small className="editor-help">Selecione todas as categorias em que esta peça deve aparecer.</small>
                    <div className="product-category-checklist" role="group" aria-label="Categorias do produto">
                      {adminCategories.length === 0 ? <span className="editor-help">Nenhuma categoria cadastrada. Crie categorias primeiro em Categorias.</span> : adminCategories.map((category) => {
                        const categoryId = Number(category.id);
                        const selected = Array.isArray(editingProduct.categoryIds) && editingProduct.categoryIds.includes(categoryId);
                        return <label className={`product-category-option ${selected ? "selected" : ""}`} key={category.id}>
                          <input type="checkbox" checked={selected} onChange={(event) => toggleEditingCategory(categoryId, event.target.checked)} />
                          <span>{category.parentId ? `↳ ${category.name}` : category.name}</span>
                        </label>;
                      })}
                    </div>
                  </div>
                  <div className="editor-field">
                    <label>Preço normal (R$)</label>
                    <Input type="number" min="0.01" step="0.01" value={editingProduct.price ?? ""} placeholder="Defina o preço normal" onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value === "" ? "" : Number(e.target.value) })} />
                  </div>
                  <div className="editor-field">
                    <label>Preço PIX (R$)</label>
                    <Input type="number" min="0.01" step="0.01" value={editingProduct.pixPrice ?? ""} placeholder="Defina o preço Pix" onChange={(e) => setEditingProduct({ ...editingProduct, pixPrice: e.target.value === "" ? "" : Number(e.target.value) })} />
                  </div>
                  <div className="editor-field">
                    <label>Preço promocional (R$) <span style={{ fontSize: '11px', color: '#b22222', fontWeight: 600 }}>(Opcional)</span></label>
                    <Input type="number" value={editingProduct.promotionalPrice ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, promotionalPrice: e.target.value ? parseFloat(e.target.value) : null })} placeholder="Ex.: 129.90" />
                    <small className="editor-help">Se preenchido, ativa o selo de promoção e o preço anterior riscado.</small>
                  </div>
                  <div className="editor-field">
                    <label>Status</label>
<select style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} value={editingProduct.status ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}>
                       <option value="" disabled>Escolha o status</option>
                       <option value="Publicado">Publicado</option>
                      <option value="Rascunho">Rascunho</option>
                      <option value="Esgotado">Esgotado</option>
                    </select>
                  </div>
                </div>
              </>}

              <section className="inventory-variation-editor" aria-labelledby="variation-editor-title">
                <div className="inventory-section-heading">
                  <div><span className="section-kicker">INVENTÁRIO</span><h4 id="variation-editor-title">Tamanhos e estoque</h4><p>Selecione os tamanhos disponíveis e informe o número de peças. Este catálogo não utiliza cores como variação.</p></div>
                  <strong>{(editingProduct.variations ?? []).reduce((total: number, variation: AdminVariation) => total + Number(variation.stock || 0), 0)} un.</strong>
                </div>
                <div className="size-checkbox-grid">
                  {getInventorySizeOptions(String(editingProduct.category ?? "")).map((size) => {
                    const variation = (editingProduct.variations ?? []).find((item: AdminVariation) => item.size === size);
                    return <label className={`size-checkbox ${variation ? "selected" : ""}`} key={size}>
                      <input type="checkbox" checked={Boolean(variation)} onChange={(event) => toggleEditingVariation(size, event.target.checked)} />
                      <span>{size}</span>
                    </label>;
                  })}
                </div>
                <div className="inventory-variation-list">
                  {(editingProduct.variations ?? []).map((variation: AdminVariation, index: number) => (
                    <div className="inventory-variation-row" key={`${variation.size}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className="variation-size-label" style={{ minWidth: '90px', fontWeight: 600 }}>{variation.size}</span>
                      <span className="variation-stock-field" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                        <Input type="number" min="0" step="1" value={variation.stock} aria-label={`Estoque tamanho ${variation.size}`} onChange={(event) => updateEditingVariationStock(variation.size, event.target.value)} />
                        <small>peças</small>
                      </span>
                      <button type="button" onClick={() => toggleEditingVariation(variation.size, false)} style={{ background: 'transparent', border: 'none', color: '#b22222', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem' }} title={`Remover tamanho ${variation.size}`} aria-label={`Remover tamanho ${variation.size}`}>✕</button>
                    </div>
                  ))}
                  {(editingProduct.variations ?? []).length === 0 && <p className="inventory-empty-state">Nenhum tamanho selecionado. Escolha uma opção acima para começar.</p>}
                </div>
              </section>

              {editorMode === "product" && <>
                <section className="product-size-guide-editor" aria-labelledby="product-size-guide-title">
                  <div className="inventory-section-heading">
                    <div>
                      <span className="section-kicker">EXPERIÊNCIA DO CLIENTE</span>
                      <h4 id="product-size-guide-title">Guia de tamanhos desta peça</h4>
                      <p>Edite a tabela específica deste produto. Use medidas em centímetros ou a nomenclatura que preferir.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={addEditingSizeGuideRow}><Plus size={14} /> Adicionar linha</Button>
                  </div>
                  {(editingProduct.sizeGuide ?? []).length > 0 ? (
                    <div className="product-size-guide-table" role="table" aria-label="Guia de tamanhos do produto">
                      <div className="product-size-guide-row product-size-guide-row--header" role="row">
                        <span role="columnheader">Tamanho</span>
                        <span role="columnheader">Largura</span>
                        <span role="columnheader">Comprimento</span>
                        <span aria-hidden="true" />
                      </div>
                      {(editingProduct.sizeGuide ?? []).map((row: ProductSizeGuideRow, index: number) => (
                        <div className="product-size-guide-row" role="row" key={`size-guide-${index}`}>
                          <Input value={row.size} onChange={(event) => updateEditingSizeGuideRow(index, "size", event.target.value)} placeholder="Ex.: M" aria-label={`Tamanho da linha ${index + 1}`} />
                          <Input value={row.width} onChange={(event) => updateEditingSizeGuideRow(index, "width", event.target.value)} placeholder="Ex.: 54 cm" aria-label={`Largura da linha ${index + 1}`} />
                          <Input value={row.length} onChange={(event) => updateEditingSizeGuideRow(index, "length", event.target.value)} placeholder="Ex.: 72 cm" aria-label={`Comprimento da linha ${index + 1}`} />
                          <button type="button" className="product-size-guide-remove" onClick={() => removeEditingSizeGuideRow(index)} aria-label={`Remover linha ${index + 1}`} title="Remover linha"><X size={15} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="product-size-guide-empty">
                      <Ruler size={18} />
                      <span>Nenhuma medida personalizada adicionada. Clique em “Adicionar linha” para criar a guia desta peça.</span>
                    </div>
                  )}
                </section>

                <div className="editor-field" style={{ marginTop: '1rem' }}>
                  <label>Descrição do produto</label>
                <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              </div>

              <div className="editor-field" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label>Galeria de Fotos do Produto ({productImages.length})</label>
                  <input type="file" ref={productFileInputRef} style={{ display: 'none' }} accept="image/*" multiple onChange={handleMultipleProductUpload} />
                  <Button type="button" onClick={() => productFileInputRef.current?.click()} disabled={productUploading}>
                    <Upload size={14} /> {productUploading ? `A otimizar ${productUploadProgress.completed}/${productUploadProgress.total}...` : "Adicionar fotos"}
                  </Button>
                </div>
                <div className="product-image-gallery" style={{ marginTop: '0.5rem' }}>
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

              <div className="admin-modal-actions" style={{ marginTop: '2rem' }}>
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
                  const validationError = validateProductDraft(editingProduct);
                  if (validationError) {
                    toast.error(validationError);
                    return;
                  }
                  const productName = String(editingProduct.name ?? "").trim();
                  const normalPrice = Number(editingProduct.price);
                  const pixPrice = Number(editingProduct.pixPrice);
                  saveProductMutation.mutate({
                     ...editingProduct,
                     name: productName,
                     price: normalPrice,
                     pixPrice,
                     images: productImages,
                     variations,
                     description: String(editingProduct.description ?? ""),
                     sizeGuide: getProductSizeGuideDraft(editingProduct.sizeGuide),
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
        {active === "Vendas" && <AdminSalesSection />}
        {active === "Carrinhos Abandonados" && <AdminAbandonedCartsSection />}
        {active === "Pedido Manual" && <AdminManualOrderSection />}
        {active === "Pedidos" && <section className="admin-content"><div className="order-cards"><div className="metric-card"><span>Todos os pedidos</span><strong>{adminOrders.length}</strong></div><div className="metric-card"><span>Aguardando pagamento</span><strong>{adminOrders.filter((order) => !isPaymentConfirmed(order.paymentStatus)).length}</strong></div><div className="metric-card"><span>Em preparação</span><strong>{adminOrders.filter((order) => ["Processando", "Em preparação"].includes(order.status)).length}</strong></div><div className="metric-card"><span>Enviados</span><strong>{adminOrders.filter((order) => ["Enviado", "Entregue"].includes(order.status)).length}</strong></div></div><div className="admin-panel table-panel">{adminOrdersLoading ? <div className="dashboard-empty-state"><LoaderCircle className="spin" size={18} /> A carregar pedidos...</div> : adminOrders.length === 0 ? <div className="empty-admin" style={{ padding: "3rem", textAlign: "center" }}><ShoppingCart size={30} style={{ color: "#b22222", marginBottom: "0.75rem" }} /><h3>Nenhuma venda registada</h3><p>Quando o primeiro pagamento for confirmado, o pedido aparecerá aqui.</p></div> : <table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead><tbody>{adminOrders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td>{order.customerName}</td><td>{new Date(order.createdAt).toLocaleString("pt-BR")}</td><td>R$ {Number(order.total).toFixed(2)}</td><td><span className={isPaymentConfirmed(order.paymentStatus) ? "stock-ok" : "stock-warning"}>{getPaymentLabel(order.paymentStatus)}</span></td><td><span className={`status-pill ${order.status === "Entregue" ? "success" : "warning"}`}>{order.status}</span></td><td><button className="table-more" onClick={() => toast.info(`Detalhes do pedido ${order.orderNumber}`)}><Eye size={17} /></button></td></tr>)}</tbody></table>}</div></section>}
        {active === "Página em construção" && (
          <section className="admin-content">
            <div className="content-toolbar">
              <div>
                <span className="section-kicker">EXPERIÊNCIA PÚBLICA</span>
                <h2 className="content-title">Página em construção &amp; Próximo drop</h2>
                <p className="content-subtitle">Tranque a loja para visitantes, configure o contador regressivo e edite as mensagens da barra de anúncio.</p>
              </div>
              <Button onClick={() => {
                const storefrontPayload = getStorefrontSavePayload();
                if (storefrontPayload) {
                  saveStorefrontConfigMutation.mutate(storefrontPayload, {
                    onSuccess: (result) => {
                      setStorefrontConfigDraft(result.config);
                      resetStorefrontPasswordDraft();
                      void utils.catalog.getStorefrontConfig.invalidate();
                      toast.success("Configurações da página em construção guardadas.");
                    },
                    onError: () => toast.error("Erro ao guardar as configurações."),
                  });
                }
              }}>
                Guardar alterações
              </Button>
            </div>
            <StorefrontSettingsPanel config={storefrontConfigDraft} onChange={setStorefrontConfigDraft} passwordDraft={storefrontPasswordDraft} onPasswordChange={setStorefrontPasswordDraft} clearPassword={clearStorefrontPassword} onClearPasswordChange={setClearStorefrontPassword} />
          </section>
        )}
        {active === "Aparência" && <section className="admin-content appearance-workspace"><div className="content-toolbar"><div><span className="section-kicker">EDITOR DA LOJA</span><h2 className="content-title">Aparência da loja</h2><p className="content-subtitle">Organize a Home, os banners, a comunicação e as regras comerciais num único espaço de edição.</p></div><Button onClick={() => {
          saveConfigMutation.mutate({ pixDiscountPercent: Number(pixDiscountPercent), freeShippingThreshold: Number(freeShippingThreshold), maxInstallments: Number(maxInstallments), interestFreeInstallments: Number(interestFreeInstallments), installmentInterestRate: Number(installmentInterestRate) }, { onSuccess: () => setAppearanceSaved(true), onError: () => toast.error("Erro ao guardar configurações comerciais.") });
          saveHomeContentMutation.mutate({ banners: homeBanners, highlights: homeHighlights, productSections: homeProductSections, vipBanner: homeVipBanner, sectionTitles: homeSectionTitles }, { onSuccess: () => { void utils.catalog.getHomeContent.invalidate(); setAppearanceSaved(true); toast.success("Home, banners e bloco VIP guardados."); }, onError: () => toast.error("Erro ao guardar o conteúdo da Home.") });
          const storefrontPayload = getStorefrontSavePayload();
          if (storefrontPayload) {
            saveStorefrontConfigMutation.mutate(storefrontPayload, { onSuccess: (result) => { setStorefrontConfigDraft(result.config); resetStorefrontPasswordDraft(); void utils.catalog.getStorefrontConfig.invalidate(); setAppearanceSaved(true); }, onError: () => toast.error("Erro ao guardar as configurações públicas da loja.") });
          }
        }}>Guardar alterações</Button></div><div className="appearance-workspace-intro"><div><span className="section-kicker">ERAS LABEL / CMS VISUAL</span><h3>Uma Home construída por eras</h3><p>Use os blocos abaixo para controlar o conteúdo que aparece no storefront. As alterações são guardadas no backend e mantêm os produtos reais selecionados pelo painel.</p></div><div className="appearance-publish-state"><span className={appearanceSaved ? "status-dot is-saved" : "status-dot"} aria-hidden="true" /><div><strong>{appearanceSaved ? "Alterações guardadas" : "Editor pronto"}</strong><small>{appearanceSaved ? "A Home pública está sincronizada." : "Edite os blocos e guarde quando terminar."}</small></div></div></div><div className="appearance-overview-cards"><div><span>Banners activos</span><strong>{homeBanners.length}</strong><small>slides configurados</small></div><div><span>Secções da Home</span><strong>{homeProductSections.length}</strong><small>curadorias editoriais</small></div><div><span>Produtos no catálogo</span><strong>{adminProducts.length}</strong><small>{catalogProductsLoading ? "a carregar dados reais" : "produtos disponíveis"}</small></div><div><span>Barra de anúncio</span><strong>{storefrontConfigDraft?.announcement.messages.length ?? 0}</strong><small>mensagens rotativas</small></div></div><div className="appearance-grid"><div className="admin-panel appearance-panel home-section-titles-panel"><div className="panel-heading"><div><span className="section-kicker">NOMES DA HOME</span><h3>Títulos das secções</h3></div><span className="editor-help">Visíveis na loja</span></div><p className="editor-description">Personalize os nomes que aparecem acima das secções editoriais sem alterar os produtos selecionados.</p><div className="home-section-title-fields"><label className="editor-field"><span>Secção de destaques</span><Input value={homeSectionTitles.highlights} onChange={(event) => setHomeSectionTitles((current) => ({ ...current, highlights: event.target.value }))} placeholder="Destaques" /></label><label className="editor-field"><span>Secção de produtos</span><Input value={homeSectionTitles.shop} onChange={(event) => setHomeSectionTitles((current) => ({ ...current, shop: event.target.value }))} placeholder="Produtos da Era" /></label><label className="editor-field"><span>Secção de comunidade</span><Input value={homeSectionTitles.community} onChange={(event) => setHomeSectionTitles((current) => ({ ...current, community: event.target.value }))} placeholder="Visto fora do estúdio." /></label></div></div><div className="admin-panel appearance-panel"><div className="panel-heading"><div><span className="section-kicker">CONFIGURAÇÕES COMERCIAIS</span><h3>Pix e Frete Grátis</h3></div></div><div className="editor-field"><label>Porcentagem de Desconto no Pix (%)</label><Input type="number" min="0" max="100" value={pixDiscountPercent} onChange={(event) => setPixDiscountPercent(Number(event.target.value))} /></div><div className="editor-field"><label>Valor Mínimo para Frete Grátis (R$)</label><Input type="number" min="0" step="10" value={freeShippingThreshold} onChange={(event) => setFreeShippingThreshold(Number(event.target.value))} /></div><div className="editor-field"><label>Máximo de Parcelas no Cartão</label><Input type="number" min="1" max="24" value={maxInstallments} onChange={(event) => setMaxInstallments(Number(event.target.value))} /></div><div className="editor-field"><label>Juros Mensais no Parcelamento (%)</label><Input type="number" min="0" max="20" step="0.01" value={installmentInterestRate} onChange={(event) => setInstallmentInterestRate(Number(event.target.value))} /><small className="editor-help">Aplicado de forma composta a partir da 2ª parcela.</small></div></div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">BANNER ROTATIVO</span><h3>Carrossel principal da Home</h3></div><div className="banner-editor-header-actions"><span className="editor-help">{homeBanners.length} slides</span><button type="button" className="banner-add-button" onClick={addHomeBanner}><Plus size={14} /> Adicionar banner</button></div></div>{homeBanners.map((banner, index) => <div className="home-editor-banner" key={banner.id}><div className="home-editor-banner-preview" style={{ backgroundImage: banner.imageUrl ? "url(" + banner.imageUrl + ")" : undefined }}><span>{String(index + 1).padStart(2, "0")}</span></div><div className="home-editor-banner-controls"><label className="image-control-button"><input type="file" accept="image/*" onChange={(event) => handleHomeImageUpload(event, "banner", index)} />{uploading ? "A carregar..." : "Trocar imagem"}</label>{banner.imageUrl && <button type="button" className="image-remove-button" onClick={() => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: "" } : item))}><X size={14} /> Remover</button>}</div><div className="home-editor-banner-actions" aria-label={`Ações do banner ${index + 1}`}><button type="button" className="section-order-button" disabled={index === 0} onClick={() => moveHomeBanner(index, -1)} aria-label={`Mover banner ${index + 1} para cima`}>↑</button><button type="button" className="section-order-button" disabled={index === homeBanners.length - 1} onClick={() => moveHomeBanner(index, 1)} aria-label={`Mover banner ${index + 1} para baixo`}>↓</button><button type="button" className="banner-secondary-action" onClick={() => duplicateHomeBanner(index)}>Duplicar</button><button type="button" className="highlight-remove-button" onClick={() => removeHomeBanner(index)} aria-label={`Remover banner ${index + 1}`}><X size={14} /></button></div><div className="home-editor-fields"><Input value={banner.eyebrow} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, eyebrow: event.target.value } : item))} placeholder="Etiqueta" /><Input value={banner.title} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Título" /><Input value={banner.subtitle} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item))} placeholder="Texto de apoio" /><div className="home-editor-inline"><Input value={banner.cta} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, cta: event.target.value } : item))} placeholder="CTA" /><select value={banner.targetType === "catalog" ? "catalog" : banner.targetType === "category" ? `category:${banner.targetValue ?? ""}` : "custom"} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => { if (itemIndex !== index) return item; const value = event.target.value; if (value === "catalog") return { ...item, targetType: "catalog" as const, targetValue: "", href: "/catalog" }; if (value.startsWith("category:")) { const slug = value.slice("category:".length); return { ...item, targetType: "category" as const, targetValue: slug, href: `/category/${slug}` }; } return { ...item, targetType: "custom" as const }; }))} aria-label={`Destino do banner ${index + 1}`}><option value="custom">Link personalizado</option><option value="catalog">Todos os produtos</option>{adminCategories.map((category) => <option key={category.id} value={`category:${category.slug}`}>{category.name} · {category.active ? "PUBLICADA" : "NÃO LISTADA"}</option>)}</select>{(!banner.targetType || banner.targetType === "custom") && <Input value={banner.href} onChange={(event) => setHomeBanners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value, targetType: "custom" as const } : item))} placeholder="Link personalizado" />}</div></div></div>)}</div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">DESTAQUES</span><h3>Curadoria da Home</h3></div><span className="editor-help">{homeHighlights.length} cards</span></div><p className="editor-description">Escolha os produtos que aparecem no bloco Destaques e defina a etiqueta exibida sobre cada peça.</p>{catalogProductsLoading && <p className="editor-description">A carregar o catálogo real…</p>}{!catalogProductsLoading && adminProducts.length === 0 && <p className="editor-description">Ainda não existem produtos persistidos no catálogo para selecionar.</p>}{homeHighlights.map((highlight, index) => <div className="highlight-editor-row" key={highlight.id}><span className="highlight-editor-index">{String(index + 1).padStart(2, "0")}</span><select value={highlight.productId} onChange={(event) => setHomeHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, productId: Number(event.target.value) } : item))} aria-label={`Produto do destaque ${index + 1}`}>{adminProducts.length > 0 ? adminProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.collection}</option>) : <option value={highlight.productId}>Produto não disponível (ID {highlight.productId})</option>}</select><Input value={highlight.label} onChange={(event) => setHomeHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value.toUpperCase() } : item))} placeholder="Etiqueta" aria-label={`Etiqueta do destaque ${index + 1}`} /><button type="button" className="highlight-remove-button" onClick={() => setHomeHighlights((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current)} aria-label={`Remover destaque ${index + 1}`}>×</button></div>)}<button type="button" className="highlight-add-button" onClick={() => setHomeHighlights((current) => [...current, { id: `highlight-${Date.now()}`, productId: adminProducts[current.length % adminProducts.length].id, label: "NOVA PEÇA" }])} disabled={homeHighlights.length >= 6 || adminProducts.length === 0}><Plus size={15} /> Adicionar destaque</button></div><div className="admin-panel appearance-panel home-editor-panel home-shop-curation-panel"><div className="panel-heading"><div><span className="section-kicker">SHOP DA HOME</span><h3>Secções publicadas</h3></div><span className="editor-help">{homeProductSections.length} secções</span></div><p className="editor-description">A Home mostra apenas os produtos incluídos nestas secções. Crie uma secção, escolha os produtos reais e arraste a ordem pelas setas.</p>{homeProductSections.map((section, index) => (
  <article className="home-shop-section-editor category-curation-editor" key={section.id}>
    <div className="category-curation-heading">
      <span className="highlight-editor-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="category-curation-heading-copy">
        <span className="section-kicker">{section.eyebrow || "CATEGORIA"}</span>
        <span className="category-curation-count">{section.productIds.length} produto{section.productIds.length === 1 ? "" : "s"} selecionado{section.productIds.length === 1 ? "" : "s"}</span>
      </div>
      <div className="category-curation-actions" aria-label={`Ações da secção ${index + 1}`}>
        <button type="button" className="section-order-button" disabled={index === 0} onClick={() => setHomeProductSections((current) => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })} aria-label="Mover secção para cima">↑</button>
        <button type="button" className="section-order-button" disabled={index === homeProductSections.length - 1} onClick={() => setHomeProductSections((current) => { const next = [...current]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })} aria-label="Mover secção para baixo">↓</button>
        <button type="button" className="highlight-remove-button" onClick={() => setHomeProductSections((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remover secção ${index + 1}`}>×</button>
      </div>
    </div>

    <div className="category-curation-fields">
      <label className="category-curation-field">
        <span>Etiqueta da secção</span>
        <Input value={section.eyebrow} onChange={(event) => setHomeProductSections((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, eyebrow: event.target.value.toUpperCase() } : item))} placeholder="CATEGORIA" aria-label={`Etiqueta da secção ${index + 1}`} />
      </label>
      <label className="category-curation-field">
        <span>Título da secção</span>
        <Input value={section.title} onChange={(event) => setHomeProductSections((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Nome da categoria" aria-label={`Título da secção ${index + 1}`} />
      </label>
      <label className="category-curation-field category-curation-field-wide">
        <span>Descrição opcional</span>
        <Input value={section.description} onChange={(event) => setHomeProductSections((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="Texto curto para apresentar esta categoria na Home" aria-label={`Descrição da secção ${index + 1}`} />
      </label>
    </div>

    <div className="category-products-heading">
      <div>
        <span className="editor-help">Produtos desta secção</span>
        <small>Selecione os produtos reais que devem aparecer nesta curadoria da Home.</small>
      </div>
      <span className="category-selection-pill">{section.productIds.length} selecionado{section.productIds.length === 1 ? "" : "s"}</span>
    </div>

    <div className="home-shop-product-options category-product-grid">
      {adminProducts.length === 0 ? (
        <span className="editor-description">Cadastre um produto antes de criar a curadoria da Home.</span>
      ) : adminProducts.map((product) => (
        <label className={`home-shop-product-option category-product-option ${section.productIds.includes(product.id) ? "selected" : ""}`} key={`${section.id}-${product.id}`}>
          <input type="checkbox" checked={section.productIds.includes(product.id)} onChange={(event) => setHomeProductSections((current) => current.map((item, itemIndex) => { if (itemIndex !== index) return item; const productIds = event.target.checked ? Array.from(new Set([...item.productIds, product.id])) : item.productIds.filter((id) => id !== product.id); return { ...item, productIds }; }))} />
          <AdminProductThumbnail src={product.images?.[0]} alt={`Miniatura de ${product.name}`} />
          <span className="category-product-option-copy"><strong>{product.name}</strong><small>{product.collection || "Sem coleção"}</small></span>
        </label>
      ))}
    </div>
  </article>
))}

<div className="premium-section-creator">
  <div className="premium-section-creator-copy">
    <span className="section-kicker">CURADORIA DA HOME</span>
    <strong>Adicionar uma nova secção</strong>
    <small>Escolha o tipo de curadoria e personalize o título e os produtos depois.</small>
  </div>
  <div className="premium-section-creator-actions">
    <label className="premium-select-wrap">
      <span>Tipo de secção</span>
      <select value={newSectionType} onChange={(event) => setNewSectionType(event.target.value as typeof newSectionType)}>
        <option value="shop">Shop editorial</option>
        <option value="category">Categoria</option>
        <option value="collection">Coleção</option>
      </select>
      <ChevronDown size={15} />
    </label>
    <button type="button" className="highlight-add-button premium-add-section-button" onClick={() => setHomeProductSections((current) => [...current, { id: `${newSectionType}-${Date.now()}`, eyebrow: newSectionType === "category" ? "CATEGORIA" : newSectionType === "collection" ? "COLEÇÃO" : "SHOP", title: newSectionType === "category" ? "Nova categoria" : newSectionType === "collection" ? "Nova coleção" : `Nova secção ${current.length + 1}`, description: "", productIds: [] }])}>
      <Plus size={15} /> Adicionar secção
    </button>
  </div>
</div>
</div><div className="admin-panel appearance-panel home-editor-panel"><div className="panel-heading"><div><span className="section-kicker">BANNER VIP</span><h3>Grupo e acesso antecipado</h3></div></div><div className="home-editor-banner vip-editor-banner"><div className="home-editor-banner-preview" style={{ backgroundImage: homeVipBanner.imageUrl ? "url(" + homeVipBanner.imageUrl + ")" : undefined }}><span className="vip-preview-mark">VIP</span></div><div className="home-editor-banner-controls"><label className="image-control-button"><input type="file" accept="image/*" onChange={(event) => handleHomeImageUpload(event, "vip")} />{uploading ? "A carregar..." : "Trocar imagem"}</label>{homeVipBanner.imageUrl && <button type="button" className="image-remove-button" onClick={() => setHomeVipBanner((current) => ({ ...current, imageUrl: "" }))}><X size={14} /> Remover</button>}</div><div className="home-editor-fields"><Input value={homeVipBanner.eyebrow} onChange={(event) => setHomeVipBanner((current) => ({ ...current, eyebrow: event.target.value }))} placeholder="Etiqueta" /><Input value={homeVipBanner.title} onChange={(event) => setHomeVipBanner((current) => ({ ...current, title: event.target.value }))} placeholder="Título" /><Input value={homeVipBanner.subtitle} onChange={(event) => setHomeVipBanner((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Texto de apoio" /><div className="home-editor-inline"><Input value={homeVipBanner.cta} onChange={(event) => setHomeVipBanner((current) => ({ ...current, cta: event.target.value }))} placeholder="CTA" /><Input value={homeVipBanner.href} onChange={(event) => setHomeVipBanner((current) => ({ ...current, href: event.target.value }))} placeholder="Link do grupo VIP" /></div></div></div></div></div>{appearanceSaved && <p className="saved-note"><Check size={14} /> As alterações da Home foram guardadas.</p>}</section>}
        {active === "Newsletter" && <section className="admin-content"><div className="content-toolbar"><div><span className="section-kicker">RELACIONAMENTO</span><h2 className="content-title">Newsletter</h2></div><Button onClick={() => toast.success("Exportação preparada.")}>Exportar lista</Button></div><div className="newsletter-admin-top"><div className="metric-card"><span>Total de inscritos</span><strong>1.284</strong><small className="positive">+83 este mês</small></div><div className="metric-card"><span>Cupons enviados</span><strong>1.276</strong><small>ERAS10 · 10% OFF</small></div><div className="metric-card"><span>Taxa de abertura</span><strong>68,4%</strong><small className="positive">acima da média</small></div></div><div className="admin-panel table-panel"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Inscrição</th><th>Cupom</th><th>Status</th></tr></thead><tbody>{[['Marina Oliveira','marina@email.com','Hoje, 13:48'],['Caio Nascimento','caio@email.com','Hoje, 11:02'],['Lara Martins','lara@email.com','Ontem, 18:45'],['João Pedro','joao@email.com','12 Ago, 09:17']].map(([name, email, date]) => <tr key={email}><td><strong>{name}</strong></td><td>{email}</td><td>{date}</td><td><span className="coupon-mini">ERAS10</span></td><td><span className="status-pill success">Enviado</span></td></tr>)}</tbody></table></div></section>}
        {active === "Clientes" && <ClientsSection onNavigate={setActive} />}
        {active === "E-mail Marketing" && <EmailMarketingSection />}
        {active === "E-mails (Resend)" && <EmailLogsSection />}
        {active === "Configurações" && <AdminSettingsSection onNavigate={selectNav} />}
        {active === "Gestão de Equipa" && <SubAdminsManagementSection />}
      </main>
    </div>
  );
}

type AdminDashboardOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number | string;
  createdAt: Date | string | number;
  status: string;
  paymentStatus: string;
};

function AdminDashboardHome({ adminName, adminOrders, adminOrdersLoading, catalogCount, onNavigate }: { adminName: string; adminOrders: AdminDashboardOrder[]; adminOrdersLoading: boolean; catalogCount: number; onNavigate: (label: string) => void }) {
  const [periodDays, setPeriodDays] = useState(7);
  const [rangeMode, setRangeMode] = useState<"preset" | "custom" | "today" | "yesterday">("preset");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<any | null>(null);
  const analyticsInput = useMemo(() => {
    const hasDateRange = isValidAnalyticsDateRange(customStartDate, customEndDate);
    if ((rangeMode === "custom" || rangeMode === "today" || rangeMode === "yesterday") && hasDateRange) {
      return { periodDays: 1, startDate: customStartDate, endDate: customEndDate };
    }
    return { periodDays };
  }, [rangeMode, customStartDate, customEndDate, periodDays]);
  const analyticsRangeReady = rangeMode !== "custom" || isValidAnalyticsDateRange(customStartDate, customEndDate);
  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery(analyticsInput, {
    enabled: analyticsRangeReady,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: true,
  });
  const summary = analytics?.summary ?? { visits: 0, sales: 0, revenue: 0, averageTicket: 0, conversionRate: 0 };
  const trend = analytics?.salesTrend ?? [];
  const rangeLabel = rangeMode === "custom" && customStartDate && customEndDate
    ? `De ${customStartDate.split("-").reverse().join("/")} até ${customEndDate.split("-").reverse().join("/")}`
    : rangeMode === "today"
    ? `Hoje (${new Date().toLocaleDateString("pt-BR")})`
    : rangeMode === "yesterday"
    ? `Ontem`
    : `últimos ${periodDays} dias`;
  const orderCounts = {
    awaiting: adminOrders.filter((order) => !isPaymentConfirmed(order.paymentStatus)).length,
    packing: adminOrders.filter((order) => ["Processando", "Em preparação"].includes(order.status)).length,
    shipping: adminOrders.filter((order) => ["Enviado", "Em trânsito"].includes(order.status)).length,
    pickup: adminOrders.filter((order) => order.status === "Disponível para retirada").length,
  };
  const maxRevenue = Math.max(1, ...trend.map((item: any) => Number(item.revenue) || 0));
  const maxVisits = Math.max(1, ...trend.map((item: any) => Number(item.visits) || 0));
  const firstName = adminName.split(" ")[0];

  return (
    <section className="admin-content admin-dashboard-home">
      <div className="admin-welcome">
        <div><p className="section-kicker">PAINEL SEGURO</p><h2>Bom dia, {firstName}.</h2><p>Uma visão limpa da operação, sem dados de demonstração.</p></div>
        <Button onClick={() => onNavigate("Produtos")}><Plus size={16} /> Novo produto</Button>
      </div>
      <div className="dashboard-period-toolbar">
        <div><span className="section-kicker">PERÍODO DE ANÁLISE</span><strong>{rangeLabel}</strong></div>
        <div className="analytics-period-picker">
          <button className={`period-btn ${rangeMode === "today" ? "active" : ""}`} type="button" onClick={() => {
            setRangeMode("today");
            const todayStr = toLocalDateInputValue(new Date());
            setCustomStartDate(todayStr);
            setCustomEndDate(todayStr);
          }}>Hoje</button>
          <button className={`period-btn ${rangeMode === "yesterday" ? "active" : ""}`} type="button" onClick={() => {
            setRangeMode("yesterday");
            const yest = new Date();
            yest.setDate(yest.getDate() - 1);
            const yestStr = toLocalDateInputValue(yest);
            setCustomStartDate(yestStr);
            setCustomEndDate(yestStr);
          }}>Ontem</button>
          {[7, 15, 30].map((days) => <button key={days} className={`period-btn ${rangeMode === "preset" && periodDays === days ? "active" : ""}`} type="button" onClick={() => { setRangeMode("preset"); setPeriodDays(days); }}>{days} dias</button>)}
          <button className={`period-btn ${rangeMode === "custom" ? "active" : ""}`} type="button" onClick={() => setRangeMode("custom")}>Personalizado</button>
        </div>
        {rangeMode === "custom" && (
          <div className="analytics-custom-range">
            <label>De <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} /></label>
            <label>Até <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} /></label>
            {customStartDate && customEndDate && (
              <span className="custom-range-badge">Exibindo de {customStartDate.split("-").reverse().join("/")} até {customEndDate.split("-").reverse().join("/")}</span>
            )}
          </div>
        )}
      </div>
      <div className="order-status-strip">
        {[{ label: "Por cobrar", value: orderCounts.awaiting, icon: ShoppingCart }, { label: "Por embalar", value: orderCounts.packing, icon: Package }, { label: "Por enviar", value: orderCounts.shipping, icon: ClipboardList }, { label: "Por retirar", value: orderCounts.pickup, icon: Check }].map(({ label, value, icon: Icon }) => <div className="order-status-card" key={label}><span className="order-status-icon"><Icon size={16} /></span><div><strong>{value === 0 ? "Sem pedidos" : value}</strong><span>{label}</span></div></div>)}
      </div>
      <div className="metric-grid">
        <div className="metric-card"><span>Visitas</span><strong>{isLoading ? "—" : summary.visits}</strong><small>Dados registados no período</small></div>
        <div className="metric-card"><span>Vendas</span><strong>{isLoading ? "—" : summary.sales}</strong><small>Pedidos no período</small></div>
        <div className="metric-card"><span>Faturamento</span><strong>{isLoading ? "—" : `R$ ${Number(summary.revenue).toFixed(2)}`}</strong><small>Receita bruta registada</small></div>
        <div className="metric-card"><span>Produtos no catálogo</span><strong>{catalogCount}</strong><small>{catalogCount === 0 ? "Pronto para o primeiro cadastro" : "Itens publicados ou em rascunho"}</small></div>
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel chart-panel dashboard-chart-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">EVOLUÇÃO DA LOJA</span>
              <h3>Vendas e Visitas no Período</h3>
            </div>
            <div className="chart-legend-badge">
              <span className="legend-dot revenue-dot" /> Faturamento (R$) &nbsp;
              <span className="legend-dot visits-dot" /> Visitas
            </div>
          </div>
          {isLoading ? (
            <div className="dashboard-empty-state"><LoaderCircle className="spin" size={18} /> A carregar gráfico de linhas...</div>
          ) : trend.length === 0 ? (
            <div className="dashboard-empty-state"><BarChart3 size={22} /><strong>Ainda não existem dados para exibir.</strong><span>O gráfico de linhas será gerado assim que houver atividade na loja.</span></div>
          ) : (
            <div className="interactive-line-chart-container">
              <div className="chart-axis-labels">
                <span>R$ {maxRevenue.toFixed(0)}</span>
                <span>R$ {(maxRevenue * 0.5).toFixed(0)}</span>
                <span>R$ 0</span>
              </div>
              <div className="svg-line-chart-wrap">
                <svg className="analytics-line-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Linha de Faturamento */}
                  <path
                    d={trend.reduce((acc: string, item: any, i: number) => {
                      const x = (i / (Math.max(1, trend.length - 1))) * 560 + 20;
                      const y = 180 - Math.max(10, ((Number(item.revenue) || 0) / (maxRevenue || 1)) * 160);
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#b22222"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Linha de Visitas (escala proporcional menor) */}
                  <path
                    d={trend.reduce((acc: string, item: any, i: number) => {
                      const x = (i / (Math.max(1, trend.length - 1))) * 560 + 20;
                      const y = 180 - Math.max(10, ((Number(item.visits) || 0) / maxVisits) * 160);
                      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, "")}
                    fill="none"
                    stroke="#333333"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Pontos de Faturamento Interativos com Hover */}
                  {trend.map((item: any, i: number) => {
                    const x = (i / (Math.max(1, trend.length - 1))) * 560 + 20;
                    const y = 180 - Math.max(10, ((Number(item.revenue) || 0) / (maxRevenue || 1)) * 160);
                    const isHovered = hoveredChartPoint && hoveredChartPoint.label === item.label;
                    return (
                      <g key={`rev-${i}`} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredChartPoint(item)} onMouseLeave={() => setHoveredChartPoint(null)}>
                        <circle cx={x} cy={y} r={isHovered ? "8" : "5"} fill={isHovered ? "#b22222" : "#ffffff"} stroke="#b22222" strokeWidth={isHovered ? "3.5" : "3"} />
                        <circle cx={x} cy={y} r="18" fill="transparent" />
                      </g>
                    );
                  })}
                </svg>
                {hoveredChartPoint && (
                  <div className="chart-floating-tooltip">
                    <strong>{hoveredChartPoint.label}</strong>
                    <span>Faturamento: <b>R$ {Number(hoveredChartPoint.revenue || 0).toFixed(2)}</b></span>
                    <span>Vendas: <b>{hoveredChartPoint.orders || 0} pedido(s)</b></span>
                    <span>Visitas: <b>{hoveredChartPoint.visits || 0} visita(s)</b></span>
                  </div>
                )}
                <div className="chart-x-labels">
                  {trend.map((item: any, i: number) => (
                    <span
                      key={i}
                      className={hoveredChartPoint && hoveredChartPoint.label === item.label ? "active-x-label" : ""}
                      onMouseEnter={() => setHoveredChartPoint(item)}
                      onMouseLeave={() => setHoveredChartPoint(null)}
                      onClick={() => setHoveredChartPoint(item)}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="admin-panel"><div className="panel-heading"><div><span className="section-kicker">OPERAÇÃO</span><h3>Pedidos recentes</h3></div><button className="inline-link" type="button" onClick={() => onNavigate("Pedidos")}>Ver todos <ArrowLeft size={13} className="rotate-180" /></button></div><div className="mini-orders">{adminOrdersLoading ? <div className="dashboard-empty-state"><LoaderCircle className="spin" size={18} /> A carregar...</div> : adminOrders.length === 0 ? <div className="dashboard-empty-state"><ShoppingCart size={18} /><span>Nenhum pedido registado.</span></div> : adminOrders.slice(0, 3).map((order) => <div className="mini-order" key={order.id}><div className="order-icon"><ShoppingCart size={15} /></div><div><strong>{order.orderNumber} · {order.customerName}</strong><span>{new Date(order.createdAt).toLocaleString("pt-BR")}</span></div><b>R$ {Number(order.total).toFixed(2)}</b></div>)}</div></section>
      </div>
      <section className="admin-panel expectations-panel"><div className="panel-heading"><div><span className="section-kicker">ORIENTAÇÃO</span><h3>Próximas etapas</h3></div><span className="editor-help">Atualizado com o estado atual da loja</span></div><div className="expectations-grid">
        <button type="button" onClick={() => onNavigate("Produtos")}><Package size={19} /><span><strong>{catalogCount === 0 ? "Cadastre o primeiro produto" : "Gerir catálogo"}</strong><small>{catalogCount === 0 ? "Adicione nome, preço, SKU, imagens e variações." : `${catalogCount} item(ns) no catálogo.`}</small></span><ArrowLeft className="rotate-180" size={16} /></button>
        <button type="button" onClick={() => onNavigate("Aparência")}><ImagePlus size={19} /><span><strong>Personalizar a home</strong><small>Atualize banners, destaques e a barra de anúncio.</small></span><ArrowLeft className="rotate-180" size={16} /></button>
        <button type="button" onClick={() => onNavigate("Configurações")}><Settings2 size={19} /><span><strong>Rever configurações</strong><small>Defina o seu nome, permissões e parâmetros comerciais.</small></span><ArrowLeft className="rotate-180" size={16} /></button>
      </div></section>
    </section>
  );
}

// Componente de Estatísticas Avançadas com dados reais, filtros de período e comparação.
function AdminAnalyticsSection() {
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [rangeMode, setRangeMode] = useState<"preset" | "custom">("preset");
  const [comparisonMode, setComparisonMode] = useState<"none" | "previous">("none");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const analyticsInput = useMemo(() => rangeMode === "custom" && customStartDate && customEndDate
    ? { periodDays: 7, startDate: customStartDate, endDate: customEndDate }
    : { periodDays }, [rangeMode, customStartDate, customEndDate, periodDays]);
  // Mantém a consulta analítica estável e sem retries silenciosos: se o backend falhar,
  // o painel mostra uma mensagem útil; durante refetches, os dados reais anteriores
  // continuam visíveis em vez de trocar a página inteira por loading.
  const {
    data: analytics,
    isLoading,
    isError: analyticsError,
    error: analyticsQueryError,
    refetch,
  } = trpc.admin.getAnalytics.useQuery(analyticsInput, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
  const {
    data: aiData,
    isLoading: aiLoading,
    isError: aiError,
    refetch: refetchAi,
  } = trpc.admin.aiSummary.useQuery(analyticsInput, {
    enabled: Boolean(analytics),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });

  const exportAnalyticsCSV = () => {
    if (!analytics) return;
    const summary = analytics.summary;
    const headers = ["Métrica", "Valor"];
    const rows = [
      ["Período (dias)", analytics.period?.days || periodDays],
      ["Visitantes únicos", summary.visits],
      ["Visualizações de página", summary.pageViews || 0],
      ["Vendas pagas", summary.sales],
      ["Receita líquida (R$)", summary.revenue.toFixed(2)],
      ["Descontos (R$)", (summary.discounts || 0).toFixed(2)],
      ["Ticket médio (R$)", summary.averageTicket.toFixed(2)],
      ["Conversão (%)", summary.conversionRate],
    ];
    const rangeLabel = rangeMode === "custom" && customStartDate && customEndDate ? `${customStartDate}_${customEndDate}` : `${periodDays}dias`;
    if (exportToCSV(`estatisticas_eras_label_${rangeLabel}.csv`, headers, rows)) toast.success("Relatório de estatísticas exportado em CSV.");
    else toast.error("Não foi possível exportar o relatório.");
  };

  // O loading só bloqueia a primeira resposta. Se já houver analytics, um refetch
  // mantém os cards e gráficos visíveis; se houver erro, o admin recebe uma ação clara.
  if (!analytics && isLoading) {
    return <section className="admin-content"><div className="inventory-state"><LoaderCircle className="spin" size={24} /><strong>Carregando métricas reais...</strong><span>Estamos a consultar visitas, pedidos pagos e receita no banco da loja.</span></div></section>;
  }
  if (!analytics && analyticsError) {
    return <section className="admin-content"><div className="inventory-state analytics-error-state"><AlertTriangle size={24} /><strong>Não foi possível carregar as estatísticas.</strong><span>{analyticsQueryError?.message || "A consulta ao banco não respondeu corretamente."}</span><Button type="button" onClick={() => void refetch()}><RefreshCw size={15} /> Tentar novamente</Button></div></section>;
  }

  const summary = analytics?.summary || { visits: 0, pageViews: 0, sales: 0, revenue: 0, grossRevenue: 0, discounts: 0, averageTicket: 0, conversionRate: 0 };
  const behavior = analytics?.visitorBehavior || { totalVisits: 0, pageViews: 0, homeViews: 0, categoryViews: 0, collectionViews: 0, productViews: 0, cartViews: 0, checkoutViews: 0 };
  const trend = analytics?.salesTrend || [];
  const selectedDays = Number(analytics?.period?.days || periodDays);

  return (
    <section className="admin-content">
      <div className="content-toolbar eras-stats-page-heading">
        <div>
          <span className="section-kicker">ANÁLISE DE DADOS E DESEMPENHO</span>
          <h2 className="content-title">Visão geral</h2>
          <p>Dados reais de acessos registrados no storefront e pedidos com pagamento aprovado.</p>
        </div>
      </div>

      <div className="eras-stats-shell">
        <div className="eras-stats-toolbar">
          <div className="eras-stats-toolbar-heading"><span className="eras-stats-overline">PERÍODO DE ANÁLISE</span><strong>{selectedDays} {selectedDays === 1 ? "dia" : "dias"}</strong></div>
          <div className="eras-stats-filter-row">
            <div className="eras-stats-periods" role="group" aria-label="Período da estatística">
              {[1, 7, 15, 30].map((days) => <button key={days} className={`eras-stats-period-btn ${rangeMode === "preset" && periodDays === days ? "active" : ""}`} onClick={() => { setRangeMode("preset"); setPeriodDays(days); }} type="button">{days === 1 ? "Hoje" : `${days} dias`}</button>)}
              <button className={`eras-stats-period-btn ${rangeMode === "custom" ? "active" : ""}`} onClick={() => setRangeMode("custom")} type="button">Personalizado</button>
            </div>
            {rangeMode === "custom" && <div className="eras-stats-date-range"><label>De <input type="date" value={customStartDate} onChange={(event) => setCustomStartDate(event.target.value)} /></label><label>Até <input type="date" value={customEndDate} onChange={(event) => setCustomEndDate(event.target.value)} /></label>{customStartDate && customEndDate && customStartDate > customEndDate && <span className="eras-stats-filter-error">Intervalo inválido.</span>}</div>}
            <label className="eras-stats-comparison"><span>Comparação</span><select value={comparisonMode} onChange={(event) => setComparisonMode(event.target.value as "none" | "previous")}><option value="none">Nenhuma</option><option value="previous">Período anterior</option></select></label>
            <div className="eras-stats-actions"><Button variant="outline" onClick={exportAnalyticsCSV} disabled={!analytics}><Download size={15} /> Exportar</Button><Button variant="outline" onClick={() => void refetch()}><RefreshCw size={15} /> Atualizar</Button></div>
          </div>
        </div>
        <div className="eras-stats-update-line"><span>Última atualização: {analytics?.period?.generatedAt ? new Date(analytics.period.generatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}</span><span>Visitantes únicos e pedidos pagos; sem estimativas.</span></div>

        <div className="eras-stats-card-grid">
          <StatsMetricCard icon={<Eye size={18} />} label="Visitas" value={String(summary.visits)} detail={`${summary.pageViews || 0} visualizações de página`} change={comparisonMode === "previous" ? analytics?.comparison?.visits : null} />
          <StatsMetricCard icon={<ShoppingCart size={18} />} label="Vendas" value={String(summary.sales)} detail="Pedidos com pagamento aprovado" change={comparisonMode === "previous" ? analytics?.comparison?.sales : null} />
          <StatsMetricCard icon={<BarChart3 size={18} />} label="Receita" value={formatCurrency(summary.revenue)} detail={summary.discounts ? `${formatCurrency(summary.discounts)} em descontos aplicados` : "Receita líquida dos pedidos pagos"} change={comparisonMode === "previous" ? analytics?.comparison?.revenue : null} />
          <StatsMetricCard icon={<Tag size={18} />} label="Ticket médio" value={formatCurrency(summary.averageTicket)} detail={summary.sales ? "Receita média por pedido pago" : "Sem pedidos pagos no período"} change={comparisonMode === "previous" ? analytics?.comparison?.averageTicket : null} />
        </div>

        <div className="eras-stats-main-grid">
          <section className="eras-stats-panel eras-stats-panel-large"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">EVOLUÇÃO</span><h3>Receita e vendas</h3></div><MoreHorizontal size={18} aria-hidden="true" /></div>{trend.length ? <StatsRevenueChart trend={trend} /> : <StatsEmptyState message="Ainda não há pedidos pagos suficientes para formar uma série temporal." />}</section>
          <section className="eras-stats-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">TRÁFEGO</span><h3>Visitas no período</h3></div><MoreHorizontal size={18} aria-hidden="true" /></div>{trend.length ? <StatsVisitsChart trend={trend} /> : <StatsEmptyState message="Ainda não há visitas registradas no período selecionado." />}</section>
        </div>

        <div className="eras-stats-secondary-grid">
          <section className="eras-stats-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">FUNIL DE COMPRA</span><h3>Visitas a vendas</h3></div><strong className="eras-stats-panel-number">{summary.conversionRate.toFixed(2)}%</strong></div><p className="eras-stats-muted">Acompanhe a redução do tráfego até os pedidos com pagamento aprovado.</p><StatsFunnel data={analytics?.funnel} /></section>
          <section className="eras-stats-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">COMPORTAMENTO</span><h3>Atividade dos visitantes</h3></div><MoreHorizontal size={18} aria-hidden="true" /></div><StatsBehaviorList behavior={behavior} /></section>
        </div>

        <div className="eras-stats-secondary-grid">
          <section className="eras-stats-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">PRODUTOS</span><h3>Mais vendidos</h3></div><span className="eras-stats-caption">Unidades pagas</span></div>{analytics?.topProducts?.length ? <div className="eras-stats-product-list">{analytics.topProducts.map((product: any, index: number) => <div className="eras-stats-product-row" key={product.id}><span className="eras-stats-product-rank">{index + 1}</span><div className="eras-stats-product-name"><strong>{product.name}</strong><span>{product.category} · estoque {product.stock}</span></div><div className="eras-stats-product-value"><strong>{product.unitsSold}</strong><span>{formatCurrency(product.revenue)}</span></div></div>)}</div> : <StatsEmptyState message="Ainda não há produtos vendidos no período selecionado." />}</section>
          <section className="eras-stats-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">CUPONS E DESCONTOS</span><h3>Uso promocional</h3></div><MoreHorizontal size={18} aria-hidden="true" /></div><div className="eras-stats-coupon-summary"><div><strong>{analytics?.couponStats?.totalCoupons || 0}</strong><span>cupons cadastrados</span></div><div><strong>{analytics?.couponStats?.totalUses || 0}</strong><span>usos acumulados</span></div><div><strong>{analytics?.couponStats?.discountedOrders || 0}</strong><span>pedidos com desconto</span></div></div>{analytics?.couponStats?.topCoupons?.length ? <div className="eras-stats-coupon-list">{analytics.couponStats.topCoupons.map((coupon: any) => <div key={coupon.code}><span>{coupon.code}</span><strong>{coupon.uses} usos</strong></div>)}</div> : <StatsEmptyState message="Nenhum cupom foi utilizado no período disponível." compact />}</section>
        </div>

        <section className="eras-stats-panel eras-stats-ai-panel"><div className="eras-stats-panel-heading"><div><span className="eras-stats-overline">ERAS INSIGHTS</span><h3>Análise fundamentada nos dados</h3></div><Button variant="outline" size="sm" onClick={() => void refetchAi()} disabled={aiLoading}>{aiLoading ? <LoaderCircle className="spin" size={14} /> : <RefreshCw size={14} />} Atualizar análise</Button></div>{aiLoading ? <div className="eras-stats-ai-loading"><LoaderCircle className="spin" size={20} /> Analisando os dados reais do período...</div> : aiError ? <div className="eras-stats-ai-copy">Não foi possível gerar a análise agora. Os indicadores acima continuam baseados nos dados reais do período.</div> : <div className="eras-stats-ai-copy">{String(aiData?.summary || "Ainda não há dados suficientes para gerar uma análise fundamentada.")}</div>}</section>
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

// Cartão de métrica com comparação opcional: sem período anterior, nunca exibe variação inventada.
function StatsMetricCard({ icon, label, value, detail, change }: { icon: ReactNode; label: string; value: string; detail: string; change: number | null | undefined }) {
  return <article className="eras-stats-card"><div className="eras-stats-card-top"><span className="eras-stats-card-icon">{icon}</span><span className="eras-stats-card-label">{label}</span><MoreHorizontal size={16} aria-hidden="true" /></div><strong className="eras-stats-card-value">{value}</strong><div className="eras-stats-card-bottom"><span>{detail}</span>{change === null || change === undefined ? <span className="eras-stats-no-comparison">Sem comparação</span> : <span className={change >= 0 ? "eras-stats-change positive" : "eras-stats-change negative"}>{change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%</span>}</div></article>;
}

function StatsEmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={`eras-stats-empty ${compact ? "compact" : ""}`}><BarChart3 size={compact ? 18 : 24} /><span>{message}</span></div>;
}

function StatsRevenueChart({ trend }: { trend: any[] }) {
  const maxValue = Math.max(1, ...trend.map((item) => Math.max(Number(item.revenue || 0), Number(item.prevRevenue || 0))));
  return <div className="eras-stats-chart"><div className="eras-stats-chart-scale"><span>{formatCurrency(maxValue)}</span><span>{formatCurrency(maxValue / 2)}</span><span>R$ 0,00</span></div><div className="eras-stats-bar-chart">{trend.map((item, index) => <div className="eras-stats-bar-column" key={`${item.label}-${index}`}><div className="eras-stats-bar-track"><div className="eras-stats-bar previous" style={{ height: `${Math.max(2, (Number(item.prevRevenue || 0) / maxValue) * 100)}%` }} title={`Período anterior: ${formatCurrency(item.prevRevenue || 0)}`} /><div className="eras-stats-bar current" style={{ height: `${Math.max(2, (Number(item.revenue || 0) / maxValue) * 100)}%` }} title={`${item.label}: ${formatCurrency(item.revenue || 0)} · ${item.orders || 0} vendas`} /></div><span>{item.label}</span></div>)}</div><div className="eras-stats-legend"><span><i className="current" /> Período atual</span><span><i className="previous" /> Período anterior</span></div></div>;
}

function StatsVisitsChart({ trend }: { trend: any[] }) {
  const width = 640;
  const height = 190;
  const padding = 22;
  const maxValue = Math.max(1, ...trend.map((item) => Number(item.visits || 0)));
  const points = trend.map((item, index) => { const x = padding + (index * (width - padding * 2)) / Math.max(1, trend.length - 1); const y = height - padding - (Number(item.visits || 0) / maxValue) * (height - padding * 2); return { ...item, x, y }; });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return <div className="eras-stats-line-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução de visitantes únicos"><path className="eras-stats-line-area" d={`${path} L ${points[points.length - 1]?.x || padding} ${height - padding} L ${points[0]?.x || padding} ${height - padding} Z`} /><path className="eras-stats-line" d={path} />{points.map((point, index) => <circle key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="4" className="eras-stats-line-point"><title>{`${point.label}: ${point.visits || 0} visitantes únicos`}</title></circle>)}</svg><div className="eras-stats-chart-labels">{trend.map((item, index) => <span key={`${item.label}-${index}`}>{item.label}</span>)}</div></div>;
}

function StatsFunnel({ data }: { data?: { visits: number; productViews: number; cartViews: number; checkoutViews: number; paidOrders: number } }) {
  const steps = [{ label: "Visitas", value: data?.visits || 0 }, { label: "Produtos", value: data?.productViews || 0 }, { label: "Sacola", value: data?.cartViews || 0 }, { label: "Checkout", value: data?.checkoutViews || 0 }, { label: "Vendas", value: data?.paidOrders || 0 }];
  const maxValue = Math.max(1, steps[0].value);
  return <div className="eras-stats-funnel">{steps.map((step) => <div className="eras-stats-funnel-row" key={step.label}><div className="eras-stats-funnel-label"><span>{step.label}</span><strong>{step.value}</strong></div><div className="eras-stats-funnel-track"><span style={{ width: `${Math.min(100, (step.value / maxValue) * 100)}%` }} /></div></div>)}</div>;
}

function StatsBehaviorList({ behavior }: { behavior: { totalVisits: number; pageViews?: number; homeViews?: number; categoryViews: number; collectionViews?: number; productViews: number; cartViews?: number; checkoutViews?: number } }) {
  const entries = [{ label: "Home", value: behavior.homeViews || 0 }, { label: "Produtos", value: behavior.productViews || 0 }, { label: "Categorias", value: behavior.categoryViews || 0 }, { label: "Coleções", value: behavior.collectionViews || 0 }, { label: "Sacola", value: behavior.cartViews || 0 }, { label: "Checkout", value: behavior.checkoutViews || 0 }];
  const maxValue = Math.max(1, ...entries.map((entry) => entry.value));
  return <div className="eras-stats-behavior-list">{entries.map((entry) => <div className="eras-stats-behavior-row" key={entry.label}><div><span>{entry.label}</span><strong>{entry.value}</strong></div><div className="eras-stats-behavior-track"><span style={{ width: `${(entry.value / maxValue) * 100}%` }} /></div></div>)}</div>;
}

// Componente de Histórico de Alterações de Estoque (Auditoria com Filtros e Exportação CSV)
function InventoryAuditSection() {
  const [adminFilter, setAdminFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "productName" | "size" | "newStock" | "adminName">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const { data: auditResult, isLoading, refetch } = trpc.admin.listInventoryAudit.useQuery({
    adminFilter: adminFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const auditLogs = auditResult?.items || [];
  const totalLogs = auditResult?.total || 0;
  const totalPages = Math.ceil(totalLogs / pageSize) || 1;

  const handleSort = (field: "createdAt" | "productName" | "size" | "newStock" | "adminName") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const exportAuditCSV = () => {
    if (!auditLogs.length) {
      toast.error("Não há registos de auditoria para exportar.");
      return;
    }
    const headers = ["Data/Hora", "Produto", "Variação", "Estoque Anterior", "Novo Estoque", "Diferença", "Admin Nome", "Admin E-mail"];
    const rows = auditLogs.map((log: any) => [
      new Date(log.createdAt).toLocaleString("pt-BR"),
      log.productName,
      log.size,
      log.previousStock,
      log.newStock,
      log.newStock - log.previousStock,
      log.adminName || "Admin",
      log.adminEmail,
    ]);
    const success = exportToCSV("historico_estoque_eras_label.csv", headers, rows);
    if (success) {
      toast.success("Histórico de estoque exportado em CSV com sucesso!");
    } else {
      toast.error("Erro ao exportar histórico de estoque.");
    }
  };

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">AUDITORIA OPERACIONAL</span>
          <h2 className="content-title">Histórico de Alterações de Estoque</h2>
          <p>Registo imutável de todas as modificações de quantidades por variação realizadas pelos administradores.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="outline" onClick={exportAuditCSV}><Download size={15} /> Exportar CSV</Button>
          <Button variant="outline" onClick={() => void refetch()}>Atualizar</Button>
        </div>
      </div>

      <div className="admin-panel" style={{ padding: "1rem", marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem", color: "#555" }}>Filtrar por Administrador (Nome ou E-mail)</label>
          <Input placeholder="Ex: theeraslabel@gmail.com" value={adminFilter} onChange={(e) => setAdminFilter(e.target.value)} style={{ background: "#fff" }} />
        </div>
        <div style={{ width: "160px" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem", color: "#555" }}>Data Inicial</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ background: "#fff" }} />
        </div>
        <div style={{ width: "160px" }}>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.3rem", color: "#555" }}>Data Final</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ background: "#fff" }} />
        </div>
        {(adminFilter || startDate || endDate) && (
          <div style={{ alignSelf: "flex-end" }}>
            <Button variant="outline" onClick={() => { setAdminFilter(""); setStartDate(""); setEndDate(""); }} style={{ fontSize: "0.8rem", height: "38px" }}>Limpar filtros</Button>
          </div>
        )}
      </div>

      <div className="admin-panel table-panel">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                Data e Hora {sortBy === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("productName")} style={{ cursor: "pointer" }}>
                Produto {sortBy === "productName" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("size")} style={{ cursor: "pointer" }}>
                Variação {sortBy === "size" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Estoque Anterior</th>
              <th onClick={() => handleSort("newStock")} style={{ cursor: "pointer" }}>
                Novo Estoque {sortBy === "newStock" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("adminName")} style={{ cursor: "pointer" }}>
                Administrador {sortBy === "adminName" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", padding: "0.5rem 1rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e0d5" }}>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong> ({totalLogs} registos no total)
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

// Componente de Gestão de Sub-administradores e Permissões por Módulo (Exclusivo Superadmin)
function SubAdminsManagementSection() {
  const { data: subAdmins = [], isLoading, refetch } = trpc.admin.listSubAdmins.useQuery();
  const createMutation = trpc.admin.createSubAdmin.useMutation({
    onSuccess: () => {
      toast.success("Sub-administrador criado com sucesso!");
      setNewAdmin({ email: "", name: "", password: "", roleTitle: "Assistente", permissions: "products,inventory,categories,stats,emails,settings" });
      setShowCreateModal(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar administrador.");
    }
  });

  const updateMutation = trpc.admin.updateSubAdmin.useMutation({
    onSuccess: () => {
      toast.success("Administrador atualizado com sucesso!");
      setEditingAdmin(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao atualizar administrador.");
    }
  });

  const deleteMutation = trpc.admin.deleteSubAdmin.useMutation({
    onSuccess: () => {
      toast.success("Administrador removido com sucesso!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao remover administrador.");
    }
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    name: "",
    password: "",
    roleTitle: "Gerente de Loja",
    permissions: "products,inventory,categories,stats,emails,settings",
  });

  const availableModules = [
    { key: "products", label: "Produtos" },
    { key: "inventory", label: "Inventário & Estoque" },
    { key: "categories", label: "Categorias" },
    { key: "stats", label: "Estatísticas & IA" },
    { key: "emails", label: "E-mails & Marketing" },
    { key: "settings", label: "Definições & Equipa" },
  ];

  const handleTogglePerm = (modKey: string, currentPermsStr: string, setter: any) => {
    const list = currentPermsStr ? currentPermsStr.split(",").map(s => s.trim()).filter(Boolean) : [];
    const exists = list.includes(modKey);
    let nextList = exists ? list.filter(k => k !== modKey) : [...list, modKey];
    setter((prev: any) => ({ ...prev, permissions: nextList.join(",") }));
  };

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">CONTROLE DE ACESSO RBAC</span>
          <h2 className="content-title">Gestão de Equipa e Permissões</h2>
          <p>Crie e gerencie contas de administradores secundários com acesso restrito a módulos específicos do painel.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} style={{ background: "#111", color: "#fff" }}>
          + Novo Administrador
        </Button>
      </div>

      {isLoading && (
        <div className="inventory-state"><LoaderCircle className="spin" size={22} /><strong>Carregando equipe...</strong></div>
      )}

      {!isLoading && (
        <div className="admin-table-wrapper" style={{ marginTop: "1.5rem" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome / E-mail</th>
                <th>Cargo / Função</th>
                <th>Módulos Permitidos</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {subAdmins.map((admin: any) => (
                <tr key={admin.id}>
                  <td>
                    <strong>{admin.name}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>{admin.email}</div>
                  </td>
                  <td>
                    <span style={{ background: "#f0f0f0", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600 }}>
                      {admin.roleTitle}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", maxWidth: "320px" }}>
                      {admin.permissions.split(",").map((p: string) => (
                        <span key={p} style={{ background: "#e8f0fe", color: "#1a73e8", fontSize: "0.75rem", padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: admin.isActive ? "#2e7d32" : "#c62828", fontWeight: 600, fontSize: "0.85rem" }}>
                      {admin.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <Button size="sm" variant="outline" onClick={() => setEditingAdmin(admin)}>Editar</Button>
                      <Button size="sm" variant="outline" style={{ color: "#c62828", borderColor: "#c62828" }} onClick={() => {
                        if (confirm(`Tem certeza que deseja remover o acesso de ${admin.name}?`)) {
                          deleteMutation.mutate({ id: admin.id });
                        }
                      }}>Remover</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {subAdmins.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                    Nenhum administrador secundário cadastrado ainda. Use o botão acima para criar o primeiro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Criar Administrador */}
      {showCreateModal && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="admin-modal admin-modal--compact" style={{ background: "#fff", width: "100%", maxWidth: "520px", borderRadius: "10px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Adicionar Novo Administrador</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowCreateModal(false)} aria-label="Fechar criação de administrador" title="Fechar"><X size={18} /></button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>Defina as credenciais e escolha quais abas o membro da equipe poderá visualizar.</p>

            <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Nome Completo</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Ex: Carlos Assistente"
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>E-mail de Acesso</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="carlos@eraslabel.com"
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Senha Provisória</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Título do Cargo</label>
                <input
                  type="text"
                  value={newAdmin.roleTitle}
                  onChange={e => setNewAdmin({ ...newAdmin, roleTitle: e.target.value })}
                  placeholder="Ex: Estoquista / Operador"
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Permissões por Módulo</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {availableModules.map(mod => {
                    const isChecked = newAdmin.permissions.split(",").map(s => s.trim()).includes(mod.key);
                    return (
                      <label key={mod.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePerm(mod.key, newAdmin.permissions, setNewAdmin)}
                        />
                        {mod.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
              <Button
                onClick={() => createMutation.mutate(newAdmin)}
                disabled={createMutation.isPending || !newAdmin.email || !newAdmin.name || !newAdmin.password}
                style={{ background: "#b22222", color: "#fff" }}
              >
                {createMutation.isPending ? "Salvando..." : "Salvar Administrador"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Administrador */}
      {editingAdmin && (
        <div className="admin-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="admin-modal admin-modal--compact" style={{ background: "#fff", width: "100%", maxWidth: "520px", borderRadius: "10px", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Editar Administrador</h3>
              <button type="button" className="admin-modal-close" onClick={() => setEditingAdmin(null)} aria-label="Fechar edição de administrador" title="Fechar"><X size={18} /></button>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>Modifique as permissões de acesso ou redefina a senha para {editingAdmin.email}</p>

            <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Nome Completo</label>
                <input
                  type="text"
                  value={editingAdmin.name}
                  onChange={e => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Título do Cargo</label>
                <input
                  type="text"
                  value={editingAdmin.roleTitle}
                  onChange={e => setEditingAdmin({ ...editingAdmin, roleTitle: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Nova Senha (opcional)</label>
                <input
                  type="password"
                  placeholder="Deixe em branco para manter a atual"
                  onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Permissões por Módulo</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {availableModules.map(mod => {
                    const isChecked = editingAdmin.permissions.split(",").map((s: string) => s.trim()).includes(mod.key);
                    return (
                      <label key={mod.key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePerm(mod.key, editingAdmin.permissions, (fn: any) => setEditingAdmin((prev: any) => ({ ...prev, permissions: fn(prev).permissions })))}
                        />
                        {mod.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>Cancelar</Button>
              <Button
                onClick={() => updateMutation.mutate({
                  id: editingAdmin.id,
                  name: editingAdmin.name,
                  roleTitle: editingAdmin.roleTitle,
                  permissions: editingAdmin.permissions,
                  password: editingAdmin.password,
                })}
                disabled={updateMutation.isPending}
                style={{ background: "#b22222", color: "#fff" }}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminSettingsSection({ onNavigate }: { onNavigate: (label: string) => void }) {
  const { data: details, isLoading } = trpc.admin.myAdminDetails.useQuery();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const uploadMutation = trpc.admin.uploadImage.useMutation();
  const [compactMode, setCompactMode] = useState(() => readAdminPreference("compact", false));
  const [reducedMotion, setReducedMotion] = useState(() => readAdminPreference("reducedMotion", false));
  const [autoRefresh, setAutoRefresh] = useState(() => readAdminPreference("autoRefresh", true));
  const updateProfile = trpc.admin.updateMyAdminProfile.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.auth.me.invalidate(), utils.admin.myAdminDetails.invalidate()]);
      toast.success("O seu perfil foi atualizado no painel.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar o perfil."),
  });

  useEffect(() => {
    if (details?.name) setName(details.name);
    if (details?.avatarUrl !== undefined) setAvatarUrl(details.avatarUrl ?? null);
  }, [details?.name, details?.avatarUrl]);

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("O ficheiro é muito grande. Escolha uma imagem de até 5MB.");
      return;
    }

    const reader = new FileReader();
    setUploadingAvatar(true);
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type || "image/png",
      }, {
        onSuccess: (res) => {
          setUploadingAvatar(false);
          setAvatarUrl(res.url);
          updateProfile.mutate({ name, avatarUrl: res.url });
          toast.success("Fotografia de perfil carregada com sucesso!");
        },
        onError: () => {
          setUploadingAvatar(false);
          toast.error("Não foi possível carregar a fotografia. Tente novamente.");
        }
      });
    };
    reader.readAsDataURL(file);
  }

  function savePreference(key: "compact" | "reducedMotion" | "autoRefresh", value: boolean) {
    writeAdminPreference(key, value);
    if (key === "compact") setCompactMode(value);
    if (key === "reducedMotion") setReducedMotion(value);
    if (key === "autoRefresh") setAutoRefresh(value);
    toast.success("Preferência do painel guardada.");
  }

  if (isLoading) return <section className="admin-content"><div className="inventory-state"><LoaderCircle className="spin" size={22} /> A carregar configurações...</div></section>;

  return (
    <section className="admin-content settings-page">
      <div className="content-toolbar settings-page-heading"><div><span className="section-kicker">CENTRO DE CONTROLO</span><h2 className="content-title">Configurações</h2><p>Personalize o seu acesso e o comportamento do painel administrativo.</p></div><span className="settings-role-badge">{details?.roleTitle || "Administrador"}</span></div>
      <div className="settings-grid">
        <section className="admin-panel settings-card"><div className="settings-card-heading"><span className="settings-icon"><UserRound size={18} /></span><div><h3>O seu perfil</h3><p>O nome e a fotografia podem ser alterados por qualquer função administrativa.</p></div></div>
          <div className="settings-form">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f3f0ea", border: "2px solid #ddd", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#333" }}>{name.charAt(0).toUpperCase() || "A"}</span>
                )}
              </div>
              <div>
                <label style={{ display: "inline-block", background: "#111", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
                  {uploadingAvatar ? "A carregar..." : "Alterar fotografia"}
                </label>
                <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.3rem" }}>JPG, PNG ou WebP de até 5MB.</p>
              </div>
            </div>
            <label>Nome de apresentação<Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como quer ser chamado no painel?" /></label>
            <label>E-mail de acesso<Input value={details?.email || ""} readOnly /></label>
            <label>Cargo<Input value={details?.roleTitle || "Administrador"} readOnly /></label>
            <div className="settings-actions">
              <Button onClick={() => updateProfile.mutate({ name, avatarUrl })} disabled={updateProfile.isPending || name.trim().length < 2}>
                {updateProfile.isPending ? <><LoaderCircle className="spin" size={15} /> A guardar...</> : <><Check size={15} /> Guardar perfil</>}
              </Button>
            </div>
          </div>
        </section>
        <section className="admin-panel settings-card"><div className="settings-card-heading"><span className="settings-icon"><SlidersHorizontal size={18} /></span><div><h3>Preferências do painel</h3><p>Estas opções ficam guardadas neste navegador.</p></div></div><div className="settings-options"><label className="settings-toggle"><span><strong>Modo compacto</strong><small>Reduz espaçamentos para mostrar mais informação.</small></span><input type="checkbox" checked={compactMode} onChange={(event) => savePreference("compact", event.target.checked)} /></label><label className="settings-toggle"><span><strong>Movimento reduzido</strong><small>Desativa transições não essenciais para uma navegação mais discreta.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => savePreference("reducedMotion", event.target.checked)} /></label><label className="settings-toggle"><span><strong>Atualização automática</strong><small>Permite atualizar indicadores quando novos dados forem registados.</small></span><input type="checkbox" checked={autoRefresh} onChange={(event) => savePreference("autoRefresh", event.target.checked)} /></label></div></section>
        <section className="admin-panel settings-card"><div className="settings-card-heading"><span className="settings-icon"><Palette size={18} /></span><div><h3>Aparência da loja</h3><p>Os conteúdos públicos continuam editáveis na secção dedicada.</p></div></div><div className="settings-link-list"><button type="button" onClick={() => onNavigate("Aparência")}><ImagePlus size={17} /><span><strong>Editar banners e destaques</strong><small>Atualize imagens, textos e links da Home.</small></span><ArrowLeft className="rotate-180" size={15} /></button><button type="button" onClick={() => onNavigate("Aparência")}><Megaphone size={17} /><span><strong>Gerir barra de anúncio</strong><small>Crie mensagens rotativas e defina links.</small></span><ArrowLeft className="rotate-180" size={15} /></button></div></section>
        <section className="admin-panel settings-card"><div className="settings-card-heading"><span className="settings-icon"><ShieldCheck size={18} /></span><div><h3>Segurança e permissões</h3><p>O cabeçalho mostra o cargo e os módulos permitidos para o utilizador.</p></div></div><div className="permission-summary"><span>Perfil atual</span><strong>{details?.isSuperAdmin ? "Acesso total" : details?.roleTitle || "Administrador"}</strong><small>{details?.isSuperAdmin ? "Pode gerir todas as áreas e a equipa." : "As permissões foram definidas pelo administrador principal."}</small></div></section>
      </div>
    </section>
  );
}

// Componente do Centro de Notificações Flutuante no Cabeçalho Admin (Apenas Pedidos e Alertas Reais com Leitura Marcada)
function AdminNotificationsDropdown({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: notifications = [] } = trpc.notifications.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("Todas as notificações foram marcadas como lidas.");
    },
  });

  const unreadList = notifications.filter((n: any) => !n.isRead);
  const totalCount = unreadList.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: totalCount > 0 ? "#fdf2f2" : "transparent",
          border: totalCount > 0 ? "1px solid #e4a6a6" : "1px solid #ddd",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          color: totalCount > 0 ? "#b22222" : "#333",
          transition: "all 0.2s ease"
        }}
        title="Centro de Notificações"
      >
        <Megaphone size={18} />
        {totalCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "#b22222",
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 700,
            borderRadius: "10px",
            padding: "0.1rem 0.35rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            {totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "44px",
          width: "360px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: "1px solid #e5e5e5",
          zIndex: 100,
          overflow: "hidden"
        }}>
          <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#faf9f6" }}>
            <div>
              <strong style={{ fontSize: "0.9rem", color: "#111" }}>Notificações (Vendas & Encomendas)</strong>
              {totalCount > 0 && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: "#b22222", color: "#fff", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 600 }}>
                  {totalCount} novas
                </span>
              )}
            </div>
            {totalCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                style={{ background: "transparent", border: "none", color: "#b22222", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div style={{ maxHeight: "340px", overflowY: "auto", padding: "0.5rem 0" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#666", fontSize: "0.85rem" }}>
                <Check size={24} style={{ color: "#2e7d32", margin: "0 auto 0.5rem" }} />
                <strong>Tudo em ordem!</strong>
                <p style={{ margin: "0.2rem 0 0" }}>As novas vendas e pedidos 'Por embalar' aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) {
                      markAsReadMutation.mutate({ id: notif.id });
                    }
                    setIsOpen(false);
                    onNavigate("Vendas");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.65rem 1rem",
                    background: notif.isRead ? "transparent" : "#fdf2f2",
                    border: "none",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fdfbf7"}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? "transparent" : "#fdf2f2"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
                    <span>{notif.title}</span>
                    {!notif.isRead && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#b22222", display: "inline-block" }} />
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#555", marginTop: "0.2rem", lineHeight: "1.3" }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#888", marginTop: "0.2rem" }}>
                    {new Date(notif.createdAt).toLocaleString("pt-BR")}
                  </div>
                </button>
              ))
            )}
          </div>

          <div style={{ padding: "0.6rem 1rem", borderTop: "1px solid #eee", background: "#faf9f6", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => { setIsOpen(false); onNavigate("Vendas"); }}
              style={{ background: "transparent", border: "none", color: "#111", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
            >
              Gerenciar vendas e pedidos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente do Cabeçalho Superior com Indicador Visual de Cargo e Permissões Efetivas
function AdminHeaderBar({ authUser, active, setMenuOpen, adminInitial, adminName, onNavigate }: any) {
  const { data: myDetails } = trpc.admin.myAdminDetails.useQuery();

  const roleTitle = myDetails?.roleTitle || (authUser?.email === "theeraslabel@gmail.com" ? "Superadministrador" : "Administrador");
  const isSuper = myDetails?.isSuperAdmin ?? (authUser?.email === "theeraslabel@gmail.com");
  const permissions = myDetails?.permissions ? myDetails.permissions.split(",").map(p => p.trim()).filter(Boolean) : [];

  const permissionLabels: Record<string, string> = {
    products: "Produtos",
    inventory: "Inventário",
    categories: "Categorias",
    stats: "Estatísticas",
    emails: "E-mails",
    settings: "Configurações",
  };

  return (
    <header className="admin-header">
      <button className="admin-mobile-menu" onClick={() => setMenuOpen((value: boolean) => !value)}>
        <MoreHorizontal size={20} />
      </button>
      <div>
        <span className="section-kicker">PAINEL ERAS LABEL</span>
        <h1>{active}</h1>
      </div>
      <div className="admin-header-actions" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ background: isSuper ? "#111" : "#b22222", color: "#fff", fontSize: "0.7rem", padding: "0.1rem 0.5rem", borderRadius: "10px", fontWeight: 700, letterSpacing: "0.02em" }}>
              {roleTitle}
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isSuper ? "Acesso total a todos os módulos" : `Acessos: ${permissions.length > 0 ? permissions.map(p => permissionLabels[p] || p).join(", ") : "Nenhum módulo"}`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: "1px solid #ddd", paddingLeft: "0.75rem", position: "relative" }}>
          <AdminNotificationsDropdown onNavigate={onNavigate} />
          {myDetails?.avatarUrl ? (
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", border: "1px solid #ccc", flexShrink: 0 }}>
              <img src={myDetails.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <span className="admin-avatar">{adminInitial}</span>
          )}
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{adminName}</span>
        </div>
      </div>
    </header>
  );
}

// Componente de Alertas de Estoque Crítico (Centro Interno de Notificações)
function LowStockNotificationsSection() {
  const { data: alerts = [], isLoading, refetch } = trpc.admin.lowStockAlerts.useQuery();

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">MONITORAMENTO CRÍTICO</span>
          <h2 className="content-title">Centro de Alertas de Estoque</h2>
        </div>
        <Button onClick={() => void refetch()} variant="outline">Atualizar alertas</Button>
      </div>

      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Produtos abaixo de 5 unidades em estoque total requerem atenção imediata para evitar rupturas no storefront da Eras Label.
      </p>

      {isLoading && (
        <div className="inventory-state"><LoaderCircle className="spin" size={22} /><strong>Carregando alertas...</strong></div>
      )}

      {!isLoading && alerts.length === 0 && (
        <div className="inventory-state">
          <ShieldCheck size={28} style={{ color: "#2e7d32", marginBottom: "0.5rem" }} />
          <strong>Nenhum produto em estoque crítico</strong>
          <span>Todos os itens do catálogo possuem estoque igual ou superior a 5 unidades.</span>
        </div>
      )}

      {!isLoading && alerts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {alerts.map((item: any) => (
            <div key={item.id} className="admin-panel" style={{ background: "#fff1f1", border: "1px solid #e4a6a6", padding: "1.25rem", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <span className="inventory-low-stock-badge danger" style={{ marginBottom: "0.25rem" }}>
                    {item.stock === 0 ? "Esgotado" : `Estoque crítico: ${item.stock} un.`}
                  </span>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111", margin: "0.2rem 0" }}>{item.name}</h3>
                  <small style={{ color: "#666" }}>Categoria: {item.category} {item.sku ? `• SKU: ${item.sku}` : ""}</small>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <Button size="sm" onClick={() => { window.location.href = "/admin"; }} style={{ background: "#b22222", color: "#fff", fontSize: "0.8rem" }}>
                  Repor no Inventário
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


/**
 * Componente AdminCmsManager: Gestão administrativa de conteúdo institucional (CMS)
 * Permite editar o título, subtítulo e texto das páginas manifesto, history, events e about.
 */
function AdminCmsManager() {
  const [selectedSlug, setSelectedSlug] = useState("manifesto");
  const { data: pageData, isLoading, refetch } = trpc.catalog.getCmsPage.useQuery({ slug: selectedSlug });
  
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [storyBlocks, setStoryBlocks] = useState<CmsStoryBlock[]>([]);
  const [eventBlocks, setEventBlocks] = useState<CmsEventBlock[]>([]);

  useEffect(() => {
    if (pageData) {
      const kind = selectedSlug === "manifesto" ? "manifesto" : selectedSlug === "events" ? "events" : "generic";
      const structured = parseCmsContent(pageData.content, kind);
      setTitle(pageData.title || "");
      setSubtitle(pageData.subtitle || "");
      setContent(structured.body || "");
      setStoryBlocks(structured.storyBlocks || []);
      setEventBlocks(structured.events || []);
      setBannerUrl(pageData.bannerUrl || "");
    } else {
      // Valores padrão para iniciar se não houver no banco
      if (selectedSlug === "manifesto") {
        setTitle("Manifesto Eras Label");
        setSubtitle("Reviver ou reinventar eras através da moda autoral e consciente.");
        setContent("Acreditamos que cada peça carrega um tempo, uma história e uma identidade. Nossa missão é conectar o passado e o futuro em vestimentas atemporais que desafiam o convencional.");
      } else if (selectedSlug === "history") {
        setTitle("A História da Eras");
        setSubtitle("Do conceito urbano à consolidação de uma nova era no streetwear.");
        setContent("Fundada em Pernambuco, a Eras Label nasceu da necessidade de criar roupas com significado profundo, unindo a força cultural da nossa gente ao design contemporâneo de alta qualidade.");
      } else if (selectedSlug === "events") {
        setTitle("Encontros & Drop Sessions");
        setSubtitle("Experiências presenciais e lançamentos exclusivos pelo Brasil.");
        setContent("Acompanhe os nossos próximos encontros, pop-ups e sessões de lançamento de coleções. Conecte-se com a comunidade Eras.");
      } else {
        setTitle("Sobre a Marca");
        setSubtitle("Propósito, ética e compromisso com a excelência criativa.");
        setContent("Cada coleção da Eras Label é desenvolvida sob rigorosos padrões de alfaiataria urbana, garantindo durabilidade, caimento perfeito e exclusividade.");
      }
      setBannerUrl("");
      setStoryBlocks([]);
      setEventBlocks([]);
    }
  }, [pageData, selectedSlug]);

  const [showPreview, setShowPreview] = useState(false);

  const saveMutation = trpc.admin.saveCmsPage.useMutation({
    onMutate: () => {
      toast.loading("Salvando alterações institucionais...", { id: "save-cms" });
    },
    onSuccess: () => {
      toast.dismiss("save-cms");
      toast.success("Página institucional atualizada e publicada com sucesso!");
      void refetch();
    },
    onError: (err) => {
      toast.dismiss("save-cms");
      toast.error(err.message || "Erro ao salvar página. Verifique os campos.");
    },
  });

  const uploadMutation = trpc.admin.uploadImage.useMutation();
  const [uploading, setUploading] = useState(false);
  const cmsKind = selectedSlug === "manifesto" ? "manifesto" : selectedSlug === "events" ? "events" : "generic";
  const updateStoryBlock = (id: string, patch: Partial<CmsStoryBlock>) => setStoryBlocks((current) => current.map((block) => block.id === id ? { ...block, ...patch } : block));
  const updateEventBlock = (id: string, patch: Partial<CmsEventBlock>) => setEventBlocks((current) => current.map((event) => event.id === id ? { ...event, ...patch } : event));
  const getSerializedContent = () => cmsKind === "generic"
    ? content
    : serializeCmsContent({ version: 1, kind: cmsKind, body: content, storyBlocks, events: eventBlocks });

  function handleUploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileBase64 = reader.result as string;
        const res = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileBase64,
          contentType: file.type || "image/png",
        });
        if (res.url) {
          setBannerUrl(res.url);
          toast.success("Banner de capa carregado com sucesso!");
        }
      } catch (err: any) {
        toast.error(err.message || "Falha ao enviar imagem.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="admin-content">
      <div className="content-toolbar">
        <div>
          <span className="section-kicker">CMS INSTITUCIONAL (URGÊNCIA 1)</span>
          <h2 className="content-title">Gestão de Conteúdo das Páginas</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { slug: "manifesto", label: "Manifesto" },
          { slug: "history", label: "História / Quem Somos" },
          { slug: "events", label: "Encontros & Eventos" },
          { slug: "about", label: "Sobre a Marca" },
        ].map((tab) => (
          <Button
            key={tab.slug}
            variant={selectedSlug === tab.slug ? "default" : "outline"}
            onClick={() => setSelectedSlug(tab.slug)}
            style={selectedSlug === tab.slug ? { background: "#b22222", color: "#fff" } : {}}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="admin-panel cms-editor-shell" style={{ background: "#fff", padding: "2rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        {isLoading ? (
          <div className="inventory-state"><LoaderCircle className="spin" size={22} /><strong>Carregando conteúdo...</strong></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Título Principal</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da página"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Subtítulo / Chamada</label>
              <Input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Breve descrição ou slogan"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Imagem de Capa (Banner)</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <Input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="URL da imagem (ou faça upload)"
                />
                <label className="admin-action-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "#f3f4f6", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.85rem", fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>
                  <Upload size={16} />
                  {uploading ? "Enviando..." : "Enviar Foto"}
                  <input type="file" accept="image/*" onChange={handleUploadBanner} style={{ display: "none" }} />
                </label>
              </div>
              {bannerUrl && (
                <div style={{ marginTop: "0.75rem", width: "100%", maxHeight: "200px", overflow: "hidden", borderRadius: "6px", border: "1px solid #ddd" }}>
                  <img src={bannerUrl} alt="Preview Banner" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.3rem" }}>Conteúdo Completo (Markdown / Texto)</label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo da página institucional aqui..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.95rem", lineHeight: "1.6", fontFamily: "inherit" }}
              />
            </div>

            {selectedSlug === "manifesto" && (
              <div className="cms-structured-editor">
                <div className="cms-structured-heading">
                  <div><span className="section-kicker">NARRATIVA VISUAL</span><h3>Blocos da história</h3><p>Combine texto e imagem para construir o manifesto em capítulos.</p></div>
                  <Button type="button" variant="outline" onClick={() => setStoryBlocks((current) => [...current, { id: `story-${Date.now()}`, title: "Novo capítulo", text: "", imagePosition: "right" }])}><Plus size={15} /> Adicionar capítulo</Button>
                </div>
                {storyBlocks.length === 0 ? <div className="cms-empty-state">Ainda não há capítulos. Adicione o primeiro bloco narrativo.</div> : storyBlocks.map((block, index) => (
                  <div className="cms-story-card" key={block.id}>
                    <div className="cms-card-index">0{index + 1}</div>
                    <div className="cms-card-fields">
                      <div className="cms-field-grid">
                        <label>Chamada<input value={block.eyebrow || ""} onChange={(e) => updateStoryBlock(block.id, { eyebrow: e.target.value })} placeholder="A origem / A matéria / O futuro" /></label>
                        <label>Título<input value={block.title} onChange={(e) => updateStoryBlock(block.id, { title: e.target.value })} placeholder="Título do capítulo" /></label>
                      </div>
                      <label>Texto<textarea rows={4} value={block.text} onChange={(e) => updateStoryBlock(block.id, { text: e.target.value })} placeholder="Conte a história deste capítulo..." /></label>
                      <div className="cms-field-grid">
                        <label>URL da imagem<input value={block.imageUrl || ""} onChange={(e) => updateStoryBlock(block.id, { imageUrl: e.target.value })} placeholder="https://..." /></label>
                        <label>Texto alternativo<input value={block.imageAlt || ""} onChange={(e) => updateStoryBlock(block.id, { imageAlt: e.target.value })} placeholder="Descrição da imagem" /></label>
                      </div>
                      <div className="cms-card-actions">
                        <label>Posição da imagem<select value={block.imagePosition || "right"} onChange={(e) => updateStoryBlock(block.id, { imagePosition: e.target.value as CmsStoryBlock["imagePosition"] })}><option value="left">À esquerda</option><option value="right">À direita</option></select></label>
                        <Button type="button" variant="ghost" className="text-[#b22222]" onClick={() => setStoryBlocks((current) => current.filter((item) => item.id !== block.id))}><X size={15} /> Remover</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSlug === "events" && (
              <div className="cms-structured-editor">
                <div className="cms-structured-heading">
                  <div><span className="section-kicker">AGENDA EDITÁVEL</span><h3>Eventos e encontros</h3><p>Cadastre os eventos e direcione cada botão para uma página, inscrição ou canal externo.</p></div>
                  <Button type="button" variant="outline" onClick={() => setEventBlocks((current) => [...current, { id: `event-${Date.now()}`, date: "", eventDate: "", title: "Novo evento", description: "", ctaLabel: "Saiba mais", ctaUrl: "", published: false }])}><Plus size={15} /> Adicionar evento</Button>
                </div>
                {eventBlocks.length === 0 ? <div className="cms-empty-state">Nenhum evento publicado. Adicione o próximo encontro da Eras.</div> : eventBlocks.map((event, index) => (
                  <div className="cms-event-card" key={event.id}>
                    <div className="cms-card-index">0{index + 1}</div>
                    <div className="cms-card-fields">
                      <div className="cms-field-grid cms-field-grid-3">
                        <label>Data editorial<input value={event.date} onChange={(e) => updateEventBlock(event.id, { date: e.target.value })} placeholder="24 AGO 2026" /></label>
                        <label>Data do evento<input type="date" value={event.eventDate || ""} onChange={(e) => updateEventBlock(event.id, { eventDate: e.target.value })} aria-describedby={`event-date-help-${event.id}`} /></label>
                        <label>Local<input value={event.location || ""} onChange={(e) => updateEventBlock(event.id, { location: e.target.value })} placeholder="Recife, PE" /></label>
                      </div>
                      <p id={`event-date-help-${event.id}`} className="cms-field-help">A data do evento controla a ordem e remove automaticamente encontros que já passaram.</p>
                      <label className="cms-publish-toggle"><input type="checkbox" checked={event.published !== false} onChange={(e) => updateEventBlock(event.id, { published: e.target.checked })} /><span><strong>Publicar este evento</strong><small>Quando desativado, fica salvo como rascunho e não aparece no site.</small></span></label>
                      <label>Descrição<textarea rows={3} value={event.description} onChange={(e) => updateEventBlock(event.id, { description: e.target.value })} placeholder="Detalhes do evento..." /></label>
                      <div className="cms-field-grid">
                        <label>Texto do botão<input value={event.ctaLabel || ""} onChange={(e) => updateEventBlock(event.id, { ctaLabel: e.target.value })} placeholder="Inscreva-se" /></label>
                        <label>Link do botão<input value={event.ctaUrl || ""} onChange={(e) => updateEventBlock(event.id, { ctaUrl: e.target.value })} placeholder="/contact ou https://..." /></label>
                      </div>
                      <div className="cms-field-grid">
                        <label>URL da imagem<input value={event.imageUrl || ""} onChange={(e) => updateEventBlock(event.id, { imageUrl: e.target.value })} placeholder="https://..." /></label>
                        <label>Texto alternativo<input value={event.imageAlt || ""} onChange={(e) => updateEventBlock(event.id, { imageAlt: e.target.value })} placeholder="Descrição da imagem" /></label>
                      </div>
                      <div className="cms-card-actions"><Button type="button" variant="ghost" className="text-[#b22222]" onClick={() => setEventBlocks((current) => current.filter((item) => item.id !== event.id))}><X size={15} /> Remover</Button></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Eye size={16} /> Pré-visualizar Página
              </Button>

              <Button
                onClick={() => saveMutation.mutate({ slug: selectedSlug, title, subtitle, content: getSerializedContent(), bannerUrl })}
                disabled={saveMutation.isPending || !title.trim() || (!content.trim() && storyBlocks.length === 0 && eventBlocks.length === 0)}
                style={{ background: "#b22222", color: "#fff", padding: "0.75rem 1.5rem" }}
              >
                {saveMutation.isPending ? "Salvando..." : "Publicar Alterações"}
              </Button>
            </div>

            {/* Modal de Pré-visualização Institucional */}
            {showPreview && (
              <div style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem"
              }}>
                <div style={{
                  background: "#f6f3ee",
                  borderRadius: "12px",
                  maxWidth: "800px",
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: "2.5rem",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                  position: "relative",
                  border: "1px solid #e5dfd3"
                }} className="admin-modal admin-modal--preview">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #e0dbd0", paddingBottom: "1rem" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b22222" }}>PRÉ-VISUALIZAÇÃO AO VIVO • {selectedSlug.toUpperCase()}</span>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", margin: 0 }}>Como os clientes verão a página</h3>
                    </div>
                    <button type="button" className="admin-modal-close" onClick={() => setShowPreview(false)} aria-label="Fechar pré-visualização" title="Fechar"><X size={18} /></button>
                  </div>

                  {bannerUrl && (
                    <div style={{ width: "100%", height: "260px", borderRadius: "8px", overflow: "hidden", marginBottom: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                      <img src={bannerUrl} alt="Banner preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#111", fontFamily: "serif", marginBottom: "0.5rem" }}>
                    {title || "Sem título"}
                  </h1>
                  {subtitle && (
                    <p style={{ fontSize: "1.1rem", color: "#555", fontStyle: "italic", marginBottom: "1.5rem" }}>
                      {subtitle}
                    </p>
                  )}
                  <div style={{ height: "1px", background: "#e0dbd0", width: "100%", margin: "1.5rem 0" }} />
                  <div style={{ fontSize: "1.05rem", color: "#222", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {content || "Sem conteúdo inserido."}
                  </div>

                  <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={() => setShowPreview(false)} style={{ background: "#111", color: "#fff" }}>
                      Voltar ao Editor
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// AdminMenuManager importado externamente
