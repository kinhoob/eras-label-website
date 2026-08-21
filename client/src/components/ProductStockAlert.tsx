import React from "react";
import { getProductStockAlertLabel } from "@shared/product-stock-alert";

interface ProductStockAlertProps {
  /** Estoque da variação atualmente selecionada; o componente nunca exibe o número. */
  stock: unknown;
}

/**
 * Renderiza o pequeno selo editorial sobre a fotografia do produto.
 * A mesma marcação é usada no tema claro e no tema escuro; a cascata global
 * altera apenas as superfícies da página e não remove nem desloca o alerta.
 */
export function ProductStockAlert({ stock }: ProductStockAlertProps) {
  const label = getProductStockAlertLabel(stock);

  if (!label) return null;

  return (
    <div className="product-stock-alert" role="status" aria-live="polite">
      {label}
    </div>
  );
}
