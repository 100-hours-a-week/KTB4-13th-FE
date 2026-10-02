import { ArrowLeftIcon } from "@/common/components/AppIcons";
import { CartButton } from "@/features/cart/components/CartButton";

interface ProductHeaderProps {
  isCartCountEnabled: boolean;
  onBack: () => void;
  onCartClick: () => void;
}

export function ProductHeader({
  isCartCountEnabled,
  onBack,
  onCartClick,
}: ProductHeaderProps) {
  const iconButtonClassName =
    "inline-flex size-11 items-center justify-center rounded-full text-text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <header className="page-content grid min-h-16 shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center bg-surface">
      <button
        aria-label="이전 화면으로 돌아가기"
        className={`${iconButtonClassName} -ml-2`}
        onClick={onBack}
        type="button"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <h1 className="text-center type-title text-text-primary">도서 상세</h1>
      <CartButton
        className={`${iconButtonClassName} -mr-2`}
        countEnabled={isCartCountEnabled}
        onClick={onCartClick}
      />
    </header>
  );
}
