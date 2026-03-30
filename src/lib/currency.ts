export const CURRENCY_CODE = "NPR";
export const CURRENCY_SYMBOL = "Rs";

export function formatPrice(value: number): string {
  return `${CURRENCY_SYMBOL} ${value.toFixed(2)}`;
}
