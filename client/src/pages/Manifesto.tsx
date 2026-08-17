import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import { trpc } from "@/lib/trpc";
import { parseCmsContent } from "@shared/cms";

export default function ManifestoPage() {
  const { data: cms } = trpc.catalog.getCmsPage.useQuery({ slug: "manifesto" });
  const structured = parseCmsContent(cms?.content, "manifesto");
  const storyBlocks = structured.storyBlocks ?? [];

  return (
    <div className="public-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
        {cms?.bannerUrl && (
          <div className="public-hero-image mb-12 w-full h-[280px] md:h-[440px] rounded-2xl overflow-hidden border border-[#dfd7cc] shadow-[0_24px_70px_rgba(35,34,30,0.12)]">
            <img src={cms.bannerUrl} alt={cms.title || "Manifesto Eras"} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="public-page-heading max-w-3xl mb-16">
          <span className="text-xs uppercase tracking-[0.28em] text-[#8c8378] block mb-3">{cms?.subtitle || "02 / FILOSOFIA"}</span>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-[0.9]">{cms?.title || "Manifesto Completo"}</h1>
        </div>

        {storyBlocks.length > 0 ? (
          <div className="space-y-20">
            {storyBlocks.map((block, index) => (
              <article key={block.id} className={`public-story-block grid md:grid-cols-2 gap-10 md:gap-16 items-center ${block.imagePosition === "left" ? "" : "md:[&>div:first-child]:order-2"}`}>
                <div className="space-y-5">
                  <span className="text-xs uppercase tracking-[0.24em] text-[#b22222]">{block.eyebrow || `Capítulo 0${index + 1}`}</span>
                  <h2 className="text-3xl md:text-5xl font-black uppercase leading-[0.95]">{block.title}</h2>
                  <p className="text-lg text-[#554f46] leading-relaxed whitespace-pre-wrap">{block.text}</p>
                </div>
                {block.imageUrl ? (
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#e5ded4] border border-[#dfd7cc]">
                    <img src={block.imageUrl} alt={block.imageAlt || block.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/5] rounded-2xl bg-[#ebe4da] border border-[#dfd7cc] flex items-center justify-center">
                    <span className="font-serif italic text-2xl text-[#8c8378]">Imagem a inserir</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl space-y-6 text-[#554f46] text-lg leading-relaxed whitespace-pre-wrap">
            {structured.body ? structured.body : <>
              <p className="font-serif text-2xl text-[#23221e] italic">“Não criamos apenas roupas. Criamos artefactos de tempo para vestir a alma de quem recusa o esquecimento.”</p>
              <p>A Eras Label nasce da convicção de que o vestuário é a forma mais íntima de arquivo histórico que possuímos. Cada época traz consigo texturas, dores, vitórias e visões estéticas que moldam quem somos.</p>
              <p>Reviver ou reinventar eras é uma ferramenta de resgate. Pegamos em elementos esquecidos do passado analógico, da contracultura e das raízes regionais para fundi-los com o design utilitário do streetwear contemporâneo.</p>
            </>}
          </div>
        )}
      </main>
      <OfficialFooter />
    </div>
  );
}
