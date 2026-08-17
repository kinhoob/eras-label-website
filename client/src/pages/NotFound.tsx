import { useLocation } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";
import OfficialFooter from "@/components/OfficialFooter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col justify-between selection:bg-[#b22222] selection:text-white">
      {/* Top minimalistic header */}
      <header className="w-full px-6 py-6 border-b border-[#dfd7cc]/60 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-[0.28em] text-[#23221e] flex items-center gap-1.5">
          ERAS<span className="w-1.5 h-1.5 rounded-full bg-[#b22222]" />
        </a>
        <span className="text-[11px] uppercase tracking-[0.24em] text-[#736e65]">Erro 404 • Página não encontrada</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f0ece3] border border-[#dfd7cc] text-[#b22222] mb-2 shadow-sm">
            <Compass className="w-7 h-7 animate-pulse" />
          </div>

          <h1 className="text-6xl md:text-7xl font-light tracking-[0.12em] text-[#23221e] font-serif">
            404
          </h1>

          <h2 className="text-lg md:text-xl uppercase tracking-[0.2em] font-medium text-[#23221e]">
            Esta era ainda não foi escrita
          </h2>

          <p className="text-sm md:text-base text-[#666057] leading-relaxed max-w-md mx-auto font-sans">
            A página que procura não existe ou foi movida para outra coleção. Explore o nosso catálogo ou regresse à página inicial para continuar.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#23221e] text-[#f6f3ee] hover:bg-[#b22222] text-xs uppercase tracking-[0.24em] font-bold transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </button>
            <button
              onClick={() => setLocation("/catalog")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-transparent border border-[#23221e]/30 text-[#23221e] hover:border-[#23221e] text-xs uppercase tracking-[0.24em] font-bold transition-all duration-300"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </main>

      <OfficialFooter />
    </div>
  );
}
