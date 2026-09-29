import type { CartTotals } from "@/pages/cart/lib/cartTotals";
import { formatWon } from "@/pages/cart/lib/cartTotals";

export function CartSummary({ totals }: { totals: CartTotals }) {
  return (
    <section
      aria-labelledby="cart-summary-title"
      className="rounded-panel border border-border bg-surface p-4"
    >
      <h2 className="sr-only" id="cart-summary-title">
        결제 금액 요약
      </h2>
      <dl className="space-y-3 type-body-small text-text-secondary">
        <div className="flex justify-between gap-4">
          <dt>총 상품금액</dt>
          <dd>{formatWon(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>배송비</dt>
          <dd>{formatWon(totals.shippingFee)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-3 type-title text-text-primary">
          <dt>결제금액</dt>
          <dd>{formatWon(totals.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
