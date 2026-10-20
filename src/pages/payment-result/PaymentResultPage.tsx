import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { fetchOrderDetail } from "@/features/order/api/orderApi";
import {
  confirmPayment,
  reportPaymentFailure,
} from "@/features/payment/api/paymentApi";
import {
  clearPaymentDraft,
  readPaymentDraft,
} from "@/features/payment/lib/paymentDraft";

type ResultState =
  | { kind: "loading" }
  | { kind: "success" }
  | { message: string; kind: "error" };

const failureReports = new Map<string, Promise<unknown>>();

export function PaymentResultPage({ kind }: { kind: "success" | "fail" }) {
  const location = useLocation();
  const orderKey = new URLSearchParams(location.search).get("orderKey") ??
    new URLSearchParams(location.search).get("orderId");
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<ResultState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const searchParams = new URLSearchParams(location.search);

    const run = async () => {
      if (!orderKey) {
        setState({ kind: "error", message: "주문 정보를 확인할 수 없어요." });
        return;
      }

      if (kind === "fail") {
        const code = searchParams.get("code") ?? "PAYMENT_FAILED";
        const message = searchParams.get("message") ?? "결제 인증에 실패했습니다.";
        const reportKey = `${orderKey}:${code}:${message}`;
        let report = failureReports.get(reportKey);
        if (!report) {
          report = reportPaymentFailure(orderKey, code, message);
          failureReports.set(reportKey, report);
        }
        await report;
        if (!controller.signal.aborted) setState({ kind: "error", message });
        return;
      }

      const alreadyConfirmed = searchParams.get("confirmed") === "1";
      if (!alreadyConfirmed) {
        const paymentKey = searchParams.get("paymentKey");
        const amount = Number(searchParams.get("amount"));
        const draft = readPaymentDraft(orderKey);
        if (
          !paymentKey ||
          !Number.isFinite(amount) ||
          amount < 0 ||
          (draft && draft.amount !== amount)
        ) {
          setState({ kind: "error", message: "결제 정보가 주문 내용과 일치하지 않아요." });
          return;
        }
        const confirmation = await confirmPayment(orderKey, paymentKey, amount);
        if (!confirmation.ok) {
          if (!controller.signal.aborted) {
            setState({
              kind: "error",
              message: confirmation.message ?? "결제를 승인하지 못했어요. 잠시 후 다시 확인해 주세요.",
            });
          }
          return;
        }
      }

      const detail = await fetchOrderDetail(orderKey, controller.signal);
      if (!detail.ok || detail.data.status !== "PAID") {
        if (!controller.signal.aborted) {
          setState({ kind: "error", message: "결제 상태를 확인하지 못했어요." });
        }
        return;
      }

      clearPaymentDraft(orderKey);
      if (!controller.signal.aborted) {
        setState({ kind: "success" });
      }
    };

    void run();
    return () => controller.abort();
  }, [kind, location.search, orderKey, requestKey]);

  return (
    <main className="page-content flex h-dvh flex-col items-center justify-center bg-surface text-center">
      {state.kind === "loading" ? <p aria-busy="true" className="type-body-small text-text-tertiary" role="status">결제 결과를 확인하고 있어요</p> : null}
      {state.kind === "success" ? <><div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-success text-success">✓</div><h1 className="mt-6 type-section">결제가 완료되었어요</h1><p className="mt-3 type-body text-text-secondary">주문 내역에서 배송 상태를 확인할 수 있어요.</p></> : null}
      {state.kind === "error" ? <><div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-error text-error">!</div><h1 className="mt-6 type-section">결제를 완료하지 못했어요</h1><p className="mt-3 max-w-xs break-keep type-body text-text-secondary">{state.message}</p></> : null}
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        {state.kind === "error" && kind === "success" ? <Button className="min-h-11 w-full" onClick={() => { setState({ kind: "loading" }); setRequestKey((value) => value + 1); }}>다시 확인하기</Button> : null}
        {orderKey && state.kind === "error" ? <Link className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 type-body-small font-semibold text-white" to={`/payment?orderKey=${encodeURIComponent(orderKey)}`}>결제 화면으로 돌아가기</Link> : null}
        <Link className="inline-flex min-h-11 items-center justify-center rounded-control border border-border px-4 type-body-small font-semibold" to="/my/orders">주문 내역 보기</Link>
      </div>
    </main>
  );
}
