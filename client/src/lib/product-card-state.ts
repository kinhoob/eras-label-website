import { getSoldOutCardState, type SoldOutProductLike } from "./soldout";

type ProductCardProduct = SoldOutProductLike & {
  name?: unknown;
  images?: unknown;
};

function getSecondaryImage(images: unknown) {
  if (!Array.isArray(images)) return null;
  const candidate = images[1];
  return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : null;
}

/**
 * View model compartilhado pelos cards da Home e do catálogo.
 * A disponibilidade da peça é independente da camada editorial: um produto
 * esgotado continua podendo ser consultado e revelar a segunda foto por
 * hover ou foco, mas nunca pode reativar o CTA de compra.
 */
export function getPublicProductCardState(product: ProductCardProduct | null | undefined) {
  const soldOutState = getSoldOutCardState(product);
  const secondaryImage = getSecondaryImage(product?.images);
  const name = String(product?.name ?? "Produto Eras Label");

  return {
    ...soldOutState,
    secondaryImage,
    hasImageSwap: Boolean(secondaryImage),
    revealsSecondaryOnHover: Boolean(secondaryImage),
    revealsSecondaryOnFocus: Boolean(secondaryImage),
    ariaLabel: `Ver ${name}${soldOutState.soldOut ? " — esgotado" : ""}`,
  } as const;
}
