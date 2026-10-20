import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { cancelCreatedOrder } from "@/features/order/api/orderApi";
import { useOrderDetail } from "@/features/order/hooks/useOrderDetail";
import { confirmPayment, createPayment } from "@/features/payment/api/paymentApi";
import {
  clearPaymentDraft,
  readPaymentDraft,
  savePaymentDraft,
  type PaymentDraft,
} from "@/features/payment/lib/paymentDraft";
import {
  getTossClientKey,
  requestTossPayment,
} from "@/features/payment/lib/tossPayments";
import { formatWon } from "@/pages/order/lib/orderTotals";

function readNonNegativeNumber(params: URLSearchParams, key: string) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function readPositiveInteger(params: URLSearchParams, key: string) {
  const value = Number(params.get(key));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function readCartItemIds(params: URLSearchParams) {
  return (params.get("cartItemIds") ?? "")
    .split(",")
    .map(Number)
    .filter((value) => Number.isSafeInteger(value) && value > 0);
}

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderKey = searchParams.get("orderKey");
  const { retry, state } = useOrderDetail(orderKey);
  const [savedDraft, setSavedDraft] = useState<PaymentDraft | null>(() =>
    orderKey ? readPaymentDraft(orderKey) : null,
  );
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const draft = savedDraft ?? (state.kind === "ready" ? {
    amount: searchParams.has("amount")
      ? readNonNegativeNumber(searchParams, "amount")
      : state.data.totalPrice,
    cartItemIds: readCartItemIds(searchParams),
    couponDiscount: readNonNegativeNumber(searchParams, "couponDiscount"),
    couponId: readPositiveInteger(searchParams, "couponId"),
    isPrepared: false,
    point: readNonNegativeNumber(searchParams, "point"),
  } satisfies PaymentDraft : null);

  const handleCancel = async () => {
    if (!orderKey || isCanceling) return;
    setIsCanceling(true);
    setActionError(null);
    const result = await cancelCreatedOrder(orderKey);
    setIsCanceling(false);
    setIsCancelOpen(false);
    if (result.ok) {
      clearPaymentDraft(orderKey);
      navigate("/my/orders", { replace: true, state: { notice: "결제 전 주문을 취소했어요" } });
      return;
    }
    setActionError("주문을 취소하지 못했어요. 주문 상태를 확인해 주세요");
  };

  const handlePayment = async () => {
    if (!orderKey || !draft || state.kind !== "ready" || isPaying) return;
    setIsPaying(true);
    setActionError(null);

    let preparedDraft = draft;
    if (!draft.isPrepared) {
      const result = await createPayment({
        orderKey,
        useOwnedCouponId: draft.couponId,
        usePoint: draft.point,
      });
      if (!result.ok) {
        setActionError(result.message ?? "결제를 준비하지 못했어요. 선택한 혜택과 주문 상태를 확인해 주세요");
        setIsPaying(false);
        return;
      }
      preparedDraft = { ...draft, isPrepared: true };
      savePaymentDraft(orderKey, preparedDraft);
      setSavedDraft(preparedDraft);
    }

    if (preparedDraft.amount === 0) {
      const result = await confirmPayment(orderKey, "", 0);
      if (result.ok) {
        navigate(`/payment/success?orderKey=${encodeURIComponent(orderKey)}&confirmed=1`, { replace: true });
        return;
      }
      setActionError(result.message ?? "결제를 승인하지 못했어요. 잠시 후 다시 시도해 주세요");
      setIsPaying(false);
      return;
    }

    const firstItem = state.data.items[0]?.itemName ?? "도서";
    const orderName = state.data.items.length > 1
      ? `${firstItem} 외 ${state.data.items.length - 1}권`
      : firstItem;
    try {
      await requestTossPayment({ amount: preparedDraft.amount, orderKey, orderName });
    } catch {
      setActionError("결제창을 열지 못했어요. 잠시 후 다시 시도해 주세요");
      setIsPaying(false);
    }
  };

  const isPaymentConfigured = Boolean(getTossClientKey()) || draft?.amount === 0;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/order" title="결제" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">주문 정보를 확인하고 있어요</p> : null}
        {state.kind === "error" ? <Toast action={<RetryButton onClick={retry} />} variant="error">주문 정보를 불러오지 못했어요</Toast> : null}
        {actionError ? <Toast variant="error">{actionError}</Toast> : null}
        {state.kind === "ready" ? (
          <div className="space-y-7">
            <section className="rounded-panel border border-border p-5" aria-labelledby="payment-order-title">
              <div className="flex items-center justify-between gap-3"><h2 className="type-title" id="payment-order-title">주문 정보</h2><span className="type-caption text-text-tertiary">{state.data.status === "CREATED" ? "결제 대기" : state.data.status}</span></div>
              <ul className="mt-4 space-y-2 type-body-small text-text-secondary">{state.data.items.map((item) => <li className="flex justify-between gap-4" key={item.orderItemId}><span className="line-clamp-1">{item.itemName} · {item.quantity}권</span><span className="shrink-0 tabular-nums">{formatWon(item.totalPrice)}</span></li>)}</ul>
              <dl className="mt-4 space-y-2 border-t border-hairline pt-4 type-body-small">
                <div className="flex justify-between text-text-secondary"><dt>상품 금액</dt><dd className="tabular-nums">{formatWon(state.data.totalPrice)}</dd></div>
                {draft && draft.couponDiscount > 0 ? <div className="flex justify-between text-accent"><dt>쿠폰 할인</dt><dd className="tabular-nums">-{formatWon(draft.couponDiscount)}</dd></div> : null}
                {draft && draft.point > 0 ? <div className="flex justify-between text-accent"><dt>포인트 사용</dt><dd className="tabular-nums">-{formatWon(draft.point)}</dd></div> : null}
                <div className="flex justify-between pt-2 type-title"><dt>최종 결제금액</dt><dd className="tabular-nums">{formatWon(draft?.amount ?? state.data.totalPrice)}</dd></div>
              </dl>
            </section>
            {state.data.address ? <section><h2 className="type-title">배송지</h2><p className="mt-3 type-body-small text-text-secondary">[{state.data.address.postalCode}] {state.data.address.address} {state.data.address.detailAddress ?? ""}</p></section> : null}
            {!isPaymentConfigured ? <Toast variant="error">이 환경에는 토스페이먼츠 클라이언트 키가 설정되지 않아 결제창을 열 수 없어요.</Toast> : null}
            <div className="space-y-2">
              <Button className="w-full" disabled={!draft || !isPaymentConfigured || state.data.status !== "CREATED"} isLoading={isPaying} onClick={() => { void handlePayment(); }}>토스페이먼츠로 결제하기</Button>
              {state.data.status === "CREATED" ? <Button className="w-full text-error" disabled={isCanceling || isPaying} onClick={() => setIsCancelOpen(true)} variant="secondary">결제 전 주문 취소</Button> : null}
              <Link className="inline-flex min-h-11 w-full items-center justify-center rounded-control type-body-small font-semibold text-text-secondary" to="/my/orders">주문 내역 보기</Link>
            </div>
          </div>
        ) : null}
      </main>
      <ConfirmDialog confirmLabel="주문 취소" description="아직 결제되지 않은 주문을 취소할까요?" isOpen={isCancelOpen} onCancel={() => setIsCancelOpen(false)} onConfirm={() => { void handleCancel(); }} title="결제 전 주문 취소" />
    </div>
  );
}
