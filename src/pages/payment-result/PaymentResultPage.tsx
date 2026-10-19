import { Link, useLocation } from "react-router-dom";

import { RetryButton } from "@/common/components/RetryButton";
import { Toast } from "@/common/components/Toast";
import { useOrderDetail } from "@/features/order/hooks/useOrderDetail";

export function PaymentResultPage({ kind }: { kind: "success" | "fail" }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderKey = searchParams.get("orderKey");
  const { retry, state } = useOrderDetail(kind === "success" ? orderKey : null);
  const isConfirmed = kind === "success" && state.kind === "ready" && state.data.status === "PAID";

  return (
    <main className="page-content flex h-dvh flex-col items-center justify-center bg-surface text-center">
      {kind === "success" && state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">결제 결과를 확인하고 있어요</p> : null}
      {kind === "success" && state.kind === "error" ? <Toast action={<RetryButton onClick={retry} />} variant="error">결제 결과를 확인하지 못했어요</Toast> : null}
      {isConfirmed ? <><div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-success text-success">✓</div><h1 className="mt-6 type-section">결제가 완료되었어요</h1><p className="mt-3 type-body text-text-secondary">주문 내역에서 배송 상태를 확인할 수 있어요.</p></> : null}
      {kind === "fail" || (kind === "success" && state.kind === "ready" && !isConfirmed) ? <><div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-error text-error">!</div><h1 className="mt-6 type-section">결제를 완료하지 못했어요</h1><p className="mt-3 max-w-xs break-keep type-body text-text-secondary">결제가 승인되지 않았습니다. 주문 상태를 확인한 뒤 다시 시도해 주세요.</p></> : null}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        {orderKey && !isConfirmed ? <Link className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 type-body-small font-semibold text-white" to={`/payment?orderKey=${encodeURIComponent(orderKey)}`}>결제 화면으로 돌아가기</Link> : null}
        <Link className="inline-flex min-h-11 items-center justify-center rounded-control border border-border px-4 type-body-small font-semibold" to="/my/orders">주문 내역 보기</Link>
      </div>
    </main>
  );
}
