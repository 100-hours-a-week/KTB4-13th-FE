import { useContext } from "react";

import { displayBookTitle } from "@/common/lib/bookTitle";
import { PlusIcon } from "@/common/components/AppIcons";
import { QuickCartContext, type QuickCartItem } from "@/features/cart/context/quickCartContext";

interface QuickAddToCartButtonProps extends QuickCartItem {
  className?: string;
  // "icon" is a round + that sits on a card corner and "icon-small" one on a cover corner;
  // both keep a 44px hit area wider than the visible circle.
  variant?: "text" | "icon" | "icon-small";
}

const ICON_CIRCLE_CLASS_NAME = {
  icon: "size-6.5 [&>svg]:size-3.5",
  "icon-small": "size-5.5 [&>svg]:size-3",
} as const;

export function QuickAddToCartButton({ className = "", variant = "text", ...item }: QuickAddToCartButtonProps) {
  const cart = useContext(QuickCartContext);

  if (!cart) return null;

  const sharedProps = {
    "aria-busy": cart.pendingProductId === item.productId,
    "aria-label": `${displayBookTitle(item.title)} 장바구니에 담기`,
    disabled: cart.isDisabled,
    onClick: () => { void cart.add(item); },
    type: "button" as const,
  };

  if (variant !== "text") {
    return (
      <button
        {...sharedProps}
        className={`group inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none disabled:opacity-50 ${className}`}
      >
        {/* The focus ring hugs the circle in accent so it stays visible on the dark first-place card too. */}
        <span
          aria-hidden="true"
          className={`flex items-center justify-center rounded-full bg-surface text-text-primary shadow-[0_2px_8px_-3px_rgba(36,33,31,0.45)] ring-1 ring-border transition-[background-color,transform] group-hover:bg-muted group-active:scale-95 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent ${ICON_CIRCLE_CLASS_NAME[variant]}`}
        >
          <PlusIcon strokeWidth={2.2} />
        </span>
      </button>
    );
  }

  return (
    <button
      {...sharedProps}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-control border border-border bg-surface px-3 type-caption font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${className}`}
    >
      담기
    </button>
  );
}
