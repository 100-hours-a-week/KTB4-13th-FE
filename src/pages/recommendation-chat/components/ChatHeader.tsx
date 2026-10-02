import { ArrowLeftIcon, CartIcon } from "@/common/components/AppIcons";

interface ChatHeaderProps {
  onBack: () => void;
  onCartClick: () => void;
}

export function ChatHeader({ onBack, onCartClick }: ChatHeaderProps) {
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
      <h1 className="text-center type-title text-text-primary">AI 추천</h1>
      <button
        aria-label="장바구니 보기"
        className={`${iconButtonClassName} -mr-2`}
        onClick={onCartClick}
        type="button"
      >
        <CartIcon className="size-6" />
      </button>
    </header>
  );
}
