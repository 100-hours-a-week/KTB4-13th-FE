import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { cancelCreatedOrder } from "@/features/order/api/orderApi";
import { useOrderDetail } from "@/features/order/hooks/useOrderDetail";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { formatWon } from "@/pages/order/lib/orderTotals";

export function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderKey = searchParams.get("orderKey");
  const { retry, state } = useOrderDetail(orderKey);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(false);

  const handleCancel = async () => {
    if (!orderKey || isCanceling) return;
    setIsCanceling(true);
    setCancelError(false);
    const result = await cancelCreatedOrder(orderKey);
    setIsCanceling(false);
    setIsCancelOpen(false);
    if (result.ok) {
      navigate("/my/orders", { replace: true, state: { notice: "결제 전 주문을 취소했어요" } });
      return;
    }
    setCancelError(true);
  };

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/order" title="결제" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">주문 정보를 확인하고 있어요</p> : null}
        {state.kind === "error" ? <Toast action={<RetryButton onClick={retry} />} variant="error">주문 정보를 불러오지 못했어요</Toast> : null}
        {cancelError ? <Toast variant="error">주문을 취소하지 못했어요. 주문 상태를 확인해 주세요</Toast> : null}
        {state.kind === "ready" ? (
          <div className="space-y-7">
            <section className="rounded-panel border border-border p-5" aria-labelledby="payment-order-title">
              <div className="flex items-center justify-between gap-3"><h2 className="type-title" id="payment-order-title">주문 정보</h2><span className="type-caption text-text-tertiary">{state.data.status === "CREATED" ? "결제 대기" : state.data.status}</span></div>
              <ul className="mt-4 space-y-2 type-body-small text-text-secondary">{state.data.items.map((item) => <li className="flex justify-between gap-4" key={item.orderItemId}><span className="line-clamp-1">{item.itemName} · {item.quantity}권</span><span className="shrink-0 tabular-nums">{formatWon(item.totalPrice)}</span></li>)}</ul>
              <div className="mt-4 flex justify-between border-t border-hairline pt-4 type-title"><span>주문 금액</span><strong className="tabular-nums">{formatWon(state.data.totalPrice)}</strong></div>
            </section>
            {state.data.address ? <section><h2 className="type-title">배송지</h2><p className="mt-3 type-body-small text-text-secondary">[{state.data.address.postalCode}] {state.data.address.address} {state.data.address.detailAddress ?? ""}</p></section> : null}
            <section className="rounded-panel bg-muted p-4" aria-labelledby="payment-unavailable-title">
              <h2 className="type-title" id="payment-unavailable-title">결제 준비 중</h2>
              <p className="mt-2 break-keep type-body-small leading-relaxed text-text-secondary">현재 서버의 PG 승인 연동이 준비되지 않아 토스페이먼츠 결제를 시작할 수 없어요. 주문은 결제 대기 상태로 보관됩니다.</p>
            </section>
            <div className="space-y-2">
              <Button className="w-full" disabled>토스페이먼츠로 결제하기</Button>
              {state.data.status === "CREATED" ? <Button className="w-full text-error" disabled={isCanceling} onClick={() => setIsCancelOpen(true)} variant="secondary">결제 전 주문 취소</Button> : null}
              <Link className="inline-flex min-h-11 w-full items-center justify-center rounded-control type-body-small font-semibold text-text-secondary" to="/my/orders">주문 내역 보기</Link>
            </div>
          </div>
        ) : null}
      </main>
      <ConfirmDialog confirmLabel="주문 취소" description="아직 결제되지 않은 주문을 취소할까요?" isOpen={isCancelOpen} onCancel={() => setIsCancelOpen(false)} onConfirm={() => { void handleCancel(); }} title="결제 전 주문 취소" />
    </div>
  );
}
