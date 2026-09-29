interface PurchaseBarProps {
  isAddingToCart: boolean;
  isSoldOut: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function PurchaseBar({
  isAddingToCart,
  isSoldOut,
  onAddToCart,
  onBuyNow,
}: PurchaseBarProps) {
  const disabledDescription = isSoldOut ? "product-sold-out-reason" : undefined;
  const buttonClassName =
    "min-h-12 flex-1 rounded-control type-body-small font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-text-disabled";

  return (
    <div
      aria-busy={isAddingToCart}
      className="flex shrink-0 gap-2 border-t border-border bg-surface px-5 py-3"
    >
      <button
        aria-describedby={disabledDescription}
        className={`${buttonClassName} border border-border bg-surface text-text-primary hover:bg-muted`}
        disabled={isSoldOut || isAddingToCart}
        onClick={onAddToCart}
        type="button"
      >
        {isAddingToCart ? "담는 중" : "장바구니"}
      </button>
      <button
        aria-describedby={disabledDescription}
        className={`${buttonClassName} bg-primary text-white hover:bg-primary-hover`}
        disabled={isSoldOut || isAddingToCart}
        onClick={onBuyNow}
        type="button"
      >
        바로 구매
      </button>
    </div>
  );
}
