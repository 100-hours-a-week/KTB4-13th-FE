import type { OrderItemViewModel } from "@/features/order/types/order";

export interface OrderTotals {
  couponDiscount: number;
  pointDiscount: number;
  shippingFee: number;
  subtotal: number;
  total: number;
}

export function calculateOrderTotals(
  items: OrderItemViewModel[],
  couponDiscount = 0,
  pointDiscount = 0,
): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  );
  // Backend main currently has no shipping-fee field or policy in the order total.
  const shippingFee = 0;

  return {
    couponDiscount,
    pointDiscount,
    shippingFee,
    subtotal,
    total: Math.max(0, subtotal + shippingFee - couponDiscount - pointDiscount),
  };
}

export function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}
