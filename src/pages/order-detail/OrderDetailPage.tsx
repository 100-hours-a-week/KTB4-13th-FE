import { Link, useParams } from "react-router-dom";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useOrderDetail } from "@/features/order/hooks/useOrderDetail";
import type { OrderStatus } from "@/features/order/types/order";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { formatWon } from "@/pages/order/lib/orderTotals";

const STATUS_LABELS: Record<OrderStatus, string> = {
  CANCELED: "주문 취소",
  CREATED: "결제 대기",
  PAID: "결제 완료",
  PARTIAL_CANCELED: "부분 취소",
};

export function OrderDetailPage() {
  const { orderKey = "" } = useParams();
  const { retry, state } = useOrderDetail(orderKey || null);

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/orders" title="주문 상세" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">주문 상세를 불러오는 중이에요</p> : null}
        {state.kind === "error" ? <Toast action={<RetryButton onClick={retry} />} variant="error">주문 상세를 불러오지 못했어요</Toast> : null}
        {state.kind === "ready" ? (
          <div className="space-y-7">
            <section className="rounded-panel border border-border p-4">
              <div className="flex items-center justify-between gap-3"><h1 className="type-title">{STATUS_LABELS[state.data.status]}</h1><span className="type-caption text-text-tertiary">{state.data.key}</span></div>
              <ul className="mt-4 divide-y divide-hairline">{state.data.items.map((item) => <li className="py-3" key={item.orderItemId}><Link className="type-body-small font-semibold" to={`/products/${item.productId}`}>{item.itemName}</Link><div className="mt-1 flex justify-between type-caption text-text-secondary"><span>{item.quantity}권{item.canceledQuantity > 0 ? ` · ${item.canceledQuantity}권 취소` : ""}</span><span className="tabular-nums">{formatWon(item.totalPrice)}</span></div></li>)}</ul>
              <div className="mt-2 flex justify-between border-t border-hairline pt-4 type-title"><span>주문 금액</span><strong>{formatWon(state.data.totalPrice)}</strong></div>
            </section>
            {state.data.payment ? <section><h2 className="type-title">결제 정보</h2><dl className="mt-3 space-y-2 type-body-small text-text-secondary"><div className="flex justify-between"><dt>쿠폰 할인</dt><dd>-{formatWon(state.data.payment.couponDiscount)}</dd></div><div className="flex justify-between"><dt>포인트 사용</dt><dd>-{formatWon(state.data.payment.usedPoint)}</dd></div><div className="flex justify-between font-semibold text-text-primary"><dt>결제 금액</dt><dd>{formatWon(state.data.payment.paidAmount)}</dd></div></dl></section> : null}
            {state.data.address ? <section><h2 className="type-title">배송지</h2><p className="mt-3 type-body-small text-text-secondary">[{state.data.address.postalCode}] {state.data.address.address} {state.data.address.detailAddress ?? ""}</p></section> : null}
            {state.data.cancellations.length > 0 ? <section><h2 className="type-title">취소 내역</h2><ul className="mt-3 space-y-3">{state.data.cancellations.map((cancellation, index) => <li className="rounded-panel bg-muted p-4 type-body-small" key={`${cancellation.canceledAt}-${index}`}><div className="flex justify-between"><span>{cancellation.type === "FULL" ? "전체 취소" : "부분 취소"}</span><strong>{formatWon(cancellation.refundedAmount)}</strong></div></li>)}</ul></section> : null}
            {state.data.status === "CREATED" ? <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-primary px-4 type-body-small font-semibold text-white" to={`/payment?orderKey=${encodeURIComponent(state.data.key)}`}>결제 화면으로 이동</Link> : null}
            {state.data.status === "PAID" || state.data.status === "PARTIAL_CANCELED" ? <section className="rounded-panel bg-muted p-4"><h2 className="type-title">결제 취소</h2><p className="mt-2 type-caption leading-relaxed text-text-secondary">실제 PG 취소 연동이 BE main에 준비되지 않아 현재 요청할 수 없어요.</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="min-h-11 rounded-control border border-border bg-surface type-body-small font-semibold" disabled type="button">부분 취소</button><button className="min-h-11 rounded-control border border-border bg-surface type-body-small font-semibold" disabled type="button">전체 취소</button></div></section> : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
