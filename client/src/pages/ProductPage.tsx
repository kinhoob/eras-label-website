import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import NotFound from "@/pages/NotFound";
import { trpc } from "@/lib/trpc";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { toast } from "sonner";
import type { PublicCartLine } from "@/components/PublicCartDrawer";

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
  const [selectedColor, setSelectedColor] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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
  // Normaliza a cor legada para que produtos antigos, sem cor cadastrada, continuem compráveis.
  const normalizeColor = (variation: any) => String(variation?.color ?? "Preto").trim() || "Preto";
  const availableColors = useMemo(() => {
    const uniqueColors = new Set<string>();
    variations.forEach((variation: any) => uniqueColors.add(normalizeColor(variation)));
    return Array.from(uniqueColors);
  }, [variations]);
  const selectedColorVariations = useMemo(
    () => variations.filter((variation: any) => normalizeColor(variation) === selectedColor),
    [variations, selectedColor],
  );
  const availableSizes = useMemo(
    () => Array.from(new Set(selectedColorVariations.map((variation: any) => String(variation.size)))),
    [selectedColorVariations],
  );
  const selectedVariation = selectedColorVariations.find((variation: any) => String(variation.size) === selectedSize);
  const selectedStock = Number(selectedVariation?.stock ?? 0);

  useEffect(() => {
    if (availableColors.length > 0 && !availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0]);
      return;
    }
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

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

  const handleAddToCart = () => {
    if (isAdding) return;
    if (variations.length > 0 && !selectedVariation) {
      toast.error("Escolha uma cor e um tamanho disponíveis para continuar.");
      return;
    }

    const chosenSize = selectedVariation ? String(selectedVariation.size) : (selectedSize || "U");
    const chosenColor = selectedVariation ? normalizeColor(selectedVariation) : (selectedColor || "Preto");
    const currentCart = loadCart<PublicCartLine>();
    const existingIndex = currentCart.findIndex((line) => line.id === product.id && line.size === chosenSize && (line.color ?? "Preto") === chosenColor);
    const nextCart: PublicCartLine[] = existingIndex >= 0
      ? currentCart.map((line, idx) => idx === existingIndex ? { ...line, quantity: line.quantity + 1 } : line)
      : [...currentCart, {
        id: product.id,
        name: product.name,
        size: chosenSize,
        color: chosenColor,
        quantity: 1,
        price: Number(product.price) || 0,
        image: images[0] || productImageFallback,
        alt: product.name,
      }];

    setIsAdding(true);
    saveCart(nextCart);
    window.dispatchEvent(new Event("eras-cart-updated"));
    window.dispatchEvent(new Event("eras-open-cart"));
    toast.success("Peça adicionada à sacola", {
      description: `${product.name} · ${chosenSize}${chosenColor ? ` · ${chosenColor}` : ""}`,
    });
    window.setTimeout(() => setIsAdding(false), 850);
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

          <section className="product-purchase-panel flex flex-col justify-center">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[#b22222]">{product.collection || "ERAS LABEL"}</p>
            <h1 className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">{product.name}</h1>
            <div className="product-price-row">
              <p className="mt-5 text-2xl font-semibold">{formatPrice(price)}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#b22222]">{formatPrice(pixPrice)} no Pix</p>
            </div>
            {product.description && <p className="mt-8 max-w-xl whitespace-pre-line text-sm leading-7 text-[#5a554d]">{product.description}</p>}

            {(availableColors.length > 0 || variations.length > 0) && (
              <div className="product-options-card" aria-label="Opções do produto">
                {availableColors.length > 0 ? (
                  <div className="product-option-group">
                    <div className="product-option-heading"><span>Cor</span><strong>{selectedColor || "Escolha uma opção"}</strong></div>
                    <div className="product-option-list">
                      {availableColors.map((color) => <button key={color} type="button" onClick={() => { setSelectedColor(color); setSelectedSize(""); }} aria-pressed={selectedColor === color} className={`product-option-button ${selectedColor === color ? "is-selected" : ""}`}>{color}</button>)}
                    </div>
                  </div>
                ) : null}

                {variations.length > 0 ? (
                  <div className="product-option-group">
                    <div className="product-option-heading"><span>Tamanho</span><strong>{selectedSize ? `Selecionado: ${selectedSize}` : "Escolha uma opção"}</strong></div>
                    <div className="product-option-list">
                      {availableSizes.map((size) => <button key={`${selectedColor}-${size}`} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`product-option-button product-option-button--size ${selectedSize === size ? "is-selected" : ""}`}>{size}</button>)}
                    </div>
                    <p className={`product-option-hint ${selectedVariation ? "is-ready" : ""}`}>{selectedVariation ? `${selectedStock} ${selectedStock === 1 ? "unidade disponível" : "unidades disponíveis"}` : "Selecione o tamanho para continuar"}</p>
                  </div>
                ) : null}
              </div>
            )}

            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-live="polite"
              className={`product-add-to-cart mt-8 h-14 w-full rounded-none text-xs font-bold uppercase tracking-[0.18em] text-white ${isAdding ? "is-added bg-[#23221e]" : "bg-[#b22222] hover:bg-[#8e1b1b]"}`}
            >
              {isAdding ? <><Check size={17} /> Adicionado à sacola</> : <><ShoppingBag size={16} /> Adicionar à sacola</>}
            </Button>
            <p className="product-purchase-note mt-4 flex items-center gap-2 text-xs text-[#5a554d]"><Check size={14} className="text-[#b22222]" /> Compra segura · Produto oficial Eras Label</p>
            <p className="mt-1 text-xs text-[#5a554d]">Link público: /produto/{product.slug || product.id}</p>
          </section>
        </div>
      </div>
      </main>
      <OfficialFooter />
    </div>
  );
}
