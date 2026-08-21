import { useEffect, useState, useMemo, useReducer, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
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
  Ruler,
  ShieldCheck,
  Truck,
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
import { ERAS_VIP_WHATSAPP_URL } from "../../../shared/const";
import { categoryPath, collectionPath, uniqueCatalogLabels } from "@/lib/catalog-routes";
import type { StorefrontConfig } from "../../../shared/storefront";
import { hasStorefrontAnnouncement } from "../../../shared/storefront-logic";
import { checkoutFlowReducer, initialCheckoutFlowState } from "@/lib/checkout-flow";
import { createOrderSummary, type OrderSummary } from "@/lib/order-summary";
import { saveCheckoutDraft } from "@/lib/checkout-draft";
import { filterStorefrontProducts, getStorefrontFilterOptions } from "@/lib/storefront-filters";
import { getSearchSuggestionText, searchStorefrontProducts, sortSoldOutLast, sortStorefrontProducts, type StorefrontSearchSort } from "@/lib/storefront-search";
import { clearRecentSearches, loadRecentSearches, removeRecentSearch, saveRecentSearch } from "@/lib/recent-searches";
import OfficialFooter from "@/components/OfficialFooter";
import PublicProductCard from "@/components/PublicProductCard";
import PublicProductPurchaseButton from "@/components/PublicProductPurchaseButton";
import { getPublicProductCardState } from "@/lib/product-card-state";
import { SidebarMenu } from "@/components/SidebarMenu";
import { getUpcomingPublishedEvents, parseCmsContent } from "@shared/cms";

type Category = string;
type SearchFilterKey = "query" | "category" | "price" | "size" | "sort";
type Product = {
  id: number;
  slug?: string | null;
  name: string;
  category: Category;
  categoryNames?: string[];
  images?: string[];
  collection: string;
  color: string;
  price: number;
  pixPrice: number;
  promotionalPrice?: number | null;
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
type HomeProductSection = { id: string; eyebrow?: string; title: string; description?: string; productIds: number[] };
type VipBanner = { eyebrow: string; title: string; subtitle: string; imageUrl: string; href: string; cta: string };
type HomeSectionTitles = { highlights?: string; shop?: string; community?: string };

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

function mapCatalogProduct(row: { id: number; slug?: string | null; name: string; collection: string; category: string; categoryNames?: string[]; categoryIds?: number[]; color?: string | null; price: unknown; pixPrice: unknown; promotionalPrice?: unknown; description: string | null; images: unknown; status: string; createdAt?: string | Date | null; variations?: Array<{ size: string; stock: number | null }> }): Product {
  const images = Array.isArray(row.images) ? row.images.filter((image): image is string => typeof image === "string") : [];
  const fallbackImage = editorialImage;
  const category = row.category?.trim() || "Sem categoria";
  const categoryNames = Array.from(new Set([category, ...(row.categoryNames ?? [])].filter(Boolean)));
  const availableVariations = (row.variations ?? []).filter((variation) => Number(variation.stock ?? 0) > 0);
  const variationSizes = Array.from(new Set(availableVariations.map((variation) => variation.size).filter(Boolean)));
  const sizes = variationSizes.length > 0 ? variationSizes : category === "Bonés" ? ["Único"] : ["P", "M", "G", "GG"];
  const variationStock = (row.variations ?? []).reduce((sum, variation) => sum + Math.max(0, Number(variation.stock ?? 0)), 0);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category,
    categoryNames,
    images,
    collection: row.collection,
    color: row.color?.trim() || inferProductColor(row.name),
    price: Number(row.price),
    pixPrice: Number(row.pixPrice),
    promotionalPrice: row.promotionalPrice !== null && row.promotionalPrice !== undefined ? Number(row.promotionalPrice) : null,
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

function AnnouncementBar({ config }: { config?: StorefrontConfig }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const messages = config?.announcement.messages ?? [];
  const rotationSeconds = config?.announcement.rotationSpeedSeconds ?? 5;
  const showArrows = config?.announcement.showArrows ?? true;

  useEffect(() => {
    if (messages.length <= 1) return;
    const intervalMs = Math.max(2000, rotationSeconds * 1000);
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % messages.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [messages.length, rotationSeconds]);

  useEffect(() => {
    if (activeIndex >= messages.length) setActiveIndex(0);
  }, [activeIndex, messages.length]);

  if (!config || !hasStorefrontAnnouncement(config) || messages.length === 0) return null;

  const message = messages[activeIndex % messages.length];
  const style = { backgroundColor: config.announcement.backgroundColor, color: config.announcement.textColor };
  const content = (
    <span 
      className="pix-strip-content" 
      key={`${activeIndex}-${message.id || message.text}`}
      style={{
        display: "inline-block",
        animation: "fadeInAnnouncement 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards",
      }}
    >
      {message.text}
    </span>
  );

  return (
    <div className="pix-strip-wrapper" style={{ ...style, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {showArrows && messages.length > 1 && (
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); setActiveIndex((current) => (current - 1 + messages.length) % messages.length); }} 
          style={{ background: 'transparent', border: 'none', color: config.announcement.textColor, cursor: 'pointer', padding: '0 1rem', fontSize: '1rem', opacity: 0.8, zIndex: 2 }}
          aria-label="Anúncio anterior"
        >
          ‹
        </button>
      )}

      {message.href.trim() ? (
        message.href.startsWith("/") ? (
          <Link href={message.href} className="pix-strip" style={{ ...style, flex: 1, textAlign: 'center' }} aria-label={message.text}>{content}</Link>
        ) : (
          <a href={message.href} className="pix-strip" style={{ ...style, flex: 1, textAlign: 'center' }} target="_blank" rel="noreferrer" aria-label={message.text}>{content}</a>
        )
      ) : (
        <div className="pix-strip" style={{ ...style, flex: 1, textAlign: 'center' }} aria-live="polite">{content}</div>
      )}

      {showArrows && messages.length > 1 && (
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); setActiveIndex((current) => (current + 1) % messages.length); }} 
          style={{ background: 'transparent', border: 'none', color: config.announcement.textColor, cursor: 'pointer', padding: '0 1rem', fontSize: '1rem', opacity: 0.8, zIndex: 2 }}
          aria-label="Próximo anúncio"
        >
          ›
        </button>
      )}
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState<Category>("Todos");
  const [sizeFilter, setSizeFilter] = useState("Todos");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searchSort, setSearchSort] = useState<StorefrontSearchSort>("newest");
  const [cart, setCart] = useState<CartLine[]>(() => loadCart<CartLine>());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState(0);
  // Controla a abertura do guia de tamanhos sem retirar o cliente do contexto da peça.
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
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
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);
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
  const { data: storefrontConfig } = trpc.catalog.getStorefrontConfig.useQuery();
  const { data: homeContent } = trpc.catalog.getHomeContent.useQuery();
  const { data: eventsPage } = trpc.catalog.getCmsPage.useQuery({ slug: "events" });
  const { data: catalogRows = [] } = trpc.catalog.list.useQuery();
  const { data: publicCategories = [] } = trpc.catalog.categories.useQuery();
  const products = useMemo<Product[]>(() => catalogRows.map(mapCatalogProduct), [catalogRows]);
  const categoryOptions = useMemo(() => {
    const configured = publicCategories.map((item) => item.name).filter((name): name is string => Boolean(name && name.trim()));
    const derived = products.flatMap((product) => product.categoryNames ?? [product.category]).filter(Boolean);
    return ["Todos", ...uniqueCatalogLabels([...configured, ...derived])];
  }, [products, publicCategories]);
  const collectionOptions = useMemo(() => uniqueCatalogLabels(products.map((product) => product.collection)), [products]);
  const banners = (homeContent?.banners?.length ? homeContent.banners : fallbackBanners) as HomeBanner[];
  const homeProductSections = useMemo<HomeProductSection[]>(() => {
    const configured = Array.isArray(homeContent?.productSections) ? homeContent.productSections as HomeProductSection[] : [];
    return configured.map((section) => ({
      ...section,
      productIds: Array.isArray(section.productIds) ? section.productIds.filter((productId) => products.some((product) => product.id === productId)) : [],
    })).filter((section) => section.title.trim() && section.productIds.length > 0);
  }, [homeContent?.productSections, products]);
  const vipBanner = (homeContent?.vipBanner ?? fallbackVipBanner) as VipBanner;
  // O CMS pode renomear cada bloco; os valores abaixo preservam uma apresentação segura durante o carregamento.
  const sectionTitles = {
    highlights: homeContent?.sectionTitles?.highlights?.trim() || "Destaques",
    shop: homeContent?.sectionTitles?.shop?.trim() || "Produtos da Era",
    community: homeContent?.sectionTitles?.community?.trim() || "Visto fora do estúdio.",
  } satisfies Required<HomeSectionTitles>;
  const upcomingEvents = useMemo(() => getUpcomingPublishedEvents(parseCmsContent(eventsPage?.content, "events").events ?? []), [eventsPage?.content]);
  const currentBanner = banners[activeBanner % banners.length] ?? fallbackBanners[0];
  const pixDiscountPercent = commercialConfig?.pixDiscountPercent ?? 5;
  const freeShippingThreshold = commercialConfig?.freeShippingThreshold ?? 350;

  const checkoutMutation = trpc.checkout.create.useMutation();

  const { sizes: availableSizes } = useMemo(() => getStorefrontFilterOptions(products), [products]);
  const normalizedMinPrice = Number.parseFloat(priceMin.replace(",", "."));
  const normalizedMaxPrice = Number.parseFloat(priceMax.replace(",", "."));
  const filteredProducts = useMemo(() => {
    const filterResults = filterStorefrontProducts(products, {
      category,
      size: sizeFilter,
      minPrice: Number.isFinite(normalizedMinPrice) ? normalizedMinPrice : undefined,
      maxPrice: Number.isFinite(normalizedMaxPrice) ? normalizedMaxPrice : undefined,
    });
    const searchedProducts = searchStorefrontProducts(filterResults, searchQuery);
    return searchQuery.trim() ? sortStorefrontProducts(searchedProducts, searchSort) : searchedProducts;
  }, [category, normalizedMaxPrice, normalizedMinPrice, products, searchQuery, searchSort, sizeFilter]);
  const searchSuggestions = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
  const activeSearchFilters = useMemo(() => {
    const filters: Array<{ key: SearchFilterKey; label: string }> = [];
    if (searchQuery.trim()) filters.push({ key: "query", label: `Pesquisa: ${searchQuery.trim()}` });
    if (category !== "Todos") filters.push({ key: "category", label: `Categoria: ${category}` });
    if (priceMin.trim() || priceMax.trim()) filters.push({ key: "price", label: `Preço: ${priceMin || "0"}–${priceMax || "∞"}` });
    if (sizeFilter !== "Todos") filters.push({ key: "size", label: `Tamanho: ${sizeFilter}` });
    if (searchQuery.trim() && searchSort !== "newest") filters.push({ key: "sort", label: `Ordenação: ${searchSort === "price-asc" ? "menor preço" : "maior preço"}` });
    return filters;
  }, [category, priceMax, priceMin, searchQuery, searchSort, sizeFilter]);
  const hasAdvancedFilters = sizeFilter !== "Todos" || Boolean(priceMin.trim() || priceMax.trim());
  function clearSearchCriterion(key: SearchFilterKey) {
    if (key === "query") setSearchQuery("");
    if (key === "category") setCategory("Todos");
    if (key === "price") { setPriceMin(""); setPriceMax(""); }
    if (key === "size") setSizeFilter("Todos");
    if (key === "sort") setSearchSort("newest");
    setActiveSearchSuggestion(-1);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }
  function clearAllSearchCriteria() {
    setSearchQuery("");
    setCategory("Todos");
    setSizeFilter("Todos");
    setPriceMin("");
    setPriceMax("");
    setSearchSort("newest");
    setActiveSearchSuggestion(-1);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }
  function clearShopFilters() {
    setCategory("Todos");
    setSizeFilter("Todos");
    setPriceMin("");
    setPriceMax("");
    setSearchSort("newest");
  }

  function revealSearch() {
    playClick(soundsOn);
    setIsSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function recordRecentSearch(query: string) {
    const next = saveRecentSearch(query);
    setRecentSearches(next);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suggestion = searchSuggestions[activeSearchSuggestion];
    if (suggestion) {
      recordRecentSearch(suggestion.name);
      openProduct(suggestion);
      setIsSearchOpen(false);
      setActiveSearchSuggestion(-1);
      return;
    }
    if (searchQuery.trim()) recordRecentSearch(searchQuery);
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
    recordRecentSearch(product.name);
    setSearchQuery(product.name);
    setActiveSearchSuggestion(-1);
    setIsSearchOpen(false);
    openProduct(product);
  }

  function chooseRecentSearch(query: string) {
    playClick(soundsOn);
    setSearchQuery(query);
    setActiveSearchSuggestion(-1);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function deleteRecentSearch(query: string) {
    playClick(soundsOn);
    setRecentSearches(removeRecentSearch(query));
  }

  function clearSearchHistory() {
    playClick(soundsOn);
    clearRecentSearches();
    setRecentSearches([]);
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
  const quickViewImages = selectedProduct
    ? (selectedProduct.images?.length ? selectedProduct.images : [selectedProduct.image])
    : [];
  const activeQuickViewImage = quickViewImages[selectedProductImage] ?? selectedProduct?.image ?? "";
  const cartCount = getCartItemCount(cart);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Preserva o valor exato devolvido pela validação, sem reconstruir um percentual fixo.
  const discount = couponApplied ? couponDiscount : 0;
  const shippingItems = useMemo(
    () => cart.map((item) => ({ id: String(item.id), price: Number(item.price), quantity: item.quantity })),
    [cart],
  );
  const shippingQueryInput = useMemo(
    () => ({ cep: shippingCep, subtotal, items: shippingItems }),
    [shippingCep, shippingItems, subtotal],
  );

  const { data: shippingData, isLoading: shippingLoading, error: shippingError } = trpc.catalog.calculateShipping.useQuery(
    shippingQueryInput,
    { enabled: shippingCep.length === 8 && shippingItems.length > 0 }
  );
  const shippingOptions = shippingData?.options ?? [];
  const [selectedShippingId, setSelectedShippingId] = useState("");
  const activeShippingOption = shippingOptions.find((option) => option.id === selectedShippingId) ?? shippingOptions[0];

  const shippingCost = activeShippingOption?.free || couponFreeShipping ? 0 : Number(activeShippingOption?.cost ?? 0);
  const total = subtotal - discount + shippingCost;
  const checkoutFeedback = getCheckoutFeedback(checkoutStatus, confirmedOrderNumber, checkoutError);

  useEffect(() => {
    if (!shippingData) {
      setSelectedShippingId("");
      return;
    }
    setSelectedShippingId((current) => shippingOptions.some((option) => option.id === current) ? current : (shippingOptions[0]?.id ?? ""));
  }, [shippingData]);

  useEffect(() => {
    saveCart(cart);
    window.dispatchEvent(new Event("eras-cart-updated"));
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
  }, [isSearchOpen, priceMax, priceMin, searchQuery, searchSort, sizeFilter]);

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

  useEffect(() => {
    // Mantém o cálculo do parallax fora do React para evitar renders a cada pixel de scroll.
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const parallaxElements = Array.from(document.querySelectorAll<HTMLElement>(".home-main [data-parallax]"));
    let frameId: number | null = null;

    const applyParallax = () => {
      frameId = null;
      const isCompactViewport = window.innerWidth < 768;
      const viewportCenter = window.innerHeight * 0.5;

      parallaxElements.forEach((element) => {
        // O movimento respeita a acessibilidade, mas continua ativo no mobile com amplitude reduzida.
        if (mediaQuery.matches) {
          element.style.setProperty("--parallax-y", "0px");
          return;
        }

        // Usar o pai não transformado impede um feedback visual em que o próprio deslocamento
        // altera o próximo cálculo e faz a imagem parecer estática ou vibrar.
        const referenceRect = element.parentElement?.getBoundingClientRect() ?? element.getBoundingClientRect();
        const desktopSpeed = Number(element.dataset.parallaxSpeed ?? "0.14");
        const mobileSpeed = Number(element.dataset.parallaxMobileSpeed ?? "0.04");
        const speed = isCompactViewport ? mobileSpeed : desktopSpeed;
        const limit = isCompactViewport ? 26 : 88;

        // O hero reage diretamente à distância rolada, deixando a diferença visível desde os
        // primeiros pixels. O banner VIP usa a posição no viewport para não se mover enquanto
        // está fora da área visual e entrar suavemente quando o cliente se aproxima dele.
        const rawOffset = element.dataset.parallax === "hero"
          ? window.scrollY * speed
          : (viewportCenter - (referenceRect.top + referenceRect.height * 0.5)) * speed;
        const offset = Math.max(-limit, Math.min(limit, rawOffset));
        element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      });
    };

    const scheduleParallax = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(applyParallax);
    };

    applyParallax();
    window.addEventListener("scroll", scheduleParallax, { passive: true });
    window.addEventListener("resize", scheduleParallax);
    mediaQuery.addEventListener?.("change", scheduleParallax);

    return () => {
      window.removeEventListener("scroll", scheduleParallax);
      window.removeEventListener("resize", scheduleParallax);
      mediaQuery.removeEventListener?.("change", scheduleParallax);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      parallaxElements.forEach((element) => element.style.removeProperty("--parallax-y"));
    };
  }, []);

  function openProduct(product: Product) {
    playClick(soundsOn);
    setSelectedProduct(product);
    setSelectedProductImage(0);
    setSelectedSize(product.sizes[0] ?? "");
    setSizeGuideOpen(false);
  }

  // Exibe uma referência de modelagem apenas como orientação; a disponibilidade vem sempre do inventário real.
  function getSizeGuideRows(product: Product) {
    if (product.category === "Bonés") return [{ size: "Único", width: "Ajustável", length: "Circunferência regulável" }];
    return [
      { size: "PP", width: "50–52 cm", length: "66–68 cm" },
      { size: "P", width: "52–54 cm", length: "68–70 cm" },
      { size: "M", width: "54–56 cm", length: "70–72 cm" },
      { size: "G", width: "56–58 cm", length: "72–74 cm" },
      { size: "GG", width: "58–60 cm", length: "74–76 cm" },
    ].filter((row) => product.sizes.includes(row.size));
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
      window.dispatchEvent(new Event("eras-open-cart"));
      addedProductTimeoutRef.current = null;
    }, 620);
    toast.success("Adicionado à sacola", { description: `${product.name} · tamanho ${size}`, duration: 2200 });
  }

  function goToCheckout() {
    playClick(soundsOn);
    // A Home usa o mesmo contrato da sacola global para não perder validações ao abrir o checkout.
    saveCheckoutDraft({
      coupon,
      couponApplied: couponApplied === true,
      couponDiscount,
      couponFreeShipping,
      selectedPaymentMethod,
      shippingCep,
      shippingMethod: activeShippingOption?.service,
      shippingOptionId: activeShippingOption?.id,
      shippingCost,
      shippingDeadline: activeShippingOption?.deadline,
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

  const couponValidateQuery = trpc.coupons.validate.useQuery(
    { code: coupon.trim(), subtotal },
    { enabled: false }
  );

  async function applyCoupon() {
    playClick(soundsOn);
    if (!coupon.trim()) {
      toast.error("Digite o código do cupom.");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await couponValidateQuery.refetch();
      setCouponLoading(false);
      if (result.data?.valid && (Number(result.data.discount ?? 0) > 0 || result.data.freeShipping)) {
        const amount = Math.max(0, Number(result.data.discount ?? 0));
        setCouponApplied(true);
        setCouponDiscount(amount);
        setCouponFreeShipping(result.data.freeShipping === true);
        toast.success(result.data.freeShipping === true ? "Cupom aplicado: frete grátis ativado." : `Cupom ${coupon.trim().toUpperCase()} aplicado: R$ ${amount.toFixed(2)} de desconto.`);
      } else {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponFreeShipping(false);
        toast.error("Cupom inválido, expirado ou valor mínimo não atingido.");
      }
    } catch {
      setCouponLoading(false);
      setCouponApplied(false);
      setCouponDiscount(0);
      setCouponFreeShipping(false);
      toast.error("Erro ao validar o cupom. Tente novamente.");
    }
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
      shippingMethod: activeShippingOption?.service,
      couponCode: couponApplied && coupon.trim() ? coupon.trim() : undefined,
      shippingOptionId: activeShippingOption?.id || undefined,
      clientTotal: Number(total.toFixed(2)),
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
      {false && <header className={`site-header ${isHeaderVisible ? "is-visible" : "is-hidden"}`}>
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
              {collectionOptions.length > 0 ? collectionOptions.map((collection) => (
                <Link key={collection} role="menuitem" href={collectionPath(collection)} onClick={() => { playClick(soundsOn); setCollectionsOpen(false); }}>{collection.toUpperCase()} <span>↗</span></Link>
              )) : <span className="collections-empty">Nenhuma coleção publicada</span>}
            </div>}
          </div>
          <Link href={categoryPath("Camisetas")} onClick={() => playClick(soundsOn)}>CAMISETAS</Link>
          <Link href={categoryPath("Bonés")} onClick={() => playClick(soundsOn)}>BONÉS</Link>
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
                placeholder="Pesquisar peças, coleções ou tamanhos"
                aria-label="Pesquisar peças, coleções ou tamanhos"
                aria-autocomplete="list"
                aria-controls="eras-search-suggestions"
                aria-activedescendant={activeSearchSuggestion >= 0 ? `eras-search-suggestion-${activeSearchSuggestion}` : undefined}
                autoComplete="off"
              />
              {searchQuery && <button className="header-search-clear" type="button" aria-label="Limpar pesquisa" onClick={() => { setSearchQuery(""); setActiveSearchSuggestion(-1); searchInputRef.current?.focus(); }}>×</button>}
              {(searchQuery.trim() || recentSearches.length > 0) && (
                <div className="header-search-results" id="eras-search-suggestions" aria-label={searchQuery.trim() ? "Resultados da pesquisa" : "Pesquisas recentes"}>
                  {searchQuery.trim() ? <>
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
                    <label className="header-search-price-range">
                      <span>Preço</span>
                      <div className="price-inputs">
                        <input inputMode="decimal" type="text" value={priceMin} onChange={(event) => setPriceMin(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="Mínimo" aria-label="Preço mínimo da pesquisa" />
                        <input inputMode="decimal" type="text" value={priceMax} onChange={(event) => setPriceMax(event.target.value.replace(/[^0-9,.]/g, ""))} placeholder="Máximo" aria-label="Preço máximo da pesquisa" />
                      </div>
                    </label>
                    <label>
                      <span>Tamanho</span>
                      <select value={sizeFilter} onChange={(event) => { playClick(soundsOn); setSizeFilter(event.target.value); }} aria-label="Filtrar pesquisa por tamanho">
                        <option value="Todos">Todos</option>
                        {availableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
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
                      <span>Tente outro nome, coleção, tamanho ou categoria.</span>
                      {activeSearchFilters.length > 0 && <button type="button" onClick={() => { playClick(soundsOn); clearAllSearchCriteria(); }}>Limpar filtros da pesquisa</button>}
                    </div>
                  )}
                  </> : (
                    <div className="header-search-recent" aria-label="Pesquisas recentes">
                      <div className="header-search-results-heading">
                        <span>PESQUISAS RECENTES</span>
                        <button type="button" onClick={clearSearchHistory}>Limpar histórico</button>
                      </div>
                      <div className="header-search-recent-list" role="listbox" aria-label="Pesquisas recentes">
                        {recentSearches.map((recentSearch) => (
                          <div className="header-search-recent-item" key={recentSearch} role="option">
                            <button type="button" onClick={() => chooseRecentSearch(recentSearch)}>
                              <Clock3 size={14} aria-hidden="true" />
                              <span>{recentSearch}</span>
                              <ArrowRight size={14} aria-hidden="true" />
                            </button>
                            <button type="button" className="header-search-recent-remove" aria-label={`Remover pesquisa ${recentSearch}`} onClick={() => deleteRecentSearch(recentSearch)}><X size={13} aria-hidden="true" /></button>
                          </div>
                        ))}
                      </div>
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
          <button className="bag-button" aria-label={`Abrir sacola${cartCount > 0 ? ` com ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : " vazia"}`} onClick={() => { playClick(soundsOn); window.dispatchEvent(new Event("eras-open-cart")); }}>
            SACOLA {cartCount > 0 && <span key={cartCount} className="bag-badge" aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
      </header>}

      <main className="home-main">
        <section className="home-hero" aria-label="Destaque da Eras Label">
          <div className="home-hero-media" data-parallax="hero" data-parallax-speed="0.18" data-parallax-mobile-speed="0.045" style={{ backgroundImage: `url(${currentBanner.imageUrl})` }} />
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

        <section className="shop-section home-curated-shop" id="shop" aria-label="Shop curado pela Eras Label">
          <div className="home-shop-intro">
            <span className="section-kicker">ERAS LABEL</span>
            <h2>SHOP</h2>
            <p>Peças selecionadas para a próxima era.</p>
          </div>
          {homeProductSections.length === 0 ? (
            <div className="shop-empty-state home-curated-empty" role="status">
              <span className="section-kicker">SHOP</span>
              <h2>A próxima era começa aqui.</h2>
              <p>As secções da Home serão publicadas pelo administrador assim que a curadoria estiver pronta.</p>
            </div>
          ) : homeProductSections.map((section, sectionIndex) => (
            <div className="home-product-section" key={section.id}>
              <div className="section-heading">
                <div><span className="section-kicker">{section.eyebrow?.trim() || `${String(sectionIndex + 1).padStart(2, "0")} / SHOP`}</span><h2>{section.title}</h2>{section.description && <p className="home-product-section-description">{section.description}</p>}</div>
                <a className="text-link" href="/catalog" onClick={() => playClick(soundsOn)}>VER SHOP <ArrowRight size={14} /></a>
              </div>
              <div className="product-grid editorial-product-grid home-curated-grid">
                {sortSoldOutLast(section.productIds.map((productId) => products.find((item) => item.id === productId)).filter((product): product is Product => Boolean(product))).slice(0, 8).map((product) => {
                  const cardState = getPublicProductCardState(product);
                  return (
                    <PublicProductCard
                      key={`${section.id}-${product.id}`}
                      product={product}
                      variant="home"
                      primaryImage={product.image}
                      secondaryImage={cardState.secondaryImage}
                      fallbackImage={product.fallbackImage}
                      onOpen={() => openProduct(product)}
                      mediaOverlay={(
                        <>
                          {product.promotionalPrice !== null && product.promotionalPrice !== undefined && product.promotionalPrice > 0 && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#b22222', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: '3px', textTransform: 'uppercase', zIndex: 2, letterSpacing: '0.08em' }}>
                              {Math.round((1 - product.promotionalPrice / product.price) * 100)}% OFF
                            </span>
                          )}
                          <span className="quick-view-label">VISUALIZAÇÃO RÁPIDA</span>
                          <span className="product-arrow"><ArrowRight size={15} /></span>
                        </>
                      )}
                    >
                      <div className="product-meta">
                        <div>
                          <a href={`/produto/${product.slug || product.id}`} className="product-name-link" onClick={(event) => { event.preventDefault(); playClick(soundsOn); window.location.href = `/produto/${product.slug || product.id}`; }}>{product.name}</a>
                          <p className="product-collection">{product.collection}</p>
                        </div>
                        <div className="product-price">
                          {product.promotionalPrice !== null && product.promotionalPrice !== undefined && product.promotionalPrice > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <strong style={{ color: '#b22222' }}>{formatPrice(product.promotionalPrice)}</strong>
                                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8rem', fontWeight: 500 }}>{formatPrice(product.price)}</span>
                              </div>
                              <span>{formatPrice(product.pixPrice)} NO PIX</span>
                            </div>
                          ) : (
                            <>
                              <strong>{formatPrice(product.price)}</strong>
                              <span>{formatPrice(product.pixPrice)} NO PIX</span>
                            </>
                          )}
                        </div>
                      </div>
                    </PublicProductCard>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Prova social ética: encaminha para publicações reais da conta oficial, sem inventar avaliações ou testemunhos. */}
        <section className="community-proof-section" aria-labelledby="community-proof-title">
          <div className="community-proof-copy">
            <span className="section-kicker">03 / ERAS NA RUA</span>
            <h2 id="community-proof-title">{sectionTitles.community}</h2>
            <p>Descubra como a comunidade está a usar as peças Eras Label. As publicações e marcações são sempre reais e podem ser vistas no perfil oficial.</p>
            <a className="text-link" href="https://www.instagram.com/eraslabel/" target="_blank" rel="noreferrer" onClick={() => playClick(soundsOn)}>VER NO INSTAGRAM <ArrowRight size={14} /></a>
          </div>
          <div className="community-proof-grid" aria-label="Compromissos da experiência Eras Label">
            <article><ShieldCheck size={20} strokeWidth={1.5} /><strong>COMPRA PROTEGIDA</strong><span>Pix e cartão processados com segurança pelo Mercado Pago.</span></article>
            <article><Truck size={20} strokeWidth={1.5} /><strong>ENVIO ACOMPANHADO</strong><span>Receba o código de rastreio assim que o pedido for despachado.</span></article>
            <article><Instagram size={20} strokeWidth={1.5} /><strong>CONTEÚDO REAL</strong><span>Marque @eraslabel para aparecer nas próximas eras.</span></article>
          </div>
        </section>

        {upcomingEvents.length > 0 && (
          <section className="home-events-preview" aria-labelledby="home-events-title">
            <div className="section-heading">
              <div><span className="section-kicker">04 / ENCONTROS</span><h2 id="home-events-title">Próximos encontros</h2></div>
              <a className="text-link" href="/events" onClick={() => playClick(soundsOn)}>VER AGENDA <ArrowRight size={14} /></a>
            </div>
            <div className="home-events-list">
              {upcomingEvents.slice(0, 3).map((event) => (
                <article className="home-event-row" key={event.id}>
                  <div className="home-event-date"><span>{event.date}</span>{event.location && <small>{event.location}</small>}</div>
                  <div className="home-event-copy"><h3>{event.title}</h3><p>{event.description}</p></div>
                  {event.ctaUrl && <a className="home-event-link" href={event.ctaUrl} target={/^https?:\/\//i.test(event.ctaUrl) ? "_blank" : undefined} rel={/^https?:\/\//i.test(event.ctaUrl) ? "noreferrer" : undefined} onClick={() => playClick(soundsOn)}>{event.ctaLabel || "Saiba mais"} <ArrowRight size={14} /></a>}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="vip-home-banner" aria-label="Grupo VIP">
          <a href={vipBanner.href} target={vipBanner.href.startsWith("http") ? "_blank" : undefined} rel={vipBanner.href.startsWith("http") ? "noreferrer" : undefined} onClick={() => playClick(soundsOn)}>
            <div className="vip-home-media" data-parallax="vip" data-parallax-speed="0.13" data-parallax-mobile-speed="0.035" style={{ backgroundImage: `url(${vipBanner.imageUrl})` }} />
            <div className="vip-home-overlay" />
            <div className="vip-home-content"><span>{vipBanner.eyebrow}</span><h2>{vipBanner.title}</h2><p>{vipBanner.subtitle}</p><strong>{vipBanner.cta} <ArrowRight size={15} /></strong></div>
          </a>
        </section>
      </main>

      {showBackToTop && <button className="back-to-top" aria-label="Voltar ao topo" onClick={() => { playClick(soundsOn); window.scrollTo({ top: 0, behavior: "smooth" }); }}><ArrowDown size={17} /></button>}

      <section className="newsletter-section" aria-labelledby="newsletter-title">
        <div className="newsletter-inner">
          <div className="newsletter-copy">
            <span className="section-kicker">NEWSLETTER ERAS</span>
            <h2 id="newsletter-title">Seja avisado antes.</h2>
            <p>Receba primeiro os próximos drops, encontros e experiências da Eras Label. Sem ruído, apenas o que importa.</p>
            <span className="newsletter-note">SEM SPAM · CANCELAMENTO A QUALQUER MOMENTO</span>
          </div>
          {newsletterSuccess ? (
            <div className="newsletter-success" role="status" aria-live="polite">
              <span className="newsletter-success-mark">✓</span>
              <strong>Inscrição confirmada.</strong>
              <p>{newsletterSuccess}</p>
              <Button type="button" onClick={() => setNewsletterSuccess(null)} variant="outline">Subscrever outro e-mail</Button>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <label>
                <span>Nome <em>opcional</em></span>
                <Input type="text" placeholder="O seu nome" value={newsletterName} onChange={(e) => setNewsletterName(e.target.value)} />
              </label>
              <label>
                <span>E-mail</span>
                <Input type="email" required placeholder="O seu melhor e-mail" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} />
              </label>
              <Button type="submit" disabled={newsletterSubmitting}>
                {newsletterSubmitting ? <><span className="spinner-mini" /> A subscrever...</> : <>ENTRAR NA ERA <ArrowRight size={16} /></>}
              </Button>
            </form>
          )}
        </div>
      </section>

      <OfficialFooter onInteraction={() => playClick(soundsOn)} />

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
                <button className="primary-button" onClick={() => { setIsCartOpen(false); window.location.href = "/catalog"; }}>EXPLORAR PRODUTOS</button>
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
                        onChange={(event) => { setCoupon(event.target.value); setCouponApplied(null); setCouponDiscount(0); setCouponFreeShipping(false); }}
                        placeholder="Insira seu cupom"
                        disabled={couponLoading}
                        aria-label="Código do cupom"
                      />
                      <button type="button" className="coupon-apply-btn cart-inline-confirm" onClick={applyCoupon} disabled={couponLoading} aria-label={couponLoading ? "Validando cupom" : "Confirmar cupom"}>
                        {couponLoading ? <Loader2 size={16} className="spinner-icon" /> : <><Check size={15} /><span>OK</span></>}
                      </button>
                    </div>
                    {couponApplied === true && <p className="coupon-feedback success"><Check size={14} /> {couponFreeShipping ? "Frete grátis ativado." : "Cupom aplicado com sucesso."}</p>}
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
                      <button type="button" className="coupon-apply-btn cart-inline-confirm" onClick={() => { playClick(soundsOn); setShippingCep(cepInput); }} disabled={cepInput.length !== 8} aria-label="Confirmar CEP">
                        <Check size={15} /><span>OK</span>
                      </button>
                    </div>
                    {shippingLoading && <p className="shipping-info-text">Calculando opções de frete reais...</p>}
                    {shippingError && !shippingLoading && <p className="shipping-info-text error">{shippingError.message || "Não foi possível calcular o frete para este CEP."}</p>}
                    {shippingData && !shippingLoading && (
                      <div className="shipping-options" role="radiogroup" aria-label="Escolha o método de frete">
                        <span className="shipping-options-label">Escolha o frete</span>
                        {shippingOptions.map((option) => (
                          <label className={`shipping-option ${activeShippingOption?.id === option.id ? "is-selected" : ""}`} key={option.id}>
                            <input type="radio" name="home-shipping-option" value={option.id} checked={activeShippingOption?.id === option.id} onChange={() => setSelectedShippingId(option.id)} />
                            <span className="shipping-option-copy"><strong>{option.service}</strong><small>{option.deadline}</small></span>
                            <strong className="shipping-option-price">{option.free || couponFreeShipping ? "Grátis" : formatPrice(Number(option.cost ?? 0))}</strong>
                          </label>
                        ))}
                      </div>
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
                    <div className="cart-total-row"><span>{activeShippingOption?.service ?? "Frete"}</span><strong>{shippingData ? (shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)) : "A calcular"}</strong></div>
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
            <div className="quick-view-gallery">
              <div className="modal-image">
                <img src={activeQuickViewImage} alt={`${selectedProduct.alt} — imagem ${selectedProductImage + 1} de ${quickViewImages.length}`} onError={(event) => {
                  if (!selectedProduct.fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
                  event.currentTarget.dataset.fallbackApplied = "true";
                  event.currentTarget.src = selectedProduct.fallbackImage;
                }} />
                {quickViewImages.length > 1 && <>
                  <button type="button" className="quick-view-gallery-control quick-view-gallery-control-prev" onClick={() => setSelectedProductImage((current) => (current - 1 + quickViewImages.length) % quickViewImages.length)} aria-label="Ver imagem anterior"><ChevronLeft size={20} /></button>
                  <button type="button" className="quick-view-gallery-control quick-view-gallery-control-next" onClick={() => setSelectedProductImage((current) => (current + 1) % quickViewImages.length)} aria-label="Ver próxima imagem"><ChevronRight size={20} /></button>
                  <span className="quick-view-gallery-counter" aria-live="polite">{String(selectedProductImage + 1).padStart(2, "0")} / {String(quickViewImages.length).padStart(2, "0")}</span>
                </>}
              </div>
              {quickViewImages.length > 1 && <div className="quick-view-gallery-thumbnails" role="tablist" aria-label="Selecionar imagem do produto">
                {quickViewImages.map((image, index) => <button key={`${image}-${index}`} type="button" role="tab" aria-selected={selectedProductImage === index} onClick={() => setSelectedProductImage(index)} className={selectedProductImage === index ? "active" : ""} aria-label={`Ver imagem ${index + 1}`}><img src={image} alt="" /></button>)}
              </div>}
            </div>
            <div className="modal-copy">
              <span className="eyebrow">{selectedProduct.collection}</span>
              <h2 id="quick-view-title">{selectedProduct.name}</h2>
              <p className="modal-price">{formatPrice(selectedProduct.price)}</p>
              <p className="modal-detail-text">{selectedProduct.detail}</p>
              <div className="modal-availability-row">
                <span className={`availability-badge ${selectedProduct.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                  {selectedProduct.stock > 0 ? `Disponível em estoque (${selectedProduct.stock} unidades)` : "Esgotado no momento"}
                </span>
                {selectedProduct.stock > 0 && selectedProduct.stock <= 5 && <span className="scarcity-note">Restam apenas {selectedProduct.stock} unidades</span>}
              </div>
              <div className="size-picker">
                <div className="size-picker-heading"><span>TAMANHO</span><button type="button" className="size-guide-trigger" onClick={() => { playClick(soundsOn); setSizeGuideOpen((current) => !current); }} aria-expanded={sizeGuideOpen}><Ruler size={13} /> GUIA DE TAMANHOS</button></div>
                <div>
                  {selectedProduct.sizes.map((size) => (
                    <button key={size} className={selectedSize === size ? "selected" : ""} onClick={() => setSelectedSize(size)} disabled={selectedProduct.stock === 0}>{size}</button>
                  ))}
                </div>
              </div>
              {sizeGuideOpen && (
                <section className="size-guide-panel" aria-label={`Guia de tamanhos para ${selectedProduct.name}`}>
                  <div className="size-guide-heading"><strong>REFERÊNCIA DE MODELAGEM</strong><button type="button" onClick={() => setSizeGuideOpen(false)} aria-label="Fechar guia de tamanhos"><X size={14} /></button></div>
                  <div className="size-guide-table" role="table">
                    <div role="row" className="size-guide-row size-guide-header"><span>TAM.</span><span>LARGURA</span><span>COMPRIMENTO</span></div>
                    {getSizeGuideRows(selectedProduct).map((row) => <div role="row" className="size-guide-row" key={row.size}><span>{row.size}</span><span>{row.width}</span><span>{row.length}</span></div>)}
                  </div>
                  <p>Meça uma peça semelhante sobre uma superfície plana. As medidas são uma referência de modelagem e podem variar ligeiramente entre coleções.</p>
                </section>
              )}
              <PublicProductPurchaseButton
                product={selectedProduct}
                added={addedProductId === selectedProduct.id}
                onPurchase={() => addToCart(selectedProduct, selectedSize)}
              />
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
                          setSelectedProductImage(0);
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
