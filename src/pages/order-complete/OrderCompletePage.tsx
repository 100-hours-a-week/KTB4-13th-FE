import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";

function readIsCartCleanupFailed(state: unknown) {
  return (
    typeof state === "object" &&
    state !== null &&
    "isCartCleanupFailed" in state &&
    state.isCartCleanupFailed === true
  );
}

export function OrderCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCartCleanupFailed = readIsCartCleanupFailed(location.state);

  return (
    <main className="page-content flex h-dvh flex-col items-center justify-center bg-surface text-center">
      <div
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-3xl font-bold text-accent"
      >
        ✓
      </div>
      <h1 className="mt-6 type-heading text-text-primary">
        주문이 완료되었어요
      </h1>
      <p className="mt-2 type-body-small text-text-secondary">
        주문한 책은 안전하게 준비해서 보내드릴게요
      </p>
      {isCartCleanupFailed ? (
        <p className="mt-6 break-keep rounded-control bg-muted px-4 py-3 type-caption text-text-secondary">
          주문한 상품 일부가 장바구니에 남아 있을 수 있어요
        </p>
      ) : null}
      <Button className="mt-8 min-w-40" onClick={() => navigate("/")}>
        홈으로 이동
      </Button>
    </main>
  );
}
