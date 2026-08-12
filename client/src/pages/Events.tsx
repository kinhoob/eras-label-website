import { useState } from "react";
import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";

export default function EventsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">03 / CALENDÁRIO</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Próximos Eventos</h1>
        <p className="text-lg text-[#554f46] max-w-2xl mb-12">
          Participe das nossas pop-ups, lançamentos presenciais e sessões de audição imersiva.
        </p>

        <div className="space-y-6">
          <div className="bg-[#ede8df] p-6 md:p-8 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c95139]">18 SET 2026 · RECIFE, PE</span>
              <h3 className="text-2xl font-black uppercase mt-1 mb-2">Pop-Up Lab: O Retorno às Raízes</h3>
              <p className="text-sm text-[#554f46]">Exibição exclusiva de protótipos e instalação de som analógico no Bairro do Recife.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest bg-[#23221e] text-[#f6f3ee] px-4 py-2 rounded">Em Breve</span>
          </div>

          <div className="bg-[#ede8df] p-6 md:p-8 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c95139]">05 OUT 2026 · SÃO PAULO, SP</span>
              <h3 className="text-2xl font-black uppercase mt-1 mb-2">Drop Imersivo Paradox Collection</h3>
              <p className="text-sm text-[#554f46]">Galeria temporária com experiência interativa de realidade mista e acesso antecipado.</p>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest bg-[#23221e] text-[#f6f3ee] px-4 py-2 rounded">Em Breve</span>
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
