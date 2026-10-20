import type { OrderTotals } from "@/pages/order/lib/orderTotals";
import { formatWon } from "@/pages/order/lib/orderTotals";
import type { OwnedCoupon } from "@/features/benefit/types/benefit";
import type { OrderBenefitsState } from "@/pages/order/hooks/useOrderBenefits";

interface BenefitSectionProps {
  pointAmount: number;
  selectedCouponId: number | null;
  state: OrderBenefitsState;
  subtotal: number;
  onPointChange: (value: number) => void;
  onRetry: () => void;
  onSelectCoupon: (value: number | null) => void;
}

function isUsableCoupon(coupon: OwnedCoupon, subtotal: number) {
  return coupon.state === "ISSUED" &&
    new Date(coupon.expiredAt).getTime() > Date.now() &&
    subtotal >= coupon.minOrderAmount;
}

export function BenefitSection({ pointAmount, selectedCouponId, state, subtotal, onPointChange, onRetry, onSelectCoupon }: BenefitSectionProps) {
  if (state.kind === "loading") {
    return <section aria-busy="true"><h2 className="type-title">쿠폰·포인트</h2><p className="mt-3 type-body-small text-text-tertiary" role="status">사용 가능한 혜택을 확인하고 있어요</p></section>;
  }
  if (state.kind === "error") {
    return <section><h2 className="type-title">쿠폰·포인트</h2><p className="mt-3 type-body-small text-error">혜택을 불러오지 못했어요</p><button className="mt-2 min-h-11 type-body-small font-semibold underline" onClick={onRetry} type="button">다시 불러오기</button></section>;
  }

  const availableCoupons = state.coupons.filter((coupon) => isUsableCoupon(coupon, subtotal));
  return (
    <section aria-labelledby="order-benefit-title">
      <h2 className="type-title" id="order-benefit-title">쿠폰·포인트</h2>
      <label className="mt-4 block type-body-small font-medium" htmlFor="order-coupon">쿠폰</label>
      <select className="mt-2 min-h-12 w-full rounded-control border border-border bg-surface px-3 type-body-small focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" id="order-coupon" onChange={(event) => onSelectCoupon(event.target.value ? Number(event.target.value) : null)} value={selectedCouponId ?? ""}>
        <option value="">사용 안 함</option>
        {availableCoupons.map((coupon) => <option key={coupon.id} value={coupon.id}>{coupon.name}</option>)}
      </select>
      {state.coupons.length > 0 && availableCoupons.length === 0 ? <p className="mt-2 type-caption text-text-tertiary">현재 주문에 최소 금액과 사용 기간을 충족하는 쿠폰이 없어요.</p> : null}
      <label className="mt-5 block type-body-small font-medium" htmlFor="order-point">포인트</label>
      <div className="mt-2 flex items-center gap-2">
        <input className="min-h-12 min-w-0 flex-1 rounded-control border border-border px-3 text-right type-body-small tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" id="order-point" inputMode="numeric" max={Math.min(state.balance, subtotal)} min={0} onChange={(event) => onPointChange(Math.min(Math.max(0, Number(event.target.value) || 0), state.balance, subtotal))} type="number" value={pointAmount} />
        <button className="min-h-12 shrink-0 rounded-control border border-border px-3 type-body-small font-semibold" onClick={() => onPointChange(Math.min(state.balance, subtotal))} type="button">전액 사용</button>
      </div>
      <p className="mt-2 text-right type-caption text-text-tertiary">보유 {formatWon(state.balance)}</p>
    </section>
  );
}

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
        토스페이먼츠
      </label>
      <p className="mt-2 type-caption leading-relaxed text-text-tertiary">토스페이먼츠 결제창에서 카드 또는 간편결제를 선택할 수 있어요.</p>
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
        {totals.couponDiscount > 0 ? <div className="flex justify-between gap-4 text-accent"><dt>쿠폰 할인</dt><dd className="tabular-nums">-{formatWon(totals.couponDiscount)}</dd></div> : null}
        {totals.pointDiscount > 0 ? <div className="flex justify-between gap-4 text-accent"><dt>포인트 사용</dt><dd className="tabular-nums">-{formatWon(totals.pointDiscount)}</dd></div> : null}
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
