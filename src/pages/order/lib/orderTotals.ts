import type { OrderItemViewModel } from "@/features/order/types/order";

const FREE_SHIPPING_THRESHOLD = 20_000;
const SHIPPING_FEE = 3_000;

export interface OrderTotals {
  shippingFee: number;
  subtotal: number;
  total: number;
}

export function calculateOrderTotals(items: OrderItemViewModel[]): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  );
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  return {
    shippingFee,
    subtotal,
    total: subtotal + shippingFee,
  };
}

export function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}
