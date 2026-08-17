import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import NotFound from "@/pages/NotFound";
import { trpc } from "@/lib/trpc";

const productImageFallback = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductPage() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug ?? "";
  const numericId = /^\d+$/.test(slug) ? Number(slug) : null;
  const slugQuery = trpc.catalog.getBySlug.useQuery({ slug: slug || "_" }, { enabled: Boolean(slug) && numericId === null });
  const idQuery = trpc.catalog.getById.useQuery({ id: numericId ?? 1 }, { enabled: numericId !== null });
  const product = numericId !== null ? idQuery.data : slugQuery.data;
  const isLoading = numericId !== null ? idQuery.isLoading : slugQuery.isLoading;
  const isError = numericId !== null ? idQuery.isError : slugQuery.isError;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!product) return;
    const title = `${product.name} | Eras Label - Loja Oficial`;
    document.title = title;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute("href", `${window.location.origin}/produto/${product.slug || product.id}`);
  }, [product]);

  const images = useMemo(() => Array.isArray(product?.images) ? product.images.filter((image): image is string => typeof image === "string" && image.length > 0) : [], [product?.images]);
  const variations = useMemo(() => Array.isArray(product?.variations) ? product.variations.filter((variation: any) => Number(variation.stock ?? 0) > 0) : [], [product?.variations]);

  if (isLoading) {
    return <main className="min-h-screen bg-[#f6f3ee] flex items-center justify-center"><p className="text-xs font-bold uppercase tracking-[0.24em]">A carregar produto</p></main>;
  }
  if (isError || !product) return <NotFound />;

  const price = Number(product.price) || 0;
  const pixPrice = Number(product.pixPrice ?? price) || price;
  const activeImage = images[selectedImage] ?? images[0];
  const goToPreviousImage = () => setSelectedImage((index) => images.length ? (index - 1 + images.length) % images.length : 0);
  const goToNextImage = () => setSelectedImage((index) => images.length ? (index + 1) % images.length : 0);
  const handleGalleryKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousImage();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextImage();
    }
  };
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined || images.length < 2) return;
    const delta = endX - startX;
    if (Math.abs(delta) < 42) return;
    if (delta > 0) goToPreviousImage();
    else goToNextImage();
  };

  return (
    <div className="public-page-shell product-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1">
      <div className="container pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-16">
          <section className="product-page-gallery" aria-label={`Imagens de ${product.name}`}>
            <div
              className="product-gallery-stage aspect-[4/5] overflow-hidden bg-[#ede8df]"
              tabIndex={images.length > 1 ? 0 : -1}
              role={images.length > 1 ? "region" : undefined}
              aria-label={images.length > 1 ? `Carrossel com ${images.length} imagens` : undefined}
              onKeyDown={handleGalleryKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {activeImage ? <img src={activeImage} alt={`${product.name} — imagem ${selectedImage + 1} de ${images.length}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImageFallback; }} /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em]">Imagem em breve</div>}
              {images.length > 1 && <>
                <button type="button" className="product-gallery-control product-gallery-control-prev" onClick={goToPreviousImage} aria-label="Ver imagem anterior"><ChevronLeft size={22} /></button>
                <button type="button" className="product-gallery-control product-gallery-control-next" onClick={goToNextImage} aria-label="Ver próxima imagem"><ChevronRight size={22} /></button>
                <span className="product-gallery-counter" aria-live="polite">{String(selectedImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
              </>}
            </div>
            {images.length > 1 && <div className="product-gallery-thumbnails" role="tablist" aria-label="Selecionar imagem do produto">
              {images.map((image, index) => <button key={`${image}-${index}`} type="button" role="tab" aria-selected={selectedImage === index} onClick={() => setSelectedImage(index)} className={`aspect-square overflow-hidden border ${selectedImage === index ? "border-[#b22222]" : "border-transparent"}`} aria-label={`Ver imagem ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = productImageFallback; }} /></button>)}
            </div>}
          </section>

          <section className="flex flex-col justify-center">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#b22222]">{product.collection}</p>
            <h1 className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">{product.name}</h1>
            <p className="mt-5 text-2xl font-semibold">{formatPrice(price)}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#b22222]">{formatPrice(pixPrice)} no Pix</p>
            {product.description && <p className="mt-8 max-w-xl whitespace-pre-line text-sm leading-7 text-[#5a554d]">{product.description}</p>}

            {variations.length > 0 && <div className="mt-8">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.18em]">Tamanho</span><span className="text-xs text-[#5a554d]">Selecione uma opção</span></div>
              <div className="flex flex-wrap gap-2">
                {variations.map((variation: any) => <button key={variation.size} type="button" onClick={() => setSelectedSize(String(variation.size))} className={`min-w-12 border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${selectedSize === String(variation.size) ? "border-[#b22222] bg-[#b22222] text-white" : "border-[#23221e]/20 bg-transparent hover:border-[#b22222]"}`}>{variation.size}</button>)}
              </div>
            </div>}

            <Button asChild className="mt-8 h-12 rounded-none bg-[#b22222] text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#8e1b1b]">
              <Link href="/#shop"><ShoppingBag size={16} /> Ver opções de compra</Link>
            </Button>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#5a554d]"><Check size={14} className="text-[#b22222]" /> Produto oficial Eras Label</p>
            <p className="mt-1 text-xs text-[#5a554d]">Link público: /produto/{product.slug || product.id}</p>
          </section>
        </div>
      </div>
      </main>
      <OfficialFooter />
    </div>
  );
}
