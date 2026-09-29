import { useState } from "react";

import { BookCover } from "@/common/components/BookCover";
import type { OrderItemViewModel } from "@/features/order/types/order";
import { formatWon } from "@/pages/order/lib/orderTotals";

interface OrderItemsSectionProps {
  items: OrderItemViewModel[];
}

export function OrderItemsSection({ items }: OrderItemsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <section aria-labelledby="order-items-title" className="space-y-2">
        <h2 className="type-title text-text-primary" id="order-items-title">
          주문상품
        </h2>
        <div className="rounded-panel border border-border bg-muted p-5 text-center">
          <p className="type-body-small text-text-secondary">
            주문할 상품 정보가 없어요
          </p>
        </div>
      </section>
    );
  }

  const summary =
    items.length === 1
      ? `${items[0].itemName} · ${items[0].quantity}권`
      : `${items[0].itemName} 외 ${items.length - 1}건`;

  return (
    <section aria-labelledby="order-items-title" className="space-y-3">
      <h2 className="type-title text-text-primary" id="order-items-title">
        주문상품
      </h2>
      <button
        aria-controls="order-item-list"
        aria-expanded={isExpanded}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 text-left type-body-small font-medium text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        <span className="min-w-0 truncate">{summary}</span>
        <span aria-hidden="true" className="shrink-0 text-text-tertiary">
          {isExpanded ? "⌃" : "⌄"}
        </span>
      </button>

      {isExpanded ? (
        <ul
          className="divide-y divide-border rounded-panel border border-border"
          id="order-item-list"
        >
          {items.map((item) => (
            <li className="flex gap-3 p-4" key={item.productId}>
              <div className="w-16 shrink-0">
                <BookCover alt="" thumbnailUrl={item.thumbnailUrl} />
              </div>
              <div className="min-w-0 flex-1 self-center">
                <p className="line-clamp-2 type-body-small font-semibold text-text-primary">
                  {item.itemName}
                </p>
                <p className="mt-1 type-caption text-text-secondary">
                  수량 {item.quantity}권
                </p>
                <p className="mt-2 type-body-small font-semibold text-text-primary">
                  {formatWon(item.discountedPrice * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
