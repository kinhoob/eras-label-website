import { Link } from "wouter";
import { PageTransitionHandler } from "@/components/PageTransition";
import { playInteractionSound } from "@/lib/interaction-sound";
import OfficialFooter from "@/components/OfficialFooter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function ArchivePage() {
  const playClickSound = () => playInteractionSound(true);
  const { data: collections = [], isLoading } = trpc.collections.list.useQuery();

  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
        <div className="public-page-heading max-w-3xl mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">Capítulos</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">Coleções</h1>
          <p className="mt-6 text-base md:text-lg text-[#554f46] max-w-2xl leading-relaxed">
            Cada coleção da Eras Label é um portal para uma fase temporal resgatada e reinterpretada no streetwear contemporâneo. Explore todas as eras abaixo.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm uppercase tracking-[0.2em] text-[#8c8378]">A carregar coleções...</div>
        ) : (
          <div className="space-y-20 md:space-y-28">
            {collections.map((col: any, idx: number) => (
              <article key={col.id || col.slug} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                <div className={`lg:col-span-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="bg-[#ede8df] rounded-2xl overflow-hidden aspect-[4/3] relative shadow-sm border border-[#e4dcd1]">
                    {col.imageUrl ? (
                      <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-[#8c8378]">
                        Eras Label — {col.year}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`lg:col-span-6 flex flex-col justify-center ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b22222] mb-3">
                    {col.year} {col.active === 1 && idx === 0 ? "· Em curso" : ""}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6">
                    {col.name}
                  </h2>
                  <p className="text-base text-[#554f46] leading-relaxed mb-8">
                    {col.editorialText || col.description || "A era em curso: silhuetas autorais e acabamento artesanal."}
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <Link href={col.ctaUrl || `/collection/${col.slug}`} onClick={playClickSound}>
                      <button className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.250em] text-[#23221e] border-b border-[#23221e] pb-1 hover:text-[#b22222] hover:border-[#b22222] transition-colors">
                        {col.ctaLabel || "Comprar a era"} <span aria-hidden="true">→</span>
                      </button>
                    </Link>
                    <Link href={`/collection/${col.slug}`} onClick={playClickSound}>
                      <button className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.250em] text-[#b22222] bg-[#f0e6dc] px-4 py-2 rounded-lg hover:bg-[#e6d8cc] transition-colors">
                        Ver fotos da coleção ↗
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <OfficialFooter onInteraction={playClickSound} />
    </div>
  );
}
