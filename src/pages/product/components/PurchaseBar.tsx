interface PurchaseBarProps {
  isAddingToCart: boolean;
  isBuyingNow: boolean;
  isSoldOut: boolean;
  price: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const priceFormatter = new Intl.NumberFormat("ko-KR");

export function PurchaseBar({
  isAddingToCart,
  isBuyingNow,
  isSoldOut,
  price,
  onAddToCart,
  onBuyNow,
}: PurchaseBarProps) {
  const isPending = isAddingToCart || isBuyingNow;

  if (isSoldOut) {
    return (
      <div className="shrink-0 border-t border-hairline bg-surface px-5 py-3">
        <button
          aria-describedby="product-sold-out-reason"
          className="min-h-12 w-full rounded-control bg-muted type-body-small font-semibold text-text-secondary"
          disabled
          type="button"
        >
          품절된 상품입니다
        </button>
      </div>
    );
  }

  return (
    <div
      aria-busy={isPending}
      className="flex shrink-0 gap-2 border-t border-hairline bg-surface px-5 py-3"
    >
      <button
        className="min-h-12 w-[28%] shrink-0 rounded-control border border-border-strong bg-surface px-2 type-body-small font-semibold text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-text-disabled"
        disabled={isPending}
        onClick={onAddToCart}
        type="button"
      >
        {isAddingToCart ? "담는 중" : "장바구니"}
      </button>
      <button
        className="min-h-12 min-w-0 flex-1 rounded-control bg-primary px-3 type-body-small font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-text-disabled"
        disabled={isPending}
        onClick={onBuyNow}
        type="button"
      >
        {isBuyingNow ? "담는 중" : `${priceFormatter.format(price)}원 · 바로 구매`}
      </button>
    </div>
  );
}
