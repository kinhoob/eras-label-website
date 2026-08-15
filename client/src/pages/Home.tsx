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
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { playInteractionSound } from "@/lib/interaction-sound";
import { getCartItemCount } from "@/lib/cart";
import { updateCartLineQuantity, removeCartLine } from "@/lib/cart-operations";
import { loadCart, saveCart } from "@/lib/cart-storage";
import { getCheckoutFeedback } from "@/lib/checkout-feedback";
import { ERAS_COLLECTION_PATHS, ERAS_VIP_WHATSAPP_URL } from "../../../shared/const";
import { checkoutFlowReducer, initialCheckoutFlowState } from "@/lib/checkout-flow";
import { createOrderSummary, type OrderSummary } from "@/lib/order-summary";
import { saveCheckoutDraft } from "@/lib/checkout-draft";
import { filterStorefrontProducts, getStorefrontFilterOptions } from "@/lib/storefront-filters";
import { getSearchSuggestionText, searchStorefrontProducts, sortStorefrontProducts, type StorefrontSearchSort } from "@/lib/storefront-search";

type Category = "Todos" | "Camisetas" | "Bonés";
type PriceRange = "all" | "under150" | "150to200" | "over200";
type SearchFilterKey = "query" | "category" | "price" | "size" | "color" | "sort";
type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "Todos">;
  collection: string;
  color: string;
  price: number;
  pixPrice: number;
  image: string;
  fallbackImage?: string;
  alt: string;
  sizes: string[];
  stock: number;
  detail: string;
  createdAt?: string | Date | null;
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
    color: "Branco",
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
    color: "Preto",
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
    color: "Cinza",
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
    color: "Off-white",
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
    color: "Bege",
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
    color: "Marinho",
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

function inferProductColor(name: string) {
  const normalized = name.toLowerCase();
  const knownColors = [
    ["off-white", "Off-white"],
    ["off white", "Off-white"],
    ["marinho", "Marinho"],
    ["bege", "Bege"],
    ["branco", "Branco"],
    ["preto", "Preto"],
    ["cinza", "Cinza"],
    ["verde", "Verde"],
    ["azul", "Azul"],
    ["vermelho", "Vermelho"],
  ] as const;
  return knownColors.find(([token]) => normalized.includes(token))?.[1] ?? "Neutro";
}

function mapCatalogProduct(row: { id: number; name: string; collection: string; category: string; color?: string | null; price: unknown; pixPrice: unknown; description: string | null; images: unknown; status: string; createdAt?: string | Date | null; variations?: Array<{ size: string; stock: number | null }> }): Product {
  const images = Array.isArray(row.images) ? row.images.filter((image): image is string => typeof image === "string") : [];
  const fallbackImage = fallbackProducts.find((product) => product.id === row.id)?.image || editorialImage;
  const category: Exclude<Category, "Todos"> = row.category === "Bonés" ? "Bonés" : "Camisetas";
  const availableVariations = (row.variations ?? []).filter((variation) => Number(variation.stock ?? 0) > 0);
  const variationSizes = Array.from(new Set(availableVariations.map((variation) => variation.size).filter(Boolean)));
  const sizes = variationSizes.length > 0 ? variationSizes : category === "Bonés" ? ["Único"] : ["P", "M", "G", "GG"];
  const variationStock = (row.variations ?? []).reduce((sum, variation) => sum + Math.max(0, Number(variation.stock ?? 0)), 0);
  return {
    id: row.id,
    name: row.name,
    category,
    collection: row.collection,
    color: row.color?.trim() || inferProductColor(row.name),
    price: Number(row.price),
    pixPrice: Number(row.pixPrice),
    image: images[0] || fallbackImage,
    fallbackImage,
    alt: row.name,
    sizes,
    stock: row.status === "soldout" ? 0 : row.variations?.length ? variationStock : 1,
    detail: row.description || "Peça Eras Label com acabamento premium.",
    createdAt: row.createdAt,
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

const playClick = (enabled: boolean) => playInteractionSound(enabled);

export default function Home() {
  const [category, setCategory] = useState<Category>("Todos");
  const [sizeFilter, setSizeFilter] = useState("Todos");
  const [colorFilter, setColorFilter] = useState("Todas");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [searchSort, setSearchSort] = useState<StorefrontSearchSort>("newest");
  const [cart, setCart] = useState<CartLine[]>(() => loadCart<CartLine>());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchSuggestion, setActiveSearchSuggestion] = useState(-1);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchLoadingTimeoutRef = useRef<number | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

  const subscribeNewsletterMutation = trpc.newsletter.subscribe.useMutation();

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    playClick(soundsOn);
    setNewsletterSubmitting(true);
    subscribeNewsletterMutation.mutate({ email: newsletterEmail, name: newsletterName }, {
      onSuccess: (res: any) => {
        setNewsletterSubmitting(false);
        const msg = res?.couponCode ? `Inscrição confirmada! O seu cupom de boas-vindas é ${res.couponCode}.` : "Inscrição efetuada com sucesso!";
        setNewsletterSuccess(msg);
        toast.success("Inscrição efetuada com sucesso!");
        setNewsletterEmail("");
        setNewsletterName("");
      },
      onError: (err: any) => {
        setNewsletterSubmitting(false);
        toast.error(err.message || "Erro ao subscrever. Tente novamente.");
      }
    });
  }
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerStopTimeoutRef = useRef<number | null>(null);
  const addedProductTimeoutRef = useRef<number | null>(null);
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

  const { sizes: availableSizes, colors: availableColors } = useMemo(() => getStorefrontFilterOptions(products), [products]);
  const filteredProducts = useMemo(() => {
    const filterResults = filterStorefrontProducts(products, {
      category,
      size: sizeFilter,
      color: colorFilter,
      priceRange,
    });
    const searchedProducts = searchStorefrontProducts(filterResults, searchQuery);
    return searchQuery.trim() ? sortStorefrontProducts(searchedProducts, searchSort) : searchedProducts;
  }, [category, colorFilter, priceRange, products, searchQuery, searchSort, sizeFilter]);
  const searchSuggestions = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
  const activeSearchFilters = useMemo(() => {
    const filters: Array<{ key: SearchFilterKey; label: string }> = [];
    if (searchQuery.trim()) filters.push({ key: "query", label: `Pesquisa: ${searchQuery.trim()}` });
    if (category !== "Todos") filters.push({ key: "category", label: `Categoria: ${category}` });
    if (priceRange !== "all") filters.push({ key: "price", label: `Preço: ${priceRange === "under150" ? "Até R$ 150" : priceRange === "150to200" ? "R$ 150–200" : "Acima de R$ 200"}` });
    if (sizeFilter !== "Todos") filters.push({ key: "size", label: `Tamanho: ${sizeFilter}` });
    if (colorFilter !== "Todas") filters.push({ key: "color", label: `Cor: ${colorFilter}` });
    if (searchQuery.trim() && searchSort !== "newest") filters.push({ key: "sort", label: `Ordenação: ${searchSort === "price-asc" ? "menor preço" : "maior preço"}` });
    return filters;
  }, [category, colorFilter, priceRange, searchQuery, searchSort, sizeFilter]);
  const hasAdvancedFilters = sizeFilter !== "Todos" || colorFilter !== "Todas" || priceRange !== "all";
  function clearSearchCriterion(key: SearchFilterKey) {
    if (key === "query") setSearchQuery("");
    if (key === "category") setCategory("Todos");
    if (key === "price") setPriceRange("all");
    if (key === "size") setSizeFilter("Todos");
    if (key === "color") setColorFilter("Todas");
    if (key === "sort") setSearchSort("newest");
    setActiveSearchSuggestion(-1);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }
  function clearAllSearchCriteria() {
    setSearchQuery("");
    setCategory("Todos");
    setSizeFilter("Todos");
    setColorFilter("Todas");
    setPriceRange("all");
    setSearchSort("newest");
    setActiveSearchSuggestion(-1);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }
  function clearShopFilters() {
    setCategory("Todos");
    setSizeFilter("Todos");
    setColorFilter("Todas");
    setPriceRange("all");
    setSearchSort("newest");
  }

  function revealSearch() {
    playClick(soundsOn);
    setIsSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suggestion = searchSuggestions[activeSearchSuggestion];
    if (suggestion) {
      openProduct(suggestion);
      setIsSearchOpen(false);
      setActiveSearchSuggestion(-1);
      return;
    }
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsSearchOpen(true);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchSuggestion((current) => Math.min(current + 1, searchSuggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchSuggestion((current) => Math.max(current - 1, -1));
    } else if (event.key === "Escape") {
      setIsSearchOpen(false);
      setActiveSearchSuggestion(-1);
      searchInputRef.current?.blur();
    }
  }

  function chooseSearchSuggestion(product: Product) {
    playClick(soundsOn);
    setSearchQuery(product.name);
    setActiveSearchSuggestion(-1);
    setIsSearchOpen(false);
    openProduct(product);
  }

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const candidates = products
      .filter((product) => product.id !== selectedProduct.id)
      .sort((left, right) => {
        const leftScore = left.collection === selectedProduct.collection ? 2 : left.category === selectedProduct.category ? 1 : 0;
        const rightScore = right.collection === selectedProduct.collection ? 2 : right.category === selectedProduct.category ? 1 : 0;
        return rightScore - leftScore;
      });
    return candidates.slice(0, 3);
  }, [products, selectedProduct]);
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
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    return () => {
      if (searchLoadingTimeoutRef.current !== null) window.clearTimeout(searchLoadingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    if (searchLoadingTimeoutRef.current !== null) window.clearTimeout(searchLoadingTimeoutRef.current);
    searchLoadingTimeoutRef.current = window.setTimeout(() => {
      setIsSearchLoading(false);
      searchLoadingTimeoutRef.current = null;
    }, 220);
  }, [isSearchOpen, searchQuery, sizeFilter, colorFilter, priceRange, searchSort]);

  useEffect(() => {
    return () => {
      if (addedProductTimeoutRef.current !== null) window.clearTimeout(addedProductTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleCartKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCartOpen(false);
    };
    window.addEventListener("keydown", handleCartKeyDown);
    return () => window.removeEventListener("keydown", handleCartKeyDown);
  }, [isCartOpen]);

  useEffect(() => {
    if (!selectedProduct) return;
    const handleQuickViewKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProduct(null);
    };
    window.addEventListener("keydown", handleQuickViewKeyDown);
    return () => window.removeEventListener("keydown", handleQuickViewKeyDown);
  }, [selectedProduct]);

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
    setAddedProductId(product.id);
    if (addedProductTimeoutRef.current !== null) window.clearTimeout(addedProductTimeoutRef.current);
    addedProductTimeoutRef.current = window.setTimeout(() => {
      setAddedProductId(null);
      setSelectedProduct(null);
      setIsCartOpen(true);
      addedProductTimeoutRef.current = null;
    }, 620);
    toast.success("Adicionado à sacola", { description: `${product.name} · tamanho ${size}`, duration: 2200 });
  }

  function goToCheckout() {
    playClick(soundsOn);
    saveCheckoutDraft({
      coupon,
      couponApplied: couponApplied === true,
      selectedPaymentMethod,
      shippingCep,
    });
    window.setTimeout(() => window.location.assign("/checkout"), 0);
  }

  function changeQuantity(productId: number, size: string, delta: number) {
    playClick(soundsOn);
    setCart((current) => updateCartLineQuantity(current, productId, size, delta));
  }

  function removeItem(item: CartLine) {
    playClick(soundsOn);
    setLastRemovedItem(item);
    setCart((current) => removeCartLine(current, item.id, item.size));
    toast.success("Item removido da sacola.", {
      description: `${item.name} · tamanho ${item.size}`,
      action: {
        label: "Desfazer",
        onClick: () => {
          playClick(soundsOn);
          setCart((current) => current.some((line) => line.id === item.id && line.size === item.size) ? current : [...current, item]);
          setLastRemovedItem(null);
          toast.success("Item restaurado.");
        },
      },
    });
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
      items: cart.map((item) => ({ productId: item.id, name: item.name, size: item.size, quantity: item.quantity, price: item.price })),
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
        <div className={`header-search ${isSearchOpen ? "is-open" : ""}`}>
          <button className="icon-button header-search-trigger" type="button" aria-label={isSearchOpen ? "Fechar pesquisa" : "Pesquisar produtos"} aria-expanded={isSearchOpen} onClick={() => isSearchOpen ? setIsSearchOpen(false) : revealSearch()}>
            <Search size={17} />
          </button>
          {isSearchOpen && (
            <form className="header-search-form" role="search" onSubmit={submitSearch}>
              <Search className="header-search-form-icon" size={16} aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveSearchSuggestion(-1);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Pesquisar peças, coleções ou cores"
                aria-label="Pesquisar peças, coleções ou cores"
                aria-autocomplete="list"
                aria-controls="eras-search-suggestions"
                aria-activedescendant={activeSearchSuggestion >= 0 ? `eras-search-suggestion-${activeSearchSuggestion}` : undefined}
                autoComplete="off"
              />
              {searchQuery && <button className="header-search-clear" type="button" aria-label="Limpar pesquisa" onClick={() => { setSearchQuery(""); setActiveSearchSuggestion(-1); searchInputRef.current?.focus(); }}>×</button>}
              {searchQuery.trim() && (
                <div className="header-search-results" id="eras-search-suggestions" aria-label="Resultados da pesquisa">
                  <div className="header-search-results-heading">
                    <span>RESULTADOS DA PESQUISA</span>
                    <span aria-live="polite">{isSearchLoading ? "A procurar…" : `${filteredProducts.length} ${filteredProducts.length === 1 ? "peça" : "peças"}`}</span>
                  </div>
                  {activeSearchFilters.length > 0 && (
                    <div className="header-search-active-filters" aria-label="Filtros ativos" role="list">
                      <span className="header-search-active-label">ATIVOS</span>
                      {activeSearchFilters.map((filter) => (
                        <div key={filter.key} role="listitem">
                          <button type="button" className="header-search-filter-chip" onClick={() => { playClick(soundsOn); clearSearchCriterion(filter.key); }} aria-label={`Remover ${filter.label}`}>
                            <span>{filter.label}</span><X size={11} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="header-search-clear-all" onClick={() => { playClick(soundsOn); clearAllSearchCriteria(); }} aria-label="Limpar todos os filtros da pesquisa">Limpar tudo</button>
                    </div>
                  )}
                  <div className="header-search-filter-grid" aria-label="Filtrar resultados da pesquisa">
                    <label>
                      <span>Preço</span>
                      <select value={priceRange} onChange={(event) => { playClick(soundsOn); setPriceRange(event.target.value as PriceRange); }} aria-label="Filtrar pesquisa por preço">
                        <option value="all">Todas</option>
                        <option value="under150">Até R$ 150</option>
                        <option value="150to200">R$ 150–200</option>
                        <option value="over200">Acima de R$ 200</option>
                      </select>
                    </label>
                    <label>
                      <span>Tamanho</span>
                      <select value={sizeFilter} onChange={(event) => { playClick(soundsOn); setSizeFilter(event.target.value); }} aria-label="Filtrar pesquisa por tamanho">
                        <option value="Todos">Todos</option>
                        {availableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Cor</span>
                      <select value={colorFilter} onChange={(event) => { playClick(soundsOn); setColorFilter(event.target.value); }} aria-label="Filtrar pesquisa por cor">
                        <option value="Todas">Todas</option>
                        {availableColors.map((color) => <option key={color} value={color}>{color}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="header-search-sort-row">
                    <span>Ordenar resultados</span>
                    <select value={searchSort} onChange={(event) => { playClick(soundsOn); setSearchSort(event.target.value as StorefrontSearchSort); }} aria-label="Ordenar resultados da pesquisa">
                      <option value="newest">Mais recentes</option>
                      <option value="price-asc">Menor preço</option>
                      <option value="price-desc">Maior preço</option>
                    </select>
                  </label>
                  {isSearchLoading ? (
                    <div className="header-search-loading" role="status" aria-live="polite">
                      <Loader2 className="search-loading-icon" size={18} aria-hidden="true" />
                      <span>A procurar peças para si…</span>
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <div className="header-search-suggestions" role="listbox" aria-label="Sugestões de produtos">
                      {searchSuggestions.map((product, index) => (
                        <button
                          key={product.id}
                          id={`eras-search-suggestion-${index}`}
                          className={activeSearchSuggestion === index ? "active" : ""}
                          type="button"
                          role="option"
                          aria-selected={activeSearchSuggestion === index}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => chooseSearchSuggestion(product)}
                        >
                          <img src={product.image} alt="" aria-hidden="true" />
                          <span><strong>{product.name}</strong><small>{getSearchSuggestionText(product)}</small></span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      ))}
                      {filteredProducts.length > searchSuggestions.length && <button className="header-search-see-all" type="submit">Ver todas as {filteredProducts.length} peças <ArrowRight size={14} /></button>}
                    </div>
                  ) : (
                    <div className="header-search-empty" role="status" aria-live="polite">
                      <strong>Não encontrámos essa era.</strong>
                      <span>Tente outro nome, coleção, cor ou tamanho.</span>
                      {activeSearchFilters.length > 0 && <button type="button" onClick={() => { playClick(soundsOn); clearAllSearchCriteria(); }}>Limpar filtros da pesquisa</button>}
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
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
                    <span className="quick-view-label">VISUALIZAÇÃO RÁPIDA</span>
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
            <span className="shop-result-count" aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? "produto" : "produtos"}</span>
          </div>
          <div className="shop-filter-bar" aria-label="Filtros avançados da loja">
            <div className="filter-tabs" role="tablist" aria-label="Filtrar por categoria">
              {(["Todos", "Camisetas", "Bonés"] as Category[]).map((item) => (
                <button key={item} className={category === item ? "active" : ""} onClick={() => { playClick(soundsOn); setCategory(item); }}>{item}</button>
              ))}
            </div>
            <label className="shop-filter-field">
              <span className="shop-filter-label-row"><span>Tamanho</span>{sizeFilter !== "Todos" && <button type="button" className="shop-filter-reset" aria-label="Limpar filtro de tamanho" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSizeFilter("Todos"); }}>×</button>}</span>
              <select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)} aria-label="Filtrar por tamanho">
                <option value="Todos">Todos</option>
                {availableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <label className="shop-filter-field">
              <span className="shop-filter-label-row"><span>Cor</span>{colorFilter !== "Todas" && <button type="button" className="shop-filter-reset" aria-label="Limpar filtro de cor" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setColorFilter("Todas"); }}>×</button>}</span>
              <select value={colorFilter} onChange={(event) => setColorFilter(event.target.value)} aria-label="Filtrar por cor">
                <option value="Todas">Todas</option>
                {availableColors.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </label>
            <label className="shop-filter-field">
              <span className="shop-filter-label-row"><span>Preço</span>{priceRange !== "all" && <button type="button" className="shop-filter-reset" aria-label="Limpar filtro de preço" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setPriceRange("all"); }}>×</button>}</span>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value as PriceRange)} aria-label="Filtrar por faixa de preço">
                <option value="all">Todas as faixas</option>
                <option value="under150">Até R$ 150</option>
                <option value="150to200">R$ 150 a R$ 200</option>
                <option value="over200">Acima de R$ 200</option>
              </select>
            </label>
            {hasAdvancedFilters && <button className="shop-filter-clear" type="button" onClick={clearShopFilters}>Limpar filtros</button>}
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
                  <span className="quick-view-label">VISUALIZAÇÃO RÁPIDA</span>
                  <span className="product-arrow"><ArrowRight size={15} /></span>
                </button>
                <div className="product-meta">
                  <div><p className="product-name">{product.name}</p><p className="product-collection">{product.collection}</p></div>
                  <div className="product-price"><strong>{formatPrice(product.price)}</strong><span>{formatPrice(product.pixPrice)} NO PIX</span></div>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="shop-empty-state" role="status">
              <p>Nenhum produto corresponde aos filtros selecionados.</p>
              <button type="button" onClick={clearShopFilters}>Limpar filtros</button>
            </div>
          )}
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

      <section className="newsletter-banner-section" style={{ backgroundColor: '#111', color: '#fff', padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b34125', display: 'block', marginBottom: '0.5rem' }}>NEWSLETTER ERAS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem', fontFamily: 'serif' }}>RECEBA ACESSO ANTECIPADO E 10% OFF</h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>Subscreva para receber lançamentos em primeira mão e um cupom exclusivo de boas-vindas na sua caixa de entrada.</p>

          {newsletterSuccess ? (
            <div style={{ background: 'rgba(179, 65, 37, 0.150)', border: '1px solid #b34125', padding: '1.25rem', borderRadius: '4px', color: '#fff' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#e05a3b' }}>Inscrição confirmada com sucesso!</p>
              <p style={{ fontSize: '0.9rem', color: '#ddd' }}>{newsletterSuccess}</p>
              <Button onClick={() => setNewsletterSuccess(null)} variant="outline" style={{ marginTop: '1rem', borderColor: '#444', color: '#fff' }}>Subscrever outro e-mail</Button>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Input 
                  type="text" 
                  placeholder="Seu nome (opcional)" 
                  value={newsletterName} 
                  onChange={(e) => setNewsletterName(e.target.value)} 
                  style={{ flex: '1 1 180px', background: '#222', borderColor: '#333', color: '#fff' }} 
                />
                <Input 
                  type="email" 
                  required 
                  placeholder="Seu melhor e-mail" 
                  value={newsletterEmail} 
                  onChange={(e) => setNewsletterEmail(e.target.value)} 
                  style={{ flex: '2 1 240px', background: '#222', borderColor: '#333', color: '#fff' }} 
                />
                <Button type="submit" disabled={newsletterSubmitting} style={{ backgroundColor: '#b34125', color: '#fff', minWidth: '140px' }}>
                  {newsletterSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner-mini" style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      A subscrever...
                    </span>
                  ) : "SUBSCREVER"}
                </Button>
              </div>
              <small style={{ color: '#777', fontSize: '0.8rem' }}>Sem spam. Pode cancelar a subscrição a qualquer momento.</small>
            </form>
          )}
        </div>
      </section>

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
          <aside className="side-cart" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <span className="section-kicker">SACOLA</span>
                <h2 id="cart-drawer-title" aria-live="polite">Seu Carrinho ({cartCount})</h2>
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
                          onClick={() => removeItem(item)}
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

                  <button type="button" className="primary-button checkout-button" onClick={goToCheckout}>
                    FINALIZAR COMPRA ({selectedPaymentMethod === "pix" ? "Pix" : "Cartão"}) <ArrowRight size={16} />
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
          <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="quick-view-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close-button" onClick={() => setSelectedProduct(null)} aria-label="Fechar visualização rápida"><X /></button>
            <div className="modal-image"><img src={selectedProduct.image} alt={selectedProduct.alt} onError={(event) => {
            if (!selectedProduct.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = selectedProduct.fallbackImage;
          }} /></div>
            <div className="modal-copy">
              <span className="eyebrow">{selectedProduct.collection}</span>
              <h2 id="quick-view-title">{selectedProduct.name}</h2>
              <p className="modal-price">{formatPrice(selectedProduct.price)}</p>
              <p className="modal-detail-text">{selectedProduct.detail}</p>
              <div className="modal-availability-row">
                <span className={`availability-badge ${selectedProduct.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                  {selectedProduct.stock > 0 ? `Disponível em estoque (${selectedProduct.stock} unidades)` : "Esgotado no momento"}
                </span>
              </div>
              <div className="size-picker">
                <span>TAMANHO</span>
                <div>
                  {selectedProduct.sizes.map((size) => (
                    <button key={size} className={selectedSize === size ? "selected" : ""} onClick={() => setSelectedSize(size)} disabled={selectedProduct.stock === 0}>{size}</button>
                  ))}
                </div>
              </div>
              <button
                className={`primary-button add-to-cart-button ${addedProductId === selectedProduct.id ? "is-added" : ""}`}
                onClick={() => addToCart(selectedProduct, selectedSize)}
                disabled={selectedProduct.stock === 0 || addedProductId === selectedProduct.id}
                aria-live="polite"
              >
                {selectedProduct.stock === 0 ? "ESGOTADO" : addedProductId === selectedProduct.id ? <><CheckCircle2 size={16} /> ADICIONADO À SACOLA</> : <>ADICIONAR À SACOLA <ArrowRight size={16} /></>}
              </button>
              <p className="stock-note"><Sparkles size={13} /> Estoque gerido no painel administrativo.</p>
              {relatedProducts.length > 0 && (
                <section className="quick-view-related" aria-label="Produtos relacionados">
                  <div className="quick-view-related-heading">
                    <span className="eyebrow">COMPLETE A ERA</span>
                    <span>Peças relacionadas</span>
                  </div>
                  <div className="quick-view-related-grid">
                    {relatedProducts.map((product) => (
                      <button
                        type="button"
                        className="quick-view-related-card"
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedSize(product.sizes[0] ?? "");
                        }}
                        aria-label={`Ver ${product.name}`}
                      >
                        <span className="quick-view-related-image"><img src={product.image} alt="" /></span>
                        <span className="quick-view-related-copy"><strong>{product.name}</strong><span>{formatPrice(product.price)}</span></span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
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
