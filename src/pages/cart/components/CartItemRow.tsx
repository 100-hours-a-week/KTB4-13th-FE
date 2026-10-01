import { Link } from "react-router-dom";

import { BookCover } from "@/common/components/BookCover";
import type { CartItemViewModel } from "@/features/cart/types/cart";
import { formatWon } from "@/pages/cart/lib/cartTotals";

interface CartItemRowProps {
  isDeleteDisabled: boolean;
  isQuantityDisabled: boolean;
  isSelected: boolean;
  isUpdating: boolean;
  item: CartItemViewModel;
  onDelete: (cartItemId: number) => void;
  onQuantityChange: (cartItemId: number, quantity: number) => void;
  onSelect: (cartItemId: number) => void;
}

const quantityButtonClassName =
  "inline-flex size-11 items-center justify-center rounded-control border border-border bg-surface type-title text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-text-disabled";

export function CartItemRow({
  isDeleteDisabled,
  isQuantityDisabled,
  isSelected,
  isUpdating,
  item,
  onDelete,
  onQuantityChange,
  onSelect,
}: CartItemRowProps) {
  const isInteractionDisabled = !item.isPurchasable || isQuantityDisabled;

  return (
    <li className="rounded-panel border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <input
          aria-label={`${item.itemName} 선택`}
          checked={isSelected}
          className="mt-1 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled={!item.isPurchasable}
          onChange={() => onSelect(item.cartItemId)}
          type="checkbox"
        />

        <Link
          aria-label={`${item.itemName} 상세 보기`}
          className="w-16 shrink-0 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          to={`/products/${item.productId}`}
        >
          <BookCover
            alt={`${item.itemName} 표지`}
            fallbackTitle={item.itemName}
            thumbnailUrl={item.thumbnailUrl}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                className="line-clamp-1 type-body-small font-semibold text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                to={`/products/${item.productId}`}
              >
                {item.itemName}
              </Link>
              {item.isPurchasable ? (
                <p className="mt-1 type-body-small font-bold text-text-primary">
                  {formatWon(item.unitPrice)}
                </p>
              ) : (
                <p className="mt-1 type-body-small font-semibold text-error">
                  일시 품절
                </p>
              )}
            </div>
            <button
              aria-label={`${item.itemName} 삭제`}
              className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-xl text-text-tertiary hover:bg-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-text-disabled"
              disabled={isDeleteDisabled}
              onClick={() => onDelete(item.cartItemId)}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div
            aria-label={`${item.itemName} 수량`}
            className="mt-3 flex items-center gap-2"
            role="group"
          >
            <button
              aria-label="수량 줄이기"
              className={quantityButtonClassName}
              disabled={isInteractionDisabled || item.quantity <= 1}
              onClick={() =>
                onQuantityChange(item.cartItemId, item.quantity - 1)
              }
              type="button"
            >
              −
            </button>
            <output
              aria-live="polite"
              className="min-w-6 text-center type-body-small text-text-primary"
            >
              {item.quantity}
            </output>
            <button
              aria-label="수량 늘리기"
              className={quantityButtonClassName}
              disabled={isInteractionDisabled || item.quantity >= 99}
              onClick={() =>
                onQuantityChange(item.cartItemId, item.quantity + 1)
              }
              type="button"
            >
              +
            </button>
            {isUpdating ? (
              <span className="type-caption text-text-tertiary" role="status">
                변경 중
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
