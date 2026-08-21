import { ArrowRight, CheckCircle2 } from "lucide-react";
import { getPublicProductCardState } from "@/lib/product-card-state";

type PublicPurchaseProduct = {
  name?: unknown;
  status?: unknown;
  stock?: unknown;
  totalStock?: unknown;
  variations?: unknown;
};

type PublicProductPurchaseButtonProps = {
  product: PublicPurchaseProduct;
  added?: boolean;
  onPurchase: () => void;
};

export default function PublicProductPurchaseButton({ product, added = false, onPurchase }: PublicProductPurchaseButtonProps) {
  const canAddToCart = getPublicProductCardState(product).canAddToCart;
  const disabled = !canAddToCart || added;

  return (
    <button
      type="button"
      className={`primary-button add-to-cart-button ${added ? "is-added" : ""}`}
      onClick={() => {
        if (!disabled) onPurchase();
      }}
      disabled={disabled}
      aria-live="polite"
      aria-label={canAddToCart ? (added ? "Adicionado à sacola" : "Adicionar à sacola") : "Produto esgotado"}
    >
      {!canAddToCart ? "ESGOTADO" : added ? <><CheckCircle2 size={16} /> ADICIONADO À SACOLA</> : <>ADICIONAR À SACOLA <ArrowRight size={16} /></>}
    </button>
  );
}
