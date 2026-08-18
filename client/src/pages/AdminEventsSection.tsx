import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Plus,
  Save,
  Ticket,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { parseCmsContent, serializeCmsContent, type CmsEventBlock } from "@shared/cms";

const newEvent = (): CmsEventBlock => ({
  id: `event-${Date.now()}`,
  date: "",
  eventDate: "",
  title: "",
  description: "",
  location: "",
  imageUrl: "",
  imageAlt: "",
  ctaLabel: "Saiba mais",
  ctaUrl: "",
  published: false,
});

const formatEventDate = (value?: string) => {
  if (!value) return { day: "--", month: "DATA" };
  const parsed = new Date(`${value}T12:00:00`);
  return {
    day: parsed.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: parsed.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase(),
  };
};

export function AdminEventsSection() {
  const utils = trpc.useUtils();
  const pageQuery = trpc.catalog.getCmsPage.useQuery({ slug: "events" });
  const saveMutation = trpc.admin.saveCmsPage.useMutation({
    onSuccess: async () => {
      toast.success("Eventos guardados e sincronizados com a página pública.");
      await utils.catalog.getCmsPage.invalidate({ slug: "events" });
    },
    onError: (error) => toast.error(error.message || "Não foi possível guardar os eventos."),
  });
  const [title, setTitle] = useState("Encontros & Drop Sessions");
  const [subtitle, setSubtitle] = useState("Experiências presenciais e lançamentos exclusivos pelo Brasil.");
  const [bannerUrl, setBannerUrl] = useState("");
  const [events, setEvents] = useState<CmsEventBlock[]>([]);

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
  const upcomingCount = useMemo(
    () => events.filter((event) => event.eventDate && new Date(`${event.eventDate}T23:59:59`).getTime() >= Date.now()).length,
    [events],
  );
  const updateEvent = (id: string, patch: Partial<CmsEventBlock>) =>
    setEvents((current) => current.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  const save = () =>
    saveMutation.mutate({
      slug: "events",
      title,
      subtitle,
      bannerUrl,
      content: serializeCmsContent({ version: 1, kind: "events", body: "", events }),
    });

  return (
    <section className="admin-content admin-editorial-page admin-events-page">
      <div className="admin-events-hero">
        <div className="admin-events-hero-copy">
          <span className="section-kicker">CMS INSTITUCIONAL · AGENDA</span>
          <h2 className="content-title">Eventos</h2>
          <p className="content-subtitle">
            Apresente os próximos encontros da comunidade com data, local, narrativa e destino de compra.
          </p>
        </div>
        <div className="admin-events-hero-actions">
          <Button variant="outline" onClick={() => setEvents((current) => [...current, newEvent()])}>
            <Plus size={16} /> Novo evento
          </Button>
          <Button className="admin-primary-action" onClick={save} disabled={saveMutation.isPending}>
            <Save size={16} /> {saveMutation.isPending ? "A guardar..." : "Guardar alterações"}
          </Button>
        </div>
      </div>

      <div className="admin-events-metrics" aria-label="Resumo da agenda">
        <div className="admin-events-metric">
          <span className="admin-events-metric-icon"><CalendarDays size={18} /></span>
          <span className="admin-events-metric-label">Eventos criados</span>
          <strong>{events.length.toString().padStart(2, "0")}</strong>
          <small>Encontros no arquivo da marca</small>
        </div>
        <div className="admin-events-metric">
          <span className="admin-events-metric-icon"><Ticket size={18} /></span>
          <span className="admin-events-metric-label">Publicados</span>
          <strong>{publishedCount.toString().padStart(2, "0")}</strong>
          <small>Visíveis na página pública</small>
        </div>
        <div className="admin-events-metric">
          <span className="admin-events-metric-icon"><MapPin size={18} /></span>
          <span className="admin-events-metric-label">Próximos</span>
          <strong>{upcomingCount.toString().padStart(2, "0")}</strong>
          <small>Datas futuras confirmadas</small>
        </div>
      </div>

      <div className="admin-panel admin-events-settings">
        <div className="admin-events-panel-heading">
          <div>
            <span className="section-kicker">PÁGINA PÚBLICA</span>
            <h3>Apresentação da agenda</h3>
            <p>Defina a linguagem e a imagem que introduzem os encontros da Eras.</p>
          </div>
          <a href="/eventos" target="_blank" rel="noreferrer" className="admin-inline-action">
            <ExternalLink size={14} /> Ver página
          </a>
        </div>
        <div className="admin-events-form-grid">
          <label>
            <span>Título da página</span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label>
            <span>Banner da agenda · URL</span>
            <Input value={bannerUrl} onChange={(event) => setBannerUrl(event.target.value)} placeholder="https://..." />
          </label>
          <label className="admin-events-form-span">
            <span>Subtítulo</span>
            <Textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} rows={2} />
          </label>
        </div>
      </div>

      <div className="admin-events-section-heading">
        <div>
          <span className="section-kicker">AGENDA EDITORIAL</span>
          <h3>Encontros da comunidade</h3>
        </div>
        <span>{events.length === 1 ? "1 evento" : `${events.length} eventos`}</span>
      </div>

      {pageQuery.isLoading ? (
        <div className="admin-panel admin-events-empty-state">
          <span className="admin-loading-mark" />
          <strong>A carregar agenda persistida...</strong>
          <span>As alterações guardadas serão apresentadas aqui.</span>
        </div>
      ) : events.length === 0 ? (
        <div className="admin-panel admin-events-empty-state">
          <span className="admin-events-empty-icon"><CalendarDays size={28} /></span>
          <span className="section-kicker">PRIMEIRO ENCONTRO</span>
          <strong>A agenda ainda está vazia</strong>
          <span>Adicione um encontro futuro para ele aparecer na página de Eventos.</span>
          <Button variant="outline" onClick={() => setEvents([newEvent()])}>
            <Plus size={15} /> Criar primeiro evento
          </Button>
        </div>
      ) : (
        <div className="admin-events-list">
          {events.map((event, index) => {
            const eventDate = formatEventDate(event.eventDate);
            return (
              <article
                className={`admin-event-editor-card ${event.published ? "is-published" : "is-draft"}`}
                key={event.id}
              >
                <div className="admin-event-editor-card-head">
                  <div className="admin-event-index">0{index + 1}</div>
                  <div className="admin-event-date-mark">
                    <span>{eventDate.day}</span>
                    <small>{eventDate.month}</small>
                  </div>
                  <div className="admin-event-editor-card-title">
                    <span className={`status-pill ${event.published ? "success" : "warning"}`}>
                      {event.published ? "Publicado" : "Rascunho"}
                    </span>
                    <h3>{event.title || "Evento sem título"}</h3>
                    <p><MapPin size={13} /> {event.location || "Local a definir"}</p>
                  </div>
                  <button
                    type="button"
                    className="admin-modal-close"
                    aria-label="Remover evento"
                    onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="admin-event-editor-body">
                  <div className="admin-event-preview">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.imageAlt || event.title || "Imagem do evento"} />
                    ) : (
                      <div className="admin-event-preview-empty">
                        <ImageIcon size={23} />
                        <span>Imagem de capa</span>
                        <small>Adicione uma URL ao lado</small>
                      </div>
                    )}
                    <span className="admin-event-preview-label">{event.published ? "Em destaque" : "Em preparação"}</span>
                  </div>

                  <div className="admin-event-editor-grid">
                    <label>
                      <span>Data do evento</span>
                      <Input type="date" value={event.eventDate ?? ""} onChange={(input) => updateEvent(event.id, { eventDate: input.target.value, date: input.target.value })} />
                    </label>
                    <label>
                      <span>Local</span>
                      <Input value={event.location ?? ""} onChange={(input) => updateEvent(event.id, { location: input.target.value })} placeholder="Cidade · espaço" />
                    </label>
                    <label>
                      <span>Título</span>
                      <Input value={event.title} onChange={(input) => updateEvent(event.id, { title: input.target.value })} />
                    </label>
                    <label>
                      <span>Imagem · URL</span>
                      <Input value={event.imageUrl ?? ""} onChange={(input) => updateEvent(event.id, { imageUrl: input.target.value })} placeholder="https://..." />
                    </label>
                    <label className="admin-events-form-span">
                      <span>Descrição</span>
                      <Textarea value={event.description} onChange={(input) => updateEvent(event.id, { description: input.target.value })} rows={3} />
                    </label>
                    <label>
                      <span>Texto do botão</span>
                      <Input value={event.ctaLabel ?? ""} onChange={(input) => updateEvent(event.id, { ctaLabel: input.target.value })} />
                    </label>
                    <label>
                      <span>Link do botão</span>
                      <Input value={event.ctaUrl ?? ""} onChange={(input) => updateEvent(event.id, { ctaUrl: input.target.value })} placeholder="https://..." />
                    </label>
                    <label className="admin-events-form-span">
                      <span>Texto alternativo da imagem</span>
                      <Input value={event.imageAlt ?? ""} onChange={(input) => updateEvent(event.id, { imageAlt: input.target.value })} />
                    </label>
                  </div>
                </div>

                <div className="admin-event-editor-footer">
                  <label className="admin-toggle-field">
                    <input type="checkbox" checked={Boolean(event.published)} onChange={(input) => updateEvent(event.id, { published: input.target.checked })} />
                    <span>Publicar na página pública</span>
                  </label>
                  <span className="admin-editorial-note">
                    <ImageIcon size={14} /> {event.imageUrl ? "Imagem definida por URL" : "Imagem de capa opcional"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
