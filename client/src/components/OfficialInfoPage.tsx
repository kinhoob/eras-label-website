import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import { officialBrand } from "@/lib/official-brand";

export type OfficialInfoSection = {
  title: string;
  paragraphs: readonly string[];
};

type OfficialInfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly OfficialInfoSection[];
  onInteraction?: () => void;
};

export default function OfficialInfoPage({ eyebrow, title, intro, sections, onInteraction }: OfficialInfoPageProps) {
  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <Link href="/" onClick={onInteraction} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8c8378] hover:text-[#b22222] transition-colors mb-10">
          <ArrowLeft size={14} /> Voltar para a loja
        </Link>
        <span className="block text-xs uppercase tracking-[0.24em] text-[#b22222] mb-3">{eyebrow}</span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.04em] leading-[0.95] mb-7">{title}</h1>
        <p className="max-w-3xl text-base md:text-lg leading-relaxed text-[#554f46] mb-12">{intro}</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-[#dfd7cc] pt-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-[-0.02em] mb-4">{section.title}</h2>
              <div className="space-y-4 text-sm md:text-base leading-7 text-[#554f46]">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-[#dfd7cc] bg-white/70 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8c8378] mb-2">Ficou com alguma dúvida?</p>
          <p className="text-sm leading-6 text-[#554f46]">Fale com a Eras Label pelo e-mail <a className="font-semibold text-[#23221e] hover:text-[#b22222]" href={`mailto:${officialBrand.email}`}>{officialBrand.email}</a> ou pelo <a className="font-semibold text-[#23221e] hover:text-[#b22222]" href={officialBrand.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>.</p>
        </div>
      </main>

      <OfficialFooter onInteraction={onInteraction} />
    </div>
  );
}
