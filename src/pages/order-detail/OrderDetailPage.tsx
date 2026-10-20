import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { ConfirmDialog } from "@/common/components/ConfirmDialog/ConfirmDialog";
import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import {
  cancelPaidOrder,
  partiallyCancelPaidOrder,
} from "@/features/order/api/orderApi";
import { useOrderDetail } from "@/features/order/hooks/useOrderDetail";
import type { OrderHistoryItem, OrderStatus } from "@/features/order/types/order";
import { AppPageHeader } from "@/features/navigation/components/AppPageHeader";
import { formatWon } from "@/pages/order/lib/orderTotals";

const STATUS_LABELS: Record<OrderStatus, string> = {
  CANCELED: "주문 취소",
  CREATED: "결제 대기",
  PAID: "결제 완료",
  PARTIAL_CANCELED: "부분 취소",
};

function createRequestKey() {
  return crypto.randomUUID().replaceAll("-", "_");
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function cancellableQuantity(item: OrderHistoryItem) {
  return Math.max(0, item.quantity - item.canceledQuantity);
}

function actualCouponDiscount(
  totalPrice: number,
  paidAmount: number,
  usedPoint: number,
) {
  return Math.max(0, totalPrice - paidAmount - usedPoint);
}

export function OrderDetailPage() {
  const { orderKey = "" } = useParams();
  const { retry, state } = useOrderDetail(orderKey || null);
  const [isFullCancelOpen, setIsFullCancelOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; variant?: "error" } | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const requestKeysRef = useRef(new Map<string, string>());

  const requestKeyFor = (action: string) => {
    const existing = requestKeysRef.current.get(action);
    if (existing) return existing;
    const next = createRequestKey();
    requestKeysRef.current.set(action, next);
    return next;
  };

  const handleFullCancel = async () => {
    if (!orderKey || pendingAction) return;
    const action = "full";
    setPendingAction(action);
    setNotice(null);
    const result = await cancelPaidOrder(orderKey, requestKeyFor(action));
    setPendingAction(null);
    setIsFullCancelOpen(false);
    if (!result.ok) {
      setNotice({ message: result.message ?? "전체 취소를 완료하지 못했어요. 다시 시도해 주세요.", variant: "error" });
      return;
    }
    requestKeysRef.current.delete(action);
    setNotice({ message: "결제와 주문을 전체 취소했어요." });
    retry();
  };

  const handlePartialCancel = async (item: OrderHistoryItem) => {
    if (!orderKey || pendingAction) return;
    const quantity = quantities[item.orderItemId] ?? 1;
    const action = `partial:${item.orderItemId}:${quantity}`;
    setPendingAction(action);
    setNotice(null);
    const result = await partiallyCancelPaidOrder(
      orderKey,
      item.orderItemId,
      quantity,
      requestKeyFor(action),
    );
    setPendingAction(null);
    if (!result.ok) {
      setNotice({ message: result.message ?? "부분 취소를 완료하지 못했어요. 다시 시도해 주세요.", variant: "error" });
      return;
    }
    requestKeysRef.current.delete(action);
    setNotice({ message: `${item.itemName} ${quantity}권을 취소했어요.` });
    retry();
  };

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <AppPageHeader fallbackPath="/my/orders" title="주문 상세" />
      <main className="page-content min-h-0 flex-1 overflow-y-auto py-5">
        {state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">주문 상세를 불러오는 중이에요</p> : null}
        {state.kind === "error" ? <Toast action={<RetryButton onClick={retry} />} variant="error">주문 상세를 불러오지 못했어요</Toast> : null}
        {notice ? <div className="mb-4"><Toast variant={notice.variant}>{notice.message}</Toast></div> : null}
        {state.kind === "ready" ? (
          <div className="space-y-7">
            <section className="rounded-panel border border-border p-4">
              <div className="flex items-center justify-between gap-3"><h1 className="type-title">{STATUS_LABELS[state.data.status]}</h1><span className="max-w-[55%] truncate type-caption text-text-tertiary">{state.data.key}</span></div>
              <ul className="mt-4 divide-y divide-hairline">{state.data.items.map((item) => <li className="py-3" key={item.orderItemId}><Link className="type-body-small font-semibold" to={`/products/${item.productId}`}>{item.itemName}</Link><div className="mt-1 flex justify-between type-caption text-text-secondary"><span>{item.quantity}권{item.canceledQuantity > 0 ? ` · ${item.canceledQuantity}권 취소` : ""}</span><span className="tabular-nums">{formatWon(item.totalPrice)}</span></div></li>)}</ul>
              <div className="mt-2 flex justify-between border-t border-hairline pt-4 type-title"><span>주문 금액</span><strong>{formatWon(state.data.totalPrice)}</strong></div>
            </section>

            {state.data.payment ? <section><h2 className="type-title">결제 정보</h2><dl className="mt-3 space-y-2 type-body-small text-text-secondary"><div className="flex justify-between"><dt>결제 수단</dt><dd>{state.data.payment.method}</dd></div><div className="flex justify-between"><dt>결제 일시</dt><dd>{formatDate(state.data.payment.paidAt)}</dd></div><div className="flex justify-between"><dt>쿠폰 할인</dt><dd>-{formatWon(actualCouponDiscount(state.data.totalPrice, state.data.payment.paidAmount, state.data.payment.usedPoint))}</dd></div><div className="flex justify-between"><dt>포인트 사용</dt><dd>-{formatWon(state.data.payment.usedPoint)}</dd></div>{state.data.payment.cancelledPaidAmount > 0 ? <div className="flex justify-between text-accent"><dt>취소 금액</dt><dd>-{formatWon(state.data.payment.cancelledPaidAmount)}</dd></div> : null}<div className="flex justify-between font-semibold text-text-primary"><dt>결제 금액</dt><dd>{formatWon(state.data.payment.paidAmount)}</dd></div></dl></section> : null}
            {state.data.address ? <section><h2 className="type-title">배송지</h2><p className="mt-3 type-body-small text-text-secondary">[{state.data.address.postalCode}] {state.data.address.address} {state.data.address.detailAddress ?? ""}</p></section> : null}

            {state.data.cancellations.length > 0 ? <section><h2 className="type-title">취소 내역</h2><ul className="mt-3 space-y-3">{state.data.cancellations.map((cancellation, index) => <li className="rounded-panel bg-muted p-4 type-body-small" key={`${cancellation.canceledAt}-${index}`}><div className="flex justify-between gap-3"><span className="font-semibold">{cancellation.type === "FULL" ? "전체 취소" : "부분 취소"}</span><strong className="tabular-nums">{formatWon(cancellation.refundedAmount)}</strong></div><p className="mt-1 type-caption text-text-tertiary">{formatDate(cancellation.canceledAt)}</p>{cancellation.items.length > 0 ? <ul className="mt-3 space-y-1 border-t border-hairline pt-3 text-text-secondary">{cancellation.items.map((item) => <li className="flex justify-between gap-3" key={`${item.orderItemId}-${item.quantity}`}><span className="line-clamp-1">{item.itemName}</span><span className="shrink-0">{item.quantity}권</span></li>)}</ul> : null}</li>)}</ul></section> : null}

            {state.data.status === "CREATED" ? <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-primary px-4 type-body-small font-semibold text-white" to={`/payment?orderKey=${encodeURIComponent(state.data.key)}`}>결제 화면으로 이동</Link> : null}

            {(state.data.status === "PAID" || state.data.status === "PARTIAL_CANCELED") && state.data.payment ? <section className="rounded-panel border border-border p-4"><div className="flex items-baseline justify-between gap-3"><h2 className="type-title">결제 취소</h2><span className="type-caption text-text-tertiary">취소 가능 {formatWon(state.data.payment.cancellablePaidAmount)}</span></div><ul className="mt-4 divide-y divide-hairline">{state.data.items.map((item) => { const available = cancellableQuantity(item); if (available === 0) return null; const quantity = Math.min(quantities[item.orderItemId] ?? 1, available); return <li className="py-3" key={item.orderItemId}><p className="type-body-small font-semibold">{item.itemName}</p><div className="mt-2 flex items-center gap-2"><label className="sr-only" htmlFor={`cancel-quantity-${item.orderItemId}`}>{item.itemName} 취소 수량</label><select className="min-h-11 min-w-0 flex-1 rounded-control border border-border bg-surface px-3 type-body-small" id={`cancel-quantity-${item.orderItemId}`} onChange={(event) => setQuantities((current) => ({ ...current, [item.orderItemId]: Number(event.target.value) }))} value={quantity}>{Array.from({ length: available }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}권</option>)}</select><Button disabled={pendingAction !== null} isLoading={pendingAction === `partial:${item.orderItemId}:${quantity}`} onClick={() => { void handlePartialCancel(item); }} variant="secondary">선택 취소</Button></div></li>; })}</ul>{state.data.status === "PAID" ? <Button className="mt-4 w-full text-error" disabled={pendingAction !== null} onClick={() => setIsFullCancelOpen(true)} variant="secondary">전체 취소</Button> : null}</section> : null}
          </div>
        ) : null}
      </main>
      <ConfirmDialog confirmLabel="전체 취소" description="결제한 모든 상품을 취소할까요? 취소 후에는 되돌릴 수 없어요." isOpen={isFullCancelOpen} onCancel={() => setIsFullCancelOpen(false)} onConfirm={() => { void handleFullCancel(); }} title="주문 전체 취소" />
    </div>
  );
}
