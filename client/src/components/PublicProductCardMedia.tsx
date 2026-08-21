import { Link } from "wouter";
import type { ReactNode } from "react";
import ProductImageSwap from "@/components/ProductImageSwap";
import { getPublicProductCardState } from "@/lib/product-card-state";

export type PublicProduct = {
  name: string;
  image?: string | null;
  images?: unknown;
  fallbackImage?: string | null;
  status?: unknown;
  stock?: unknown;
  totalStock?: unknown;
  variations?: unknown;
};

type PublicProductCardMediaProps = {
  product: PublicProduct;
  primaryImage?: string | null;
  secondaryImage?: string | null;
  fallbackImage?: string | null;
  mode: "button" | "link";
  href?: string;
  className: string;
  onClick?: () => void;
  overlay?: ReactNode;
};

export default function PublicProductCardMedia({
  product,
  primaryImage,
  secondaryImage,
  fallbackImage,
  mode,
  href,
  className,
  onClick,
  overlay,
}: PublicProductCardMediaProps) {
  const state = getPublicProductCardState({ ...product, images: product.images ?? [primaryImage, secondaryImage] });
  const image = primaryImage || product.image || fallbackImage || "";
  const hasImage = Boolean(image);
  const secondary = secondaryImage || state.secondaryImage;
  const mediaClassName = `${className}${secondary ? " has-image-swap" : ""}`;
  const content = (
    <>
      {hasImage ? (
        <ProductImageSwap
          primaryImage={image}
          secondaryImage={secondary}
          fallbackImage={fallbackImage || undefined}
          alt={product.name}
          onPrimaryError={(event) => {
            if (!fallbackImage || event.currentTarget.dataset.fallbackApplied) return;
            event.currentTarget.dataset.fallbackApplied = "true";
            event.currentTarget.src = fallbackImage;
          }}
        />
      ) : (
        <span className="catalog-product-media-placeholder">Imagem a caminho</span>
      )}
      {state.badge && (
        <span className="absolute bottom-3 left-3 bg-[#b22222] text-white text-[9px] tracking-widest uppercase px-2 py-0.5 font-bold rounded-sm shadow-sm z-10 pointer-events-none">
          {state.badge}
        </span>
      )}
      {overlay}
    </>
  );

  if (mode === "link") {
    return (
      <Link href={href || "#"} className={mediaClassName} aria-label={state.ariaLabel} data-sold-out={state.soldOut ? "true" : "false"}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={mediaClassName} onClick={onClick} aria-label={state.ariaLabel} data-sold-out={state.soldOut ? "true" : "false"}>
      {content}
    </button>
  );
}
