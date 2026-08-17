import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { trpc } from "@/lib/trpc";
import { parseCmsContent } from "@shared/cms";

function EventLink({ url, label }: { url?: string; label: string }) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#23221e] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f6f3ee] transition hover:bg-[#b22222]">{label}<ArrowUpRight size={14} /></a>;
  return <Link href={url} className="inline-flex items-center gap-2 rounded-full bg-[#23221e] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f6f3ee] transition hover:bg-[#b22222]">{label}<ArrowUpRight size={14} /></Link>;
}

export default function EventsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playClickSound = () => playInteractionSound(soundEnabled);
  const { data: cms } = trpc.catalog.getCmsPage.useQuery({ slug: "events" });
  const structured = parseCmsContent(cms?.content, "events");
  const events = structured.events ?? [];

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <header className="border-b border-[#dfd7cc] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f6f3ee]/95 backdrop-blur z-40"><div className="flex items-center gap-4"><button onClick={() => { playClickSound(); setMenuOpen(true); }} className="p-1 hover:text-[#b22222] transition-colors" aria-label="Abrir menu"><Menu size={22} /></button><Link href="/" onClick={playClickSound} className="font-serif text-2xl font-black tracking-widest uppercase">ERAS.</Link></div><div className="flex items-center gap-6"><button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs uppercase tracking-widest hover:text-[#b22222]">{soundEnabled ? "Som Ativo" : "Mudo"}</button><Link href="/auth" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#b22222]">Conta</Link></div></header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full"><div className="max-w-3xl mb-14"><span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">{cms?.subtitle || "03 / CALENDÁRIO"}</span><h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">{cms?.title || "Próximos Eventos"}</h1><p className="mt-6 text-lg text-[#554f46] max-w-2xl whitespace-pre-wrap">{structured.body || "Participe das nossas pop-ups, lançamentos presenciais e sessões de audição imersiva."}</p></div>
        {events.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cfc5b8] bg-[#eee7dd] p-10 text-center"><span className="text-xs uppercase tracking-[0.2em] text-[#8c8378]">Agenda em preparação</span><h2 className="mt-3 text-2xl font-black uppercase">Nenhum evento publicado ainda</h2><p className="mt-2 text-[#554f46]">Os próximos encontros da Eras Label aparecerão aqui assim que forem cadastrados no painel.</p></div> : <div className="space-y-6">{events.map((event) => <article key={event.id} className="grid md:grid-cols-[0.8fr_1.2fr] gap-0 overflow-hidden rounded-2xl border border-[#dfd7cc] bg-[#ede8df]">{event.imageUrl ? <div className="min-h-[260px] md:min-h-full"><img src={event.imageUrl} alt={event.imageAlt || event.title} className="h-full w-full object-cover" /></div> : <div className="hidden md:flex min-h-[260px] items-center justify-center bg-[#e2dace] text-[#8c8378] font-serif italic text-2xl">ERAS.</div>}<div className="p-7 md:p-10 flex flex-col justify-between gap-8"><div><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#b22222]">{event.date}{event.location ? ` · ${event.location}` : ""}</span><h2 className="mt-3 text-3xl font-black uppercase leading-[0.95]">{event.title}</h2><p className="mt-4 text-[#554f46] leading-relaxed whitespace-pre-wrap">{event.description}</p></div><EventLink url={event.ctaUrl} label={event.ctaLabel || "Saiba mais"} /></div></article>)}</div>}
      </main>

      {menuOpen && <div className="lovable-menu-overlay" onClick={() => setMenuOpen(false)}><div className="lovable-side-menu" onClick={(e) => e.stopPropagation()}><div className="lovable-menu-header"><span className="lovable-menu-kicker">EXPLORAR ERAS</span><button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Fechar menu"><X size={19} /></button></div><div className="lovable-menu-links"><Link href="/catalog" onClick={() => { playClickSound(); setMenuOpen(false); }}>Todos os produtos</Link><Link href="/archive" onClick={() => { playClickSound(); setMenuOpen(false); }}>Arquivo de Eras</Link><Link href="/manifesto" onClick={() => { playClickSound(); setMenuOpen(false); }}>Manifesto</Link><Link href="/events" onClick={() => { playClickSound(); setMenuOpen(false); }}>Eventos</Link><Link href="/contact" onClick={() => { playClickSound(); setMenuOpen(false); }}>Contato</Link><a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" className="vip-whatsapp">Grupo VIP no WhatsApp <ArrowUpRight size={14} /></a></div><div className="lovable-menu-section"><span className="lovable-menu-kicker">CATEGORIAS</span><div className="lovable-menu-sublinks"><Link href="/category/camisetas" onClick={() => setMenuOpen(false)}>Camisetas</Link><Link href="/category/bones" onClick={() => setMenuOpen(false)}>Bonés</Link></div></div><div className="lovable-menu-section"><span className="lovable-menu-kicker">COLEÇÕES</span><div className="lovable-menu-sublinks"><Link href="/collection/paradox" onClick={() => setMenuOpen(false)}>Paradox Collection</Link><Link href="/collection/lost-between-eras" onClick={() => setMenuOpen(false)}>Lost Between Eras</Link><Link href="/collection/raizes" onClick={() => setMenuOpen(false)}>Raízes — Recife & La Ursa</Link></div></div></div></div>}
    </div>
  );
}
