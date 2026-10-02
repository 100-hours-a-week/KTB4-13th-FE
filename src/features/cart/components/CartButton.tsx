import { useEffect, useState } from "react";

import { CartIcon } from "@/common/components/AppIcons";
import { fetchCart } from "@/features/cart/api/cartApi";
import { subscribeCartChanges } from "@/features/cart/lib/cartEvents";

interface CartButtonProps {
  className: string;
  countEnabled: boolean;
  onClick: () => void;
}

function getCartQuantity(items: { quantity: number }[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function CartButton({
  className,
  countEnabled,
  onClick,
}: CartButtonProps) {
  const [count, setCount] = useState<number | null>(null);
  const [animationVersion, setAnimationVersion] = useState(0);

  useEffect(() => {
    if (!countEnabled) {
      return undefined;
    }

    let isActive = true;
    let controller: AbortController | null = null;

    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const result = await fetchCart(controller.signal);

      if (isActive && result.ok) {
        setCount(getCartQuantity(result.data.items));
      }
    };

    void refresh();
    const unsubscribe = subscribeCartChanges((event) => {
      if (event.animate) {
        setAnimationVersion((current) => current + 1);
      }
      void refresh();
    });

    return () => {
      isActive = false;
      controller?.abort();
      unsubscribe();
    };
  }, [countEnabled]);

  const ariaLabel =
    countEnabled && count !== null && count > 0
      ? `장바구니, 담긴 상품 ${count}개`
      : "장바구니";

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
      type="button"
    >
      <span
        className={`relative inline-flex ${animationVersion > 0 ? "cart-icon-bump" : ""}`}
        key={animationVersion}
      >
        <CartIcon className="size-6" />
        {countEnabled && count !== null && count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold leading-none text-white shadow-sm"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </span>
    </button>
  );
}
