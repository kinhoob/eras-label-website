import { useState } from "react";
import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { ChevronDown, ArrowRight, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
  category: "Envios" | "Trocas" | "Marca";
};

const faqList: FaqItem[] = [
  {
    category: "Envios",
    question: "Como funciona o envio e quais transportadoras são utilizadas?",
    answer: "A Eras Label opera em parceria oficial com o Melhor Envio para garantir cotações precisas e entregas seguras em todo o território nacional. Disponibilizamos exclusivamente os serviços dos Correios (PAC e SEDEX) e das transportadoras Jadlog (Econômico e Rápido) e Loggi.",
  },
  {
    category: "Envios",
    question: "Qual é o prazo de postagem e como recebo o código de rastreio?",
    answer: "As peças são preparadas e despachadas em até 2 dias úteis após a confirmação do pagamento. Assim que a etiqueta é gerada no Melhor Envio, o sistema envia automaticamente um e-mail com o código de rastreio, que também pode ser consultado a qualquer momento na nossa página de rastreio ou na área de cliente.",
  },
  {
    category: "Envios",
    question: "Como funciona a política de frete grátis?",
    answer: "Oferecemos frete grátis para compras acima do valor estipulado na barra de anúncio e nas regras vigentes de cada coleção. O valor exato para o seu CEP pode ser calculado diretamente no carrinho de compras ou na página de checkout.",
  },
  {
    category: "Trocas",
    question: "Qual é o prazo e o procedimento para trocas e devoluções?",
    answer: "Você tem até 7 dias corridos após o recebimento da encomenda para solicitar a troca ou devolução de qualquer peça, desde que esteja sem marcas de uso, com etiquetas originais e acompanhada da nota fiscal. O processo é iniciado diretamente através do nosso canal de atendimento por e-mail ou WhatsApp.",
  },
  {
    category: "Trocas",
    question: "As peças possuem garantia contra defeitos de fabricação?",
    answer: "Sim. Todas as peças passam por um rigoroso controle de qualidade em nosso ateliê. Caso identifique qualquer imperfeição de fabricação, a substituição é garantida sem custos adicionais de frete.",
  },
  {
    category: "Marca",
    question: "Qual é o propósito e a essência da Eras Label?",
    answer: "A Eras Label é uma marca de streetwear autoral cujo propósito é criar roupas com significado, que dialoguem com a cultura, identidade e evolução das pessoas e da sociedade. O nosso lema é 'Reviver ou reinventar eras', resgatando e reinterpretando fases da história e da vida.",
  },
  {
    category: "Marca",
    question: "Onde são produzidas as coleções da Eras Label?",
    answer: "As nossas peças são desenvolvidas com processos de curadoria rigorosa, modelagem oversized exclusiva e tiragens limitadas, garantindo que cada lançamento carregue uma narrativa única e sustentável para a comunidade.",
  },
];

export default function FaqPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const playClickSound = () => playInteractionSound(soundEnabled);

  const filteredFaqs = activeTab === "Todos" 
    ? faqList 
    : faqList.filter((item) => item.category === activeTab);

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
          <Link href="/contact" onClick={playClickSound} className="text-xs uppercase tracking-widest hover:text-[#c95139]">Contato</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full">
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">SUPORTE & TRANSPARÊNCIA</span>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Perguntas Frequentes</h1>
        <p className="text-sm text-[#554f46] mb-10 max-w-2xl leading-relaxed">
          Tire suas dúvidas sobre os prazos de envio, nossa integração logística com o Melhor Envio, políticas de troca e os compromissos éticos da Eras Label.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white border border-[#dfd7cc] p-6 rounded-lg">
            <Truck size={22} className="text-[#c95139] mb-3" />
            <strong className="block text-xs uppercase tracking-widest mb-1">Envio Rastreado</strong>
            <span className="text-xs text-[#554f46]">Correios e Jadlog integrados em tempo real.</span>
          </div>
          <div className="bg-white border border-[#dfd7cc] p-6 rounded-lg">
            <RotateCcw size={22} className="text-[#c95139] mb-3" />
            <strong className="block text-xs uppercase tracking-widest mb-1">7 Dias para Trocas</strong>
            <span className="text-xs text-[#554f46]">Processo simples e transparente.</span>
          </div>
          <div className="bg-white border border-[#dfd7cc] p-6 rounded-lg">
            <ShieldCheck size={22} className="text-[#c95139] mb-3" />
            <strong className="block text-xs uppercase tracking-widest mb-1">Compra Protegida</strong>
            <span className="text-xs text-[#554f46]">Mercado Pago com Pix e cartão seguros.</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#dfd7cc] pb-4">
          {["Todos", "Envios", "Trocas", "Marca"].map((tab) => (
            <button
              key={tab}
              onClick={() => { playClickSound(); setActiveTab(tab); }}
              className={`px-4 py-2 text-xs uppercase tracking-widest rounded transition-colors ${activeTab === tab ? "bg-[#23221e] text-white font-bold" : "bg-[#ede8df] text-[#554f46] hover:bg-[#dfd7cc]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Accordion list */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-white border border-[#dfd7cc] rounded-lg overflow-hidden transition-all">
                <button
                  onClick={() => { playClickSound(); setOpenIndex(isOpen ? null : index); }}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest bg-[#ede8df] px-2 py-1 rounded text-[#554f46] font-mono">{faq.category}</span>
                    <span className="text-sm font-bold uppercase tracking-wide text-[#23221e]">{faq.question}</span>
                  </div>
                  <ChevronDown size={18} className={`text-[#8c8378] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#c95139]" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#554f46] border-t border-[#f2efe9] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="bg-[#ede8df] border border-[#dfd7cc] rounded-lg p-8 text-center">
          <Sparkles size={24} className="mx-auto mb-3 text-[#c95139]" />
          <h2 className="text-lg font-bold uppercase tracking-tight mb-2">Ainda tem alguma dúvida?</h2>
          <p className="text-xs text-[#554f46] mb-6 max-w-md mx-auto">
            Nossa equipe de atendimento está pronta para ajudar você com qualquer questão sobre pedidos, coleções ou entregas.
          </p>
          <Link
            href="/contact"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 bg-[#23221e] text-white hover:bg-[#c95139] px-6 py-3 rounded text-xs uppercase font-bold tracking-widest transition-colors"
          >
            <span>Falar com o Ateliê</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#dfd7cc] px-6 py-8 text-center text-xs text-[#8c8378] uppercase tracking-widest flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto w-full gap-4">
        <span>© 2026 ERAS LABEL</span>
        <div className="flex gap-6">
          <Link href="/tracking" onClick={playClickSound} className="hover:text-[#c95139]">Rastreio</Link>
          <Link href="/contact" onClick={() => playClickSound()} className="hover:text-[#c95139]">Contato</Link>
          <Link href="/" onClick={playClickSound} className="hover:text-[#c95139]">Início</Link>
        </div>
        <span>Reviver. Reinventar Eras.</span>
      </footer>
    </div>
  );
}
