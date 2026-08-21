/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicProductCard from "./PublicProductCard";
import PublicProductPurchaseButton from "./PublicProductPurchaseButton";

const product = {
  name: "Camiseta Drafts",
  stock: 0,
  status: "soldout",
  images: ["principal.jpg", "modelo.jpg"],
};

describe("cards públicos renderizados", () => {
  it("na Home mantém principal, segunda foto e selo ao passar por hover/focus, sem liberar compra", () => {
    const onPurchase = vi.fn();
    const { container } = render(
      <PublicProductCard
        product={product}
        variant="home"
        primaryImage="principal.jpg"
        secondaryImage="modelo.jpg"
      >
        <PublicProductPurchaseButton product={product} onPurchase={onPurchase} />
      </PublicProductCard>,
    );

    const card = container.querySelector('article[data-public-product-card="home"]') as HTMLElement;
    const media = card.querySelector("button.product-image-button") as HTMLButtonElement;
    const primary = card.querySelector("img.product-image-swap-base") as HTMLImageElement;
    const secondary = card.querySelector("img.product-image-swap-hover") as HTMLImageElement;
    const badge = screen.getByText("ESGOTADO");
    const cta = screen.getByRole("button", { name: "Produto esgotado" }) as HTMLButtonElement;

    expect(card).toBeTruthy();
    expect(media).toBeTruthy();
    expect(media.dataset.soldOut).toBe("true");
    expect(primary.src).toContain("principal.jpg");
    expect(secondary.src).toContain("modelo.jpg");
    expect(badge).toBeTruthy();
    expect(cta.disabled).toBe(true);

    fireEvent.mouseEnter(media);
    fireEvent.keyDown(media, { key: "Tab" });
    media.focus();
    fireEvent.click(cta);

    expect(primary.isConnected).toBe(true);
    expect(secondary.isConnected).toBe(true);
    expect(document.activeElement).toBe(media);
    expect(screen.getByText("ESGOTADO")).toBe(badge);
    expect(cta.disabled).toBe(true);
    expect(onPurchase).not.toHaveBeenCalled();
  });

  it("no catálogo mantém a mídia linkável e o reveal secundário no hover/focus sem CTA de compra", () => {
    const { container } = render(
      <PublicProductCard
        product={product}
        variant="catalog"
        primaryImage="principal.jpg"
        secondaryImage="modelo.jpg"
        href="/produto/camiseta-drafts"
      >
        <p>Ficha da peça</p>
      </PublicProductCard>,
    );

    const card = container.querySelector('article[data-public-product-card="catalog"]') as HTMLElement;
    const media = card.querySelector("a.catalog-product-media") as HTMLAnchorElement;
    const primary = card.querySelector("img.product-image-swap-base") as HTMLImageElement;
    const secondary = card.querySelector("img.product-image-swap-hover") as HTMLImageElement;

    expect(card).toBeTruthy();
    expect(media).toBeTruthy();
    expect(media.getAttribute("href")).toBe("/produto/camiseta-drafts");
    expect(media.dataset.soldOut).toBe("true");
    expect(primary).toBeTruthy();
    expect(secondary).toBeTruthy();
    expect(screen.getByText("ESGOTADO")).toBeTruthy();

    fireEvent.mouseEnter(media);
    fireEvent.keyDown(media, { key: "Tab" });
    media.focus();

    expect(primary.isConnected).toBe(true);
    expect(document.activeElement).toBe(media);
    expect(secondary.isConnected).toBe(true);
    expect(media.getAttribute("aria-label")).toBe("Ver Camiseta Drafts — esgotado");
  });
});
