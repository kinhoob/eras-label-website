import React from "react";

/**
 * Props do visual de imagem usado pelos cards públicos de produto.
 * A primeira URL é sempre a fotografia principal; a segunda, quando existe,
 * representa a fotografia editorial do modelo usando a peça.
 */
type ProductImageSwapProps = {
  primaryImage?: string | null;
  secondaryImage?: string | null;
  alt: string;
  fallbackImage?: string;
  onPrimaryError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
};

/**
 * Renderiza as duas camadas de fotografia do card.
 * A troca é controlada por CSS no elemento interativo pai (button ou Link),
 * mantendo o componente sem estado e evitando renders extras durante o hover.
 */
export function ProductImageSwap({
  primaryImage,
  secondaryImage,
  alt,
  fallbackImage,
  onPrimaryError,
}: ProductImageSwapProps) {
  const hasSecondaryImage = Boolean(secondaryImage && secondaryImage.trim().length > 0);

  return (
    <>
      {/* Fotografia principal: permanece visível como fallback em qualquer dispositivo. */}
      <img
        className="product-image-swap-base"
        src={primaryImage || fallbackImage}
        alt={alt}
        onError={onPrimaryError}
        loading="lazy"
        decoding="async"
      />

      {/*
       * Fotografia editorial secundária: só é adicionada quando existe uma
       * segunda imagem cadastrada. Em caso de erro de carregamento, o atributo
       * data-image-error remove esta camada sem esconder a foto principal.
       */}
      {hasSecondaryImage && (
        <img
          className="product-image-swap-hover"
          src={secondaryImage ?? undefined}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.dataset.imageError = "true";
          }}
        />
      )}
    </>
  );
}

export default ProductImageSwap;
