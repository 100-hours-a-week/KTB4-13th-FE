import { useLocation, useNavigate } from "react-router-dom";

import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { CartButton } from "@/features/cart/components/CartButton";

export function OrderHistoryHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/my", { replace: true });
      return;
    }
    navigate(-1);
  };

  return (
    <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-hairline bg-surface">
      <button
        aria-label="마이페이지로 돌아가기"
        className="-ml-2 inline-flex size-11 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={handleBack}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <h1 className="text-center type-title text-text-primary">주문내역</h1>
      <CartButton
        className="inline-flex size-11 items-center justify-center text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        countEnabled
        onClick={() => navigate("/cart")}
      />
    </header>
  );
}
