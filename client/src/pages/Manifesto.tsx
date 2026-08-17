import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { trpc } from "@/lib/trpc";
import { parseCmsContent } from "@shared/cms";

export default function ManifestoPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playClickSound = () => playInteractionSound(soundEnabled);
  const { data: cms } = trpc.catalog.getCmsPage.useQuery({ slug: "manifesto" });
  const structured = parseCmsContent(cms?.content, "manifesto");
  const storyBlocks = structured.storyBlocks ?? [];

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <header className="border-b border-[#dfd7cc] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f6f3ee]/95 backdrop-blur z-40">
        <div className="flex items-center gap-4"><button onClick={() => { playClickSound(); setMenuOpen(true); }} className="p-1 hover:text-[#b22222] transition-colors" aria-label="Abrir menu"><Menu size={22} /></button><Link href="/" onClick={playClickSound} className="font-serif text-2xl font-black tracking-widest uppercase">ERAS.</Link></div>
        <div className="flex items-center gap-6"><button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs uppercase tracking-widest hover:text-[#b22222]">{soundEnabled ? "Som Ativo" : "Mudo"}</button><Link href="/auth" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#b22222]">Conta</Link></div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        {cms?.bannerUrl && <div className="mb-12 w-full h-[320px] md:h-[420px] rounded-2xl overflow-hidden border border-[#dfd7cc] shadow-[0_24px_70px_rgba(35,34,30,0.12)]"><img src={cms.bannerUrl} alt={cms.title || "Manifesto Eras"} className="w-full h-full object-cover" /></div>}
        <div className="max-w-3xl mb-16"><span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">{cms?.subtitle || "02 / FILOSOFIA"}</span><h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">{cms?.title || "Manifesto Completo"}</h1></div>

        {storyBlocks.length > 0 ? <div className="space-y-20">{storyBlocks.map((block, index) => <article key={block.id} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${block.imagePosition === "left" ? "" : "md:[&>div:first-child]:order-2"}`}>
          <div className="space-y-5"><span className="text-xs uppercase tracking-[0.24em] text-[#b22222]">{block.eyebrow || `Capítulo 0${index + 1}`}</span><h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.95]">{block.title}</h2><p className="text-lg text-[#554f46] leading-relaxed whitespace-pre-wrap">{block.text}</p></div>
          {block.imageUrl ? <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#e5ded4] border border-[#dfd7cc]"><img src={block.imageUrl} alt={block.imageAlt || block.title} className="w-full h-full object-cover" /></div> : <div className="aspect-[4/5] rounded-2xl bg-[#ebe4da] border border-[#dfd7cc] flex items-center justify-center"><span className="font-serif italic text-2xl text-[#8c8378]">Imagem a inserir</span></div>}
        </article>)}</div> : <div className="max-w-3xl prose prose-neutral space-y-6 text-[#554f46] text-lg leading-relaxed whitespace-pre-wrap">{structured.body ? structured.body : <><p className="font-serif text-2xl text-[#23221e] italic">"Não criamos apenas roupas. Criamos artefactos de tempo para vestir a alma de quem recusa o esquecimento."</p><p>A Eras Label nasce da convicção de que o vestuário é a forma mais íntima de arquivo histórico que possuímos. Cada época traz consigo texturas, dores, vitórias e visões estéticas que moldam quem somos.</p><p>Reviver ou reinventar eras é uma ferramenta de resgate. Pegamos em elementos esquecidos do passado analógico, da contracultura e das raízes regionais para fundi-los com o design utilitário do streetwear contemporâneo.</p></>}</div>}
      </main>

      {menuOpen && <div className="lovable-menu-overlay" onClick={() => setMenuOpen(false)}><div className="lovable-side-menu" onClick={(e) => e.stopPropagation()}><div className="lovable-menu-header"><span className="lovable-menu-kicker">EXPLORAR ERAS</span><button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Fechar menu"><X size={19} /></button></div><div className="lovable-menu-links"><Link href="/catalog" onClick={() => { playClickSound(); setMenuOpen(false); }}>Todos os produtos</Link><Link href="/archive" onClick={() => { playClickSound(); setMenuOpen(false); }}>Arquivo de Eras</Link><Link href="/manifesto" onClick={() => { playClickSound(); setMenuOpen(false); }}>Manifesto</Link><Link href="/events" onClick={() => { playClickSound(); setMenuOpen(false); }}>Eventos</Link><Link href="/contact" onClick={() => { playClickSound(); setMenuOpen(false); }}>Contato</Link><a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" className="vip-whatsapp">Grupo VIP no WhatsApp <ArrowUpRight size={14} /></a></div><div className="lovable-menu-section"><span className="lovable-menu-kicker">CATEGORIAS</span><div className="lovable-menu-sublinks"><Link href="/category/camisetas" onClick={() => setMenuOpen(false)}>Camisetas</Link><Link href="/category/bones" onClick={() => setMenuOpen(false)}>Bonés</Link></div></div><div className="lovable-menu-section"><span className="lovable-menu-kicker">COLEÇÕES</span><div className="lovable-menu-sublinks"><Link href="/collection/paradox" onClick={() => setMenuOpen(false)}>Paradox Collection</Link><Link href="/collection/lost-between-eras" onClick={() => setMenuOpen(false)}>Lost Between Eras</Link><Link href="/collection/raizes" onClick={() => setMenuOpen(false)}>Raízes — Recife & La Ursa</Link></div></div></div></div>}
    </div>
  );
}
