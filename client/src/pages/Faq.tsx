import { useState } from "react";
import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { ChevronDown, ArrowRight, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import OfficialFooter from "@/components/OfficialFooter";

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
    answer: "Assim que o pedido é enviado, o código de rastreio chega no e-mail de cadastro feito na hora da compra. No nosso site, o código também pode ser acompanhado pela página de rastreamento quando estiver disponível.",
  },
  {
    category: "Envios",
    question: "Como funciona a política de frete grátis?",
    answer: "A página oficial informa frete grátis para todo o Brasil na modalidade SEDEX em pedidos acima de R$300,00. No checkout, o valor e a disponibilidade são calculados conforme o CEP e a configuração vigente da loja.",
  },
  {
    category: "Trocas",
    question: "Qual é o prazo e o procedimento para trocas e devoluções?",
    answer: "Você tem até 7 dias úteis após o recebimento da encomenda para solicitar a troca ou devolução. O produto deve estar sem resquício de uso ou avaria, com lacres ou adesivos de segurança preservados. O processo começa pelo suporte via e-mail ou WhatsApp; na devolução, o reembolso ocorre em até 3 dias após a confirmação de recebimento e análise.",
  },
  {
    category: "Trocas",
    question: "Quem paga o frete em uma troca?",
    answer: "A marca paga o frete de retorno do produto para análise. Quando a troca é concluída e o novo produto é enviado, o cliente paga o frete de reenvio.",
  },
  {
    category: "Marca",
    question: "Qual é o propósito e a essência da Eras Label?",
    answer: "A Eras Label nasceu para conectar passado, presente e futuro através do streetwear. Inspirados pela cultura, arte e identidade das ruas, criamos peças que contam histórias e carregam significados. Nosso conceito gira em torno de reviver e reinventar eras.",
  },
  {
    category: "Marca",
    question: "Como posso falar com a Eras Label sobre uma dúvida?",
    answer: "Você pode falar com a Eras Label pelo e-mail theeraslabel@gmail.com ou pelo WhatsApp oficial disponível no rodapé. Também é possível iniciar o atendimento pela página de contato.",
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
            <strong className="block text-xs uppercase tracking-widest mb-1">7 Dias Úteis para Trocas</strong>
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

      <OfficialFooter onInteraction={playClickSound} />
    </div>
  );
}
