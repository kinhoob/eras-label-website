import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfficialFooter from "@/components/OfficialFooter";
import NotFound from "@/pages/NotFound";
import { trpc } from "@/lib/trpc";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductPage() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug ?? "";
  const { data: product, isLoading, isError } = trpc.catalog.getBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (!product) return;
    const title = `${product.name} | Eras Label - Loja Oficial`;
    document.title = title;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute("href", `${window.location.origin}/produto/${product.slug}`);
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

  return (
    <main className="product-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e]">
      <header className="product-page-header border-b border-[#23221e]/10">
        <div className="container flex items-center justify-between py-5">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.24em]">ERAS<span className="text-[#b22222]">.</span></Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]"><ArrowLeft size={15} /> Voltar à loja</Link>
        </div>
      </header>

      <div className="container py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-16">
          <section className="product-page-gallery" aria-label={`Imagens de ${product.name}`}>
            <div className="aspect-[4/5] overflow-hidden bg-[#ede8df]">
              {activeImage ? <img src={activeImage} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em]">Imagem em breve</div>}
            </div>
            {images.length > 1 && <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((image, index) => <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`aspect-square overflow-hidden border ${selectedImage === index ? "border-[#b22222]" : "border-transparent"}`} aria-label={`Ver imagem ${index + 1}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
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
            <p className="mt-1 text-xs text-[#5a554d]">Link público: /produto/{product.slug}</p>
          </section>
        </div>
      </div>
      <OfficialFooter />
    </main>
  );
}
