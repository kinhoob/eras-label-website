import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { PageTransitionHandler } from "@/components/PageTransition";
import OfficialFooter from "@/components/OfficialFooter";
import NotFound from "@/pages/NotFound";
import { trpc } from "@/lib/trpc";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { toast } from "sonner";
import type { PublicCartLine } from "@/components/PublicCartDrawer";
import { getProductDescription, hasSavedProductDescription } from "@/lib/product-content";

const productImageFallback =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getProductHref(product: { id: number; slug?: string | null }) {
  return `/produto/${product.slug || product.id}`;
}

function getProductImage(product: { images?: unknown }, fallback = productImageFallback) {
  const images = Array.isArray(product.images)
    ? product.images.filter((image): image is string => typeof image === "string" && image.length > 0)
    : [];
  return images[0] || fallback;
}

export default function ProductPage() {
  const [, params] = useRoute("/produto/:slug");
  const slug = params?.slug ?? "";
  const numericId = /^\d+$/.test(slug) ? Number(slug) : null;
  const slugQuery = trpc.catalog.getBySlug.useQuery(
    { slug: slug || "_" },
    { enabled: Boolean(slug) && numericId === null },
  );
  const idQuery = trpc.catalog.getById.useQuery(
    { id: numericId ?? 1 },
    { enabled: numericId !== null },
  );
  const relatedQuery = trpc.catalog.list.useQuery(undefined, {
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
  const product = numericId !== null ? idQuery.data : slugQuery.data;
  const isLoading = numericId !== null ? idQuery.isLoading : slugQuery.isLoading;
  const isError = numericId !== null ? idQuery.isError : slugQuery.isError;
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!product) return;
    const title = `${product.name} | Eras Label - Loja Oficial`;
    document.title = title;
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute("href", `${window.location.origin}${getProductHref(product)}`);
  }, [product]);

  const images = useMemo(
    () =>
      Array.isArray(product?.images)
        ? product.images.filter(
            (image): image is string => typeof image === "string" && image.length > 0,
          )
        : [],
    [product?.images],
  );
  const variations = useMemo(
    () =>
      Array.isArray(product?.variations)
        ? product.variations.filter((variation: any) => Number(variation.stock ?? 0) > 0)
        : [],
    [product?.variations],
  );
  const availableSizes = useMemo(
    () => Array.from(new Set(variations.map((variation: any) => String(variation.size)))),
    [variations],
  );
  const selectedVariation = variations.find(
    (variation: any) => String(variation.size) === selectedSize,
  );
  const selectedStock = Number(selectedVariation?.stock ?? 0);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedImage(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  const relatedProducts = useMemo(() => {
    if (!product || !relatedQuery.data) return [];
    const candidates = relatedQuery.data.filter((candidate) => candidate.id !== product.id);
    const sameCollection = candidates.filter(
      (candidate) => Boolean(product.collection) && candidate.collection === product.collection,
    );
    const sameCategory = candidates.filter(
      (candidate) =>
        candidate.category === product.category ||
        candidate.subcategory === product.category ||
        candidate.categoryNames?.includes(product.category),
    );
    const ordered = [...sameCollection, ...sameCategory];
    return ordered.filter(
      (candidate, index) => ordered.findIndex((item) => item.id === candidate.id) === index,
    ).slice(0, 4);
  }, [product, relatedQuery.data]);

  const goToPreviousImage = useCallback(() => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);
  const goToNextImage = useCallback(() => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f6f3ee] flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em]">A carregar produto</p>
      </main>
    );
  }
  if (isError || !product) return <NotFound />;

  const normalPrice = Number(product.price) || 0;
  const promoPrice = product.promotionalPrice !== null && product.promotionalPrice !== undefined && Number(product.promotionalPrice) > 0 ? Number(product.promotionalPrice) : null;
  const effectivePrice = promoPrice !== null ? promoPrice : normalPrice;
  const pixPrice = Number(product.pixPrice ?? effectivePrice) || effectivePrice;
  const pixSavings = Math.max(0, effectivePrice - pixPrice);
  const installments = effectivePrice / 2;

  const handleAddToCart = () => {
    if (!product) return;
    const isSoldOut = product.status === "soldout" || (Array.isArray(product.variations) && product.variations.every((v: any) => Number(v.stock ?? 0) === 0)) || (selectedVariation && Number(selectedVariation.stock ?? 0) === 0);
    if (isSoldOut) {
      toast.error("Produto esgotado", { description: "Este item não possui unidades disponíveis no momento." });
      return;
    }
    if (variations.length > 0 && !selectedVariation) {
      toast.error("Escolha um tamanho disponível para continuar.");
      return;
    }

    const chosenSize = selectedVariation ? String(selectedVariation.size) : selectedSize || "U";
    const currentCart = loadCart<PublicCartLine>();
    const existingIndex = currentCart.findIndex(
      (line) => line.id === product.id && line.size === chosenSize,
    );
    const nextCart: PublicCartLine[] =
      existingIndex >= 0
        ? currentCart.map((line, index) =>
            index === existingIndex ? { ...line, quantity: line.quantity + 1 } : line,
          )
        : [
            ...currentCart,
            {
              id: product.id,
              name: product.name,
              size: chosenSize,
              quantity: 1,
              price: effectivePrice,
              image: images[0] || productImageFallback,
              alt: product.name,
            },
          ];

    setIsAdding(true);
    saveCart(nextCart);
    window.dispatchEvent(new Event("eras-cart-updated"));
    window.dispatchEvent(new Event("eras-open-cart"));
    toast.success("Peça adicionada à sacola", {
      description: `${product.name} · tamanho ${chosenSize}`,
    });
    window.setTimeout(() => setIsAdding(false), 850);
  };

  return (
    <div className="public-page-shell product-page-shell min-h-screen bg-[#f6f3ee] text-[#23221e] flex flex-col font-sans">
      <PageTransitionHandler />
      <main className="public-page-content flex-1">
        <div className="product-detail-container container">
          <div className="product-detail-layout">
            <section className="product-page-gallery" aria-label={`Imagens de ${product.name}`}>
              <div className="product-gallery-layout">
                {images.length > 1 && (
                  <div className="product-gallery-thumbnails" role="tablist" aria-label="Selecionar imagem do produto">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        role="tab"
                        aria-selected={selectedImage === index}
                        aria-label={`Ver imagem ${index + 1}`}
                        className={`product-gallery-thumbnail ${selectedImage === index ? "is-selected" : ""}`}
                        onClick={() => {
                          carouselApi?.scrollTo(index);
                          setSelectedImage(index);
                        }}
                      >
                        <img
                          src={image}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = productImageFallback;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <Carousel
                  className="product-main-carousel"
                  opts={{ loop: images.length > 1, duration: 28 }}
                  setApi={setCarouselApi}
                  onKeyDown={handleGalleryKeyDown}
                >
                  <CarouselContent className="product-carousel-content">
                    {(images.length > 0 ? images : [productImageFallback]).map((image, index) => (
                      <CarouselItem key={`${image}-${index}`} className="product-carousel-slide">
                        <div className="product-gallery-stage">
                          <img
                            src={image}
                            alt={`${product.name} — imagem ${index + 1} de ${Math.max(images.length, 1)}`}
                            className="product-gallery-image"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = productImageFallback;
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="product-gallery-control product-gallery-control-prev"
                        onClick={goToPreviousImage}
                        aria-label="Ver imagem anterior"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        className="product-gallery-control product-gallery-control-next"
                        onClick={goToNextImage}
                        aria-label="Ver próxima imagem"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <span className="product-gallery-counter" aria-live="polite">
                        {String(selectedImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                      </span>
                    </>
                  )}
                </Carousel>
              </div>
            </section>

            <section className="product-purchase-panel" aria-labelledby="product-title">
              <nav className="product-breadcrumb" aria-label="Percurso da página">
                <Link href="/">Início</Link>
                <span aria-hidden="true">·</span>
                <Link href="/collection/paradox">Coleções</Link>
                <span aria-hidden="true">·</span>
                <span>{product.name}</span>
              </nav>
              <p className="product-collection-label">{product.collection || "ERAS LABEL"}</p>
              <h1 id="product-title" className="product-title font-display">
                {product.name}
              </h1>
              {promoPrice !== null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#b22222', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.5rem', letterSpacing: '0.08em' }}>
                  PROMOÇÃO · {Math.round((1 - promoPrice / normalPrice) * 100)}% OFF
                </div>
              )}
              <div className="product-price-block">
                <div>
                  {promoPrice !== null ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <p className="product-price" style={{ color: '#b22222', margin: 0 }}>{formatPrice(promoPrice)}</p>
                      <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#888', fontWeight: 500 }}>{formatPrice(normalPrice)}</span>
                    </div>
                  ) : (
                    <p className="product-price">{formatPrice(normalPrice)}</p>
                  )}
                  <p className="product-pix-price">{formatPrice(pixPrice)} com Pix</p>
                </div>
                <p className="product-installments">2× de {formatPrice(installments)} sem juros</p>
              </div>
              {pixSavings > 0 && (
                <p className="product-pix-saving">Poupe {formatPrice(pixSavings)} pagando com Pix</p>
              )}

              <div className="product-shipping-highlight">
                <Truck size={17} aria-hidden="true" />
                <span>Frete grátis a partir de R$ 350,00</span>
              </div>

              {variations.length > 0 && (
                <div className="product-options-card" aria-label="Opções do produto">
                    <div className="product-option-group">
                      <div className="product-option-heading">
                        <span>Tamanho</span>
                        <strong>{selectedSize ? `Selecionado: ${selectedSize}` : "Escolha uma opção"}</strong>
                      </div>
                      <div className="product-option-list">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            aria-pressed={selectedSize === size}
                            className={`product-option-button product-option-button--size ${selectedSize === size ? "is-selected" : ""}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className={`product-option-hint ${selectedVariation ? "is-ready" : ""}`}>
                        {selectedVariation
                          ? `${selectedStock} ${selectedStock === 1 ? "unidade disponível" : "unidades disponíveis"}`
                          : "Selecione o tamanho para continuar"}
                      </p>
                    </div>
                </div>
              )}

              {(() => {
                const isSoldOut = product.status === "soldout" || (Array.isArray(product.variations) && product.variations.every((v: any) => Number(v.stock ?? 0) === 0)) || (selectedVariation && Number(selectedVariation.stock ?? 0) === 0);
                return (
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || isSoldOut}
                    aria-live="polite"
                    className={`product-add-to-cart ${isAdding ? "is-added" : ""} ${isSoldOut ? "opacity-60 cursor-not-allowed bg-neutral-400 hover:bg-neutral-400" : ""}`}
                  >
                    {isSoldOut ? "Esgotado" : (isAdding ? <Check size={17} /> : <ShoppingBag size={16} />)}
                    {isSoldOut ? "Produto Esgotado" : (isAdding ? "Adicionado à sacola" : "Comprar")}
                  </Button>
                );
              })()}

              <div className="product-service-points">
                <div>
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>Compra segura e produto oficial Eras Label</span>
                </div>
                <div>
                  <Truck size={16} aria-hidden="true" />
                  <span>Envio acompanhado para todo o Brasil</span>
                </div>
              </div>

              <div className="product-info-accordions">
                <details>
                  <summary>
                    <span><CreditCard size={15} aria-hidden="true" /> Meios de pagamento</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <p>Pix com desconto ou cartão de crédito em até 2× sem juros pelo Mercado Pago.</p>
                </details>
                <details>
                  <summary>
                    <span><Truck size={15} aria-hidden="true" /> Meios de envio</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <p>Escolha o serviço disponível para o seu CEP no carrinho. Enviamos por PAC, SEDEX e Jadlog.</p>
                </details>
                <details open={hasSavedProductDescription(product.description)}>
                  <summary>
                    <span><Ruler size={15} aria-hidden="true" /> Detalhes da peça</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <p className="whitespace-pre-line">{getProductDescription(product.description)}</p>
                </details>
              </div>
            </section>
          </div>

          {relatedProducts.length > 0 && (
            <section className="related-products-section" aria-labelledby="related-products-title">
              <div className="related-products-heading">
                <div>
                  <p className="product-collection-label">A mesma era</p>
                  <h2 id="related-products-title" className="font-display">Talvez também goste</h2>
                </div>
                <Link href="/catalog">
                  Ver coleção <ChevronRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={getProductHref(relatedProduct)}
                    className="related-product-card"
                  >
                    <div className="related-product-image-wrap">
                      <img
                        src={getProductImage(relatedProduct)}
                        alt={relatedProduct.name}
                        className="related-product-image"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = productImageFallback;
                        }}
                      />
                    </div>
                    <div className="related-product-meta">
                      <span>{relatedProduct.category || relatedProduct.collection || "ERAS LABEL"}</span>
                      <h3>{relatedProduct.name}</h3>
                      <strong>{formatPrice(Number(relatedProduct.price) || 0)}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <OfficialFooter />
    </div>
  );
}
