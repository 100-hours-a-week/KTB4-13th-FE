import { useEffect, useState } from "react";

import { Button } from "@/common/components/Button";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  fetchCoupons,
  fetchOwnedCoupons,
  issueCoupon,
} from "@/features/benefit/api/benefitApi";
import type { Coupon } from "@/features/benefit/types/benefit";
import { useAuth } from "@/features/auth/context/useAuth";
import { formatWon } from "@/pages/order/lib/orderTotals";

type CouponState =
  | { kind: "loading" }
  | { coupons: Coupon[]; issuedIds: Set<number>; kind: "ready" }
  | { kind: "error" };

function benefitLabel(coupon: Coupon) {
  if (coupon.type === "PERCENT_RATE") return `${coupon.discount * 100}% 할인`;
  if (coupon.type === "FIXED_AMOUNT") return `${formatWon(coupon.discount)} 할인`;
  return "할인 쿠폰";
}

export function ProductCouponSection({
  couponIds,
  onLoginRequired,
}: {
  couponIds: number[];
  onLoginRequired: () => void;
}) {
  const { status: authStatus } = useAuth();
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<CouponState>({ kind: "loading" });
  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const ownedRequest = authStatus === "authenticated"
      ? fetchOwnedCoupons(controller.signal)
      : Promise.resolve({ data: [], ok: true } as const);
    void Promise.all([
      fetchCoupons(couponIds, controller.signal),
      ownedRequest,
    ]).then(([coupons, owned]) => {
      if (controller.signal.aborted) return;
      setState(coupons.ok && owned.ok
        ? {
            coupons: coupons.data.filter((coupon) => new Date(coupon.expiredAt).getTime() > Date.now()),
            issuedIds: new Set(owned.data.map((coupon) => coupon.id)),
            kind: "ready",
          }
        : { kind: "error" });
    });
    return () => controller.abort();
  }, [authStatus, couponIds, requestKey]);

  if (couponIds.length === 0) return null;

  const handleIssue = async (couponId: number) => {
    if (authStatus !== "authenticated") {
      onLoginRequired();
      return;
    }
    if (issuingId !== null || state.kind !== "ready") return;
    setIssuingId(couponId);
    setError(null);
    const result = await issueCoupon(couponId);
    setIssuingId(null);
    if (!result.ok) {
      setError(result.message ?? "쿠폰을 받지 못했어요. 다시 시도해 주세요.");
      return;
    }
    setState({
      ...state,
      issuedIds: new Set([...state.issuedIds, couponId]),
    });
  };

  return (
    <section aria-labelledby="product-coupon-title" className="page-content border-b border-hairline py-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-title" id="product-coupon-title">받을 수 있는 쿠폰</h2>
        {state.kind === "ready" ? <span className="type-caption text-text-tertiary">{state.coupons.length}개</span> : null}
      </div>
      {state.kind === "loading" ? <p aria-busy="true" className="mt-3 type-body-small text-text-tertiary" role="status">쿠폰을 확인하고 있어요</p> : null}
      {state.kind === "error" ? <div className="mt-3"><Toast action={<RetryButton onClick={() => { setState({ kind: "loading" }); setRequestKey((value) => value + 1); }} />} variant="error">쿠폰을 불러오지 못했어요</Toast></div> : null}
      {error ? <div className="mt-3"><Toast variant="error">{error}</Toast></div> : null}
      {state.kind === "ready" && state.coupons.length === 0 ? <p className="mt-3 type-body-small text-text-tertiary">현재 받을 수 있는 쿠폰이 없어요.</p> : null}
      {state.kind === "ready" && state.coupons.length > 0 ? <ul className="mt-3 space-y-2">{state.coupons.map((coupon) => { const isIssued = state.issuedIds.has(coupon.id); return <li className="flex items-center gap-3 rounded-control bg-muted px-4 py-3" key={coupon.id}><div className="min-w-0 flex-1"><p className="truncate type-body-small font-semibold">{coupon.name}</p><p className="mt-0.5 type-caption text-text-secondary">{benefitLabel(coupon)} · {formatWon(coupon.minOrderAmount)} 이상</p></div><Button className="shrink-0 px-3" disabled={isIssued || issuingId !== null} isLoading={issuingId === coupon.id} onClick={() => { void handleIssue(coupon.id); }} variant="secondary">{isIssued ? "받음" : "쿠폰 받기"}</Button></li>; })}</ul> : null}
    </section>
  );
}
