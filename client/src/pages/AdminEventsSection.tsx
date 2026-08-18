import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Image as ImageIcon, MapPin, Plus, Save, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { parseCmsContent, serializeCmsContent, type CmsEventBlock } from "@shared/cms";

const newEvent = (): CmsEventBlock => ({ id: `event-${Date.now()}`, date: "", eventDate: "", title: "", description: "", location: "", imageUrl: "", imageAlt: "", ctaLabel: "Saiba mais", ctaUrl: "", published: false });

export function AdminEventsSection() {
  const utils = trpc.useUtils();
  const pageQuery = trpc.catalog.getCmsPage.useQuery({ slug: "events" });
  const saveMutation = trpc.admin.saveCmsPage.useMutation({
    onSuccess: async () => { toast.success("Eventos guardados e sincronizados com a página pública."); await utils.catalog.getCmsPage.invalidate({ slug: "events" }); },
    onError: (error) => toast.error(error.message || "Não foi possível guardar os eventos."),
  });
  const [title, setTitle] = useState("Encontros & Drop Sessions");
  const [subtitle, setSubtitle] = useState("Experiências presenciais e lançamentos exclusivos pelo Brasil.");
  const [bannerUrl, setBannerUrl] = useState("");
  const [events, setEvents] = useState<CmsEventBlock[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    if (!pageQuery.data) return;
    const page = pageQuery.data;
    const structured = parseCmsContent(page.content, "events");
    setTitle(page.title || "Encontros & Drop Sessions");
    setSubtitle(page.subtitle || "Experiências presenciais e lançamentos exclusivos pelo Brasil.");
    setBannerUrl(page.bannerUrl || "");
    setEvents(structured.events ?? []);
  }, [pageQuery.data]);

  const publishedCount = useMemo(() => events.filter((event) => event.published).length, [events]);
  const upcomingCount = useMemo(() => events.filter((event) => event.eventDate && new Date(`${event.eventDate}T23:59:59`).getTime() >= Date.now()).length, [events]);
  const updateEvent = (id: string, patch: Partial<CmsEventBlock>) => setEvents((current) => current.map((event) => event.id === id ? { ...event, ...patch } : event));
  const save = () => saveMutation.mutate({ slug: "events", title, subtitle, bannerUrl, content: serializeCmsContent({ version: 1, kind: "events", body: "", events }) });

  return <section className="admin-content admin-editorial-page admin-events-page">
    <div className="admin-editorial-hero"><div><span className="section-kicker">CMS INSTITUCIONAL · AGENDA</span><h2 className="content-title">Eventos</h2><p className="content-subtitle">Apresente os próximos encontros da comunidade com data, local, narrativa e destino de compra.</p></div><div className="admin-editorial-hero-actions"><Button variant="outline" onClick={() => setEvents((current) => [...current, newEvent()])}><Plus size={16} /> Novo evento</Button><Button className="admin-primary-action" onClick={save} disabled={saveMutation.isPending}><Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar alterações"}</Button></div></div>
    <div className="admin-editorial-metrics"><div className="admin-editorial-metric"><CalendarDays size={18} /><span>Eventos criados</span><strong>{events.length}</strong></div><div className="admin-editorial-metric"><Ticket size={18} /><span>Publicados</span><strong>{publishedCount}</strong></div><div className="admin-editorial-metric"><MapPin size={18} /><span>Próximos</span><strong>{upcomingCount}</strong></div></div>
    <div className="admin-panel admin-editorial-settings"><div className="panel-heading"><div><span className="section-kicker">PÁGINA PÚBLICA</span><h3>Apresentação da agenda</h3></div><a href="/eventos" target="_blank" rel="noreferrer" className="admin-inline-action"><ExternalLink size={14} /> Ver página</a></div><div className="admin-editorial-form-grid"><label>Título da página<Input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Banner (URL)<Input value={bannerUrl} onChange={(event) => setBannerUrl(event.target.value)} placeholder="https://..." /></label><label className="admin-editorial-form-span">Subtítulo<Textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} rows={2} /></label></div></div>
    {pageQuery.isLoading ? <div className="admin-panel admin-empty-state"><span className="admin-loading-mark" />A carregar agenda persistida...</div> : events.length === 0 ? <div className="admin-panel admin-empty-state"><CalendarDays size={28} /><strong>A agenda ainda está vazia</strong><span>Adicione um encontro futuro para ele aparecer na página de Eventos.</span><Button variant="outline" onClick={() => setEvents([newEvent()])}>Criar primeiro evento</Button></div> : <div className="admin-events-list">{events.map((event) => <article className={`admin-event-editor-card ${event.published ? "is-published" : "is-draft"}`} key={event.id}><div className="admin-event-editor-card-head"><div className="admin-event-date-mark"><span>{event.eventDate ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit" }) : "--"}</span><small>{event.eventDate ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase() : "DATA"}</small></div><div className="admin-event-editor-card-title"><span className={`status-pill ${event.published ? "success" : "warning"}`}>{event.published ? "Publicado" : "Rascunho"}</span><h3>{event.title || "Evento sem título"}</h3><p>{event.location || "Local a definir"}</p></div><button type="button" className="admin-modal-close" aria-label="Remover evento" onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}><X size={17} /></button></div><div className="admin-event-editor-grid"><label>Data do evento<Input type="date" value={event.eventDate ?? ""} onChange={(input) => updateEvent(event.id, { eventDate: input.target.value, date: input.target.value })} /></label><label>Local<Input value={event.location ?? ""} onChange={(input) => updateEvent(event.id, { location: input.target.value })} placeholder="Cidade · espaço" /></label><label>Título<Input value={event.title} onChange={(input) => updateEvent(event.id, { title: input.target.value })} /></label><label>Imagem (URL)<Input value={event.imageUrl ?? ""} onChange={(input) => updateEvent(event.id, { imageUrl: input.target.value })} placeholder="https://..." /></label><label className="admin-editorial-form-span">Descrição<Textarea value={event.description} onChange={(input) => updateEvent(event.id, { description: input.target.value })} rows={3} /></label><label>Texto do botão<Input value={event.ctaLabel ?? ""} onChange={(input) => updateEvent(event.id, { ctaLabel: input.target.value })} /></label><label>Link do botão<Input value={event.ctaUrl ?? ""} onChange={(input) => updateEvent(event.id, { ctaUrl: input.target.value })} placeholder="https://..." /></label><label className="admin-editorial-form-span">Texto alternativo da imagem<Input value={event.imageAlt ?? ""} onChange={(input) => updateEvent(event.id, { imageAlt: input.target.value })} /></label></div><div className="admin-event-editor-footer"><label className="admin-toggle-field"><input type="checkbox" checked={Boolean(event.published)} onChange={(input) => updateEvent(event.id, { published: input.target.checked })} /><span>Publicar na página pública</span></label>{event.imageUrl ? <span className="admin-editorial-note"><ImageIcon size={14} /> Imagem definida por URL</span> : <span className="admin-editorial-note">Adicione uma imagem de capa para enriquecer o cartão.</span>}</div></article>)}</div>}
  </section>;
}
