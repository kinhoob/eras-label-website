import { Instagram, Mail, MessageCircle, Phone, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { officialBrand } from "@/lib/official-brand";
import { trpc } from "@/lib/trpc";

type OfficialFooterProps = {
  onInteraction?: () => void;
};

function TikTokMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.7 3c.4 2.1 1.6 3.4 3.7 3.7v3.1c-1.5-.1-2.8-.6-3.8-1.4v6.1c0 3.5-2.4 5.8-5.8 5.8-3 0-5.3-2.1-5.3-5s2.2-4.9 5-4.9c.3 0 .7 0 1 .1v3.1a3 3 0 0 0-1-.2c-1.2 0-2 .7-2 1.8s.8 1.9 2 1.9c1.4 0 2.1-.9 2.1-2.5V3h4.1Z" />
    </svg>
  );
}

const linkClass = "transition-colors duration-200 hover:text-[#b22222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b22222] focus-visible:ring-offset-2";

export default function OfficialFooter({ onInteraction }: OfficialFooterProps) {
  const interact = () => onInteraction?.();
  const { data: customMenus = [] } = trpc.catalog.listCustomMenus.useQuery({ location: "footer" });

  const footerMainDefault = [
    { label: "Início", url: "/" },
    { label: "Produtos", url: "/#shop" },
    { label: "Coleções", url: "/collection/paradox" },
    { label: "Camisetas", url: "/category/camisetas" },
    { label: "Bonés", url: "/category/bones" },
  ];

  const footerInfoDefault = [
    { label: "Contato", url: "/contact" },
    { label: "Envios", url: "/shipping" },
    { label: "Política de Privacidade", url: "/privacy" },
    { label: "Quem Somos", url: "/about" },
    { label: "Trocas e Devoluções", url: "/returns" },
    { label: "Perguntas Frequentes", url: "/faq" },
    { label: "Rastrear pedido", url: "/tracking" },
  ];

  const effectiveFooterMenus = customMenus.length > 0 ? customMenus : [...footerMainDefault, ...footerInfoDefault].map((m, idx) => ({ ...m, id: idx, location: "footer" }));
  const mainMenus = effectiveFooterMenus.slice(0, Math.ceil(effectiveFooterMenus.length / 2));
  const infoMenus = effectiveFooterMenus.slice(Math.ceil(effectiveFooterMenus.length / 2));

  return (
    <footer className="site-footer official-footer" aria-label="Rodapé da Eras Label">
      <div className="footer-socials" aria-label="Redes sociais da Eras Label">
          <a className="footer-social-link" href={officialBrand.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram da Eras Label" title="Instagram" onClick={interact}>
          <Instagram size={20} strokeWidth={1.7} aria-hidden="true" />
        </a>
        <a className="footer-social-link" href={officialBrand.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok da Eras Label" title="TikTok" onClick={interact}>
          <TikTokMark size={20} />
        </a>
      </div>

      <div className="footer-grid">
        <nav className="footer-column" aria-label="Navegação principal">
          <strong>PRINCIPAL</strong>
          {mainMenus.map((item: any) => (
            <Link key={item.id} href={item.url} onClick={interact} className={linkClass}>{item.label}</Link>
          ))}
        </nav>

        <nav className="footer-column" aria-label="Informações da loja">
          <strong>INFORMAÇÕES</strong>
          {infoMenus.map((item: any) => (
            <Link key={item.id} href={item.url} onClick={interact} className={linkClass}>{item.label}</Link>
          ))}
        </nav>

        <div className="footer-column footer-contact">
          <strong>ENTRE EM CONTATO</strong>
          <a className={linkClass} href={officialBrand.whatsappUrl} target="_blank" rel="noreferrer" onClick={interact}>
            <MessageCircle size={14} aria-hidden="true" /> WhatsApp
          </a>
          <a className={linkClass} href={officialBrand.phoneHref} onClick={interact}>
            <Phone size={14} aria-hidden="true" /> {officialBrand.phoneLabel}
          </a>
          <a className={linkClass} href={`mailto:${officialBrand.email}`} onClick={interact}>
            <Mail size={14} aria-hidden="true" /> {officialBrand.email}
          </a>
          <a className={`footer-vip-link ${linkClass}`} href={officialBrand.vipWhatsappUrl} target="_blank" rel="noreferrer" onClick={interact}>
            Grupo VIP no WhatsApp <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 ERAS LABEL</span>
        <span>REVIVER. REINVENTAR ERAS.</span>
        <span>DESENVOLVIDO COM INTENÇÃO</span>
      </div>
    </footer>
  );
}
