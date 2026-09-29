import { useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";

export function OrderCompletePage() {
  const navigate = useNavigate();

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
      <Button className="mt-8 min-w-40" onClick={() => navigate("/")}>
        홈으로 이동
      </Button>
    </main>
  );
}
