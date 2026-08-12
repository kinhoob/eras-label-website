import { useState } from "react";
import { Link, useRoute } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function CatalogViewPage() {
  const [, paramsCategory] = useRoute("/category/:slug");
  const [, paramsCollection] = useRoute("/collection/:slug");
  
  const filterType = paramsCategory ? "category" : "collection";
  const filterSlug = paramsCategory?.slug || paramsCollection?.slug || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data: products = [], isLoading } = trpc.catalog.list.useQuery();

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  const filteredProducts = products.filter((p: any) => {
    if (filterType === "category") {
      return p.category?.toLowerCase().includes(filterSlug.toLowerCase());
    } else {
      return p.collectionName?.toLowerCase().includes(filterSlug.toLowerCase());
    }
  });

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      {/* Top Header */}
      <header className="border-b border-[#dfd7cc] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f6f3ee]/95 backdrop-blur z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { playClickSound(); setMenuOpen(true); }}
            className="p-1 hover:text-[#c95139] transition-colors"
            aria-label="Abrir Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <Link href="/" onClick={playClickSound} className="font-serif text-2xl font-black tracking-widest uppercase">
            ERAS.
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs uppercase tracking-widest flex items-center gap-1 hover:text-[#c95139]">
            {soundEnabled ? "Som Ativo" : "Mudo"}
          </button>
          <Link href="/auth" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#c95139]">Conta</Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">
          {filterType === "category" ? "CATEGORIA" : "COLEÇÃO"} / {filterSlug.toUpperCase()}
        </span>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-12">
          {filterSlug.replace(/-/g, " ")}
        </h1>

        {isLoading ? (
          <div className="text-center py-20 uppercase tracking-widest text-sm">Carregando era...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#ede8df] p-12 rounded-lg text-center">
            <h3 className="text-xl font-bold uppercase mb-2">Nenhum produto encontrado nesta seleção</h3>
            <p className="text-sm text-[#554f46] mb-6">Explore outras categorias ou volte à página inicial.</p>
            <Link href="/" onClick={playClickSound}>
              <Button className="bg-[#23221e] text-[#f6f3ee] hover:bg-[#c95139]">Voltar ao Início</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((p: any) => {
              const images = Array.isArray(p.images) ? p.images : [p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"];
              return (
                <div key={p.id} className="group bg-[#ede8df] rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-[3/4] overflow-hidden bg-[#dfd7cc] relative">
                    <img src={images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#c95139]">{p.collectionName || "Era Geral"}</span>
                      <h3 className="text-lg font-black uppercase mt-1 mb-2">{p.name}</h3>
                      <p className="text-sm font-semibold">R$ {Number(p.price).toFixed(2)}</p>
                    </div>
                    <Link href="/" onClick={playClickSound} className="mt-4">
                      <Button variant="outline" className="w-full border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                        Ver na Loja
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <div className="lovable-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="lovable-side-menu" onClick={(e) => e.stopPropagation()}>
            <div className="lovable-menu-header">
              <span className="lovable-menu-kicker">EXPLORAR ERAS</span>
              <button onClick={() => { playClickSound(); setMenuOpen(false); }} className="p-2 font-bold uppercase text-sm">Fechar [X]</button>
            </div>
            <div className="lovable-menu-links">
              <Link href="/" onClick={() => { playClickSound(); setMenuOpen(false); }}>Início</Link>
              <Link href="/archive" onClick={() => { playClickSound(); setMenuOpen(false); }}>Arquivo de Eras</Link>
              <Link href="/manifesto" onClick={() => { playClickSound(); setMenuOpen(false); }}>Manifesto Completo</Link>
              <Link href="/events" onClick={() => { playClickSound(); setMenuOpen(false); }}>Eventos</Link>
              <Link href="/contact" onClick={() => { playClickSound(); setMenuOpen(false); }}>Contato</Link>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" onClick={playClickSound} className="vip-whatsapp">
                Grupo VIP no WhatsApp
              </a>
            </div>
            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">CATEGORIAS</span>
              <div className="lovable-menu-sublinks">
                <Link href="/" onClick={() => { playClickSound(); setMenuOpen(false); }}>Todos os Produtos</Link>
                <Link href="/category/camisetas" onClick={() => { playClickSound(); setMenuOpen(false); }}>Camisetas</Link>
                <Link href="/category/bones" onClick={() => { playClickSound(); setMenuOpen(false); }}>Bonés</Link>
              </div>
            </div>
            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">COLEÇÕES</span>
              <div className="lovable-menu-sublinks">
                <Link href="/collection/paradox" onClick={() => { playClickSound(); setMenuOpen(false); }}>Paradox Collection</Link>
                <Link href="/collection/lost" onClick={() => { playClickSound(); setMenuOpen(false); }}>Lost Between Eras</Link>
                <Link href="/collection/raizes" onClick={() => { playClickSound(); setMenuOpen(false); }}>Raízes — Recife & La Ursa</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
