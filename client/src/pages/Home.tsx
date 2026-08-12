import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  Check,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Category = "Todos" | "Camisetas" | "Bonés";
type Product = {
  id: number;
  name: string;
  category: Exclude<Category, "Todos">;
  collection: string;
  price: number;
  pixPrice: number;
  image: string;
  alt: string;
  sizes: string[];
  stock: number;
  detail: string;
};

type CartLine = Product & { size: string; quantity: number };

const products: Product[] = [
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
const editorialImage = "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=85";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
  const [soundsOn, setSoundsOn] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<boolean | null>(null);
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState<CartLine | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"pix" | "credit_card" | "boleto">("pix");
  const newsletterMutation = trpc.newsletter.subscribe.useMutation();
  const checkoutMutation = trpc.checkout.create.useMutation();

  const filteredProducts = useMemo(
    () => (category === "Todos" ? products : products.filter((product) => product.category === category)),
    [category],
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

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

  function submitNewsletter(event: React.FormEvent) {
    event.preventDefault();
    if (!newsletterName.trim() || !newsletterEmail.includes("@")) {
      toast.error("Preencha nome e e-mail para entrar na lista.");
      return;
    }
    playClick(soundsOn);
    newsletterMutation.mutate({ name: newsletterName.trim(), email: newsletterEmail.trim() }, {
      onSuccess: (result) => {
        setNewsletterSent(true);
        setNewsletterName("");
        setNewsletterEmail("");
        toast.success(`Inscrição realizada. Cupom ${result.couponCode} gerado para si.`);
      },
      onError: () => {
        setNewsletterSent(true);
        toast.success("Inscrição confirmada na lista de espera!");
      }
    });
  }

  function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
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
      shippingCost: 0,
      discount,
      total,
      paymentMethod: selectedPaymentMethod,
    }, {
      onSuccess: (result) => {
        setLoading(false);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setCart([]);
        toast.success(`Pedido ${result.orderNumber} recebido. Confirmação enviada por e-mail.`);
      },
      onError: () => {
        setLoading(false);
        toast.error("Não foi possível criar o pedido. Tente novamente.");
      },
    });
  }

  return (
    <div className="eras-site">
      <div className="pix-strip">5% OFF PARA PAGAMENTOS NO PIX · UMA NOVA ERA COMEÇA AQUI</div>
      <header className="site-header">
        <button className="icon-button" aria-label="Abrir menu lateral" onClick={() => { playClick(soundsOn); setIsMenuOpen(true); }}>
          <Menu size={20} />
        </button>
        <Link href="/" className="brand-mark" onClick={() => playClick(soundsOn)}>ERAS<span>.</span></Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#shop" onClick={() => playClick(soundsOn)}>PRODUTOS</a>
          <a href="#collections" onClick={() => playClick(soundsOn)}>COLEÇÕES</a>
          <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Camisetas"); }}>CAMISETAS</a>
          <a href="#shop" onClick={() => { playClick(soundsOn); setCategory("Bonés"); }}>BONÉS</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label={soundsOn ? "Desativar sons" : "Ativar sons"} onClick={() => setSoundsOn((value) => !value)}>
            {soundsOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <Link href="/auth" className="icon-button" aria-label="Entrar na conta" onClick={() => playClick(soundsOn)}>
            <CircleUserRound size={18} />
          </Link>
          <button className="bag-button" onClick={() => { playClick(soundsOn); setIsCartOpen(true); }}>
            SACOLA {cartCount > 0 && <span className="bag-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,11,10,.58), rgba(11,11,10,.05)), url(${heroImage})` }}>
          <div className="hero-copy">
            <p className="eyebrow">COLEÇÃO EM CURSO · 2026</p>
            <h1>REVIVER.<br /><em>REINVENTAR</em><br />ERAS.</h1>
            <a className="text-link hero-link" href="#shop" onClick={() => playClick(soundsOn)}>VER A ERA ATUAL <ArrowRight size={16} /></a>
          </div>
          <div className="hero-footer"><span>PARADOX COLLECTION</span><span>ROLE <ArrowDown size={15} /></span></div>
        </section>

        <section className="manifesto-section" id="manifesto">
          <div className="section-kicker">01 / MANIFESTO</div>
          <div className="manifesto-grid">
            <h2>Nada é inventado<br /><em>do zero.</em></h2>
            <div>
              <p className="lead-copy">Tudo volta — com outro corpo, outro som, outra cidade.</p>
              <p>Trabalhamos com memória brasileira: som, rua, arquivo familiar, imprensa antiga, gíria. Cada era é um recorte de tempo transformado em roupa — não em fantasia.</p>
              <a className="text-link" href="#archive" onClick={() => playClick(soundsOn)}>LER O MANIFESTO COMPLETO <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="collection-feature" id="collections">
          <div className="feature-image" style={{ backgroundImage: `url(${editorialImage})` }} />
          <div className="feature-copy">
            <p className="eyebrow">A ERA EM CURSO</p>
            <p className="feature-year">2026</p>
            <h2>PARADOX<br /><em>COLLECTION</em></h2>
            <p>Travessia, Dissociação, Ressonador, Vórtex e Time Break. Estar em dois tempos ao mesmo tempo.</p>
            <a className="text-link" href="#shop" onClick={() => playClick(soundsOn)}>EXPLORAR A COLEÇÃO <ArrowRight size={16} /></a>
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div><span className="section-kicker">02 / SHOP</span><h2>A ERA ATUAL</h2></div>
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
                  <img src={product.image} alt={product.alt} />
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

        <section className="archive-section" id="archive">
          <div className="section-kicker">03 / ARQUIVO DE ERAS</div>
          <div className="archive-list">
            {[['2026', 'PARADOX COLLECTION', 'Travessia, Dissociação, Ressonador, Vórtex e Time Break.'], ['2025', 'LOST BETWEEN ERAS', 'Cápsula de headwear com a frase-manifesto bordada em tom sobre tom.'], ['2024', 'RAÍZES — RECIFE & LA URSA', 'O primeiro drop. Recife como origem e o folclore de rua como vocabulário visual.']].map(([year, title, description]) => (
              <a href="#shop" className="archive-row" key={year} onClick={() => playClick(soundsOn)}><span>{year}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight size={18} /></a>
            ))}
          </div>
        </section>

        <section className="events-section" id="events">
          <div className="section-kicker">04 / PRÓXIMOS ENCONTROS</div>
          <div className="events-grid">
            {[['14.08.26', 'LANÇAMENTO PARADOX', 'Recife', 'Bairro do Recife · listening set · lista fechada'], ['27.09.26', 'SESSÃO DE ARQUIVO', 'São Paulo', 'Exibição do editorial + peças de arquivo em exposição'], ['12.11.26', 'LISTENING ROOM', 'Rio de Janeiro', 'Set analógico e apresentação da cápsula de encerramento']].map(([date, title, city, detail]) => (
              <div className="event-card" key={date}><span className="event-date">{date}</span><h3>{title}</h3><p className="event-city">{city}</p><p>{detail}</p></div>
            ))}
          </div>
        </section>

        <section className="newsletter-section" id="contact">
          <div><span className="section-kicker">05 / LISTA DE ESPERA</span><h2>SEJA AVISADO<br /><em>ANTES DA PRÓXIMA ERA.</em></h2></div>
          {newsletterSent ? <div className="newsletter-success"><Check size={25} /><p>A sua inscrição está confirmada.<br />Verifique o e-mail para receber o cupom.</p></div> : <form className="newsletter-form" onSubmit={submitNewsletter}><Input value={newsletterName} onChange={(event) => setNewsletterName(event.target.value)} placeholder="Seu nome" aria-label="Seu nome" /><Input value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Seu e-mail" type="email" aria-label="Seu e-mail" /><button type="submit" onClick={() => playClick(soundsOn)}>ENVIAR <ArrowRight size={16} /></button></form>}
        </section>
      </main>

      <footer className="site-footer">
        <div><div className="footer-brand">ERAS<span>.</span></div><p>Reviver. Reinventar Eras.<br />Cada coleção é um capítulo fechado — produzido em lotes limitados, no Brasil.</p></div>
        <div className="footer-column"><strong>NAVEGAÇÃO</strong><a href="#manifesto" onClick={() => playClick(soundsOn)}>Início</a><a href="#shop" onClick={() => playClick(soundsOn)}>Shop</a><a href="#collections" onClick={() => playClick(soundsOn)}>Coleções</a><a href="#archive" onClick={() => playClick(soundsOn)}>Arquivo</a><a href="#events" onClick={() => playClick(soundsOn)}>Eventos</a></div>
        <div className="footer-column"><strong>SUPORTE</strong><a href="mailto:atelie@eraslabel.com" onClick={() => playClick(soundsOn)}>Contato</a><a href="#contact" onClick={() => playClick(soundsOn)}>Envios</a><a href="#contact" onClick={() => playClick(soundsOn)}>Trocas e Devoluções</a></div>
        <div className="footer-column"><strong>CONTATO</strong><a href="mailto:atelie@eraslabel.com">atelie@eraslabel.com</a><span>São Paulo · Brasil</span><span>Seg–Sex · 10h às 18h</span></div>
        <div className="footer-bottom"><span>© 2026 ERAS LABEL</span><span>PARADOX COLLECTION</span></div>
      </footer>

      {/* Side Menu identical to Lovable */}
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
              <a href="#" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>INÍCIO</a>
              <a href="#archive" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>ARQUIVO DE ERAS</a>
              <a href="#manifesto" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>MANIFESTO COMPLETO</a>
              <a href="#events" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>EVENTOS</a>
              <a href="#contact" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>CONTATO</a>
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="vip-whatsapp" onClick={() => playClick(soundsOn)}>
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
                <a href="#collections" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>PARADOX COLLECTION</a>
                <a href="#archive" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>LOST BETWEEN ERAS</a>
                <a href="#archive" onClick={() => { playClick(soundsOn); setIsMenuOpen(false); }}>RAÍZES — RECIFE & LA URSA</a>
              </div>
            </div>
          </aside>
        </div>
      )}

      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedProduct(null)}><X /></button>
            <div className="modal-image"><img src={selectedProduct.image} alt={selectedProduct.alt} /></div>
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

      {isCartOpen && (
        <div className="overlay cart-overlay" onClick={() => setIsCartOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div><span className="section-kicker">SACOLA</span><h2>{cartCount} {cartCount === 1 ? "peça" : "peças"}</h2></div>
              <button className="close-button" onClick={() => setIsCartOpen(false)}><X /></button>
            </div>
            {cart.length > 0 && (
              <div className="free-shipping-progress">
                {subtotal >= 350 ? (
                  <p className="shipping-msg"><Sparkles size={14} /> PARABÉNS! VOCÊ GANHOU FRETE GRÁTIS.</p>
                ) : (
                  <p className="shipping-msg">FALTAM {formatPrice(350 - subtotal)} PARA GANHAR FRETE GRÁTIS</p>
                )}
                <div className="shipping-bar-track">
                  <div className="shipping-bar-fill" style={{ width: `${Math.min(100, (subtotal / 350) * 100)}%` }} />
                </div>
              </div>
            )}
            {lastRemovedItem && (
              <div className="undo-banner">
                <span>Item removido da sacola.</span>
                <button onClick={() => {
                  playClick(soundsOn);
                  setCart((current) => [...current, lastRemovedItem]);
                  setLastRemovedItem(null);
                  toast.success("Item restaurado com sucesso.");
                }}>Desfazer</button>
              </div>
            )}
            {cart.length === 0 ? (
              <div className="empty-cart"><ShoppingBag size={33} /><p>Ainda não há peças aqui.</p><button className="text-link" onClick={() => setIsCartOpen(false)}>CONTINUAR A EXPLORAR <ArrowRight size={16} /></button></div>
            ) : (
              <>
                <div className="cart-lines">
                  {cart.map((item) => (
                    <div className="cart-line" key={`${item.id}-${item.size}`}>
                      <img src={item.image} alt={item.alt} />
                      <div>
                        <p>{item.name}</p>
                        <span>Tamanho {item.size}</span>
                        <strong>{formatPrice(item.price)}</strong>
                        <div className="quantity">
                          <button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label="Diminuir quantidade"><Minus size={12} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(item.id, item.size, 1)} aria-label="Aumentar quantidade"><Plus size={12} /></button>
                        </div>
                        <button className="cart-line-remove" onClick={() => {
                          playClick(soundsOn);
                          setLastRemovedItem(item);
                          setCart((current) => current.filter((i) => !(i.id === item.id && i.size === item.size)));
                          toast.success("Peça removida da sacola.", {
                            action: {
                              label: "Desfazer",
                              onClick: () => {
                                setCart((current) => [...current, item]);
                                setLastRemovedItem(null);
                              }
                            }
                          });
                        }}>Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="coupon-section">
                  <div className="coupon-row">
                    <Input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Código do cupom (ex: ERAS10)" disabled={couponLoading} />
                    <button onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? <Loader2 size={14} className="spinner-icon" /> : "APLICAR"}
                    </button>
                  </div>
                  {couponApplied === true && (
                    <div className="coupon-feedback success">
                      <Check size={14} /> Cupom <strong>ERAS10</strong> aplicado com sucesso (10% OFF)
                    </div>
                  )}
                  {couponApplied === false && coupon.trim() !== "" && (
                    <div className="coupon-feedback error">
                      <X size={14} /> Cupom inválido ou expirado. Tente ERAS10.
                    </div>
                  )}
                </div>
                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                  {couponApplied && <div><span>Desconto</span><strong>-{formatPrice(discount)}</strong></div>}
                  <div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
                </div>

                <div className="payment-methods-section">
                  <h4>Forma de Pagamento</h4>
                  <div className="payment-methods-grid">
                    <button type="button" className={`payment-chip ${selectedPaymentMethod === "pix" ? "active" : ""}`} onClick={() => { playClick(soundsOn); setSelectedPaymentMethod("pix"); }}>
                      Pix <span className="highlight">5% OFF</span>
                    </button>
                    <button type="button" className={`payment-chip ${selectedPaymentMethod === "credit_card" ? "active" : ""}`} onClick={() => { playClick(soundsOn); setSelectedPaymentMethod("credit_card"); }}>
                      Cartão <span>Até 6x</span>
                    </button>
                    <button type="button" className={`payment-chip ${selectedPaymentMethod === "boleto" ? "active" : ""}`} onClick={() => { playClick(soundsOn); setSelectedPaymentMethod("boleto"); }}>
                      Boleto <span>À vista</span>
                    </button>
                  </div>
                </div>

                <button className="primary-button checkout-button" onClick={() => setIsCheckoutOpen(true)}>
                  IR PARA CHECKOUT ({selectedPaymentMethod === "pix" ? "Pix" : selectedPaymentMethod === "credit_card" ? "Cartão" : "Boleto"}) <ArrowRight size={16} />
                </button>
                <div className="cart-recommendations">
                  <h3>VOCÊ TAMBÉM PODE GOSTAR</h3>
                  <div className="recommendations-grid">
                    {products.slice(0, 2).map((rec) => (
                      <div className="recommendation-card" key={rec.id}>
                        <img src={rec.image} alt={rec.alt} />
                        <div>
                          <p>{rec.name}</p>
                          <span className="rec-price">{formatPrice(rec.price)}</span>
                        </div>
                        <button className="rec-add" onClick={() => addToCart(rec, rec.sizes[0] ?? "P")}>
                          ADICIONAR <Plus size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-head">
              <div><span className="section-kicker">CHECKOUT</span><h2>Finalizar pedido</h2></div>
              <button className="close-button" onClick={() => setIsCheckoutOpen(false)}><X /></button>
            </div>
            <form onSubmit={submitCheckout} className="checkout-form">
              <div className="checkout-grid">
                <label>Nome completo<Input name="customerName" required placeholder="Seu nome" /></label>
                <label>E-mail<Input name="customerEmail" required type="email" placeholder="voce@email.com" /></label>
                <label>CPF<Input name="cpf" required placeholder="000.000.000-00" /></label>
                <label>Telefone<Input name="phone" required placeholder="(00) 00000-0000" /></label>
                <label>CEP<Input name="cep" required placeholder="00000-000" /></label>
                <label>Número<Input name="number" required placeholder="123" /></label>
                <label className="wide">Endereço completo<Input name="street" required placeholder="Rua, avenida ou travessa" /></label>
                <label>Complemento<Input name="complement" placeholder="Apartamento, bloco" /></label>
                <label>Bairro<Input name="neighborhood" required placeholder="Seu bairro" /></label>
                <label>Cidade<Input name="city" required placeholder="Sua cidade" /></label>
                <label>Estado<Input name="state" required placeholder="UF" /></label>
              </div>
              <div className="shipping-placeholder"><Clock3 size={16} /><span>O cálculo de frete e as opções do Melhor Envio aparecerão após o CEP.</span></div>
              <div className="payment-placeholder"><span className="eyebrow">PAGAMENTO</span><p>Ambiente seguro. Pix, cartão e outros métodos habilitados.</p></div>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "A PROCESSAR..." : `CONFIRMAR PEDIDO · ${formatPrice(total)}`} <ArrowRight size={16} />
              </button>
            </form>
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
