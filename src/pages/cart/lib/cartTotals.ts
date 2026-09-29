import type { CartItemViewModel } from "@/features/cart/types/cart";

const FREE_SHIPPING_THRESHOLD = 20_000;
const SHIPPING_FEE = 3_000;
const priceFormatter = new Intl.NumberFormat("ko-KR");

export interface CartTotals {
  shippingFee: number;
  subtotal: number;
  total: number;
}

export function calculateCartTotals(
  items: CartItemViewModel[],
  selectedIds: ReadonlySet<number>,
): CartTotals {
  const subtotal = items.reduce((sum, item) => {
    if (!item.isPurchasable || !selectedIds.has(item.cartItemId)) {
      return sum;
    }
    return sum + item.unitPrice * item.quantity;
  }, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return { shippingFee, subtotal, total: subtotal + shippingFee };
}

export function formatWon(price: number) {
  return `${priceFormatter.format(price)}원`;
}
