import type { ReactNode } from "react";
import PublicProductCardMedia, { type PublicProduct } from "@/components/PublicProductCardMedia";
import { getPublicProductCardState } from "@/lib/product-card-state";

type PublicProductCardProps = {
  product: PublicProduct;
  variant: "home" | "catalog";
  primaryImage?: string | null;
  secondaryImage?: string | null;
  fallbackImage?: string | null;
  href?: string;
  onOpen?: () => void;
  mediaOverlay?: ReactNode;
  children: ReactNode;
};

export default function PublicProductCard({
  product,
  variant,
  primaryImage,
  secondaryImage,
  fallbackImage,
  href,
  onOpen,
  mediaOverlay,
  children,
}: PublicProductCardProps) {
  const state = getPublicProductCardState(product);
  const isCatalog = variant === "catalog";

  return (
    <article
      className={isCatalog ? "catalog-product-card group" : "product-card"}
      data-public-product-card={variant}
      data-sold-out={state.soldOut ? "true" : "false"}
    >
      <PublicProductCardMedia
        product={product}
        primaryImage={primaryImage}
        secondaryImage={secondaryImage}
        fallbackImage={fallbackImage}
        mode={href ? "link" : "button"}
        href={href}
        className={isCatalog ? "catalog-product-media relative" : "product-image-button"}
        onClick={onOpen}
        overlay={mediaOverlay}
      />
      {children}
    </article>
  );
}
