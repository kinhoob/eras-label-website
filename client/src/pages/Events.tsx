import { ArrowUpRight } from "lucide-react";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import { trpc } from "@/lib/trpc";
import { getUpcomingPublishedEvents, parseCmsContent } from "@shared/cms";

function EventLink({ url, label }: { url?: string | null; label: string }) {
  if (!url) {
    return <span className="text-xs uppercase tracking-[0.18em] text-[#8c8378]">Link a adicionar no painel</span>;
  }

  const external = /^https?:\/\//i.test(url);
  return (
    <a href={url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-[#23221e] hover:text-[#b22222] transition-colors">
      {label}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export default function EventsPage() {
  const { data: cms } = trpc.catalog.getCmsPage.useQuery({ slug: "events" });
  const structured = parseCmsContent(cms?.content, "events");
  // Apenas eventos publicados e com data de hoje em diante chegam à página pública.
  const events = getUpcomingPublishedEvents(structured.events ?? []);

  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="public-page-heading max-w-3xl mb-14">
          <span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">{cms?.subtitle || "03 / CALENDÁRIO"}</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">{cms?.title || "Próximos Eventos"}</h1>
          <p className="mt-6 text-lg text-[#554f46] max-w-2xl leading-relaxed whitespace-pre-wrap">{structured.body || "Participe das nossas pop-ups, lançamentos presenciais e sessões de audição imersiva."}</p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cfc5b8] bg-[#eee7dd] p-10 md:p-16 text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8c8378]">Agenda em preparação</span>
            <h2 className="mt-3 text-2xl font-black uppercase">Nenhum evento publicado ainda</h2>
              <p className="mt-2 text-[#554f46]">Os próximos encontros da Eras Label aparecerão aqui assim que forem cadastrados e publicados no painel.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <article key={event.id} className="public-editorial-card grid md:grid-cols-[0.8fr_1.2fr] gap-0 overflow-hidden rounded-2xl border border-[#dfd7cc] bg-[#ede8df]">
                {event.imageUrl ? <div className="min-h-[260px] md:min-h-full"><img src={event.imageUrl} alt={event.imageAlt || event.title} className="h-full w-full object-cover" /></div> : <div className="hidden md:flex min-h-[260px] items-center justify-center bg-[#e2dace] text-[#8c8378] font-serif italic text-2xl">ERAS.</div>}
                <div className="p-7 md:p-10 flex flex-col justify-between gap-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#b22222]">{event.date}{event.location ? ` · ${event.location}` : ""}</span>
                    <h2 className="mt-3 text-3xl font-black uppercase leading-[0.95]">{event.title}</h2>
                    <p className="mt-4 text-[#554f46] leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </div>
                  <EventLink url={event.ctaUrl} label={event.ctaLabel || "Saiba mais"} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <OfficialFooter />
    </div>
  );
}
