import { useEffect, useState } from "react";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { fetchOwnedCoupons, fetchPointSummary } from "@/features/benefit/api/benefitApi";
import type { OwnedCoupon, PointSummary } from "@/features/benefit/types/benefit";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { formatWon } from "@/pages/order/lib/orderTotals";

type BenefitsState =
  | { kind: "loading" }
  | { coupons: OwnedCoupon[]; kind: "ready"; points: PointSummary }
  | { kind: "error" };

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function couponStatus(coupon: OwnedCoupon) {
  if (coupon.state === "USED") return "사용 완료";
  if (new Date(coupon.expiredAt).getTime() <= Date.now()) return "기간 만료";
  return "사용 가능";
}

function couponBenefit(coupon: OwnedCoupon) {
  if (coupon.type === "PERCENT_RATE") return `${coupon.discount * 100}% 할인`;
  if (coupon.type === "FIXED_AMOUNT") return `${formatWon(coupon.discount)} 할인`;
  return "할인 없음";
}

export function MyBenefitsPage() {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<BenefitsState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetchOwnedCoupons(controller.signal),
      fetchPointSummary(controller.signal),
    ]).then(([coupons, points]) => {
      if (controller.signal.aborted) return;
      setState(
        coupons.ok && points.ok
          ? { coupons: coupons.data, kind: "ready", points: points.data }
          : { kind: "error" },
      );
    });
    return () => controller.abort();
  }, [requestKey]);

  return (
    <div className="flex h-full flex-col bg-surface">
      <AppPageHeader fallbackPath="/my" title="쿠폰·포인트" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {state.kind === "loading" ? (
          <div aria-busy="true" className="space-y-3">
            <p className="sr-only" role="status">혜택을 불러오는 중이에요</p>
            <div className="h-28 animate-pulse rounded-panel bg-muted" />
            <div className="h-44 animate-pulse rounded-panel bg-muted" />
          </div>
        ) : null}
        {state.kind === "error" ? (
          <Toast action={<RetryButton onClick={() => { setState({ kind: "loading" }); setRequestKey((value) => value + 1); }} />} variant="error">
            쿠폰과 포인트를 불러오지 못했어요
          </Toast>
        ) : null}
        {state.kind === "ready" ? (
          <div className="space-y-7">
            <section aria-labelledby="point-balance-title" className="rounded-panel bg-primary p-5 text-white">
              <h2 className="type-body-small text-white/70" id="point-balance-title">사용 가능한 포인트</h2>
              <p className="mt-3 type-numeral tabular-nums">{formatWon(state.points.balance)}</p>
            </section>
            <section aria-labelledby="coupon-list-title">
              <h2 className="type-title" id="coupon-list-title">보유 쿠폰</h2>
              {state.coupons.length === 0 ? (
                <p className="mt-4 rounded-panel border border-border p-5 text-center type-body-small text-text-secondary">보유한 쿠폰이 없어요</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {state.coupons.map((coupon) => {
                    const status = couponStatus(coupon);
                    return (
                      <li className={`rounded-panel border border-border p-4 ${status === "사용 가능" ? "bg-surface" : "bg-muted text-text-tertiary"}`} key={coupon.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div><strong className="type-title">{coupon.name}</strong><p className="mt-1 type-body-small font-semibold text-accent">{couponBenefit(coupon)}</p></div>
                          <span className="shrink-0 type-caption font-semibold">{status}</span>
                        </div>
                        <p className="mt-3 type-caption text-text-tertiary">{formatWon(coupon.minOrderAmount)} 이상 · {dateFormatter.format(new Date(coupon.expiredAt))}까지</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section aria-labelledby="point-history-title">
              <h2 className="type-title" id="point-history-title">포인트 내역</h2>
              {state.points.histories.length === 0 ? (
                <p className="mt-3 type-body-small text-text-secondary">아직 포인트 내역이 없어요</p>
              ) : (
                <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
                  {state.points.histories.map((history) => (
                    <li className="flex items-center justify-between gap-4 py-3" key={history.id}>
                      <div><p className="type-body-small font-medium">{history.type === "REVIEW" ? "리뷰 적립" : "결제 사용"}</p><time className="type-caption text-text-tertiary" dateTime={history.createdAt}>{dateFormatter.format(new Date(history.createdAt))}</time></div>
                      <strong className={`type-body-small tabular-nums ${history.amount > 0 ? "text-success" : "text-text-primary"}`}>{history.amount > 0 ? "+" : ""}{formatWon(history.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
