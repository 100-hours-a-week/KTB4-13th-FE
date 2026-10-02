import type { OrderTotals } from "@/pages/order/lib/orderTotals";
import { formatWon } from "@/pages/order/lib/orderTotals";

export function PaymentMethodSection() {
  return (
    <fieldset>
      <legend className="float-left mb-3 w-full type-title text-text-primary">결제수단</legend>
      <label className="clear-both flex min-h-12 items-center gap-3 rounded-control border border-text-primary px-4 type-body-small font-semibold text-text-primary">
        <input
          checked
          className="size-5 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          name="payment-method"
          readOnly
          type="radio"
          value="test"
        />
        테스트 결제
      </label>
    </fieldset>
  );
}

export function PaymentSummary({ totals }: { totals: OrderTotals }) {
  return (
    <section aria-labelledby="payment-summary-title">
      <h2 className="type-title text-text-primary" id="payment-summary-title">
        결제금액
      </h2>
      <dl className="mt-4 space-y-3 type-body-small">
        <div className="flex justify-between gap-4 text-text-secondary">
          <dt>상품 금액</dt>
          <dd className="tabular-nums">{formatWon(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-text-secondary">
          <dt>배송비</dt>
          <dd className="tabular-nums">{formatWon(totals.shippingFee)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-4 type-title text-text-primary">
          <dt>최종 결제금액</dt>
          <dd className="type-subheading tabular-nums">{formatWon(totals.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
