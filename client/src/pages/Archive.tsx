import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import OfficialFooter from "@/components/OfficialFooter";

const archiveEntries = [
  {
    year: "2026",
    title: "Paradox Collection",
    description: "A colisão entre memórias analógicas e o futuro digital. Peças em algodão pesado com lavagem ácida e modelagem boxy.",
    href: "/collection/paradox",
  },
  {
    year: "2025",
    title: "Lost Between Eras",
    description: "Inspirada nos anos 90 e na estética underground de transição de milénio.",
    href: "/collection/lost-between-eras",
  },
  {
    year: "2025",
    title: "Raízes — Recife & La Ursa",
    description: "Uma homenagem vibrante à cultura pernambucana e às tradições populares do Carnaval de rua.",
    href: "/collection/raizes",
  },
];

export default function ArchivePage() {
  const playClickSound = () => playInteractionSound(true);

  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="public-page-heading max-w-3xl mb-14">
          <span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">01 / ARQUIVO HISTÓRICO</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">Arquivo de Eras</h1>
          <p className="mt-6 text-lg text-[#554f46] max-w-2xl leading-relaxed">
            Cada coleção da Eras Label é um portal para uma fase temporal resgatada e reinterpretada no streetwear contemporâneo. Explore o arquivo completo abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {archiveEntries.map((entry) => (
            <article key={entry.title} className="public-editorial-card bg-[#ede8df] p-7 md:p-8 rounded-2xl flex flex-col justify-between min-h-[260px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#b22222]">{entry.year}</span>
                <h2 className="text-2xl font-black uppercase mt-2 mb-4">{entry.title}</h2>
                <p className="text-sm text-[#554f46] leading-relaxed mb-8">{entry.description}</p>
              </div>
              <Link href={entry.href} onClick={playClickSound}>
                <Button variant="outline" className="border-[#23221e] text-[#23221e] hover:bg-[#23221e] hover:text-[#f6f3ee]">
                  Ver peças da era <span aria-hidden="true">→</span>
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <OfficialFooter onInteraction={playClickSound} />
    </div>
  );
}
