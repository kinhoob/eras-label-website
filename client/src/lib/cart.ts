export type CartQuantityLine = {
  quantity: number;
};

/** Soma as unidades de todas as linhas do carrinho para o indicador da Sacola. */
export function getCartItemCount(lines: CartQuantityLine[]) {
  return lines.reduce((total, line) => total + Math.max(0, line.quantity), 0);
}
