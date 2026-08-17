import { useState } from "react";
import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import OfficialFooter from "@/components/OfficialFooter";
import { Truck, Package, Search, Copy, Check, ExternalLink, Clock, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

type TrackingEvent = {
  status?: string;
  description?: string;
  location?: { city?: string; state?: string };
  created_at?: string;
};

type TrackingRecord = {
  service?: string;
  name?: string;
  status?: string;
  state?: string;
  estimated_delivery?: string;
  events?: TrackingEvent[];
};

export default function TrackingPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [copied, setCopied] = useState(false);

  const playClickSound = () => playInteractionSound(soundEnabled);

  const { data, isLoading, error } = trpc.orders.trackOrderShipping.useQuery(
    { trackingCode: activeCode },
    { enabled: activeCode.trim().length >= 3 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const clean = trackingCodeInput.trim();
    if (!clean) {
      toast.error("Introduza um código de rastreio válido.");
      return;
    }
    setActiveCode(clean);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código de rastreio copiado!");
  };

  // Extrair o objeto de rastreio retornado pelo Melhor Envio (pode vir como objeto com chave correspondente ao código ou array)
  const trackingData = data?.tracking;
  const trackingRecord: TrackingRecord | null = trackingData && typeof trackingData === "object"
    ? (() => {
        const trackingObject = trackingData as Record<string, TrackingRecord>;
        return trackingObject[activeCode] || Object.values(trackingObject)[0] || (trackingObject as unknown as TrackingRecord);
      })()
    : null;

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      {/* Header */}
      <header className="border-b border-[#dfd7cc] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#f6f3ee]/95 backdrop-blur z-40">
        <div className="flex items-center gap-4">
          <Link href="/" onClick={playClickSound} className="font-serif text-2xl font-black tracking-widest uppercase">
            ERAS.
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-xs uppercase tracking-widest flex items-center gap-1 hover:text-[#c95139]">
            {soundEnabled ? "Som Ativo" : "Mudo"}
          </button>
          <Link href="/orders" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#c95139]">Meus Pedidos</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">LOGÍSTICA & TRANSPORTE</span>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Rastreamento de Pedido</h1>
        <p className="text-sm text-[#554f46] mb-10">
          Insira o código de rastreio fornecido no seu e-mail de confirmação ou no painel de pedidos para acompanhar a rota da sua entrega em tempo real através da nossa integração oficial com o Melhor Envio.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8378]" size={18} />
            <Input
              type="text"
              placeholder="Ex: SS123456789BR ou ID do Melhor Envio"
              value={trackingCodeInput}
              onChange={(e) => setTrackingCodeInput(e.target.value)}
              className="pl-11 bg-white border-[#dfd7cc] h-12 text-sm"
            />
          </div>
          <Button type="submit" className="bg-[#23221e] text-white hover:bg-[#c95139] px-6 h-12 uppercase text-xs font-bold tracking-widest">
            Rastrear
          </Button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#dfd7cc] border-t-[#c95139] mb-4" />
            <p className="text-xs uppercase tracking-widest text-[#8c8378]">A consultar dados no Melhor Envio...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#fbe8e6] border border-[#f2c2bc] p-6 rounded-lg text-[#a82d1c] mb-8">
            <h3 className="font-bold uppercase text-sm mb-1">Não foi possível localizar o envio</h3>
            <p className="text-xs">{error.message || "Verifique se o código de rastreio está correto e tente novamente."}</p>
          </div>
        )}

        {/* Result State */}
        {activeCode && !isLoading && !error && (
          <div className="bg-white border border-[#dfd7cc] rounded-lg p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#edebd7] gap-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8c8378]">CÓDIGO DE RASTREIO</span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl font-bold font-mono tracking-wide">{activeCode}</h2>
                  <button
                    onClick={() => handleCopy(activeCode)}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#554f46] hover:text-[#c95139] bg-[#f6f3ee] px-2.5 py-1 rounded border border-[#dfd7cc]"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>
              </div>
              <a
                href={`https://www.linkcorreios.com.br/?id=${activeCode}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-[#f6f3ee] hover:bg-[#edebd7] px-4 py-2.5 rounded transition-colors"
              >
                <span>Ver nos Correios / Transportadora</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Tracking timeline / Details */}
            {trackingRecord ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#f6f3ee] p-4 rounded-md">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#8c8378] block">Serviço</span>
                    <strong className="text-sm uppercase">{trackingRecord.service || trackingRecord.name || "Correios / Logística"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#8c8378] block">Status Atual</span>
                    <strong className="text-sm uppercase text-[#c95139]">{trackingRecord.status || trackingRecord.state || "Em trânsito"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#8c8378] block">Previsão</span>
                    <strong className="text-sm">{trackingRecord.estimated_delivery || "Consulte o detalhe abaixo"}</strong>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-[#8c8378]">Histórico de Movimentações</h3>
                  {Array.isArray(trackingRecord.events) && trackingRecord.events.length > 0 ? (
                    <div className="space-y-4 border-l-2 border-[#dfd7cc] pl-4 ml-2">
                      {trackingRecord.events.map((ev, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#c95139] ring-4 ring-[#f6f3ee]" />
                          <p className="text-xs font-bold uppercase text-[#23221e]">{ev.status || ev.description || "Atualização de status"}</p>
                          <p className="text-xs text-[#554f46] mt-0.5">{ev.location ? `${ev.location.city || ""} - ${ev.location.state || ""}` : ""} {ev.created_at ? `· ${new Date(ev.created_at).toLocaleString("pt-BR")}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#554f46]">O envio foi registrado e está a ser processado pela transportadora selecionada.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#554f46] uppercase tracking-wider">
                Envio localizado com sucesso na rede Melhor Envio.
              </div>
            )}
          </div>
        )}

        {!activeCode && (
          <div className="bg-[#ede8df] rounded-lg p-8 text-center border border-[#dfd7cc]">
            <Truck size={32} className="mx-auto mb-3 text-[#8c8378]" />
            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Insira um código acima</h3>
            <p className="text-xs text-[#554f46]">Você pode rastrear códigos dos Correios (PAC/SEDEX), Jadlog ou Loggi.</p>
          </div>
        )}
      </main>

      <OfficialFooter onInteraction={playClickSound} />
    </div>
  );
}
