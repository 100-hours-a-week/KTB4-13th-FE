import { useContext } from "react";

import { QuickCartContext, type QuickCartItem } from "@/features/cart/context/quickCartContext";

export function QuickAddToCartButton(item: QuickCartItem) {
  const cart = useContext(QuickCartContext);

  if (!cart) return null;

  return (
    <button
      aria-busy={cart.pendingProductId === item.productId}
      aria-label={`${item.title} 장바구니에 담기`}
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface px-3 type-caption font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
      disabled={cart.isDisabled}
      onClick={() => { void cart.add(item); }}
      type="button"
    >
      담기
    </button>
  );
}
