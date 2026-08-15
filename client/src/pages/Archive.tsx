import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";

export default function ArchivePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playClickSound = () => playInteractionSound(soundEnabled);

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
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">01 / ARQUIVO HISTÓRICO</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Arquivo de Eras</h1>
        <p className="text-lg text-[#554f46] max-w-2xl mb-12">
          Cada coleção da Eras Label é um portal para uma fase temporal resgatada e reinterpretada no streetwear contemporâneo. Explore o arquivo completo abaixo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#ede8df] p-8 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c95139]">2026</span>
              <h3 className="text-2xl font-black uppercase mt-2 mb-4">Paradox Collection</h3>
              <p className="text-sm text-[#554f46] leading-relaxed mb-6">
                A colisão entre memórias analógicas e o futuro digital. Peças em algodão pesado com lavagem ácida e modelagem boxy.
              </p>
            </div>
            <Link href="/" onClick={playClickSound}>
              <Button variant="outline" className="border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                Ver Peças da Era &rarr;
              </Button>
            </Link>
          </div>

          <div className="bg-[#ede8df] p-8 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c95139]">2025</span>
              <h3 className="text-2xl font-black uppercase mt-2 mb-4">Lost Between Eras</h3>
              <p className="text-sm text-[#554f46] leading-relaxed mb-6">
                Inspirada nos anos 90 e na estética underground de transição de milénio.
              </p>
            </div>
            <Link href="/" onClick={playClickSound}>
              <Button variant="outline" className="border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                Ver Peças da Era &rarr;
              </Button>
            </Link>
          </div>

          <div className="bg-[#ede8df] p-8 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c95139]">2025</span>
              <h3 className="text-2xl font-black uppercase mt-2 mb-4">Raízes — Recife & La Ursa</h3>
              <p className="text-sm text-[#554f46] leading-relaxed mb-6">
                Uma homenagem vibrante à cultura pernambucana e às tradições populares do Carnaval de rua.
              </p>
            </div>
            <Link href="/" onClick={playClickSound}>
              <Button variant="outline" className="border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                Ver Peças da Era &rarr;
              </Button>
            </Link>
          </div>
        </div>
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
              <a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" onClick={playClickSound} className="vip-whatsapp">
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
                <Link href="/collection/lost-between-eras" onClick={() => { playClickSound(); setMenuOpen(false); }}>Lost Between Eras</Link>
                <Link href="/collection/raizes" onClick={() => { playClickSound(); setMenuOpen(false); }}>Raízes — Recife & La Ursa</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
