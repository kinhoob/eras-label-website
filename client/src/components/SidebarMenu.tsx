import { Link } from "wouter";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { categoryPath, collectionPath, uniqueCatalogLabels } from "@/lib/catalog-routes";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySound: () => void;
}

type PublicCatalogProduct = {
  category?: string | null;
  categoryNames?: string[];
  collection?: string | null;
};

export function SidebarMenu({ isOpen, onClose, onPlaySound }: SidebarMenuProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timer = window.setTimeout(() => setShouldRender(false), 280);
    return () => window.clearTimeout(timer);
  }, [isOpen]);
  const { data: categories = [] } = trpc.catalog.categories.useQuery(undefined, { enabled: shouldRender });
  const { data: catalogRows = [] } = trpc.catalog.list.useQuery(undefined, { enabled: shouldRender });

  if (!shouldRender) return null;

  const catalogProducts = catalogRows as PublicCatalogProduct[];
  const categoryLabels = uniqueCatalogLabels([
    ...categories.map((category) => category.name),
    ...catalogProducts.flatMap((product) => [product.category, ...(product.categoryNames ?? [])]),
  ]);
  const collectionLabels = uniqueCatalogLabels(catalogProducts.map((product) => product.collection));
  const closeWithSound = () => {
    onPlaySound();
    onClose();
  };

  return (
    <div className={`lovable-menu-overlay ${isOpen ? "is-open" : "is-closing"}`} onClick={onClose}>
      <div className={`lovable-side-menu ${isOpen ? "is-open" : "is-closing"}`} onClick={(e) => e.stopPropagation()}>
        <div className="lovable-menu-header">
          <span className="lovable-menu-kicker">EXPLORAR ERAS</span>
          <button onClick={closeWithSound} className="close-button" aria-label="Fechar menu">
            <X size={19} />
          </button>
        </div>
        <div className="lovable-menu-links">
          <Link href="/" onClick={closeWithSound}>Início</Link>
          <Link href="/catalog" onClick={closeWithSound}>Todos os produtos</Link>
          <Link href="/archive" onClick={closeWithSound}>Arquivo de Eras</Link>
          <Link href="/manifesto" onClick={closeWithSound}>Manifesto</Link>
          <Link href="/events" onClick={closeWithSound}>Eventos</Link>
          <Link href="/contact" onClick={closeWithSound}>Contato</Link>
          <a href="https://chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK?mode=gi_t" target="_blank" rel="noreferrer" onClick={onPlaySound} className="vip-whatsapp">
            Grupo VIP no WhatsApp
          </a>
        </div>
        {categoryLabels.length > 0 && <div className="lovable-menu-section">
          <span className="lovable-menu-kicker">CATEGORIAS</span>
          <div className="lovable-menu-sublinks">
            {categoryLabels.map((category) => (
              <Link key={category} href={categoryPath(category)} onClick={closeWithSound}>{category}</Link>
            ))}
          </div>
        </div>}
        {collectionLabels.length > 0 && <div className="lovable-menu-section">
          <span className="lovable-menu-kicker">COLEÇÕES</span>
          <div className="lovable-menu-sublinks">
            {collectionLabels.map((collection) => (
              <Link key={collection} href={collectionPath(collection)} onClick={closeWithSound}>{collection}</Link>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}
