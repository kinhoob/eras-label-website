import { useEffect, useState, useMemo, useReducer, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  CircleUserRound,
  Clock3,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Loader2,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getCartItemCount } from "@/lib/cart";
import { getCheckoutFeedback } from "@/lib/checkout-feedback";
import { ERAS_COLLECTION_PATHS, ERAS_VIP_WHATSAPP_URL } from "../../../shared/const";
import { checkoutFlowReducer, initialCheckoutFlowState } from "@/lib/checkout-flow";
import { createOrderSummary, type OrderSummary } from "@/lib/order-summary";

type Category = "Todos" | "Camisetas" | "Bonés";
type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "Todos">;
  collection: string;
  price: number;
  pixPrice: number;
  image: string;
  fallbackImage?: string;
  alt: string;
  sizes: string[];
  stock: number;
  detail: string;
};

type CartLine = Product & { size: string; quantity: number };
type HomeBanner = { id: string; eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string };
type HomeHighlight = { id: string; productId: number; label: string };
type VipBanner = { eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string };

const fallbackBanners: HomeBanner[] = [
  {
    id: "drafts",
    eyebrow: "NOVA ERA · 2026",
    title: "DRAFTS JÁ DISPONÍVEL",
    subtitle: "Uma nova coleção em movimento.",
    imageUrl: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2000&q=90",
    href: "#shop",
    cta: "EXPLORAR AGORA",
  },
  {
    id: "paradox",
    eyebrow: "PARADOX COLLECTION",
    title: "REVIVER. REINVENTAR.",
    subtitle: "Peças para atravessar o tempo presente.",
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90",
    href: "#shop",
    cta: "VER COLEÇÃO",
  },
];
const fallbackVipBanner: VipBanner = {
  eyebrow: "ACESSO ANTECIPADO",
  title: "ENTRE PARA O GRUPO VIP",
  subtitle: "Lançamentos, bastidores e as próximas eras primeiro.",
  imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90",
  href: ERAS_VIP_WHATSAPP_URL,
  cta: "ENTRAR NO WHATSAPP",
};
const fallbackHighlights: HomeHighlight[] = [
  { id: "highlight-1", productId: 1, label: "PEÇA-CHAVE" },
  { id: "highlight-2", productId: 2, label: "MAIS VISTO" },
  { id: "highlight-3", productId: 5, label: "ARQUIVO" },
];

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "T-Shirt Travessia",
    category: "Camisetas",
    collection: "PARADOX COLLECTION",
    price: 154.9,
    pixPrice: 147.16,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    alt: "T-shirt branca numa composição editorial",
    sizes: ["P", "M", "G", "GG"],
    stock: 18,
    detail: "Uma peça sobre o instante em que duas versões da mesma pessoa ocupam o mesmo lugar.",
  },
  {
    id: 2,
    name: "T-Shirt Dissociação",
    category: "Camisetas",
    collection: "PARADOX COLLECTION",
    price: 154.9,
    pixPrice: 147.16,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85",
    alt: "Modelo em t-shirt escura",
    sizes: ["P", "M", "G", "GG"],
    stock: 12,
    detail: "O corpo muda de ritmo. A memória, não.",
  },
  {
    id: 3,
    name: "T-Shirt Ressonador",
    category: "Camisetas",
    collection: "PARADOX COLLECTION",
    price: 152.9,
    pixPrice: 145.26,
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85",
    alt: "T-shirt de algodão dobrada",
    sizes: ["P", "M", "G"],
    stock: 8,
    detail: "Sintonizada para quem escuta o que ainda não chegou.",
  },
  {
    id: 4,
    name: "T-Shirt Vórtex Off",
    category: "Camisetas",
    collection: "PARADOX COLLECTION",
    price: 165.5,
    pixPrice: 157.23,
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    alt: "T-shirt em tom off-white",
    sizes: ["P", "M", "G", "GG"],
    stock: 6,
    detail: "Uma espiral de referências, impressa em matéria.",
  },
  {
    id: 5,
    name: "Boné Lost Between Eras Off",
    category: "Bonés",
    collection: "LOST BETWEEN ERAS",
    price: 117.5,
    pixPrice: 111.63,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=85",
    alt: "Boné bege com estética de arquivo",
    sizes: ["Único"],
    stock: 4,
    detail: "O manifesto da marca bordado em tom sobre tom.",
  },
  {
    id: 6,
    name: "Boné Lost Between Eras Marinho",
    category: "Bonés",
    collection: "LOST BETWEEN ERAS",
    price: 117.5,
    pixPrice: 111.63,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=85",
    alt: "Boné marinho em fundo neutro",
    sizes: ["Único"],
    stock: 0,
    detail: "Edição de arquivo. Atualmente esgotada.",
  },
];

const heroImage = "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2000&q=90";

function mapCatalogProduct(row: { id: number; name: string; collection: string; category: string; price: unknown; pixPrice: unknown; description: string | null; images: unknown; status: string }): Product {
  const images = Array.isArray(row.images) ? row.images.filter((image): image is string => typeof image === "string") : [];
  const fallbackImage = fallbackProducts.find((product) => product.id === row.id)?.image || editorialImage;
  const category: Exclude<Category, "Todos"> = row.category === "Bonés" ? "Bonés" : "Camisetas";
  return {
    id: row.id,
    name: row.name,
    category,
    collection: row.collection,
    price: Number(row.price),
    pixPrice: Number(row.pixPrice),
    image: images[0] || fallbackImage,
    fallbackImage,
    alt: row.name,
    sizes: category === "Bonés" ? ["Único"] : ["P", "M", "G", "GG"],
    stock: row.status === "soldout" ? 0 : 1,
    detail: row.description || "Peça Eras Label com acabamento premium.",
  };
}
const editorialImage = "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=85";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.4.08-2.79-.3-3.99-1.03-1.99-1.2-3.44-3.22-3.74-5.54-.06-.5-.09-1-.08-1.5.03-1.7.7-3.4 1.83-4.68 1.03-1.17 2.46-1.96 3.95-2.28.38-.08.76-.13 1.14-.13.15-.01.3-.01.45-.01.01 1.27-.02 2.54.01 3.81-.84-.27-1.78-.19-2.58.14-.95.4-1.76 1.16-2.22 2.08-.37.73-.53 1.57-.43 2.38.18 1.24.93 2.4 1.98 3.08.67.44 1.44.64 2.21.63.51-.01 1.02-.12 1.5-.36.92-.46 1.62-1.3 1.85-2.3.08-.36.12-.72.11-1.08V.02z" />
    </svg>
  );
}

function playClick(enabled: boolean) {
  if (!enabled) return;
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.04);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, audioContext.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.09);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch {
    // Audio enhancement fallback
  }
}

export default function Home() {
  const [category, setCategory] = useState<Category>("Todos");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerStopTimeoutRef = useRef<number | null>(null);
  const previousScrollYRef = useRef(0);
  const [soundsOn, setSoundsOn] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedOrderSummary, setConfirmedOrderSummary] = useState<OrderSummary | null>(null);
  const [checkoutFlow, setCheckoutFlow] = useReducer(checkoutFlowReducer, initialCheckoutFlowState);
  const { status: checkoutStatus, errorMessage: checkoutError, orderNumber: confirmedOrderNumber } = checkoutFlow;
  const [couponLoading, setCouponLoading] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<CartLine | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"pix" | "credit_card">("pix");
  const [cepInput, setCepInput] = useState("");
  const [shippingCep, setShippingCep] = useState("");
  const { data: commercialConfig } = trpc.catalog.getConfig.useQuery();
  const { data: homeContent } = trpc.catalog.getHomeContent.useQuery();
  const { data: catalogRows = [] } = trpc.catalog.list.useQuery();
  const products = useMemo<Product[]>(() => catalogRows.length ? catalogRows.map(mapCatalogProduct) : fallbackProducts, [catalogRows]);
  const banners = (homeContent?.banners?.length ? homeContent.banners : fallbackBanners) as HomeBanner[];
  const highlights = useMemo<HomeHighlight[]>(() => {
    const configured = (homeContent?.highlights?.length ? homeContent.highlights : fallbackHighlights) as HomeHighlight[];
    const available = configured.filter((highlight) => products.some((product) => product.id === highlight.productId));
    const usedIds = new Set(available.map((highlight) => highlight.productId));
    const supplement = products.filter((product) => !usedIds.has(product.id)).slice(0, Math.max(0, 3 - available.length)).map((product, index) => ({
      id: `fallback-highlight-${product.id}`,
      productId: product.id,
      label: index === 0 && available.length === 0 ? "PEÇA-CHAVE" : "EM DESTAQUE",
    }));
    return [...available, ...supplement].slice(0, 3);
  }, [homeContent?.highlights, products]);
  const vipBanner = (homeContent?.vipBanner ?? fallbackVipBanner) as VipBanner;
  const currentBanner = banners[activeBanner % banners.length] ?? fallbackBanners[0];
  const pixDiscountPercent = commercialConfig?.pixDiscountPercent ?? 5;
  const freeShippingThreshold = commercialConfig?.freeShippingThreshold ?? 350;

  const checkoutMutation = trpc.checkout.create.useMutation();

  const filteredProducts = useMemo(
    () => (category === "Todos" ? products : products.filter((product) => product.category === category)),
    [category, products],
  );
  const cartCount = getCartItemCount(cart);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;

  const { data: shippingData, isLoading: shippingLoading, refetch: refetchShipping } = trpc.catalog.calculateShipping.useQuery(
    { cep: shippingCep, subtotal },
    { enabled: shippingCep.length === 8 }
  );

  const shippingCost = shippingData?.free ? 0 : (shippingData?.cost ?? 0);
  const total = subtotal - discount + shippingCost;
  const checkoutFeedback = getCheckoutFeedback(checkoutStatus, confirmedOrderNumber, checkoutError);

  useEffect(() => {
    if (banners.length < 2) return;
    const interval = window.setInterval(() => setActiveBanner((value) => (value + 1) % banners.length), 5200);
    return () => window.clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const revealAfterScrollStops = () => {
      if (headerStopTimeoutRef.current !== null) window.clearTimeout(headerStopTimeoutRef.current);
      headerStopTimeoutRef.current = window.setTimeout(() => {
        setIsHeaderVisible(true);
        headerStopTimeoutRef.current = null;
      }, 180);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = previousScrollYRef.current;
      const isAtTop = currentScrollY <= 12;
      const isScrollingUp = currentScrollY < previousScrollY - 2;
      const isScrollingDown = currentScrollY > previousScrollY + 2;

      if (isAtTop || isScrollingUp) setIsHeaderVisible(true);
      else if (isScrollingDown) setIsHeaderVisible(false);

      previousScrollYRef.current = currentScrollY;
      setShowBackToTop(currentScrollY > 560);
      revealAfterScrollStops();
    };

    previousScrollYRef.current = window.scrollY;
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (headerStopTimeoutRef.current !== null) window.clearTimeout(headerStopTimeoutRef.current);
    };
  }, []);

  function openProduct(product: Product) {
    playClick(soundsOn);
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] ?? "");
  }

  function addToCart(product: Product, size: string) {
    if (!size) {
      toast.error("Escolha um tamanho antes de continuar.");
      return;
    }
    if (product.stock === 0) {
      toast.error("Este produto está esgotado.");
      return;
    }
    playClick(soundsOn);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { ...product, size, quantity: 1 }];
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
    toast.success("Peça adicionada à sacola.");
  }

  function changeQuantity(productId: number, size: string, delta: number) {
    playClick(soundsOn);
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId && item.size === size ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function applyCoupon() {
    playClick(soundsOn);
    if (!coupon.trim()) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    setTimeout(() => {
      setCouponLoading(false);
      if (coupon.trim().toUpperCase() === "ERAS10") {
        setCouponApplied(true);
        toast.success("Cupom ERAS10 aplicado: 10% de desconto.");
      } else {
        setCouponApplied(false);
        toast.error("Cupom não encontrado ou expirado.");
      }
    }, 600);
  }

  function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setCheckoutFlow({ type: "start" });
    playClick(soundsOn);
    checkoutMutation.mutate({
      customerName: String(form.get("customerName") ?? ""),
      customerEmail: String(form.get("customerEmail") ?? ""),
      customerCpf: String(form.get("cpf") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: {
        cep: String(form.get("cep") ?? ""),
        street: String(form.get("street") ?? ""),
        number: String(form.get("number") ?? ""),
        complement: String(form.get("complement") ?? ""),
        neighborhood: String(form.get("neighborhood") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
      },
      items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity, price: item.price })),
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod: selectedPaymentMethod,
    }, {
      onSuccess: (result) => {
        setLoading(false);
        setConfirmedOrderSummary(createOrderSummary({
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            alt: item.alt,
          })),
          subtotal,
          discount,
          shippingCost,
          total,
          paymentMethod: selectedPaymentMethod,
          estimatedDelivery: shippingData?.deadline,
        }));
        setCheckoutFlow({ type: "success", orderNumber: result.orderNumber });
        setIsCartOpen(false);
        setCart([]);
        playClick(soundsOn);
        toast.success(`Pagamento confirmado para o pedido ${result.orderNumber}.`);
      },
      onError: (error) => {
        setLoading(false);
        setCheckoutFlow({ type: "error", message: error.message || "Não foi possível confirmar o pagamento." });
        toast.error("Não foi possível confirmar o pagamento. Revise os dados e tente novamente.");
      },
    });
  }

  return (
    <div className="eras-site">
      <div className="pix-strip">5% OFF PARA PAGAMENTOS NO PIX · UMA NOVA ERA COMEÇA AQUI</div>
      <header className={`site-header ${isHeaderVisible ? "is-visible" : "is-hidden"}`}>
        <button className="icon-button" aria-label="Abrir menu lateral" onClick={() => { playClick(soundsOn); setIsMenuOpen(true); }}>
          <Menu size={20} />
        </button>
        <Link href="/" className="brand-mark" onClick={() => playClick(soundsOn)}>ERAS<span>.</span></Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#shop" onClick={() => playClick(soundsOn)}>PRODUTOS</a>
          <div
              className={`collections-nav ${collectionsOpen ? "open" : ""}`}
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCollectionsOpen(false);
              }}
            >
            <button
              className="collections-trigger"
              type="button"
              aria-haspopup="menu"
              aria-expanded={collectionsOpen}
              onFocus={() => setCollectionsOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setCollectionsOpen(false);
                  event.currentTarget.blur();
                }
              }}
              onClick={() => { playClick(soundsOn); setCollectionsOpen((value) => !value); }}
            >COLEÇÕES <ArrowDown size={13} /></button>
            {collectionsOpen && <div className="collections-dropdown" role="menu" aria-label="Coleções disponíveis">
              <Link role="menuitem" href={ERAS_COLLECTION_PATHS.paradox} onClick={() => { playClick(soundsOn); setCollectionsOpen(false); }}>PARADOX COLLECTION <span>↗</span></Link>
              <Link role="menuitem" href={ERAS_COLLECTION_PATHS.lostBetweenEras} onClick={() => { playClick(soundsOn); setCollectionsOpen(false); }}>LOST BETWEEN ERAS <span>↗</span></Link>
              <Link role="menuitem" href={ERAS_COLLECTION_PATHS.raizes} onClick={() => { playClick(soundsOn); setCollectionsOpen(false); }}>RAÍZES — RECIFE & LA URSA <span>↗</span></Link>
            </div>}
          </div>
          <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Camisetas"); }}>CAMISETAS</a>
          <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Bonés"); }}>BONÉS</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label={soundsOn ? "Desativar sons" : "Ativar sons"} onClick={() => setSoundsOn((value) => !value)}>
            {soundsOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <Link href="/account" className="icon-button" aria-label="Minha Conta e Pedidos" onClick={() => playClick(soundsOn)}>
            <CircleUserRound size={18} />
          </Link>
          <button className="bag-button" aria-label={`Abrir sacola${cartCount > 0 ? ` com ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : " vazia"}`} onClick={() => { playClick(soundsOn); setIsCartOpen(true); }}>
            SACOLA {cartCount > 0 && <span key={cartCount} className="bag-badge" aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero" aria-label="Destaque da Eras Label">
          <div className="home-hero-media" style={{ backgroundImage: `url(${currentBanner.imageUrl})` }} />
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <span className="home-hero-eyebrow">{currentBanner.eyebrow}</span>
            <h1>{currentBanner.title}</h1>
            <p>{currentBanner.subtitle}</p>
            <a className="home-hero-cta" href={currentBanner.href} onClick={() => playClick(soundsOn)}>{currentBanner.cta} <ArrowRight size={15} /></a>
          </div>
          <div className="home-hero-controls" aria-label="Controles do banner">
            <span>{String((activeBanner % banners.length) + 1).padStart(2, "0")}</span>
            <div className="home-hero-dots">
              {banners.map((banner, index) => <button key={banner.id} className={index === activeBanner % banners.length ? "active" : ""} aria-label={`Ver banner ${index + 1}`} onClick={() => { playClick(soundsOn); setActiveBanner(index); }} />)}
            </div>
            <span>{String(banners.length).padStart(2, "0")}</span>
          </div>
        </section>

        <section className="highlights-section" id="highlights">
          <div className="section-heading">
            <div><span className="section-kicker">01 / CURADORIA</span><h2>DESTAQUES</h2></div>
            <a className="text-link" href="#shop" onClick={() => playClick(soundsOn)}>VER TUDO <ArrowRight size={14} /></a>
          </div>
          <div className="product-grid highlights-grid">
            {highlights.map((highlight) => {
              const product = products.find((item) => item.id === highlight.productId);
              if (!product) return null;
              return (
                <article className="product-card" key={highlight.id}>
                  <button className="product-image-button" onClick={() => openProduct(product)} aria-label={`Ver ${product.name}`}>
                    <img src={product.image} alt={product.alt} onError={(event) => {
                      if (!product.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                      event.currentTarget.dataset.fallbackApplied = "true";
                      event.currentTarget.src = product.fallbackImage;
                    }} />
                    <span className="highlight-label">{highlight.label}</span>
                    {product.stock === 0 && <span className="soldout-tag">ESGOTADO</span>}
                    <span className="product-arrow"><ArrowRight size={15} /></span>
                  </button>
                  <div className="product-meta">
                    <div><p className="product-name">{product.name}</p><p className="product-collection">{product.collection}</p></div>
                    <div className="product-price"><strong>{formatPrice(product.price)}</strong><span>{formatPrice(product.pixPrice)} NO PIX</span></div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div><span className="section-kicker">02 / SHOP</span><h2>PRODUTOS DA ERA</h2></div>
            <div className="filter-tabs" role="tablist" aria-label="Filtrar produtos">
              {(["Todos", "Camisetas", "Bonés"] as Category[]).map((item) => (
                <button key={item} className={category === item ? "active" : ""} onClick={() => { playClick(soundsOn); setCategory(item); }}>{item}</button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button className="product-image-button" onClick={() => openProduct(product)} aria-label={`Ver ${product.name}`}>
                  <img src={product.image} alt={product.alt} onError={(event) => {
                    if (!product.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                    event.currentTarget.dataset.fallbackApplied = "true";
                    event.currentTarget.src = product.fallbackImage;
                  }} />
                  {product.stock === 0 && <span className="soldout-tag">ESGOTADO</span>}
                  <span className="product-arrow"><ArrowRight size={15} /></span>
                </button>
                <div className="product-meta">
                  <div><p className="product-name">{product.name}</p><p className="product-collection">{product.collection}</p></div>
                  <div className="product-price"><strong>{formatPrice(product.price)}</strong><span>{formatPrice(product.pixPrice)} NO PIX</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="vip-home-banner" aria-label="Grupo VIP">
          <a href={vipBanner.href} target={vipBanner.href.startsWith("http") ? "_blank" : undefined} rel={vipBanner.href.startsWith("http") ? "noreferrer" : undefined} onClick={() => playClick(soundsOn)}>
            <div className="vip-home-media" style={{ backgroundImage: `url(${vipBanner.imageUrl})` }} />
            <div className="vip-home-overlay" />
            <div className="vip-home-content"><span>{vipBanner.eyebrow}</span><h2>{vipBanner.title}</h2><p>{vipBanner.subtitle}</p><strong>{vipBanner.cta} <ArrowRight size={15} /></strong></div>
          </a>
        </section>
      </main>

      {showBackToTop && <button className="back-to-top" aria-label="Voltar ao topo" onClick={() => { playClick(soundsOn); window.scrollTo({ top: 0, behavior: "smooth" }); }}><ArrowDown size={17} /></button>}

      <footer className="site-footer official-footer">
        <div className="footer-socials" aria-label="Redes sociais da Eras Label">
          <a className="footer-social-link" href="https://www.instagram.com/eraslabel/" target="_blank" rel="noreferrer" aria-label="Instagram da Eras Label" title="Instagram">
            <Instagram size={20} strokeWidth={1.7} aria-hidden="true" />
          </a>
          <a className="footer-social-link" href="https://www.tiktok.com/@eraslabel" target="_blank" rel="noreferrer" aria-label="TikTok da Eras Label" title="TikTok">
            <TikTokIcon size={20} />
          </a>
        </div>
        <div className="footer-column"><strong>PRINCIPAL</strong><Link href="/" onClick={() => playClick(soundsOn)}>Início</Link><a href="#shop" onClick={() => playClick(soundsOn)}>Produtos</a><div className="footer-collection-wrap"><button onClick={() => setCollectionsOpen((value) => !value)}>Coleções <ArrowDown size={12} /></button>{collectionsOpen && <div className="footer-collection-menu"><Link href="/collection/paradox">Paradox Collection</Link><Link href="/archive">Raízes 2025 S'1</Link></div>}</div><a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Camisetas"); }}>Camisetas</a><a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Bonés"); }}>Bonés</a></div>
        <div className="footer-column"><strong>INFORMAÇÕES</strong><Link href="/contact" onClick={() => playClick(soundsOn)}>Contato</Link><Link href="/contact" onClick={() => playClick(soundsOn)}>Envios</Link><Link href="/contact" onClick={() => playClick(soundsOn)}>Política de Privacidade</Link><Link href="/manifesto" onClick={() => playClick(soundsOn)}>Quem Somos</Link><Link href="/contact" onClick={() => playClick(soundsOn)}>Trocas e Devoluções</Link></div>
        <div className="footer-column footer-contact"><strong>FALE COM A ERAS</strong><a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="mailto:atelie@eraslabel.com">atelie@eraslabel.com</a><span>São Paulo · Brasil</span><span>Seg–Sex · 10h às 18h</span></div>
        <div className="footer-bottom"><span>© 2026 ERAS LABEL</span><span>REVIVER. REINVENTAR ERAS.</span><span>DESENVOLVIDO COM INTENÇÃO</span></div>
      </footer>

      {/* Side Menu identical to Lovable with direct routing to Manifesto and Events */}
      {isMenuOpen && (
        <div className="overlay lovable-menu-overlay" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>
          <aside className="lovable-side-menu" onClick={(event) => event.stopPropagation()}>
            <div className="lovable-menu-header">
              <span className="lovable-menu-kicker">EXPLORAR</span>
              <button className="close-button" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }} aria-label="Fechar menu">
                <X size={20} />
              </button>
            </div>
            
            <nav className="lovable-menu-links">
              <Link href="/" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>INÍCIO</Link>
              <Link href="/archive" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>ARQUIVO DE ERAS</Link>
              <Link href="/manifesto" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>MANIFESTO COMPLETO</Link>
              <Link href="/events" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>EVENTOS</Link>
              <Link href="/contact" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>CONTATO</Link>
              <a href={ERAS_VIP_WHATSAPP_URL} target="_blank" rel="noreferrer" className="vip-whatsapp" onClick={() => playClick(soundsOn)}>
                GRUPO VIP NO<br />WHATSAPP
              </a>
            </nav>

            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">CATEGORIAS</span>
              <div className="lovable-menu-sublinks">
                <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Todos"); setIsMenuOpen(false); }}>TODOS OS PRODUTOS</a>
                <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Camisetas"); setIsMenuOpen(false); }}>CAMISETAS</a>
                <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Bonés"); setIsMenuOpen(false); }}>BONÉS</a>
              </div>
            </div>

            <div className="lovable-menu-section">
              <span className="lovable-menu-kicker">COLEÇÕES</span>
              <div className="lovable-menu-sublinks">
                <Link href={ERAS_COLLECTION_PATHS.paradox} onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>PARADOX COLLECTION</Link>
                <Link href={ERAS_COLLECTION_PATHS.lostBetweenEras} onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>LOST BETWEEN ERAS</Link>
                <Link href={ERAS_COLLECTION_PATHS.raizes} onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>RAÍZES — RECIFE & LA URSA</Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Persistent Side Cart with recommended items, progress bar, coupons, undo and payment badges */}
      {isCartOpen && (
        <div className="overlay" onClick={() => setIsCartOpen(false)}>
          <aside className="side-cart" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <span className="section-kicker">SACOLA</span>
                <h2>Seu Carrinho ({cartCount})</h2>
              </div>
              <button className="close-button" onClick={() => setIsCartOpen(false)} aria-label="Fechar carrinho"><X /></button>
            </div>

            <div className="free-shipping-progress" aria-label="Progresso de frete grátis">
              <div className="shipping-progress-text">
                {subtotal >= freeShippingThreshold ? (
                  <span><strong>Parabéns!</strong> Você conquistou frete grátis.</span>
                ) : (
                  <span>Faltam <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> para frete grátis.</span>
                )}
                <span>{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }} />
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={48} strokeWidth={1} />
                <p>Sua sacola está vazia.</p>
                <button className="primary-button" onClick={() => setIsCartOpen(false)}>EXPLORAR PRODUTOS</button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item" key={`${item.id}-${item.size}`}>
                      <img src={item.image} alt={item.alt} />
                      <div className="cart-item-details">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-variant">Tamanho: {item.size}</p>
                        <div className="cart-item-bottom">
                          <div className="quantity-stepper">
                            <button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label="Diminuir quantidade"><Minus size={13} /></button>
                            <span>{item.quantity}</span>
                            <button onClick={() => changeQuantity(item.id, item.size, 1)} aria-label="Aumentar quantidade"><Plus size={13} /></button>
                          </div>
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => {
                          playClick(soundsOn);
                          setLastRemovedItem(item);
                          setCart((current) => current.filter((i) => !(i.id === item.id && i.size === item.size)));
                          toast.success("Item removido da sacola.", {
                            action: {
                              label: "Desfazer",
                              onClick: () => {
                                playClick(soundsOn);
                                setCart((current) => [...current, item]);
                                setLastRemovedItem(null);
                                toast.success("Item restaurado.");
                              },
                            },
                          });
                        }}
                        aria-label="Remover item"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="coupon-box">
                    <div className="coupon-input-group">
                      <Input
                        value={coupon}
                        onChange={(event) => setCoupon(event.target.value)}
                        placeholder="Cupom (ex: ERAS10)"
                        disabled={couponLoading}
                        aria-label="Código do cupom"
                      />
                      <button className="coupon-apply-btn" onClick={applyCoupon} disabled={couponLoading}>
                        {couponLoading ? <Loader2 size={16} className="spinner-icon" /> : "APLICAR"}
                      </button>
                    </div>
                    {couponApplied === true && <p className="coupon-feedback success">Cupom ERAS10 aplicado (10% OFF)</p>}
                    {couponApplied === false && <p className="coupon-feedback error">Cupom inválido ou expirado</p>}
                  </div>

                  <div className="cep-calc-box">
                    <div className="coupon-input-group">
                      <Input
                        value={cepInput}
                        onChange={(event) => setCepInput(event.target.value.replace(/\D/g, "").slice(0, 8))}
                        placeholder="Digite o CEP (ex: 01311000)"
                        maxLength={8}
                        aria-label="CEP para cálculo de frete"
                      />
                      <button className="coupon-apply-btn" onClick={() => { playClick(soundsOn); setShippingCep(cepInput); }}>
                        CALCULAR
                      </button>
                    </div>
                    {shippingLoading && <p className="shipping-info-text">Calculando frete...</p>}
                    {shippingData && !shippingLoading && (
                      <p className="shipping-info-text success">
                        {shippingData.free ? "Frete Grátis" : `Frete: ${formatPrice(shippingData.cost)}`} · Prazo: {shippingData.deadline}
                      </p>
                    )}
                  </div>

                  <div className="payment-methods-selector">
                    <span className="eyebrow">MÉTODO DE PAGAMENTO</span>
                    <div className="payment-chips">
                      <button
                        type="button"
                        className={`payment-chip ${selectedPaymentMethod === "pix" ? "active" : ""}`}
                        onClick={() => { playClick(soundsOn); setSelectedPaymentMethod("pix"); }}
                      >
                        <strong>Pix</strong>
                        <span>{pixDiscountPercent}% OFF</span>
                      </button>
                      <button
                        type="button"
                        className={`payment-chip ${selectedPaymentMethod === "credit_card" ? "active" : ""}`}
                        onClick={() => { playClick(soundsOn); setSelectedPaymentMethod("credit_card"); }}
                      >
                        <strong>Cartão</strong>
                        <span>Até 6x</span>
                      </button>
                    </div>
                  </div>

                  <div className="cart-totals">
                    <div className="cart-total-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                    {discount > 0 && <div className="cart-total-row discount"><span>Desconto cupom</span><strong>- {formatPrice(discount)}</strong></div>}
                    <div className="cart-total-row"><span>Frete</span><strong>{shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}</strong></div>
                    {selectedPaymentMethod === "pix" && (
                      <div className="cart-total-row pix-savings">
                        <span>Economia no Pix ({pixDiscountPercent}%)</span>
                        <strong>- {formatPrice(subtotal * (pixDiscountPercent / 100))}</strong>
                      </div>
                    )}
                    <div className="cart-total-row final"><span>Total</span><strong>{formatPrice(total)}</strong></div>
                  </div>

                  <button className="primary-button checkout-button" onClick={() => { playClick(soundsOn); setIsCartOpen(false); setIsCheckoutOpen(true); }}>
                    IR PARA CHECKOUT ({selectedPaymentMethod === "pix" ? "Pix" : "Cartão"}) <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {cart.length === 0 && (
              <div className="side-cart-recommendations">
                <span className="section-kicker">VOCÊ TAMBÉM PODE GOSTAR</span>
                <div className="recommendations-list">
                  {products.slice(0, 2).map((rec) => (
                    <div className="recommendation-item" key={rec.id}>
                      <img src={rec.image} alt={rec.alt} />
                      <div>
                        <strong>{rec.name}</strong>
                        <span>{formatPrice(rec.price)}</span>
                      </div>
                      <button onClick={() => addToCart(rec, rec.sizes[0])}>ADICIONAR</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="overlay" onClick={() => { if (!loading) setIsCheckoutOpen(false); }}>
          <div className={`checkout-modal ${checkoutStatus === "success" ? "checkout-modal-success" : ""}`} onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div><span className="section-kicker">CHECKOUT</span><h2>{checkoutFeedback.title}</h2></div>
              <button className="close-button" onClick={() => { if (!loading) setIsCheckoutOpen(false); }} disabled={loading} aria-label="Fechar checkout"><X /></button>
            </div>

            <div className={`checkout-progress ${checkoutStatus === "success" ? "is-complete" : ""}`} aria-label="Etapas do checkout">
              <div className="checkout-step is-complete"><span>01</span><small>SACOLA</small></div>
              <span className="checkout-progress-line" aria-hidden="true" />
              <div className={`checkout-step ${checkoutStatus === "success" ? "is-complete" : "is-active"}`}><span>02</span><small>DADOS</small></div>
              <span className="checkout-progress-line" aria-hidden="true" />
              <div className={`checkout-step ${checkoutStatus === "success" ? "is-active" : ""}`}><span>03</span><small>CONFIRMAÇÃO</small></div>
            </div>

            {checkoutStatus === "success" ? (
              <div className="checkout-success-state" role="status" aria-live="polite">
                <div className="checkout-success-icon"><CheckCircle2 size={42} strokeWidth={1.5} /></div>
                <span className="section-kicker">CONFIRMAÇÃO RECEBIDA</span>
                <h3>Seu pagamento foi confirmado.</h3>
                <p>{checkoutFeedback.message}</p>

                {confirmedOrderSummary && (
                  <section className="checkout-order-summary" aria-label="Resumo detalhado do pedido">
                    <div className="checkout-order-summary-heading">
                      <div>
                        <span className="section-kicker">RESUMO DO PEDIDO</span>
                        <strong>{confirmedOrderSummary.totalItems} {confirmedOrderSummary.totalItems === 1 ? "item" : "itens"}</strong>
                      </div>
                      <span className="checkout-delivery-estimate"><Clock3 size={15} /> Chega em {confirmedOrderSummary.estimatedDelivery}</span>
                    </div>

                    <div className="checkout-order-items">
                      {confirmedOrderSummary.items.map((item) => (
                        <div className="checkout-order-item" key={`${item.id}-${item.size}`}>
                          <img src={item.image} alt={item.alt} />
                          <div className="checkout-order-item-copy">
                            <strong>{item.name}</strong>
                            <span>Tamanho {item.size} · Qtd. {item.quantity}</span>
                          </div>
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="checkout-order-totals">
                      <div><span>Subtotal</span><strong>{formatPrice(confirmedOrderSummary.subtotal)}</strong></div>
                      <div><span>Descontos</span><strong className={confirmedOrderSummary.discount > 0 ? "summary-discount" : ""}>{confirmedOrderSummary.discount > 0 ? `- ${formatPrice(confirmedOrderSummary.discount)}` : formatPrice(0)}</strong></div>
                      <div><span>Frete</span><strong>{confirmedOrderSummary.shippingCost === 0 ? "Grátis" : formatPrice(confirmedOrderSummary.shippingCost)}</strong></div>
                      <div><span>Pagamento</span><strong>{confirmedOrderSummary.paymentMethod === "pix" ? "Pix" : "Cartão"}</strong></div>
                      <div className="checkout-order-total"><span>Total pago</span><strong>{formatPrice(confirmedOrderSummary.total)}</strong></div>
                    </div>
                  </section>
                )}

                <div className="checkout-success-meta">
                  <span><Check size={14} /> Pedido recebido pela Eras Label</span>
                  <span><Check size={14} /> Pagamento aprovado com segurança</span>
                  <span><Check size={14} /> Acompanhamento disponível na sua conta</span>
                </div>
                <div className="checkout-success-actions">
                  <Link href="/account" className="primary-button" onClick={() => playClick(soundsOn)}>ACOMPANHAR PEDIDO <ArrowRight size={16} /></Link>
                  <button type="button" className="text-link" onClick={() => { playClick(soundsOn); setIsCheckoutOpen(false); }}>CONTINUAR COMPRANDO</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitCheckout} className="checkout-form" aria-busy={loading}>
                {checkoutStatus === "processing" && (
                  <div className="checkout-processing-banner" role="status" aria-live="polite">
                    <Loader2 size={18} className="spinner-icon" />
                    <div><strong>{checkoutFeedback.title}</strong><span>{checkoutFeedback.message}</span></div>
                  </div>
                )}
                {checkoutStatus === "error" && (
                  <div className="checkout-error-banner" role="alert">
                    <AlertCircle size={18} />
                    <div><strong>{checkoutFeedback.title}</strong><span>{checkoutFeedback.message}</span><small>Confira os dados e tente novamente. Seu carrinho permanece salvo.</small></div>
                  </div>
                )}
                <div className="checkout-grid">
                  <label>Nome completo<Input name="customerName" required placeholder="Seu nome" disabled={loading} /></label>
                  <label>E-mail<Input name="customerEmail" required type="email" placeholder="voce@email.com" disabled={loading} /></label>
                  <label>CPF<Input name="cpf" required placeholder="000.000.000-00" disabled={loading} /></label>
                  <label>Telefone<Input name="phone" required placeholder="(00) 00000-0000" disabled={loading} /></label>
                  <label>CEP<Input name="cep" required placeholder="00000-000" disabled={loading} /></label>
                  <label>Número<Input name="number" required placeholder="123" disabled={loading} /></label>
                  <label className="wide">Endereço completo<Input name="street" required placeholder="Rua, avenida ou travessa" disabled={loading} /></label>
                  <label>Complemento<Input name="complement" placeholder="Apartamento, bloco" disabled={loading} /></label>
                  <label>Bairro<Input name="neighborhood" required placeholder="Seu bairro" disabled={loading} /></label>
                  <label>Cidade<Input name="city" required placeholder="Sua cidade" disabled={loading} /></label>
                  <label>Estado<Input name="state" required placeholder="UF" disabled={loading} /></label>
                </div>
                <div className="shipping-placeholder"><Clock3 size={16} /><span>O cálculo de frete e as opções do Melhor Envio aparecerão após o CEP.</span></div>
                <div className="payment-placeholder"><span className="eyebrow">PAGAMENTO SELECIONADO</span><p>Método escolhido: <strong>{selectedPaymentMethod === "pix" ? "Pix (com desconto)" : "Cartão de Crédito"}</strong></p></div>
                <button type="submit" className="primary-button checkout-submit-button" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spinner-icon" /> CONFIRMANDO PAGAMENTO...</> : <>CONFIRMAR PAGAMENTO · {formatPrice(total)} <ArrowRight size={16} /></>}
                </button>
                {loading && <p className="checkout-processing-note">A confirmação pode levar alguns segundos.</p>}
              </form>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedProduct(null)}><X /></button>
            <div className="modal-image"><img src={selectedProduct.image} alt={selectedProduct.alt} onError={(event) => {
            if (!selectedProduct.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = selectedProduct.fallbackImage;
          }} /></div>
            <div className="modal-copy">
              <span className="eyebrow">{selectedProduct.collection}</span>
              <h2>{selectedProduct.name}</h2>
              <p className="modal-price">{formatPrice(selectedProduct.price)}</p>
              <p>{selectedProduct.detail}</p>
              <div className="size-picker">
                <span>TAMANHO</span>
                <div>
                  {selectedProduct.sizes.map((size) => (
                    <button key={size} className={selectedSize === size ? "selected" : ""} onClick={() => setSelectedSize(size)} disabled={selectedProduct.stock === 0}>{size}</button>
                  ))}
                </div>
              </div>
              <button className="primary-button" onClick={() => addToCart(selectedProduct, selectedSize)} disabled={selectedProduct.stock === 0}>
                {selectedProduct.stock === 0 ? "ESGOTADO" : "ADICIONAR À SACOLA"} <ArrowRight size={16} />
              </button>
              <p className="stock-note"><Sparkles size={13} /> Estoque gerido no painel administrativo.</p>
            </div>
          </div>
        </div>
      )}

      {/* State-driven Rotating Hourglass Transition Indicator */}
      {loading && (
        <div className="loading-hint active" aria-hidden="true">
          <span>
            <svg className="hourglass-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14" />
              <path d="M5 2h14" />
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
            </svg>
            a carregar era...
          </span>
        </div>
      )}
    </div>
  );
}
