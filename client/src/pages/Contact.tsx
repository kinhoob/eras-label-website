import { useState } from "react";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OfficialFooter from "@/components/OfficialFooter";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const playClickSound = () => playInteractionSound(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setSubmitted(true);
    toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
  };

  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24 w-full">
        <span className="text-xs uppercase tracking-widest text-[#8c8378] block mb-2">04 / SUPORTE E PARCERIAS</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Contato</h1>
        <p className="text-lg text-[#554f46] mb-12">
          Tem dúvidas sobre pedidos, trocas ou deseja propor uma parceria artística? Fale diretamente com a equipa da Eras Label.
        </p>

        {submitted ? (
          <div className="bg-[#ede8df] p-8 rounded-lg text-center">
            <h3 className="text-2xl font-black uppercase mb-4">Mensagem Recebida</h3>
            <p className="text-sm text-[#554f46]">Agradecemos o seu contacto. A nossa equipa responderá para o seu e-mail em até 24 horas úteis.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#ede8df] p-8 rounded-lg">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold mb-2">Seu Nome</label>
              <Input required placeholder="Ex: Kinho" className="bg-[#f6f3ee] border-[#dfd7cc]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold mb-2">Seu E-mail</label>
              <Input required type="email" placeholder="seu@email.com" className="bg-[#f6f3ee] border-[#dfd7cc]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold mb-2">Mensagem</label>
              <Textarea required placeholder="Como podemos ajudar na sua era?" className="bg-[#f6f3ee] border-[#dfd7cc] min-h-[120px]" />
            </div>
            <Button type="submit" className="w-full bg-[#23221e] text-[#f6f3ee] hover:bg-[#c95139]">
              Enviar Mensagem
            </Button>
          </form>
        )}
      </main>

      <OfficialFooter onInteraction={playClickSound} />
    </div>
  );
}
